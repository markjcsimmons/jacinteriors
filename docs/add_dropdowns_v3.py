#!/usr/bin/env python3
"""
Add SPACES and SERVICES dropdowns to all pages
Replaces the entire nav-menu content with proper dropdowns
"""

import re
from pathlib import Path

def get_nav_menu_root(active=''):
    """Get nav menu for root pages"""
    return f'''<div class="nav-menu" id="navMenu">
    <a href="index-variant-2.html" class="nav-link{' active' if active == 'home' else ''}">HOME</a>
    <a href="portfolio.html" class="nav-link{' active' if active == 'portfolio' else ''}">PORTFOLIO</a>
    <div class="nav-dropdown">
        <a href="#" class="nav-link">SPACES</a>
        <div class="nav-dropdown-content">
            <a href="bathrooms.html">Bathrooms</a>
            <a href="bedrooms.html">Bedrooms</a>
            <a href="kitchens.html">Kitchens</a>
            <a href="dining-rooms.html">Dining Rooms</a>
            <a href="living-spaces.html">Living Spaces</a>
            <a href="office-spaces.html">Office Spaces</a>
            <a href="kids-bedrooms.html">Kid's Bedrooms</a>
            <a href="entryways.html">Entryways</a>
            <a href="bar-area.html">Bar Area</a>
            <a href="laundry-rooms.html">Laundry Rooms</a>
            <a href="outdoor-spaces.html">Outdoor Spaces</a>
        </div>
    </div>
    <div class="nav-dropdown">
        <a href="services.html" class="nav-link{' active' if active == 'services' else ''}">SERVICES</a>
        <div class="nav-dropdown-content">
            <a href="residential-design.html">Residential Design</a>
            <a href="commercial-design.html">Commercial Design</a>
            <a href="interior-styling.html">Interior Styling</a>
            <a href="space-planning.html">Space Planning</a>
            <a href="cities-we-serve.html">Cities We Serve</a>
        </div>
    </div>
    <a href="about.html" class="nav-link{' active' if active == 'about' else ''}">ABOUT</a>
    <a href="contact.html" class="nav-link{' active' if active == 'contact' else ''}">CONTACT</a>
</div>'''

def get_nav_menu_subdir(active=''):
    """Get nav menu for subdirectory pages"""
    return f'''<div class="nav-menu" id="navMenu">
    <a href="../index-variant-2.html" class="nav-link{' active' if active == 'home' else ''}">HOME</a>
    <a href="../portfolio.html" class="nav-link{' active' if active == 'portfolio' else ''}">PORTFOLIO</a>
    <div class="nav-dropdown">
        <a href="#" class="nav-link">SPACES</a>
        <div class="nav-dropdown-content">
            <a href="../bathrooms.html">Bathrooms</a>
            <a href="../bedrooms.html">Bedrooms</a>
            <a href="../kitchens.html">Kitchens</a>
            <a href="../dining-rooms.html">Dining Rooms</a>
            <a href="../living-spaces.html">Living Spaces</a>
            <a href="../office-spaces.html">Office Spaces</a>
            <a href="../kids-bedrooms.html">Kid's Bedrooms</a>
            <a href="../entryways.html">Entryways</a>
            <a href="../bar-area.html">Bar Area</a>
            <a href="../laundry-rooms.html">Laundry Rooms</a>
            <a href="../outdoor-spaces.html">Outdoor Spaces</a>
        </div>
    </div>
    <div class="nav-dropdown">
        <a href="../services.html" class="nav-link{' active' if active == 'services' else ''}">SERVICES</a>
        <div class="nav-dropdown-content">
            <a href="../residential-design.html">Residential Design</a>
            <a href="../commercial-design.html">Commercial Design</a>
            <a href="../interior-styling.html">Interior Styling</a>
            <a href="../space-planning.html">Space Planning</a>
            <a href="../cities-we-serve.html">Cities We Serve</a>
        </div>
    </div>
    <a href="../about.html" class="nav-link{' active' if active == 'about' else ''}">ABOUT</a>
    <a href="../contact.html" class="nav-link{' active' if active == 'contact' else ''}">CONTACT</a>
</div>'''

def get_active_page(filepath, content):
    """Determine which nav item should be active"""
    filename = filepath.name.lower()
    
    if 'index' in filename:
        return 'home'
    elif 'portfolio' in filename or 'projects/' in str(filepath):
        return 'portfolio'
    elif 'about' in filename:
        return 'about'
    elif 'service' in filename:
        return 'services'
    elif 'contact' in filename:
        return 'contact'
    elif 'cities/' in str(filepath) or 'cities-we-serve' in filename:
        return 'services'  # Cities is under services dropdown
    
    return ''

def update_file(filepath):
    """Update navigation in file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has dropdowns
        if 'nav-dropdown' in content:
            return 'skip'
        
        # Skip if no nav-menu
        if 'nav-menu' not in content and 'nav-links' not in content:
            return 'no_nav'
        
        is_subdir = 'projects/' in str(filepath) or 'cities/' in str(filepath)
        active = get_active_page(filepath, content)
        
        new_nav = get_nav_menu_subdir(active) if is_subdir else get_nav_menu_root(active)
        
        # Replace nav-menu content
        pattern = r'<div class="nav-menu"[^>]*>.*?</div>\s*(?=<button|</div>)'
        
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, new_nav + '\n', content, flags=re.DOTALL)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 'updated'
        
        return 'no_match'
    except Exception as e:
        print(f"Error {filepath}: {e}")
        return 'error'

def main():
    base_dir = Path(__file__).parent
    
    html_files = []
    html_files.extend(base_dir.glob("*.html"))
    html_files.extend((base_dir / "projects").glob("*.html"))
    html_files.extend((base_dir / "cities").glob("*.html"))
    
    # Skip files already updated
    skip_files = ['index-variant-2.html', 'portfolio.html', 'about.html', 'services.html', 'beverly-hills-alpine.html']
    
    updated = 0
    skipped = 0
    no_match = 0
    
    for f in html_files:
        if f.name in skip_files:
            skipped += 1
            continue
            
        result = update_file(f)
        if result == 'updated':
            print(f"✓ {f.name}")
            updated += 1
        elif result == 'skip':
            skipped += 1
        else:
            no_match += 1
    
    print(f"\n✓ Updated {updated} files")
    print(f"  Skipped {skipped} files")
    print(f"  No match {no_match} files")

if __name__ == "__main__":
    main()
