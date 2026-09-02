#!/usr/bin/env python3
"""
index.html의 CSP script-src sha256 해시가 실제 <script> 내용과 일치하는지
확인한다. 스크립트를 한 글자라도 고치고 해시를 재계산하지 않으면 브라우저가
조용히 스크립트 실행을 막아버리는데(콘솔 CSP 에러 외엔 아무 증상도 없음),
이 스크립트는 그걸 배포 전 CI에서 잡기 위한 것.

CSP 해시는 <script> 태그 바로 뒤부터 </script> 바로 앞까지의 바이트를 그대로
sha256 후 base64 인코딩한 값이어야 한다(앞의 줄바꿈도 포함, 2026-09-01에
이 경계를 잘못 잡아서 실제 브라우저가 요구하는 값과 다른 해시를 냈던 사고가
있었음).

인라인 <script> 태그가 여러 개일 수 있으므로 전부 찾아서 각각 검증한다
(처음엔 첫 번째 태그만 검사하는 버그가 있었음 — 지금은 1개뿐이라 증상은
없었지만, 나중에 두 번째 인라인 스크립트가 추가되면 이 가드 자체가 그걸
놓쳐서 막으려던 사고가 그대로 재발할 뻔했음, 2026-09-02 Opus 감사에서 발견).
"""
import hashlib
import base64
import re
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 화살표 등 특수문자 출력이 깨지지 않도록.
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT / "public" / "index.html"


def main() -> int:
    data = INDEX_HTML.read_bytes()

    # HTML 주석(<!-- -->) 안에 "<script>"라는 글자가 언급될 수 있어서(예: 이
    # 파일 자체의 설명 주석), 먼저 주석을 전부 들어낸 뒤 진짜 <script> 태그를
    # 찾는다 — 안 그러면 주석 속 문자열을 진짜 태그로 잘못 잡을 수 있다.
    stripped = re.sub(rb"<!--.*?-->", b"", data, flags=re.S)

    # src= 속성이 있는 <script src="...">는 인라인이 아니라 해시 대상이 아님 —
    # 여는 태그가 정확히 "<script>"(속성 없음)인 것만 인라인 스크립트로 본다.
    inline_scripts = re.findall(rb"<script>(.*?)</script>", stripped, flags=re.S)

    if not inline_scripts:
        print("::error::인라인 <script> 태그를 찾지 못했습니다.")
        return 1

    actual_hashes = {
        "sha256-" + base64.b64encode(hashlib.sha256(content).digest()).decode()
        for content in inline_scripts
    }

    declared_hashes = set(
        re.findall(r"script-src [^;]*'(sha256-[A-Za-z0-9+/=]+)'", data.decode("utf-8"))
    )
    if not declared_hashes:
        print("::error::CSP script-src에서 sha256 해시를 찾지 못했습니다.")
        return 1

    missing = actual_hashes - declared_hashes
    stale = declared_hashes - actual_hashes

    if missing or stale:
        print(
            "::error::CSP script-src 해시가 실제 <script> 내용과 다릅니다 — "
            "스크립트를 수정하고 해시 재계산을 잊은 것으로 보입니다."
        )
        for h in sorted(missing):
            print(f"::error::  선언 안 된 실제 해시(추가 필요): {h}")
        for h in sorted(stale):
            print(f"::error::  더는 안 쓰는 선언된 해시(제거 검토): {h}")
        return 1

    print(f"OK — CSP script-src 해시가 실제 <script> {len(inline_scripts)}개와 전부 일치함")
    return 0


if __name__ == "__main__":
    sys.exit(main())
