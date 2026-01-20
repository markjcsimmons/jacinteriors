#!/usr/bin/env python3
"""
Create an R2 manifest.json for a Spaces folder from a local directory.

Usage:
  python3 make_r2_manifest.py "/path/to/bedrooms" > manifest.json

Then upload `manifest.json` into your R2 folder:
  spaces/bedrooms/manifest.json

The website will map:
  bedrooms-1.jpg -> manifest[0]
  bedrooms-2.jpg -> manifest[1]
  ...
"""

from __future__ import annotations

import json
import os
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 make_r2_manifest.py \"/path/to/images_folder\"", file=sys.stderr)
        return 2

    src_dir = sys.argv[1]
    if not os.path.isdir(src_dir):
        print(f"Not a directory: {src_dir}", file=sys.stderr)
        return 2

    files: list[str] = []
    for name in os.listdir(src_dir):
        if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
            files.append(name)

    files.sort()
    payload = {"files": files}
    sys.stdout.write(json.dumps(payload, indent=2))
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

