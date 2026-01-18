#!/usr/bin/env python3
"""
Fix ALL HTML pages to have proper head structure with Google Fonts.
"""

import os
import re
from pathlib import Path

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

# Google Fonts links that should be in every page
FONT_LINKS = '''    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">'''

def fix_page(filepath):
    """Fix a single page to include Google Fonts."""
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Cannot read: {e}"
    
    original_content = content
    
    # Check if already has Google Fonts properly
    if 'Plus+Jakarta+Sans' in content or 'Plus Jakarta Sans' in content:
        if 'fonts.googleapis.com' in content:
            return True, "Already has fonts"
    
    # Fix malformed </meta></head>
    content = content.replace('</meta></head>', '</head>')
    
    # Check if it has fonts.googleapis but wrong font
    if 'fonts.googleapis.com' in content and 'Plus+Jakarta+Sans' not in content:
        # Replace the existing Google Fonts link with correct one
        # Find and replace the font link
        content = re.sub(
            r'<link[^>]*fonts\.googleapis\.com/css2\?family=[^"]*"[^>]*>',
            '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">',
            content
        )
    
    # If still missing Google Fonts, add them
    if 'fonts.googleapis.com' not in content:
        # Find the </head> tag and insert fonts before it
        # First, find where to insert (after last <link> or <meta> before </head>)
        
        # Try to insert after the stylesheet link
        if 'style.css' in content:
            # Find the style.css link and insert after it
            style_match = re.search(r'(<link[^>]*style\.css[^>]*>)', content)
            if style_match:
                insert_pos = style_match.end()
                content = content[:insert_pos] + '\n' + FONT_LINKS + content[insert_pos:]
        else:
            # Insert before </head>
            content = content.replace('</head>', FONT_LINKS + '\n</head>')
    
    # If still missing preconnect, add them
    if 'rel="preconnect"' not in content and 'fonts.googleapis.com' in content:
        # Add preconnect before the fonts link
        font_link_match = re.search(r'(<link[^>]*fonts\.googleapis\.com[^>]*>)', content)
        if font_link_match:
            preconnect = '''    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
'''
            content = content[:font_link_match.start()] + preconnect + content[font_link_match.start():]
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Fixed"
    
    return True, "No changes needed"

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    all_files.sort()
    
    fixed = 0
    already_ok = 0
    errors = 0
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        success, msg = fix_page(filepath)
        
        if msg == "Fixed":
            print(f"✓ FIXED: {rel_path}")
            fixed += 1
        elif msg == "Already has fonts" or msg == "No changes needed":
            already_ok += 1
        else:
            print(f"✗ ERROR: {rel_path} - {msg}")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: Fixed {fixed}, Already OK {already_ok}, Errors {errors}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
