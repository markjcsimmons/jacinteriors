#!/usr/bin/env python3
"""
Add SPACES and SERVICES dropdowns to navigation across all pages
WITHOUT changing any other styling
"""

import re
from pathlib import Path

# Navigation with dropdowns - for pages in root
NAV_ROOT = '''<div class="nav-links">
                <a href="index-variant-2.html" class="nav-link">HOME</a>
                <a href="portfolio.html" class="nav-link">PORTFOLIO</a>
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
                    <a href="services.html" class="nav-link">SERVICES</a>
                    <div class="nav-dropdown-content">
                        <a href="residential-design.html">Residential Design</a>
                        <a href="commercial-design.html">Commercial Design</a>
                        <a href="interior-styling.html">Interior Styling</a>
                        <a href="space-planning.html">Space Planning</a>
                        <a href="cities-we-serve.html">Cities We Serve</a>
                    </div>
                </div>
                <a href="about.html" class="nav-link">ABOUT</a>
                <a href="contact.html" class="nav-link">CONTACT</a>
            </div>'''

# Navigation with dropdowns - for pages in subdirectories (projects/, cities/)
NAV_SUBDIR = '''<div class="nav-links">
                <a href="../index-variant-2.html" class="nav-link">HOME</a>
                <a href="../portfolio.html" class="nav-link">PORTFOLIO</a>
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
                    <a href="../services.html" class="nav-link">SERVICES</a>
                    <div class="nav-dropdown-content">
                        <a href="../residential-design.html">Residential Design</a>
                        <a href="../commercial-design.html">Commercial Design</a>
                        <a href="../interior-styling.html">Interior Styling</a>
                        <a href="../space-planning.html">Space Planning</a>
                        <a href="../cities-we-serve.html">Cities We Serve</a>
                    </div>
                </div>
                <a href="../about.html" class="nav-link">ABOUT</a>
                <a href="../contact.html" class="nav-link">CONTACT</a>
            </div>'''

def update_file(filepath):
    """Update navigation in file to include dropdowns"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has dropdowns
        if 'nav-dropdown' in content:
            return False
        
        # Determine if this is in a subdirectory
        is_subdir = 'projects/' in str(filepath) or 'cities/' in str(filepath)
        nav_html = NAV_SUBDIR if is_subdir else NAV_ROOT
        
        # Find and replace nav-links section
        # Pattern for nav-links with various content
        pattern = r'<div class="nav-links">.*?</div>\s*(?=</div>)'
        
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, nav_html, content, flags=re.DOTALL)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error: {filepath}: {e}")
        return False

def main():
    base_dir = Path(__file__).parent
    
    # All HTML files
    html_files = []
    html_files.extend(base_dir.glob("*.html"))
    html_files.extend((base_dir / "projects").glob("*.html"))
    html_files.extend((base_dir / "cities").glob("*.html"))
    
    updated = 0
    skipped = 0
    for f in html_files:
        if f.name == 'index-variant-2.html':
            skipped += 1
            continue  # Already updated manually
        result = update_file(f)
        if result:
            print(f"✓ {f.name}")
            updated += 1
        else:
            skipped += 1
    
    print(f"\n✓ Updated {updated} files")
    print(f"  Skipped {skipped} files (already have dropdowns or no nav-links)")

if __name__ == "__main__":
    main()
