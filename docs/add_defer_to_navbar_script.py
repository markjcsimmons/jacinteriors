#!/usr/bin/env python3
"""Add defer attribute to all navbar script tags to prevent blocking"""

import re
from pathlib import Path

def add_defer(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find script tag with load-navbar.js and add defer if not present
    pattern = r'(<script[^>]*src=["\'][^"\']*load-navbar\.js[^"\']*["\'][^>]*)(>)'
    
    def replace_script(match):
        tag = match.group(1)
        closing = match.group(2)
        if 'defer' not in tag:
            return tag + ' defer' + closing
        return match.group(0)
    
    new_content = re.sub(pattern, replace_script, content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    docs_dir = Path(__file__).parent
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html']]
    
    updated = []
    for filepath in sorted(all_files):
        if add_defer(filepath):
            updated.append(filepath.relative_to(docs_dir))
            print(f"✓ Added defer to {filepath.relative_to(docs_dir)}")
    
    print(f"\nUpdated {len(updated)} files")

if __name__ == '__main__':
    main()
