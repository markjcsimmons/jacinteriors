#!/usr/bin/env python3
"""
Remove inline width: 100% styles from masonry grid items that conflict with JavaScript.
"""

import os
import re

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"

SPACE_PAGES = [
    'bathrooms', 'bedrooms', 'kitchens', 'dining-rooms', 'living-spaces',
    'office-spaces', 'kids-bedrooms', 'entryways', 'bar-area',
    'laundry-rooms', 'outdoor-spaces'
]

def remove_inline_widths(html_file):
    """Remove inline width styles from masonry grid items."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove inline width: 100% from masonry grid items
    # Pattern: <div class="parallax-image..." style="width: 100%;">
    content = re.sub(
        r'<div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">',
        '<div class="parallax-image scale-in-image hover-zoom-image">',
        content
    )
    
    # Also handle variations
    content = re.sub(
        r'<div class="parallax-image[^"]*" style="width:\s*100%;">',
        lambda m: m.group(0).replace(' style="width: 100%;"', ''),
        content
    )
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    print("=" * 70)
    print("Removing Conflicting Inline Width Styles")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            remove_inline_widths(html_file)
            print(f"  ✓ Removed conflicting inline styles")
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
