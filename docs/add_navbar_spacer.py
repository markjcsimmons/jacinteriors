#!/usr/bin/env python3
"""
Add spacer div after navbar to prevent content from going under fixed navbar
"""

import os
import re

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def add_spacer(filepath):
    """Add spacer after navbar to account for fixed positioning."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    # Check if spacer already exists
    if 'navbar-spacer' in content:
        return True, "Already has spacer"
    
    # Find navbar and add spacer after it
    # Look for </nav> tag
    nav_pattern = r'(</nav>)'
    
    if re.search(nav_pattern, content):
        # Add spacer div after navbar
        spacer = '\n    <!-- Navbar spacer to prevent content overlap -->\n    <div class="navbar-spacer" style="height: 80px; width: 100%;"></div>'
        content = re.sub(nav_pattern, r'\1' + spacer, content, count=1)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Added spacer"
    
    return False, "No navbar found"

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
        success, msg = add_spacer(filepath)
        
        if msg == "Added spacer":
            print(f"✓ ADDED: {rel_path}")
            added += 1
        elif msg == "Already has spacer":
            already_has += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Added {added}, Already has {already_has}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
