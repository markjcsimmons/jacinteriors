#!/usr/bin/env python3
"""
Fix masonry layout for all spaces pages to ensure exactly 3 images per row on desktop.
Update the JavaScript to properly scale images and maintain 3-column layout.
"""

import os
import re
from bs4 import BeautifulSoup

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"

SPACE_PAGES = [
    'bathrooms',
    'bedrooms',
    'kitchens',
    'dining-rooms',
    'living-spaces',
    'office-spaces',
    'kids-bedrooms',
    'entryways',
    'bar-area',
    'laundry-rooms',
    'outdoor-spaces',
]

MASONRY_SCRIPT = '''        function initMasonry() {
            const grid = document.querySelector('.image-gallery-grid');
            if (!grid) return;
            const items = Array.from(grid.children);
            if (items.length === 0) return;
            
            const gap = 16;
            let columns = 2;
            if (window.innerWidth <= 768) {
                columns = 1;
            } else if (window.innerWidth >= 1200) {
                columns = 3; // Exactly 3 columns on desktop
            }
            
            const containerWidth = grid.offsetWidth;
            const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
            
            // Set grid container to relative positioning
            grid.style.position = 'relative';
            grid.style.width = '100%';
            
            // Set all items to absolute positioning with fixed width
            items.forEach((item) => {
                item.style.position = 'absolute';
                item.style.width = columnWidth + 'px';
                item.style.margin = '0';
                
                // Ensure images scale to fit column width
                const img = item.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.maxWidth = '100%';
                }
            });
            
            // Arrange items in columns
            const columnHeights = new Array(columns).fill(0);
            items.forEach((item, index) => {
                const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
                const left = shortestColumnIndex * (columnWidth + gap);
                const top = columnHeights[shortestColumnIndex];
                
                item.style.left = left + 'px';
                item.style.top = top + 'px';
                
                // Get actual height after image loads
                const img = item.querySelector('img');
                if (img && img.complete) {
                    const itemHeight = item.offsetHeight || img.offsetHeight;
                    columnHeights[shortestColumnIndex] += itemHeight + gap;
                } else if (img) {
                    img.addEventListener('load', function() {
                        const itemHeight = item.offsetHeight || img.offsetHeight;
                        columnHeights[shortestColumnIndex] += itemHeight + gap;
                        grid.style.height = Math.max(...columnHeights) + 'px';
                    }, { once: true });
                    // Estimate height for now
                    columnHeights[shortestColumnIndex] += 300 + gap;
                } else {
                    const itemHeight = item.offsetHeight || 300;
                    columnHeights[shortestColumnIndex] += itemHeight + gap;
                }
            });
            
            // Set grid height after all images load
            setTimeout(() => {
                const finalHeights = new Array(columns).fill(0);
                items.forEach((item) => {
                    const left = parseFloat(item.style.left);
                    const colIndex = Math.round(left / (columnWidth + gap));
                    finalHeights[colIndex] = Math.max(finalHeights[colIndex], parseFloat(item.style.top) + item.offsetHeight);
                });
                grid.style.height = Math.max(...finalHeights) + gap + 'px';
            }, 100);
        }'''

def fix_masonry_script(html_file):
    """Update the masonry script in an HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the script tag containing initMasonry
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string and 'initMasonry' in script.string:
            # Replace the function
            old_function = re.search(r'function initMasonry\(\)\s*\{[^}]*\}', script.string, re.DOTALL)
            if old_function:
                script.string = script.string.replace(old_function.group(0), MASONRY_SCRIPT.strip())
                print(f"  ✓ Updated masonry script")
                break
    
    # Also fix CSS for image-gallery-grid
    style_tags = soup.find_all('style')
    for style in style_tags:
        if style.string:
            # Remove fixed width from .image-gallery-grid > div
            style.string = re.sub(
                r'\.image-gallery-grid > div\s*\{[^}]*width:\s*calc\(50%[^}]*\}',
                '.image-gallery-grid > div {\n            position: absolute;\n            box-sizing: border-box;\n            transition: transform 0.3s ease;\n        }',
                style.string,
                flags=re.DOTALL
            )
    
    # Write updated HTML
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    return True

def main():
    print("=" * 70)
    print("Fixing Masonry Layout - 3 Images Per Row on Desktop")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            fix_masonry_script(html_file)
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
