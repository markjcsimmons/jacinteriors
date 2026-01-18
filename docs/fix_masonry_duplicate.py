#!/usr/bin/env python3
"""
Fix duplicate code in masonry JavaScript that's causing syntax errors.
"""

import os
import re

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"

SPACE_PAGES = [
    'bathrooms', 'bedrooms', 'kitchens', 'dining-rooms', 'living-spaces',
    'office-spaces', 'kids-bedrooms', 'entryways', 'bar-area',
    'laundry-rooms', 'outdoor-spaces'
]

def fix_duplicate_code(html_file):
    """Remove duplicate code from masonry function."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the problematic setTimeout section with duplicate code
    # Pattern: setTimeout that contains duplicate forEach loops
    pattern = r'(// Set grid height after all images load\s+setTimeout\(\(\) => \{[^}]*const finalHeights = new Array\(columns\)\.fill\(0\);\s+)(// Set all items to absolute positioning with fixed width\s+items\.forEach[^}]*\}, 100\];)'
    
    # Replace with clean version
    replacement = r'\1items.forEach((item) => {\n                const left = parseFloat(item.style.left);\n                const colIndex = Math.round(left / (columnWidth + gap));\n                finalHeights[colIndex] = Math.max(finalHeights[colIndex], parseFloat(item.style.top) + item.offsetHeight);\n            });\n            grid.style.height = Math.max(...finalHeights) + gap + \'px\';\n        }, 100);'
    
    # Try a different approach - find the entire broken section
    # Look for the pattern where setTimeout has duplicate code inside
    lines = content.split('\n')
    new_lines = []
    in_duplicate = False
    skip_until = None
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Detect start of duplicate section
        if '// Set grid height after all images load' in line and i + 1 < len(lines) and 'setTimeout' in lines[i + 1]:
            # Check if next few lines contain duplicate code
            if i + 5 < len(lines) and '// Set all items to absolute positioning with fixed width' in lines[i + 5]:
                # This is the duplicate section - skip it and use the correct one later
                # Find where the correct setTimeout ends
                j = i
                while j < len(lines) and not (lines[j].strip() == '}, 100);' and j > i + 3):
                    j += 1
                # Skip to after the duplicate
                i = j + 1
                continue
        
        new_lines.append(line)
        i += 1
    
    content = '\n'.join(new_lines)
    
    # Also ensure there's only one closing brace for the function
    # Count function initMasonry occurrences
    init_count = content.count('function initMasonry()')
    if init_count > 1:
        # Keep only the first one
        parts = content.split('function initMasonry()')
        if len(parts) > 1:
            # Take first occurrence and everything after the last closing brace
            first_part = parts[0] + 'function initMasonry()' + parts[1]
            # Find the end of the first function
            brace_count = 0
            func_end = first_part.find('function initMasonry()')
            if func_end >= 0:
                search_start = func_end + len('function initMasonry()')
                for i in range(search_start, len(first_part)):
                    if first_part[i] == '{':
                        brace_count += 1
                    elif first_part[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            # Found end of function
                            content = first_part[:i+1] + content[content.find('}', i) + 1:]
                            break
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    print("=" * 70)
    print("Fixing Duplicate Code in Masonry JavaScript")
    print("=" * 70)
    
    for space_name in SPACE_PAGES:
        html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
        if os.path.exists(html_file):
            print(f"\n{space_name}.html:")
            # Read and manually fix
            with open(html_file, 'r') as f:
                content = f.read()
            
            # Find and remove the duplicate setTimeout block
            # Look for the pattern: setTimeout with duplicate forEach inside
            start_marker = '// Set grid height after all images load'
            end_marker = '}, 100);'
            
            # Find all setTimeout blocks
            import re
            pattern = r'(// Set grid height after all images load\s+setTimeout\(\(\) => \{[\s\S]*?)(}, 100\);)'
            matches = list(re.finditer(pattern, content))
            
            if len(matches) > 1:
                # Keep only the last (correct) one
                last_match = matches[-1]
                # Remove all but the last
                for match in matches[:-1]:
                    content = content[:match.start()] + content[match.end():]
                print(f"  ✓ Removed duplicate setTimeout blocks")
            
            # Also check for duplicate function definitions
            if content.count('function initMasonry()') > 1:
                # Keep only first occurrence
                parts = content.split('function initMasonry()', 2)
                if len(parts) == 3:
                    # Find end of first function
                    first_func = 'function initMasonry()' + parts[1]
                    # Count braces to find end
                    brace_count = 0
                    func_end = 0
                    for i, char in enumerate(first_func):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                func_end = i + 1
                                break
                    content = parts[0] + first_func[:func_end] + parts[2]
                    print(f"  ✓ Removed duplicate function definition")
            
            with open(html_file, 'w') as f:
                f.write(content)
        else:
            print(f"\n⚠ {space_name}.html: Not found")
    
    print("\n" + "=" * 70)
    print("✓ All spaces pages updated")
    print("=" * 70)

if __name__ == "__main__":
    main()
