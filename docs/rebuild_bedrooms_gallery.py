#!/usr/bin/env python3
"""
Rebuild `bedrooms.html` so it only references images that exist on disk.

Fixes:
- Remove duplicate/old <img> entries in `.image-gallery-grid`
- Use exact filenames from `assets/images/spaces/bedrooms/`
- Normalize .JPG -> .jpg on disk (important for case-sensitive hosts like GitHub Pages)
"""

from __future__ import annotations

import os
import re
from bs4 import BeautifulSoup

DOCS_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(DOCS_DIR, "bedrooms.html")
IMG_DIR = os.path.join(DOCS_DIR, "assets/images/spaces/bedrooms")


def safe_rename_case_insensitive(src: str, dest: str) -> None:
    """
    Rename even on case-insensitive filesystems by hopping via a temp name.
    """
    if src == dest:
        return
    if not os.path.exists(src):
        return
    tmp = dest + ".__tmp__"
    if os.path.exists(tmp):
        os.remove(tmp)
    os.rename(src, tmp)
    os.rename(tmp, dest)


def normalize_extensions() -> None:
    for name in os.listdir(IMG_DIR):
        base, ext = os.path.splitext(name)
        if ext in {".JPG", ".JPEG", ".PNG"}:
            src = os.path.join(IMG_DIR, name)
            dest = os.path.join(IMG_DIR, base + ext.lower())
            safe_rename_case_insensitive(src, dest)


def list_images() -> list[str]:
    files: list[str] = []
    for name in os.listdir(IMG_DIR):
        if name.lower().endswith((".jpg", ".jpeg", ".png")):
            files.append(name)

    def sort_key(n: str) -> tuple[int, str]:
        m = re.search(r"bedrooms-(\d+)", n)
        return (int(m.group(1)) if m else 10**9, n.lower())

    return sorted(files, key=sort_key)


def rebuild_html(files: list[str]) -> None:
    html = open(HTML_PATH, "r", encoding="utf-8").read()
    soup = BeautifulSoup(html, "html.parser")

    # Update first-row image to bedrooms-1.* (if present), else first available
    first_row_img = soup.select_one(".first-row-grid img")
    if first_row_img:
        preferred = next((f for f in files if f.startswith("bedrooms-1.")), None)
        chosen = preferred or (files[0] if files else None)
        if chosen:
            first_row_img["src"] = f"assets/images/spaces/bedrooms/{chosen}"

    grid = soup.select_one(".image-gallery-grid")
    if not grid:
        raise RuntimeError("Could not find .image-gallery-grid in bedrooms.html")

    # Clear existing gallery items
    for child in list(grid.children):
        # BeautifulSoup includes whitespace nodes; only decompose tags
        if getattr(child, "name", None):
            child.decompose()

    # Gallery should include everything except the first-row image (bedrooms-1.*)
    gallery_files = [f for f in files if not f.startswith("bedrooms-1.")]

    for fname in gallery_files:
        item = soup.new_tag("div", attrs={"class": "parallax-image scale-in-image hover-zoom-image"})
        container = soup.new_tag("div", attrs={"class": "image-container"})
        img = soup.new_tag(
            "img",
            attrs={
                "alt": "Bedrooms",
                "loading": "lazy",
                "src": f"assets/images/spaces/bedrooms/{fname}",
            },
        )
        container.append(img)
        item.append(container)
        grid.append(item)

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(str(soup))


def main() -> None:
    normalize_extensions()
    files = list_images()
    rebuild_html(files)
    print(f"Rebuilt bedrooms.html with {len(files)} images on disk ({len(files)-1} in gallery).")


if __name__ == "__main__":
    main()

