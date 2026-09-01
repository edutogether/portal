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
"""
import hashlib
import base64
import re
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 화살표 등 특수문자 출력이 깨지지 않도록.
sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT / "index.html"


def main() -> int:
    data = INDEX_HTML.read_bytes()

    # HTML 주석(<!-- -->) 안에 "<script>"라는 글자가 언급될 수 있어서(예: 이
    # 파일 자체의 설명 주석), 먼저 주석을 전부 들어낸 뒤 진짜 <script> 태그를
    # 찾는다 — 안 그러면 주석 속 문자열을 진짜 태그로 잘못 잡을 수 있다.
    stripped = re.sub(rb"<!--.*?-->", b"", data, flags=re.S)

    start_tag = b"<script>"
    end_tag = b"</script>"
    start = stripped.index(start_tag) + len(start_tag)
    end = stripped.index(end_tag, start)
    content = stripped[start:end]

    actual_hash = "sha256-" + base64.b64encode(
        hashlib.sha256(content).digest()
    ).decode()

    m = re.search(
        r"script-src [^;]*'(sha256-[A-Za-z0-9+/=]+)'", data.decode("utf-8")
    )
    if not m:
        print("::error::CSP script-src에서 sha256 해시를 찾지 못했습니다.")
        return 1
    declared_hash = m.group(1)

    if declared_hash != actual_hash:
        print(
            "::error::CSP script-src 해시가 실제 <script> 내용과 다릅니다 — "
            "스크립트를 수정하고 해시 재계산을 잊은 것으로 보입니다."
        )
        print(f"::error::  선언된 해시: {declared_hash}")
        print(f"::error::  실제 해시:   {actual_hash}")
        return 1

    print(f"OK — CSP script-src 해시가 실제 <script> 내용과 일치함 ({actual_hash})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
