#!/usr/bin/env python3
"""
Comprehensive navbar check for all pages - detects all potential issues.
"""

import os
import re
from pathlib import Path

def check_page_comprehensive(filepath):
    """Comprehensive check of a page for all navbar issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        filename = filepath.name
        relative_path = filepath.relative_to(Path(__file__).parent)
        
        # Check 1: Has navbar script?
        if 'load-navbar.js' not in content:
            issues.append(('CRITICAL', 'Missing load-navbar.js script'))
        else:
            # Check 2: Script is in head section?
            head_match = re.search(r'<head[^>]*>.*?</head>', content, re.DOTALL | re.IGNORECASE)
            if head_match:
                head_content = head_match.group(0)
                if 'load-navbar.js' not in head_content:
                    issues.append(('CRITICAL', 'load-navbar.js should be in <head> section'))
            
            # Check 3: Correct path for subdirectory?
            depth = len(relative_path.parent.parts)
            expected_path = '../' * depth + 'assets/js/load-navbar.js' if depth > 0 else 'assets/js/load-navbar.js'
            
            # Check if path is correct
            script_pattern = r'<script[^>]*src=["\']([^"\']*load-navbar\.js[^"\']*)["\']'
            script_match = re.search(script_pattern, content, re.IGNORECASE)
            if script_match:
                actual_path = script_match.group(1)
                if actual_path != expected_path and depth > 0:
                    issues.append(('WARNING', f'Path may be incorrect. Expected: {expected_path}, Found: {actual_path}'))
        
        # Check 4: Has hardcoded nav tags?
        nav_tags = re.findall(r'<nav[^>]*class=["\'][^"\']*navbar', content, re.IGNORECASE)
        for tag in nav_tags:
            # Check if it's in a comment
            tag_pos = content.find(tag)
            if tag_pos > 0:
                context = content[max(0, tag_pos-100):tag_pos]
                if '<!--' not in context or '-->' in context[context.find('<!--'):]:
                    issues.append(('WARNING', f'Found hardcoded <nav> tag - should be removed (navbar is injected dynamically)'))
                    break
        
        # Check 5: Has navbar-dark class?
        if 'navbar-dark' in content:
            # Check if it's being added somewhere
            if re.search(r'class=["\'][^"\']*navbar-dark', content):
                context_before = content[:content.find('navbar-dark')]
                if '<!--' not in context_before[-200:] or context_before.rfind('<!--') < context_before.rfind('-->'):
                    issues.append(('WARNING', 'Has navbar-dark class reference - may cause white text'))
        
        # Check 6: Has hardcoded navbar-spacer?
        if 'navbar-spacer' in content:
            spacer_pattern = r'<div[^>]*class=["\'][^"\']*navbar-spacer'
            if re.search(spacer_pattern, content):
                issues.append(('INFO', 'Has hardcoded navbar-spacer - should come from navbar.html only'))
        
        # Check 7: Check for conflicting styles
        if '<style>' in content:
            style_blocks = re.findall(r'<style[^>]*>.*?</style>', content, re.DOTALL | re.IGNORECASE)
            for style_block in style_blocks:
                if '.navbar' in style_block and 'load-navbar.js' in content:
                    issues.append(('WARNING', 'Has inline .navbar styles - may conflict with navbar.html'))
        
        # Check 8: Missing Google Fonts?
        if 'Plus Jakarta Sans' not in content:
            issues.append(('INFO', 'Missing Plus Jakarta Sans font - navbar uses this font'))
        
    except Exception as e:
        issues.append(('ERROR', f'Error reading file: {e}'))
    
    return issues

def main():
    docs_dir = Path(__file__).parent
    
    # Find all HTML files recursively
    all_files = list(docs_dir.rglob('*.html'))
    all_files = [f for f in all_files if f.name not in ['navbar.html', 'navbar-iframe.html', 'PAGE_TEMPLATE.html']]
    all_files.sort()
    
    pages_with_issues = []
    pages_ok = []
    
    print("=" * 80)
    print("COMPREHENSIVE NAVBAR CHECK - ALL PAGES")
    print("=" * 80)
    print()
    
    for filepath in all_files:
        relative_path = filepath.relative_to(docs_dir)
        issues = check_page_comprehensive(filepath)
        
        if issues:
            pages_with_issues.append((relative_path, issues))
        else:
            pages_ok.append(relative_path)
    
    # Summary
    print(f"✓ Pages with no issues: {len(pages_ok)}")
    print(f"⚠ Pages with issues: {len(pages_with_issues)}")
    print()
    
    if pages_with_issues:
        print("=" * 80)
        print("PAGES WITH ISSUES:")
        print("=" * 80)
        
        critical_count = 0
        warning_count = 0
        info_count = 0
        
        for filepath, issues in pages_with_issues:
            print(f"\n{filepath}:")
            for severity, issue in issues:
                icon = '🔴' if severity == 'CRITICAL' else '🟡' if severity == 'WARNING' else '🔵' if severity == 'INFO' else '❌'
                print(f"  {icon} [{severity}] {issue}")
                if severity == 'CRITICAL':
                    critical_count += 1
                elif severity == 'WARNING':
                    warning_count += 1
                elif severity == 'INFO':
                    info_count += 1
        
        print("\n" + "=" * 80)
        print("SUMMARY:")
        print(f"  🔴 Critical issues: {critical_count}")
        print(f"  🟡 Warnings: {warning_count}")
        print(f"  🔵 Info: {info_count}")
    else:
        print("✓ All pages are correctly configured!")
    
    print("\n" + "=" * 80)
    print(f"Total pages checked: {len(all_files)}")
    print("=" * 80)

if __name__ == '__main__':
    main()
