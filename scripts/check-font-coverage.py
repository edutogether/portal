#!/usr/bin/env python3
"""
index.html이 실제로 쓰는 글자가 자가호스팅된 Pretendard 서브셋(assets/fonts/pretendard/)
에 전부 들어있는지 확인한다. 새 한글 텍스트(특히 새 가사)를 추가하고 재서브셋을
잊으면, 그 글자만 시스템 폰트로 조용히 폴백된다 — 이 스크립트는 그걸 배포 전에
CI에서 잡기 위한 것.

재서브셋 방법은 assets/fonts/pretendard/pretendard.css 상단 주석 참고.
"""
import re
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 한글/특수문자 출력이 깨지지 않도록.
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT / "public" / "index.html"
FONT_DIR = ROOT / "public" / "assets" / "fonts" / "pretendard"


def extract_used_chars(html: str) -> set[str]:
    # HTML 주석(<!-- -->)과 JS/CSS 블록은 화면에 안 그려지므로 먼저 전부 들어낸다.
    # 예전엔 이걸 안 해서 CSP 관련 head 주석, JS // 주석 안의 단어(예: "옮김",
    # "깨짐")까지 "사용 글자"로 잘못 잡혔었다(2026-08-25 발견).
    no_comments = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    no_script = re.sub(r"<script[^>]*>.*?</script>", " ", no_comments, flags=re.S)
    no_style = re.sub(r"<style[^>]*>.*?</style>", " ", no_script, flags=re.S)
    text_only = re.sub(r"<[^>]+>", " ", no_style)
    text_only = (
        text_only.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&#39;", "'")
        .replace("&quot;", '"')
    )
    html_chars = set(text_only)

    # JS가 동적으로 그리는 텍스트는 딱 두 종류뿐이라 정확히 짚어서 뽑는다
    # (모든 작은따옴표 문자열을 다 잡으면 주석 안 단어까지 오염됨).
    script_match = re.search(r"<script>\n(.*)</script>", no_comments, re.S)
    script_content = script_match.group(1) if script_match else ""
    lyric_texts = re.findall(r"text:\s*'((?:[^'\\]|\\.)*)'", script_content)
    toast_texts = re.findall(r"showToast\('((?:[^'\\]|\\.)*)'\)", script_content)
    js_chars = set("".join(lyric_texts) + "".join(toast_texts))

    all_chars = html_chars | js_chars
    return {c for c in all_chars if c.isprintable() or c == " "}


def font_covers(path: Path) -> set[int]:
    font = TTFont(str(path))
    cmap = font.getBestCmap()
    return set(cmap.keys())


def main() -> int:
    html = INDEX_HTML.read_text(encoding="utf-8")
    used_chars = extract_used_chars(html)

    covered: set[int] = set()
    for woff2_path in sorted(FONT_DIR.glob("*.woff2")):
        covered |= font_covers(woff2_path)

    # 이모지(예: 🕹️ 파비콘, ✨)는 애초에 시스템 이모지 폰트로 렌더링되고
    # Pretendard가 담당할 대상이 아니라서 제외한다. U+1F000 이상뿐 아니라
    # Misc Symbols/Dingbats 블록(U+2600~U+27BF, ✨ 등 다수의 이모지가 이
    # 대역에 있음)도 같은 이유로 제외해야 한다 — 안 그러면 실제로는 시스템
    # 이모지 폰트로 정상 렌더링되는 글자가 "서브셋 누락"으로 잘못 잡힌다
    # (2026-08-31 ✨ 오탐 발견).
    # U+FE0F(VS16)는 앞 글자를 컬러 이모지로 그리라는 지시자일 뿐 그 자체로는
    # 그려지는 글자가 아니라서 어떤 폰트에도 실제 글리프가 없다 — 이모지와
    # 같은 이유로 제외한다.
    def is_emoji_range(cp):
        return cp >= 0x1F000 or 0x2600 <= cp <= 0x27BF or cp == 0xFE0F

    missing = sorted(
        c for c in used_chars
        if ord(c) > 0x20 and ord(c) not in covered and not is_emoji_range(ord(c))
    )

    if missing:
        print("::error::Pretendard 서브셋에 없는 글자가 index.html에서 쓰이고 있습니다:")
        for c in missing:
            print(f"::error::  U+{ord(c):04X} ({c!r})")
        print(
            "재서브셋 방법: assets/fonts/pretendard/pretendard.css 상단 주석 참고"
        )
        return 1

    print(f"OK — 사용 글자 {len(used_chars)}자 전부 서브셋에 포함됨")
    return 0


if __name__ == "__main__":
    sys.exit(main())
