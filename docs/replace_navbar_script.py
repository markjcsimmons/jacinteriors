#!/usr/bin/env python3
"""
Replace navbar.js with load-navbar.js on all pages
"""

import os
import re

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def replace_script(filepath):
    """Replace navbar.js with load-navbar.js."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    # Replace navbar.js with load-navbar.js
    if 'navbar.js' in content:
        content = content.replace('navbar.js', 'load-navbar.js')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Replaced"
    
    return True, "No navbar.js found"

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    all_files.sort()
    
    replaced = 0
    no_change = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        success, msg = replace_script(filepath)
        
        if msg == "Replaced":
            print(f"✓ REPLACED: {rel_path}")
            replaced += 1
        elif msg == "No navbar.js found":
            no_change += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Replaced {replaced}, No change {no_change}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
