#!/usr/bin/env python3
"""
Audit all HTML pages for consistency:
- Proper head structure
- Google Fonts
- Correct navigation
- Logo image
"""

import os
import re
from pathlib import Path

DOCS_DIR = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'

def audit_page(filepath):
    """Audit a single page and return issues found."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"Cannot read file: {e}"]
    
    # Check for Google Fonts
    if 'fonts.googleapis.com' not in content:
        issues.append("MISSING: Google Fonts link")
    
    if 'Plus+Jakarta+Sans' not in content and 'Plus Jakarta Sans' not in content:
        issues.append("MISSING: Plus Jakarta Sans font")
    
    # Check for proper navigation structure
    if '<nav class="navbar">' not in content:
        issues.append("MISSING: <nav class='navbar'>")
    
    if 'id="navMenu"' not in content:
        issues.append("MISSING: id='navMenu' on nav-menu")
    
    if 'jac-logo.png' not in content:
        issues.append("MISSING: Logo image (jac-logo.png)")
    
    if 'mobile-menu-toggle' not in content:
        issues.append("MISSING: Mobile menu toggle")
    
    # Check for SPACES dropdown
    if 'SPACES' not in content:
        issues.append("MISSING: SPACES nav item")
    
    # Check for SERVICES dropdown
    if 'SERVICES' not in content:
        issues.append("MISSING: SERVICES nav item")
    
    # Check nav order: HOME, PORTFOLIO, SPACES, SERVICES, ABOUT, CONTACT
    nav_order_pattern = r'HOME.*PORTFOLIO.*SPACES.*SERVICES.*ABOUT.*CONTACT'
    if not re.search(nav_order_pattern, content, re.DOTALL):
        issues.append("WARNING: Nav order may be incorrect")
    
    # Check for malformed meta/head
    if '</meta></head>' in content:
        issues.append("ERROR: Malformed </meta></head> tag")
    
    # Check stylesheet link
    if 'style.css' not in content:
        issues.append("MISSING: style.css link")
    
    return issues

def main():
    all_files = []
    for root, dirs, files in os.walk(DOCS_DIR):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.html'):
                all_files.append(os.path.join(root, file))
    
    # Sort files
    all_files.sort()
    
    issues_found = {}
    clean_pages = []
    
    for filepath in all_files:
        rel_path = os.path.relpath(filepath, DOCS_DIR)
        issues = audit_page(filepath)
        
        if issues:
            issues_found[rel_path] = issues
        else:
            clean_pages.append(rel_path)
    
    # Print report
    print("=" * 60)
    print("PAGE AUDIT REPORT")
    print("=" * 60)
    print(f"\nTotal pages: {len(all_files)}")
    print(f"Clean pages: {len(clean_pages)}")
    print(f"Pages with issues: {len(issues_found)}")
    
    if issues_found:
        print("\n" + "-" * 60)
        print("PAGES WITH ISSUES:")
        print("-" * 60)
        
        # Group by issue type
        issue_counts = {}
        for page, issues in issues_found.items():
            for issue in issues:
                if issue not in issue_counts:
                    issue_counts[issue] = []
                issue_counts[issue].append(page)
        
        # Print summary by issue
        print("\nISSUE SUMMARY:")
        for issue, pages in sorted(issue_counts.items(), key=lambda x: -len(x[1])):
            print(f"\n{issue}: ({len(pages)} pages)")
            for page in pages[:5]:  # Show first 5
                print(f"  - {page}")
            if len(pages) > 5:
                print(f"  ... and {len(pages) - 5} more")
    
    print("\n" + "=" * 60)
    print("END OF REPORT")
    print("=" * 60)

if __name__ == '__main__':
    main()
