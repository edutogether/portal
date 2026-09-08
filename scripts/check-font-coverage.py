#!/usr/bin/env python3
"""
사이트가 실제로 그리는 글자가 자가호스팅된 Pretendard 서브셋에 전부 들어있는지
확인한다. 새 한글 텍스트(새 카드 문구·새 가사 등)를 추가하고 재서브셋을 잊으면
그 글자만 시스템 폰트로 조용히 폴백된다 — 배포 전에 CI에서 잡기 위한 검사다.

**검사 대상 글자는 렌더된 DOM에서 나온다.** tests/font-text.spec.js가 빌드된
사이트를 실제로 띄워 body의 textContent를 .cache/rendered-text.txt로 덤프하고,
이 스크립트는 그 파일만 읽는다. 예전에는 index.html 소스를 정규식으로 훑었는데,
빌드가 생긴 뒤로는 문구가 번들 JS 안 문자열 리터럴로 흩어져서 소스를 훑으면 코드
식별자와 주석 글자까지 "사용 글자"로 잡힌다(그 오탐은 실제로 한 번 겪었다).

실행 순서:
  npm run build
  npx playwright test --grep @fonttext
  python3 scripts/check-font-coverage.py

재서브셋 방법은 public/assets/fonts/pretendard/pretendard.css 상단 주석 참고.
"""
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 한글/특수문자 출력이 깨지지 않도록.
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
RENDERED_TEXT = ROOT / ".cache" / "rendered-text.txt"
FONT_DIR = ROOT / "public" / "assets" / "fonts" / "pretendard"


def font_covers(path: Path) -> set[int]:
    font = TTFont(str(path))
    return set(font.getBestCmap().keys())


def is_emoji_range(cp: int) -> bool:
    """이모지는 시스템 이모지 폰트가 그리므로 Pretendard가 담당할 대상이 아니다.

    U+1F000 이상뿐 아니라 Misc Symbols/Dingbats 블록(U+2600~U+27BF — ✨ 등 다수의
    이모지가 여기 있다)도 제외해야 한다. 안 그러면 실제로는 정상 렌더링되는 글자가
    "서브셋 누락"으로 잘못 잡힌다(2026-08-31 ✨ 오탐). U+FE0F(VS16)는 앞 글자를
    컬러 이모지로 그리라는 지시자일 뿐 그려지는 글자가 아니라 어떤 폰트에도 글리프가
    없으므로 같은 이유로 제외한다.
    """
    return cp >= 0x1F000 or 0x2600 <= cp <= 0x27BF or cp == 0xFE0F


def main() -> int:
    if not RENDERED_TEXT.exists():
        print(
            "::error::렌더된 텍스트 덤프가 없습니다: "
            f"{RENDERED_TEXT.relative_to(ROOT)}\n"
            "  먼저 `npm run build` 후 `npx playwright test --grep @fonttext`를 실행하세요."
        )
        return 1

    used_chars = set(RENDERED_TEXT.read_text(encoding="utf-8"))

    covered: set[int] = set()
    for woff2_path in sorted(FONT_DIR.glob("*.woff2")):
        covered |= font_covers(woff2_path)

    if not covered:
        print(f"::error::폰트 파일을 찾지 못했습니다: {FONT_DIR.relative_to(ROOT)}")
        return 1

    missing = sorted(
        c for c in used_chars
        if ord(c) > 0x20 and ord(c) not in covered and not is_emoji_range(ord(c))
    )

    if missing:
        print("::error::Pretendard 서브셋에 없는 글자가 화면에 쓰이고 있습니다:")
        for c in missing:
            print(f"::error::  U+{ord(c):04X} ({c!r})")
        print("재서브셋 방법: public/assets/fonts/pretendard/pretendard.css 상단 주석 참고")
        return 1

    print(f"OK — 화면에 그려지는 글자 {len(used_chars)}자 전부 서브셋에 포함됨")
    return 0


if __name__ == "__main__":
    sys.exit(main())
