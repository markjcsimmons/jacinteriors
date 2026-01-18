#!/usr/bin/env python3
"""
Final fix for masonry image scaling - use setProperty with important flag.
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
    """Update masonry JavaScript to use setProperty for image scaling."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the image styling section
    # Look for the pattern where we set img.style properties
    old_pattern = r'// (Force images to scale down|Ensure images scale to fit column width)[\s\S]*?const img = item\.querySelector\([\'"]img[\'"]\);[\s\S]*?if \(img\) \{[\s\S]*?img\.style\.(width|objectFit|boxSizing)[\s\S]*?\}'
    
    new_code = '''// Force images to scale down to fit container width
                const img = item.querySelector('img');
                if (img) {
                    // Use setProperty with important to override any conflicting styles
                    img.style.setProperty('width', '100%', 'important');
                    img.style.setProperty('max-width', '100%', 'important');
                    img.style.setProperty('height', 'auto', 'important');
                    img.style.setProperty('display', 'block', 'important');
                    img.style.setProperty('object-fit', 'contain', 'important');
                    img.style.setProperty('box-sizing', 'border-box', 'important');
                }'''
    
    # Try to find and replace
    if 'img.style.width =' in content and 'setProperty' not in content:
        # Find the section
        pattern = r'(// (Force images|Ensure images)[\s\S]*?const img = item\.querySelector\([\'"]img[\'"]\);[\s\S]*?if \(img\) \{)[\s\S]*?(img\.style\.(width|objectFit|boxSizing)[\s\S]*?\})'
        content = re.sub(
            pattern,
            lambda m: m.group(1) + '\n                    ' + new_code.split('\n')[2:] + '\n                }',
            content,
            flags=re.DOTALL
        )
    
    # Simpler approach - just replace the img.style assignments
    if 'img.style.width =' in content:
        # Replace the entire block
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            if '// Force images to scale down' in line or '// Ensure images scale to fit' in line:
                # Found the start - replace this section
                new_lines.append('                // Force images to scale down to fit container width')
                new_lines.append('                const img = item.querySelector(\'img\');')
                new_lines.append('                if (img) {')
                new_lines.append('                    // Use setProperty with important to override any conflicting styles')
                new_lines.append('                    img.style.setProperty(\'width\', \'100%\', \'important\');')
                new_lines.append('                    img.style.setProperty(\'max-width\', \'100%\', \'important\');')
                new_lines.append('                    img.style.setProperty(\'height\', \'auto\', \'important\');')
                new_lines.append('                    img.style.setProperty(\'display\', \'block\', \'important\');')
                new_lines.append('                    img.style.setProperty(\'object-fit\', \'contain\', \'important\');')
                new_lines.append('                    img.style.setProperty(\'box-sizing\', \'border-box\', \'important\');')
                new_lines.append('                }')
                # Skip until we find the closing brace
                i += 1
                while i < len(lines) and not (lines[i].strip() == '}' and 'img' in lines[i-5:i+1]):
                    i += 1
                i += 1
                continue
            new_lines.append(line)
            i += 1
        content = '\n'.join(new_lines)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    print("=" * 70)
    print("Final Fix: Masonry Image Scaling with setProperty")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            fix_masonry_scaling(html_file)
            print(f"  ✓ Updated to use setProperty")
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
