#!/usr/bin/env python3
"""
Add navbar.js script to all HTML pages to ensure consistent navbar
"""

import os
import re

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def add_navbar_script(filepath):
    """Add navbar.js script before closing body tag."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    # Check if navbar.js is already included
    if 'navbar.js' in content:
        return True, "Already has navbar.js"
    
    # Find closing head tag or opening body tag to insert early
    # Prefer inserting in head before closing </head> for early load
    if '</head>' in content:
        script_tag = '    <script src="assets/js/navbar.js"></script>\n'
        
        # Check if we need relative path (for subdirectories)
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        if '/' in rel_path:
            # Calculate relative path depth
            depth = rel_path.count('/')
            script_tag = '    <script src="' + '../' * depth + 'assets/js/navbar.js"></script>\n'
        
        # Insert before </head> for early load
        content = content.replace('</head>', script_tag + '</head>')
    elif '</body>' in content:
        script_tag = '    <script src="assets/js/navbar.js"></script>\n'
        
        # Check if we need relative path (for subdirectories)
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        if '/' in rel_path:
            # Calculate relative path depth
            depth = rel_path.count('/')
            script_tag = '    <script src="' + '../' * depth + 'assets/js/navbar.js"></script>\n'
        
        # Insert before </body>
        content = content.replace('</body>', script_tag + '</body>')
    else:
        return False, "No </head> or </body> tag found"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True, "Added navbar.js"

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    all_files.sort()
    
    added = 0
    already_has = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        success, msg = add_navbar_script(filepath)
        
        if msg == "Added navbar.js":
            print(f"✓ ADDED: {rel_path}")
            added += 1
        elif msg == "Already has navbar.js":
            already_has += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Added {added}, Already had {already_has}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
