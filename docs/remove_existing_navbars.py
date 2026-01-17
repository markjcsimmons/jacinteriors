#!/usr/bin/env python3
"""
Remove all existing navbar HTML from pages - navbar will be injected by script
"""

import os
import re

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def remove_navbar(filepath):
    """Remove existing navbar HTML from file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    original_content = content
    
    # Find and remove navbar (from <!-- Navigation --> to </nav>)
    # Also remove navbar spacer if present
    patterns = [
        (r'<!-- Navigation -->\s*<nav class="navbar">.*?</nav>', re.DOTALL),
        (r'<nav class="navbar">.*?</nav>', re.DOTALL),
        (r'<!-- Navbar spacer.*?</div>', re.DOTALL),
    ]
    
    for pattern, flags in patterns:
        content = re.sub(pattern, '', content, flags=flags)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Removed navbar"
    
    return True, "No navbar found"

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    all_files.sort()
    
    removed = 0
    no_change = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        success, msg = remove_navbar(filepath)
        
        if msg == "Removed navbar":
            print(f"✓ REMOVED: {rel_path}")
            removed += 1
        elif msg == "No navbar found":
            no_change += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Removed {removed}, No change {no_change}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
