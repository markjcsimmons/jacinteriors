#!/usr/bin/env python3
"""
Rebuild all spaces pages so galleries only reference images that exist on disk.

After filtering/renaming images, some HTML pages can still reference old numbers
(e.g. bathrooms-49.jpg) causing broken images. This script:
- Normalizes uppercase extensions in `assets/images/spaces/<space>/` to lowercase
  (important for GitHub Pages case-sensitive hosting)
- Replaces `.image-gallery-grid` contents with one entry per file on disk
- Updates the first-row image to `<space>-1.*` if present, else first file
"""

from __future__ import annotations

import os
import re
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


def safe_rename_case_insensitive(src: str, dest: str) -> None:
    if src == dest:
        return
    if not os.path.exists(src):
        return
    tmp = dest + ".__tmp__"
    if os.path.exists(tmp):
        os.remove(tmp)
    os.rename(src, tmp)
    os.rename(tmp, dest)


def normalize_extensions(img_dir: str) -> None:
    for name in os.listdir(img_dir):
        base, ext = os.path.splitext(name)
        if ext in {".JPG", ".JPEG", ".PNG"}:
            safe_rename_case_insensitive(
                os.path.join(img_dir, name),
                os.path.join(img_dir, base + ext.lower()),
            )


def list_images(space: str, img_dir: str) -> list[str]:
    files: list[str] = []
    for name in os.listdir(img_dir):
        if name.lower().endswith((".jpg", ".jpeg", ".png")) and name.startswith(f"{space}-"):
            files.append(name)

    def sort_key(n: str) -> tuple[int, str]:
        m = re.search(rf"{re.escape(space)}-(\d+)", n)
        return (int(m.group(1)) if m else 10**9, n.lower())

    return sorted(files, key=sort_key)


def rebuild_page(space: str, html_path: str, files: list[str]) -> None:
    html = open(html_path, "r", encoding="utf-8").read()
    soup = BeautifulSoup(html, "html.parser")

    # First-row image
    first_row_img = soup.select_one(".first-row-grid img")
    if first_row_img and files:
        preferred = next((f for f in files if f.startswith(f"{space}-1.")), None)
        chosen = preferred or files[0]
        first_row_img["src"] = f"assets/images/spaces/{space}/{chosen}"

    grid = soup.select_one(".image-gallery-grid")
    if not grid:
        # Some pages may not have been generated with this template
        return

    # Clear existing gallery items
    for child in list(grid.children):
        if getattr(child, "name", None):
            child.decompose()

    # Gallery contains everything except the first-row image (space-1.*)
    gallery_files = [f for f in files if not f.startswith(f"{space}-1.")]

    for fname in gallery_files:
        item = soup.new_tag("div", attrs={"class": "parallax-image scale-in-image hover-zoom-image"})
        container = soup.new_tag("div", attrs={"class": "image-container"})
        img = soup.new_tag(
            "img",
            attrs={
                "alt": space.replace("-", " ").title(),
                "loading": "lazy",
                "src": f"assets/images/spaces/{space}/{fname}",
            },
        )
        container.append(img)
        item.append(container)
        grid.append(item)

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(str(soup))


def main() -> None:
    updated = 0
    for space in SPACES:
        html_path = os.path.join(DOCS_DIR, f"{space}.html")
        img_dir = os.path.join(DOCS_DIR, "assets/images/spaces", space)
        if not os.path.exists(html_path) or not os.path.isdir(img_dir):
            continue

        normalize_extensions(img_dir)
        files = list_images(space, img_dir)
        rebuild_page(space, html_path, files)
        updated += 1
        print(f"{space}: rebuilt gallery from {len(files)} files")

    print(f"Done. Updated {updated} pages.")


if __name__ == "__main__":
    main()

