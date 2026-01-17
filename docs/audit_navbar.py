#!/usr/bin/env python3
"""
Audit all HTML pages to ensure navbar is included and properly configured.
"""

import os
import re
from pathlib import Path

def check_navbar_in_file(filepath):
    """Check if a file has the navbar script and return issues found."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if load-navbar.js is included
        if 'load-navbar.js' not in content:
            issues.append("Missing load-navbar.js script")
        
        # Check if script is in head (should be)
        if 'load-navbar.js' in content:
            # Check if it's in head section
            head_match = re.search(r'<head>.*?</head>', content, re.DOTALL | re.IGNORECASE)
            if head_match:
                head_content = head_match.group(0)
                if 'load-navbar.js' not in head_content:
                    issues.append("load-navbar.js should be in <head> section")
        
        # Check for any existing <nav> tags that might conflict
        if '<nav' in content and 'load-navbar.js' in content:
            # Count nav tags
            nav_count = len(re.findall(r'<nav[^>]*>', content, re.IGNORECASE))
            if nav_count > 0:
                issues.append(f"Found {nav_count} existing <nav> tag(s) - should be removed (navbar is injected dynamically)")
        
        # Check for navbar-spacer that might be hardcoded
        if 'navbar-spacer' in content and 'load-navbar.js' in content:
            # Check if it's in the HTML (should only be in navbar.html)
            # The spacer should come from navbar.html, not be hardcoded
            spacer_pattern = r'<div[^>]*class="navbar-spacer"[^>]*>'
            if re.search(spacer_pattern, content, re.IGNORECASE):
                issues.append("Found hardcoded navbar-spacer - should be removed (comes from navbar.html)")
        
    except Exception as e:
        issues.append(f"Error reading file: {e}")
    
    return issues

def main():
    docs_dir = Path(__file__).parent
    
    # Recursively find all HTML files, excluding navbar.html and navbar-iframe.html
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html']]
    all_files.sort()
    
    pages_with_issues = []
    pages_missing_navbar = []
    pages_ok = []
    
    print("=" * 80)
    print("NAVBAR AUDIT REPORT")
    print("=" * 80)
    print()
    
    for filepath in all_files:
        filename = filepath.name
        issues = check_navbar_in_file(filepath)
        
        if not issues:
            pages_ok.append(filename)
        elif "Missing load-navbar.js script" in issues:
            pages_missing_navbar.append((filename, issues))
        else:
            pages_with_issues.append((filename, issues))
    
    # Report results
    print(f"✓ Pages with navbar correctly configured: {len(pages_ok)}")
    print(f"⚠ Pages missing navbar script: {len(pages_missing_navbar)}")
    print(f"⚠ Pages with navbar issues: {len(pages_with_issues)}")
    print()
    
    if pages_missing_navbar:
        print("=" * 80)
        print("PAGES MISSING NAVBAR SCRIPT:")
        print("=" * 80)
        for filename, issues in pages_missing_navbar:
            print(f"\n{filename}:")
            for issue in issues:
                print(f"  - {issue}")
    
    if pages_with_issues:
        print("\n" + "=" * 80)
        print("PAGES WITH NAVBAR ISSUES:")
        print("=" * 80)
        for filename, issues in pages_with_issues:
            print(f"\n{filename}:")
            for issue in issues:
                print(f"  - {issue}")
    
    if not pages_missing_navbar and not pages_with_issues:
        print("✓ All pages have navbar correctly configured!")
    
    print("\n" + "=" * 80)
    print(f"Total pages audited: {len(all_files)}")
    print("=" * 80)
    
    return pages_missing_navbar, pages_with_issues

if __name__ == '__main__':
    main()
