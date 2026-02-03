#!/usr/bin/env python3
"""
Bump load-navbar.js cache-busting version across docs/**/*.html.

This updates any script tag src that points to:
  assets/js/load-navbar.js
  ../assets/js/load-navbar.js
  ../../assets/js/load-navbar.js
... etc
to include ?v=<NEW_VERSION>.

It also optionally removes the known-bad corrupted script tag src="../P260131-3" that
was previously introduced.
"""

from __future__ import annotations

import re
from pathlib import Path


NEW_VERSION = "20260203-2"

ROOT = Path(__file__).resolve().parents[1]  # jacinteriors/
DOCS = ROOT / "docs"


def update_html(text: str) -> tuple[str, int]:
    n = 0

    # Remove corrupted script tag if present
    # (Keep this narrow to avoid accidental deletions.)
    bad_script_re = re.compile(
        r"""\s*<script\s+src=(['"])\.\./P260131-3\1\s+defer></script>\s*\n?""",
        re.IGNORECASE,
    )
    text2, c = bad_script_re.subn("", text)
    if c:
        text = text2
        n += c

    # Ensure any src ending with assets/js/load-navbar.js has ?v=NEW_VERSION
    # Handles both single and double quotes.
    src_re = re.compile(
        r"""src=(['"])((?:\.\./)*assets/js/load-navbar\.js)(\?v=[^'"]+)?\1""",
        re.IGNORECASE,
    )

    def repl(m: re.Match) -> str:
        nonlocal n
        quote = m.group(1)
        path = m.group(2)
        n += 1
        return f'src={quote}{path}?v={NEW_VERSION}{quote}'

    text = src_re.sub(repl, text)
    return text, n


def main() -> None:
    if not DOCS.exists():
        raise SystemExit(f"docs/ not found at {DOCS}")

    html_files = sorted(DOCS.rglob("*.html"))
    total_changed_files = 0
    total_replacements = 0

    for p in html_files:
        original = p.read_text(encoding="utf-8", errors="ignore")
        updated, reps = update_html(original)
        if updated != original:
            p.write_text(updated, encoding="utf-8")
            total_changed_files += 1
            total_replacements += reps

    print(
        f"Updated load-navbar.js version to {NEW_VERSION} in "
        f"{total_changed_files} file(s) ({total_replacements} replacement(s))."
    )


if __name__ == "__main__":
    main()

