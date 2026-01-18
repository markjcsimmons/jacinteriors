#!/usr/bin/env python3
"""
Remove any <img> references to missing files on spaces pages.

Sometimes prior edits duplicated image blocks outside the `.image-gallery-grid`.
This script removes image blocks whose `src` points to a non-existent file.
"""

from __future__ import annotations

import os
from bs4 import BeautifulSoup

DOCS_DIR = os.path.dirname(os.path.abspath(__file__))
SPACES = [
    "bathrooms",
    "bedrooms",
    "kitchens",
    "dining-rooms",
    "living-spaces",
    "office-spaces",
    "kids-bedrooms",
    "entryways",
    "bar-area",
    "laundry-rooms",
    "outdoor-spaces",
]


def has_class(tag, cls: str) -> bool:
    classes = tag.get("class", [])
    if isinstance(classes, str):
        classes = classes.split()
    return cls in classes


def closest_parallax_container(img_tag):
    node = img_tag
    while node and getattr(node, "name", None):
        if node.name == "div" and node.get("class"):
            classes = node.get("class")
            if isinstance(classes, str):
                classes = classes.split()
            if any("parallax-image" == c or "hover-zoom-image" == c for c in classes):
                return node
        node = node.parent
    return None


def purge_page(space: str) -> int:
    html_path = os.path.join(DOCS_DIR, f"{space}.html")
    if not os.path.exists(html_path):
        return 0

    html = open(html_path, "r", encoding="utf-8").read()
    soup = BeautifulSoup(html, "html.parser")

    removed = 0
    prefix = f"assets/images/spaces/{space}/"

    for img in list(soup.find_all("img")):
        src = img.get("src") or ""
        if not src.startswith(prefix):
            continue
        # Keep the first-row image even if missing (shouldn't happen after rebuild)
        if img.find_parent("div", class_="first-row-grid"):
            continue
        if not os.path.exists(os.path.join(DOCS_DIR, src)):
            container = closest_parallax_container(img)
            if container:
                container.decompose()
            else:
                img.decompose()
            removed += 1

    if removed:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(str(soup))

    return removed


def main() -> None:
    total = 0
    for space in SPACES:
        removed = purge_page(space)
        if removed:
            print(f"{space}: removed {removed} missing image blocks")
        total += removed
    print(f"Done. Removed {total} missing image blocks.")


if __name__ == "__main__":
    main()

