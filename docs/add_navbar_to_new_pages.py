#!/usr/bin/env python3
"""
Automatically add navbar script to any HTML pages that are missing it.
This ensures all new pages automatically get the navbar.
"""

import os
import re
from pathlib import Path

def calculate_relative_path(filepath):
    """Calculate the relative path to assets/js/load-navbar.js from a given file."""
    filepath = Path(filepath)
    depth = len(filepath.parent.parts) - len(Path(filepath).parent.resolve().parts)
    
    # Count how many directories deep from docs/
    docs_dir = Path(__file__).parent
    relative_to_docs = filepath.relative_to(docs_dir)
    depth = len(relative_to_docs.parent.parts)
    
    if depth == 0:
        return 'assets/js/load-navbar.js'
    else:
        return '../' * depth + 'assets/js/load-navbar.js'

def has_navbar_script(filepath):
    """Check if file already has navbar script."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return 'load-navbar.js' in content
    except:
        return False

def add_navbar_script(filepath):
    """Add navbar script to a file if it's missing."""
    if has_navbar_script(filepath):
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if it's navbar.html itself
        if 'navbar.html' in str(filepath) or 'navbar-iframe.html' in str(filepath):
            return False
        
        # Calculate correct path
        script_path = calculate_relative_path(filepath)
        script_tag = f'    <script src="{script_path}"></script>'
        
        # Find </head> tag and insert before it
        if '</head>' in content:
            # Check if there's already a script tag before </head>
            head_pattern = r'(</head>)'
            replacement = f'{script_tag}\n\\1'
            content = re.sub(head_pattern, replacement, content, flags=re.IGNORECASE)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"⚠ Warning: {filepath} has no </head> tag")
            return False
            
    except Exception as e:
        print(f"⚠ Error processing {filepath}: {e}")
        return False

def main():
    docs_dir = Path(__file__).parent
    
    # Find all HTML files recursively
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html']]
    
    updated = []
    skipped = []
    
    for filepath in all_files:
        if has_navbar_script(filepath):
            skipped.append(filepath)
        else:
            if add_navbar_script(filepath):
                updated.append(filepath)
                print(f"✓ Added navbar to {filepath.relative_to(docs_dir)}")
    
    print(f"\n{'='*80}")
    print(f"Summary:")
    print(f"  ✓ Updated: {len(updated)}")
    print(f"  - Already had navbar: {len(skipped)}")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()
