#!/usr/bin/env python3
"""
Add Plus Jakarta Sans font import to all pages that are missing it.
This ensures navbar fonts render correctly.
"""

import re
from pathlib import Path

def add_font_import(filepath):
    """Add Google Fonts import for Plus Jakarta Sans if missing."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if font is already there
    if 'Plus Jakarta Sans' in content:
        return False
    
    # Find the head section
    head_match = re.search(r'(<head[^>]*>)(.*?)(</head>)', content, re.DOTALL | re.IGNORECASE)
    if not head_match:
        return False
    
    head_start = head_match.group(1)
    head_content = head_match.group(2)
    head_end = head_match.group(3)
    
    # Check if there's a stylesheet link or preconnect
    # Add font imports after preconnect or before closing head
    font_import = '''    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">'''
    
    # Check if preconnect already exists
    if 'fonts.googleapis.com' in head_content:
        # Font import might be missing, check if we need to add it
        if 'Plus Jakarta Sans' not in head_content:
            # Try to add after existing preconnect
            pattern = r'(<link[^>]*fonts\.googleapis\.com[^>]*>)'
            if re.search(pattern, head_content):
                head_content = re.sub(pattern, r'\\1\n' + font_import, head_content, count=1)
            else:
                # Add before closing head
                head_content = head_content + '\n' + font_import
    else:
        # Add before closing head
        head_content = head_content + '\n' + font_import
    
    new_content = head_start + head_content + head_end
    content = content[:head_match.start()] + new_content + content[head_match.end():]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    docs_dir = Path(__file__).parent
    
    # Find all HTML files recursively
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html', 'PAGE_TEMPLATE.html']]
    
    updated = []
    
    for filepath in sorted(all_files):
        if add_font_import(filepath):
            updated.append(filepath.relative_to(docs_dir))
            print(f"✓ Added font import to {filepath.relative_to(docs_dir)}")
    
    print(f"\n{'='*80}")
    print(f"Updated {len(updated)} files")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()
