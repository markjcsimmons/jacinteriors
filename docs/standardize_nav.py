#!/usr/bin/env python3
"""
Standardize navigation across all pages to use the same structure:
- Image logo
- nav-menu class with id="navMenu"
- Mobile menu toggle button
- Proper dropdown structure
"""

import os
import re
from pathlib import Path

# Define the standard navigation HTML for root-level pages
ROOT_NAV = '''    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <a href="index-variant-2.html" class="logo">
                    <img src="assets/images/jac-logo.png" alt="JAC Interiors" class="logo-img">
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="index-variant-2.html" class="nav-link{home_active}">HOME</a>
                    <a href="portfolio.html" class="nav-link{portfolio_active}">PORTFOLIO</a>
                    <div class="nav-dropdown">
                        <a href="#" class="nav-link{spaces_active}">SPACES</a>
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
                        <a href="services.html" class="nav-link{services_active}">SERVICES</a>
                        <div class="nav-dropdown-content">
                            <a href="residential-design.html">Residential Design</a>
                            <a href="commercial-design.html">Commercial Design</a>
                            <a href="interior-styling.html">Interior Styling</a>
                            <a href="space-planning.html">Space Planning</a>
                            <a href="cities-we-serve.html">Cities We Serve</a>
                        </div>
                    </div>
                    <a href="about.html" class="nav-link{about_active}">ABOUT</a>
                    <a href="contact.html" class="nav-link{contact_active}">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>'''

# Define the standard navigation HTML for subdirectory pages (cities/, projects/, spaces/)
SUB_NAV = '''    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <a href="../index-variant-2.html" class="logo">
                    <img src="../assets/images/jac-logo.png" alt="JAC Interiors" class="logo-img">
                </a>
                <div class="nav-menu" id="navMenu">
                    <a href="../index-variant-2.html" class="nav-link{home_active}">HOME</a>
                    <a href="../portfolio.html" class="nav-link{portfolio_active}">PORTFOLIO</a>
                    <div class="nav-dropdown">
                        <a href="#" class="nav-link{spaces_active}">SPACES</a>
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
                        <a href="../services.html" class="nav-link{services_active}">SERVICES</a>
                        <div class="nav-dropdown-content">
                            <a href="../residential-design.html">Residential Design</a>
                            <a href="../commercial-design.html">Commercial Design</a>
                            <a href="../interior-styling.html">Interior Styling</a>
                            <a href="../space-planning.html">Space Planning</a>
                            <a href="../cities-we-serve.html">Cities We Serve</a>
                        </div>
                    </div>
                    <a href="../about.html" class="nav-link{about_active}">ABOUT</a>
                    <a href="../contact.html" class="nav-link{contact_active}">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>'''

def determine_active_state(filename, filepath):
    """Determine which nav item should be active based on the file."""
    home_active = ""
    portfolio_active = ""
    spaces_active = ""
    services_active = ""
    about_active = ""
    contact_active = ""
    
    # Check file path/name to determine active state
    if 'index' in filename:
        home_active = " active"
    elif 'portfolio' in filename:
        portfolio_active = " active"
    elif 'about' in filename:
        about_active = " active"
    elif 'contact' in filename:
        contact_active = " active"
    elif 'services' in filename or 'cities' in filepath or 'residential' in filename or 'commercial' in filename or 'interior-styling' in filename or 'space-planning' in filename:
        services_active = " active"
    elif any(space in filename for space in ['bathroom', 'bedroom', 'kitchen', 'dining', 'living', 'office', 'kid', 'entryway', 'bar-area', 'laundry', 'outdoor']):
        spaces_active = " active"
    elif 'spaces' in filepath:
        spaces_active = " active"
    elif 'projects' in filepath:
        portfolio_active = " active"
    
    return {
        'home_active': home_active,
        'portfolio_active': portfolio_active,
        'spaces_active': spaces_active,
        'services_active': services_active,
        'about_active': about_active,
        'contact_active': contact_active
    }

def process_file(filepath):
    """Process a single HTML file to standardize the navigation."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if this file has a nav element
    if '<nav class="navbar' not in content:
        return False, "No navbar found"
    
    # Determine if this is a root or subdirectory file
    rel_path = str(filepath)
    is_subdir = '/cities/' in rel_path or '/projects/' in rel_path or '/spaces/' in rel_path
    
    filename = os.path.basename(filepath).lower()
    active_states = determine_active_state(filename, rel_path)
    
    # Choose the appropriate template
    if is_subdir:
        new_nav = SUB_NAV.format(**active_states)
    else:
        new_nav = ROOT_NAV.format(**active_states)
    
    # Find and replace the entire nav element
    # Pattern to match the entire nav block
    nav_pattern = r'(\s*)<!-- Navigation -->.*?</nav>'
    
    match = re.search(nav_pattern, content, re.DOTALL)
    if match:
        # Replace the navigation
        new_content = content[:match.start()] + '\n' + new_nav + content[match.end():]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, "Updated"
    
    # Try alternative pattern without comment
    nav_pattern2 = r'(\s*)<nav class="navbar[^>]*>.*?</nav>'
    match = re.search(nav_pattern2, content, re.DOTALL)
    if match:
        new_content = content[:match.start()] + '\n' + new_nav + content[match.end():]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, "Updated (alt pattern)"
    
    return False, "Could not match nav pattern"

def main():
    docs_dir = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/docs')
    
    # Find all HTML files
    html_files = list(docs_dir.glob('*.html')) + \
                 list(docs_dir.glob('cities/*.html')) + \
                 list(docs_dir.glob('projects/*.html')) + \
                 list(docs_dir.glob('spaces/*.html'))
    
    updated = 0
    skipped = 0
    errors = []
    
    for filepath in html_files:
        # Skip Python files and non-HTML
        if not filepath.suffix == '.html':
            continue
            
        try:
            success, msg = process_file(filepath)
            if success:
                print(f"✓ {filepath.name}: {msg}")
                updated += 1
            else:
                print(f"- {filepath.name}: {msg}")
                skipped += 1
        except Exception as e:
            print(f"✗ {filepath.name}: Error - {e}")
            errors.append((filepath.name, str(e)))
    
    print(f"\nSummary: {updated} updated, {skipped} skipped, {len(errors)} errors")

if __name__ == '__main__':
    main()
