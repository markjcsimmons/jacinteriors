#!/usr/bin/env python3
"""
Restore page structure based on requirements:
1. Remove stray characters (\1)
2. Ensure all pages have navbar script with defer
3. Ensure project pages have masonry JavaScript
4. Ensure space pages have correct titles (exact match to dropdown)
5. Remove YEAR field from project pages if present
"""

import re
from pathlib import Path

docs_dir = Path(__file__).parent

# Space page titles (exact match to dropdown)
SPACE_TITLES = {
    'bathrooms.html': 'Bathrooms',
    'bedrooms.html': 'Bedrooms',
    'kitchens.html': 'Kitchens',
    'dining-rooms.html': 'Dining Rooms',
    'living-spaces.html': 'Living Spaces',
    'office-spaces.html': 'Office Spaces',
    'kids-bedrooms.html': "Kid's Bedrooms",
    'entryways.html': 'Entryways',
    'bar-area.html': 'Bar Area',
    'laundry-rooms.html': 'Laundry Rooms',
    'outdoor-spaces.html': 'Outdoor Spaces'
}

def fix_stray_characters(content):
    """Remove stray \1 characters"""
    content = re.sub(r'\\1\s*', '', content)
    return content

def ensure_navbar_script(content, is_subdirectory=False):
    """Ensure navbar script is present with defer attribute"""
    script_path = '../assets/js/load-navbar.js' if is_subdirectory else 'assets/js/load-navbar.js'
    script_tag = f'<script src="{script_path}" defer></script>'
    
    # Check if script exists
    if 'load-navbar.js' in content:
        # Update to ensure it has defer
        content = re.sub(
            r'<script\s+src=["\']([^"\']*load-navbar\.js[^"\']*)["\']\s*></script>',
            script_tag,
            content
        )
        # If no defer, add it
        if 'defer' not in content or f'src="{script_path}"' not in content:
            # Remove old script tag
            content = re.sub(
                r'<script\s+src=["\'][^"\']*load-navbar\.js[^"\']*["\'][^>]*></script>',
                '',
                content
            )
            # Add before </head>
            content = content.replace('</head>', f'    {script_tag}\n</head>')
    else:
        # Add script before </head>
        content = content.replace('</head>', f'    {script_tag}\n</head>')
    
    return content

def remove_year_field(content):
    """Remove YEAR field from project header metadata"""
    # Pattern to match Year field in metadata section
    patterns = [
        r'<div class="scroll-fade-in delay-\d+">\s*<div[^>]*>Year</div>\s*<div[^>]*>.*?</div>\s*</div>',
        r'<div[^>]*>Year</div>\s*<div[^>]*>.*?</div>',
    ]
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    return content

def ensure_masonry_js(content):
    """Ensure masonry JavaScript is present in project pages"""
    if 'initMasonry' in content:
        return content  # Already has masonry JS
    
    masonry_js = '''
    <script>
        // Masonry layout implementation
        function initMasonry() {
            const grid = document.querySelector('.image-gallery-grid');
            if (!grid) return;
            
            const items = Array.from(grid.children);
            if (items.length === 0) return;
            
            const gap = 16;
            let columns = 2;
            
            if (window.innerWidth <= 768) {
                columns = 1;
            } else if (window.innerWidth >= 1200) {
                columns = 3;
            }
            
            const containerWidth = grid.offsetWidth;
            const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
            const columnHeights = new Array(columns).fill(0);
            
            items.forEach((item, index) => {
                const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
                const left = shortestColumnIndex * (columnWidth + gap);
                const top = columnHeights[shortestColumnIndex];
                
                item.style.left = left + 'px';
                item.style.top = top + 'px';
                item.style.width = columnWidth + 'px';
                
                const itemHeight = item.offsetHeight;
                columnHeights[shortestColumnIndex] += itemHeight + gap;
            });
            
            grid.style.height = Math.max(...columnHeights) + 'px';
        }

        window.addEventListener('load', () => {
            const images = document.querySelectorAll('.image-gallery-grid img');
            let loadedCount = 0;
            
            if (images.length === 0) {
                initMasonry();
                return;
            }
            
            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        initMasonry();
                    }
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            initMasonry();
                        }
                    });
                }
            });
        });

        window.addEventListener('resize', () => {
            initMasonry();
        });
    </script>'''
    
    # Add before </body>
    if '</body>' in content:
        content = content.replace('</body>', masonry_js + '\n</body>')
    
    return content

def fix_space_title(content, filename):
    """Fix space page title to match dropdown exactly"""
    if filename not in SPACE_TITLES:
        return content
    
    expected_title = SPACE_TITLES[filename]
    
    # Fix <h1> title in header section
    # Pattern: <h1>...title...</h1> in the header section
    header_pattern = r'(<section[^>]*padding: 3rem 0[^>]*>.*?<h1[^>]*>)(.*?)(</h1>)'
    
    def replace_title(match):
        return match.group(1) + expected_title + match.group(3)
    
    content = re.sub(header_pattern, replace_title, content, flags=re.DOTALL)
    
    # Also fix <title> tag
    content = re.sub(
        r'<title>.*?</title>',
        f'<title>{expected_title} | JAC Interiors</title>',
        content,
        flags=re.IGNORECASE
    )
    
    return content

def process_file(filepath):
    """Process a single HTML file"""
    relative_path = filepath.relative_to(docs_dir)
    is_subdirectory = 'projects' in str(relative_path) or 'cities' in str(relative_path)
    is_project = 'projects' in str(relative_path)
    is_space = relative_path.name in SPACE_TITLES
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Fix stray characters
        content = fix_stray_characters(content)
        
        # 2. Ensure navbar script
        content = ensure_navbar_script(content, is_subdirectory)
        
        # 3. Remove YEAR field from projects
        if is_project:
            content = remove_year_field(content)
            # Ensure masonry JS
            if '.image-gallery-grid' in content:
                content = ensure_masonry_js(content)
        
        # 4. Fix space page titles
        if is_space:
            content = fix_space_title(content, relative_path.name)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {relative_path}")
            return True
        
        return False
    
    except Exception as e:
        print(f"✗ Error processing {relative_path}: {e}")
        return False

def main():
    """Process all HTML files"""
    html_files = list(docs_dir.rglob('*.html'))
    
    print(f"Processing {len(html_files)} HTML files...")
    print()
    
    fixed_count = 0
    for filepath in html_files:
        if process_file(filepath):
            fixed_count += 1
    
    print()
    print(f"✓ Fixed {fixed_count} files")
    print("✓ All pages restored to correct structure")

if __name__ == '__main__':
    main()
