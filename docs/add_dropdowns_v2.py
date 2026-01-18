#!/usr/bin/env python3
"""
Add SPACES and SERVICES dropdowns to navigation across all pages
Handles both nav-links and nav-menu structures
"""

import re
from pathlib import Path

def get_dropdown_nav(prefix=''):
    """Get the dropdown navigation items"""
    return f'''<div class="nav-dropdown">
    <a href="#" class="nav-link">SPACES</a>
    <div class="nav-dropdown-content">
        <a href="{prefix}bathrooms.html">Bathrooms</a>
        <a href="{prefix}bedrooms.html">Bedrooms</a>
        <a href="{prefix}kitchens.html">Kitchens</a>
        <a href="{prefix}dining-rooms.html">Dining Rooms</a>
        <a href="{prefix}living-spaces.html">Living Spaces</a>
        <a href="{prefix}office-spaces.html">Office Spaces</a>
        <a href="{prefix}kids-bedrooms.html">Kid's Bedrooms</a>
        <a href="{prefix}entryways.html">Entryways</a>
        <a href="{prefix}bar-area.html">Bar Area</a>
        <a href="{prefix}laundry-rooms.html">Laundry Rooms</a>
        <a href="{prefix}outdoor-spaces.html">Outdoor Spaces</a>
    </div>
</div>
<div class="nav-dropdown">
    <a href="{prefix}services.html" class="nav-link">SERVICES</a>
    <div class="nav-dropdown-content">
        <a href="{prefix}residential-design.html">Residential Design</a>
        <a href="{prefix}commercial-design.html">Commercial Design</a>
        <a href="{prefix}interior-styling.html">Interior Styling</a>
        <a href="{prefix}space-planning.html">Space Planning</a>
        <a href="{prefix}cities-we-serve.html">Cities We Serve</a>
    </div>
</div>'''

def update_file(filepath):
    """Update navigation in file to include dropdowns"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has dropdowns
        if 'nav-dropdown' in content:
            return 'skip'
        
        # Determine prefix for links
        is_subdir = 'projects/' in str(filepath) or 'cities/' in str(filepath)
        prefix = '../' if is_subdir else ''
        
        dropdown_nav = get_dropdown_nav(prefix)
        
        # Pattern to find CITIES link and replace with dropdowns
        # Handle various formats
        patterns = [
            # Pattern 1: CITIES link followed by SERVICES
            (rf'<a[^>]*href="[^"]*cities-we-serve\.html"[^>]*>CITIES</a>\s*<a[^>]*href="[^"]*services\.html"[^>]*>SERVICES</a>',
             dropdown_nav),
            # Pattern 2: Cities link (lowercase)
            (rf'<a[^>]*href="[^"]*cities-we-serve\.html"[^>]*>Cities</a>\s*<a[^>]*href="[^"]*services\.html"[^>]*>Services</a>',
             dropdown_nav),
        ]
        
        modified = False
        for pattern, replacement in patterns:
            if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                content = re.sub(pattern, replacement, content, flags=re.IGNORECASE | re.DOTALL)
                modified = True
                break
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 'updated'
        
        return 'no_match'
    except Exception as e:
        print(f"Error: {filepath}: {e}")
        return 'error'

def main():
    base_dir = Path(__file__).parent
    
    # All HTML files
    html_files = []
    html_files.extend(base_dir.glob("*.html"))
    html_files.extend((base_dir / "projects").glob("*.html"))
    html_files.extend((base_dir / "cities").glob("*.html"))
    
    updated = 0
    skipped = 0
    no_match = 0
    
    for f in html_files:
        result = update_file(f)
        if result == 'updated':
            print(f"✓ {f.name}")
            updated += 1
        elif result == 'skip':
            skipped += 1
        else:
            no_match += 1
    
    print(f"\n✓ Updated {updated} files")
    print(f"  Skipped {skipped} files (already have dropdowns)")
    print(f"  No match {no_match} files")

if __name__ == "__main__":
    main()
