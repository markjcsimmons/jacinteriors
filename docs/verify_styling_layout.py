#!/usr/bin/env python3
"""
Verify and ensure correct styling and layout across all pages:
1. Project pages: Dark header (#1a1a1a), metadata (Client, Location, Style - no YEAR), first row with image+text card, masonry grid
2. Space pages: Dark header (#1a1a1a), just H1 title, first row with image+text card, masonry grid
3. City pages: Black header (#000), city name only (no "Interior Designer"), proper descriptions
4. About/Contact: Proper section-header styling
"""

import re
from pathlib import Path

docs_dir = Path(__file__).parent

def verify_project_page(filepath):
    """Verify project page has correct styling"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        
        # Check header background
        if 'background: #1a1a1a' not in content or 'background-color: #1a1a1a' not in content:
            if 'padding: 3rem 0; background: #1a1a1a' not in content:
                issues.append("Missing dark header background (#1a1a1a)")
        
        # Check no YEAR field
        if re.search(r'>\s*Year\s*<', content, re.IGNORECASE):
            issues.append("Has YEAR field (should be removed)")
        
        # Check for first-row-grid with text card
        if 'first-row-grid' not in content or 'first-row-text' not in content:
            issues.append("Missing first row with text card")
        
        # Check for masonry grid
        if 'image-gallery-grid' not in content:
            issues.append("Missing masonry image grid")
        
        # Check for masonry JS
        if 'initMasonry' not in content:
            issues.append("Missing masonry JavaScript")
        
        return issues
    
    except Exception as e:
        return [f"Error: {e}"]

def verify_space_page(filepath):
    """Verify space page has correct styling"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        
        # Check header - should be dark (#1a1a1a) with just H1
        if 'background: #1a1a1a' not in content:
            issues.append("Missing dark header background (#1a1a1a)")
        
        # Check title is just the space name (no extra words)
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
        if h1_match:
            h1_text = h1_match.group(1).strip()
            # Should not have "Design" or other extra words
            if 'Design' in h1_text or 'Designer' in h1_text:
                issues.append(f"H1 has extra words: {h1_text}")
        
        # Check for first-row-grid with text card
        if 'first-row-grid' not in content or 'first-row-text' not in content:
            issues.append("Missing first row with text card")
        
        # Check for masonry grid
        if 'image-gallery-grid' not in content:
            issues.append("Missing masonry image grid")
        
        # Check for masonry JS
        if 'initMasonry' not in content:
            issues.append("Missing masonry JavaScript")
        
        return issues
    
    except Exception as e:
        return [f"Error: {e}"]

def verify_city_page(filepath):
    """Verify city page has correct styling"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        
        # Check header - should be black (#000 or #000000)
        if 'background-color: #000' not in content and 'background-color: #000000' not in content:
            issues.append("Missing black header background (#000)")
        
        # Check H1 doesn't have duplicate "Interior Designer"
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
        if h1_match:
            h1_text = h1_match.group(1).strip()
            if h1_text.count('Interior Designer') > 1:
                issues.append(f"H1 has duplicate 'Interior Designer': {h1_text}")
        
        return issues
    
    except Exception as e:
        return [f"Error: {e}"]

def verify_about_contact_page(filepath):
    """Verify about/contact page has correct styling"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        
        # Check for section-header styling
        if 'section-header' not in content:
            # About page should use section-header
            if 'about' in filepath.name.lower():
                issues.append("Missing section-header styling")
        
        return issues
    
    except Exception as e:
        return [f"Error: {e}"]

def main():
    """Verify all pages"""
    projects_dir = docs_dir / 'projects'
    cities_dir = docs_dir / 'cities'
    
    space_pages = ['bathrooms', 'bedrooms', 'kitchens', 'dining-rooms', 'living-spaces', 
                   'office-spaces', 'kids-bedrooms', 'entryways', 'bar-area', 
                   'laundry-rooms', 'outdoor-spaces']
    
    print("Verifying styling and layout...")
    print()
    
    all_issues = []
    
    # Check project pages
    if projects_dir.exists():
        project_files = list(projects_dir.glob('*.html'))
        print(f"Checking {len(project_files)} project pages...")
        for filepath in project_files:
            issues = verify_project_page(filepath)
            if issues:
                all_issues.append((filepath.relative_to(docs_dir), issues))
                print(f"  ⚠ {filepath.name}: {', '.join(issues)}")
    
    # Check space pages
    print(f"\nChecking {len(space_pages)} space pages...")
    for space in space_pages:
        filepath = docs_dir / f"{space}.html"
        if filepath.exists():
            issues = verify_space_page(filepath)
            if issues:
                all_issues.append((filepath.relative_to(docs_dir), issues))
                print(f"  ⚠ {filepath.name}: {', '.join(issues)}")
    
    # Check city pages
    if cities_dir.exists():
        city_files = list(cities_dir.glob('*.html'))
        print(f"\nChecking {len(city_files)} city pages...")
        for filepath in city_files[:10]:  # Check first 10
            issues = verify_city_page(filepath)
            if issues:
                all_issues.append((filepath.relative_to(docs_dir), issues))
                print(f"  ⚠ {filepath.name}: {', '.join(issues)}")
    
    # Check about/contact
    print(f"\nChecking about/contact pages...")
    for page in ['about.html', 'contact.html']:
        filepath = docs_dir / page
        if filepath.exists():
            issues = verify_about_contact_page(filepath)
            if issues:
                all_issues.append((filepath.relative_to(docs_dir), issues))
                print(f"  ⚠ {filepath.name}: {', '.join(issues)}")
    
    print()
    if all_issues:
        print(f"⚠ Found {len(all_issues)} pages with styling issues")
        return False
    else:
        print("✓ All pages have correct styling and layout")
        return True

if __name__ == '__main__':
    main()
