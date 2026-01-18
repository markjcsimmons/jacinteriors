#!/usr/bin/env python3
"""
Fix image scaling in masonry grid to ensure images scale down to fit their column width.
"""

import os
import re
from bs4 import BeautifulSoup

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"

SPACE_PAGES = [
    'bathrooms', 'bedrooms', 'kitchens', 'dining-rooms', 'living-spaces',
    'office-spaces', 'kids-bedrooms', 'entryways', 'bar-area',
    'laundry-rooms', 'outdoor-spaces'
]

def fix_image_scaling(html_file):
    """Fix CSS and JavaScript to ensure images scale properly."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Fix CSS in style tag
    style_tags = soup.find_all('style')
    for style in style_tags:
        if style.string:
            # Ensure image-container and images scale properly
            css = style.string
            
            # Add/update image-container styles
            if '.image-gallery-grid .image-container' not in css:
                css += """
        .image-gallery-grid .image-container {
            width: 100%;
            overflow: hidden;
        }
        .image-gallery-grid .image-container img {
            width: 100%;
            height: auto;
            display: block;
            max-width: 100%;
            object-fit: contain;
        }
"""
            else:
                # Update existing styles
                css = re.sub(
                    r'\.image-gallery-grid \.image-container img\s*\{[^}]*\}',
                    '.image-gallery-grid .image-container img {\n            width: 100%;\n            height: auto;\n            display: block;\n            max-width: 100%;\n            object-fit: contain;\n        }',
                    css,
                    flags=re.DOTALL
                )
            
            style.string = css
    
    # Fix JavaScript to ensure images scale
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string and 'initMasonry' in script.string:
            js = script.string
            
            # Update the part where we set image styles
            js = re.sub(
                r'// Ensure images scale to fit column width\s*const img = item\.querySelector\([\'"]img[\'"]\);\s*if \(img\) \{[^}]*\}',
                '''// Ensure images scale to fit column width
                const img = item.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.maxWidth = '100%';
                    img.style.objectFit = 'contain';
                }
                const container = item.querySelector('.image-container');
                if (container) {
                    container.style.width = '100%';
                    container.style.overflow = 'hidden';
                }''',
                js,
                flags=re.DOTALL
            )
            
            script.string = js
    
    # Write updated HTML
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    return True

def main():
    print("=" * 70)
    print("Fixing Image Scaling in Masonry Grid")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            fix_image_scaling(html_file)
            print(f"  ✓ Fixed image scaling")
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
