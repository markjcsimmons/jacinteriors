#!/usr/bin/env python3
"""
Move load-navbar.js script from end of body to head for early loading
"""

import os
import re

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def move_script_to_head(filepath):
    """Move load-navbar.js from body to head."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    # Find the script tag in body
    script_pattern = r'<script src="([^"]*load-navbar\.js)"></script>'
    match = re.search(script_pattern, content)
    
    if not match:
        return True, "No load-navbar.js found"
    
    script_tag = match.group(0)
    script_path = match.group(1)
    
    # Calculate relative path for head (might need adjustment)
    rel_path = os.path.relpath(filepath, DOCS_DIR)
    depth = rel_path.count('/')
    
    if depth > 0 and not script_path.startswith('../'):
        script_path = '../' * depth + 'assets/js/load-navbar.js'
        script_tag = f'<script src="{script_path}"></script>'
    
    # Remove from body
    content = content.replace(match.group(0), '')
    
    # Add to head (before </head>)
    if '</head>' in content:
        content = content.replace('</head>', f'    {script_tag}\n</head>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Moved to head"
    
    return False, "No </head> tag found"

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    all_files.sort()
    
    moved = 0
    no_change = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        success, msg = move_script_to_head(filepath)
        
        if msg == "Moved to head":
            print(f"✓ MOVED: {rel_path}")
            moved += 1
        elif msg == "No load-navbar.js found":
            no_change += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Moved {moved}, No change {no_change}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
