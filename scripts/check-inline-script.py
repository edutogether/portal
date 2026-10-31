#!/usr/bin/env python3
"""
빌드 산출물(dist/)에 인라인 <script>나 인라인 이벤트 핸들러 속성(onclick= 등)이
들어있으면 실패시킨다. 둘 다 script-src 'self'가 막는다.

이 검사는 원래 "인라인 <script>의 sha256 해시가 CSP 선언과 일치하는가"를 보던
check-csp-hash.py였다. 리액트로 옮기면서 스크립트가 전부 외부 파일(/assets/*.js)로
빠져 CSP가 script-src 'self'로 단순해졌고, 해시를 맞출 대상 자체가 사라졌다.

그렇다고 검사를 없애면 안 된다. 누군가 나중에 인라인 <script>를 하나 넣으면
script-src 'self'가 그걸 **조용히** 차단한다 — 콘솔 CSP 에러 말고는 아무 증상이
없어서, 예전에 해시가 어긋났을 때와 똑같은 방식으로 스크립트가 죽는다. 그래서
지키는 대상을 "해시 일치"에서 "인라인 스크립트가 아예 없을 것"으로 바꿨다.

인라인 스크립트가 정말로 필요해지면 이 검사를 지우지 말고, CSP에 그 스크립트의
해시를 추가하는 쪽으로 함께 고쳐야 한다.
"""
import re
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 특수문자 출력이 깨지지 않도록.
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [ROOT / "dist" / "index.html", ROOT / "dist" / "404.html"]


def inline_scripts(html: str) -> list[str]:
    # HTML 주석 안에 "<script>"라는 글자가 설명으로 등장할 수 있어서(이 저장소의
    # index.html 주석이 실제로 그렇다) 먼저 주석을 전부 들어낸 뒤에 찾는다.
    stripped = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    # src= 속성이 있는 <script src="...">는 외부 파일이라 대상이 아니다.
    return [
        m.group(0)
        for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>", stripped, flags=re.I)
    ]


def inline_handlers(html: str) -> list[str]:
    # <body ontouchstart="">처럼 태그 안의 on*= 속성. 인라인 <script>와 똑같이 CSP가 막고,
    # 막힐 때마다 콘솔에 CSP 위반 에러를 남긴다(2026-10-31 라이브에서 발견).
    stripped = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    return [
        m.group(0)
        for m in re.finditer(r"<[a-z][^>]*\son[a-z]+\s*=[^>]*>", stripped, flags=re.I)
    ]


def main() -> int:
    missing = [p for p in TARGETS if not p.exists()]
    if missing:
        names = ", ".join(str(p.relative_to(ROOT)) for p in missing)
        print(f"::error::빌드 산출물이 없습니다: {names} — 먼저 `npm run build`를 실행하세요.")
        return 1

    failed = False
    for path in TARGETS:
        text = path.read_text(encoding="utf-8")
        found = inline_scripts(text)
        rel = path.relative_to(ROOT)
        handlers = inline_handlers(text)
        if handlers:
            failed = True
            print(f"::error::{rel} 에 인라인 이벤트 핸들러 속성이 {len(handlers)}개 있습니다.")
            for tag in handlers:
                print(f"  {tag}")
            print("  CSP가 막아 콘솔에 에러만 남깁니다. main.tsx에서 addEventListener로 거세요.")
        if found:
            failed = True
            print(f"::error::{rel} 에 인라인 <script>가 {len(found)}개 있습니다.")
            for tag in found:
                print(f"  {tag}")
            print(
                "  CSP가 script-src 'self'라서 인라인 스크립트는 브라우저에서 조용히 "
                "차단됩니다. 외부 파일로 빼거나, 정말 필요하면 CSP에 해시를 함께 추가하세요."
            )
        else:
            print(f"OK — {rel} 에 인라인 <script> 없음")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
