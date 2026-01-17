#!/usr/bin/env python3
"""
Verify that all pages have correct navbar setup and no conflicting styles.
"""

import os
import re
from pathlib import Path

def check_page(filepath):
    """Check a page for navbar issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for navbar-dark class (makes links white - wrong!)
        if 'navbar-dark' in content and 'class=' in content:
            # Check if it's in a script or actual HTML
            if re.search(r'class=["\'][^"\']*navbar-dark', content):
                issues.append("Has 'navbar-dark' class - will make links white")
        
        # Check for hardcoded nav tags that might conflict
        nav_tags = re.findall(r'<nav[^>]*>', content, re.IGNORECASE)
        if len(nav_tags) > 0:
            # Check if it's in a comment or actual HTML
            for tag in nav_tags:
                # Find context around the tag
                tag_pos = content.find(tag)
                if tag_pos > 0:
                    context = content[max(0, tag_pos-50):tag_pos+100]
                    if '<!--' not in context[:50]:  # Not in a comment
                        issues.append(f"Found hardcoded <nav> tag: {tag[:50]}...")
        
        # Check if load-navbar.js path is correct for subdirectories
        if 'load-navbar.js' in content:
            # Check path
            if '../assets/js/load-navbar.js' in content:
                # This is correct for subdirectories
                pass
            elif 'assets/js/load-navbar.js' in content:
                # Check if file is in subdirectory
                relative = filepath.relative_to(Path(__file__).parent)
                if len(relative.parent.parts) > 1:  # In a subdirectory
                    issues.append("Navbar script path may be wrong for subdirectory")
        
    except Exception as e:
        issues.append(f"Error: {e}")
    
    return issues

def main():
    docs_dir = Path(__file__).parent
    
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html', 'PAGE_TEMPLATE.html']]
    
    pages_with_issues = []
    
    for filepath in sorted(all_files):
        issues = check_page(filepath)
        if issues:
            pages_with_issues.append((filepath.relative_to(docs_dir), issues))
    
    if pages_with_issues:
        print("=" * 80)
        print("PAGES WITH NAVBAR STYLING ISSUES:")
        print("=" * 80)
        for filepath, issues in pages_with_issues:
            print(f"\n{filepath}:")
            for issue in issues:
                print(f"  ⚠ {issue}")
    else:
        print("✓ All pages have correct navbar setup!")
    
    print(f"\nTotal pages checked: {len(all_files)}")

if __name__ == '__main__':
    main()
