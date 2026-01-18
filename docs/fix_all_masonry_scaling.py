#!/usr/bin/env python3
"""
Fix masonry image scaling for all spaces pages - ensure images scale down to fit 3-column layout.
"""

import os
import re

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"

SPACE_PAGES = [
    'bathrooms', 'bedrooms', 'kitchens', 'dining-rooms', 'living-spaces',
    'office-spaces', 'kids-bedrooms', 'entryways', 'bar-area',
    'laundry-rooms', 'outdoor-spaces'
]

def fix_masonry_scaling(html_file):
    """Fix masonry JavaScript to ensure proper image scaling."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the JavaScript section that sets item styles
    # Replace the items.forEach section with better scaling
    old_pattern = r'// Set all items to absolute positioning with fixed width\s+items\.forEach\(\(item\) => \{[^}]+\}\);'
    
    new_code = '''// Set all items to absolute positioning with fixed width
            items.forEach((item) => {
                item.style.position = 'absolute';
                item.style.width = columnWidth + 'px';
                item.style.margin = '0';
                item.style.maxWidth = columnWidth + 'px'; // Force max width
                
                // Ensure container scales
                const container = item.querySelector('.image-container');
                if (container) {
                    container.style.width = '100%';
                    container.style.maxWidth = '100%';
                    container.style.overflow = 'hidden';
                    container.style.display = 'block';
                }
                
                // Ensure images scale to fit column width
                const img = item.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.maxWidth = '100%';
                    img.style.objectFit = 'contain';
                    img.style.boxSizing = 'border-box';
                }
            });'''
    
    # Try to find and replace the forEach block
    content = re.sub(
        r'items\.forEach\(\(item\) => \{[\s\S]*?// Ensure images scale to fit column width[\s\S]*?\}\);',
        new_code,
        content,
        flags=re.MULTILINE
    )
    
    # Also ensure CSS has proper constraints
    if '.image-gallery-grid .image-container {' not in content:
        # Add container styles before image styles
        content = re.sub(
            r'(\.image-gallery-grid \.image-container img \{)',
            r'''.image-gallery-grid .image-container {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            display: block;
        }
        \1''',
            content
        )
    
    # Ensure image styles are correct
    content = re.sub(
        r'\.image-gallery-grid \.image-container img \{[^}]*\}',
        '''.image-gallery-grid .image-container img {
            width: 100%;
            height: auto;
            display: block;
            max-width: 100%;
            object-fit: contain;
            box-sizing: border-box;
        }''',
        content,
        flags=re.DOTALL
    )
    
    # Remove inline width: 100% from divs that might conflict
    content = re.sub(
        r'<div class="parallax-image[^"]*" style="width: 100%;">',
        '<div class="parallax-image scale-in-image hover-zoom-image">',
        content
    )
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    print("=" * 70)
    print("Fixing Masonry Image Scaling - All Spaces Pages")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            fix_masonry_scaling(html_file)
            print(f"  ✓ Fixed scaling")
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
