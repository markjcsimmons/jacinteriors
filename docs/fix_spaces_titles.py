#!/usr/bin/env python3
"""
Update all spaces pages to have titles that exactly match the dropdown menu.
Remove all other elements from the title bar.
"""

import re
import os

# Mapping of filenames to exact dropdown titles
SPACES_PAGES = {
    'bathrooms.html': 'Bathrooms',
    'bedrooms.html': 'Bedrooms',
    'kitchens.html': 'Kitchens',
    'dining-rooms.html': 'Dining Rooms',
    'living-spaces.html': 'Living Spaces',
    'office-spaces.html': 'Office Spaces',
    'kids-bedrooms.html': "Kid's Bedrooms",
    'entryways.html': 'Entryways',
    'bar-area.html': 'Bar Area',
    'laundry-rooms.html': 'Laundry Rooms',
    'outdoor-spaces.html': 'Outdoor Spaces'
}

def fix_spaces_page(filepath, exact_title):
    """Update a spaces page to have only the exact title, no other elements."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the page header section
    # Pattern to match the entire header section from <!-- Page Header to </section>
    pattern = r'(<!-- Page Header with Metadata -->\s*<section[^>]*>.*?</section>)'
    
    # Replace with simplified header - only the title
    new_header = f'''    <!-- Page Header -->
    <section style="padding: 3rem 0; background: #1a1a1a; color: white; margin-top: 5rem;">
        <div class="container">
            <h1 class="scroll-fade-in" style="font-size: 3.5rem; font-weight: 500; margin: 0; letter-spacing: -1.5px; line-height: 1.1; color: white;">{exact_title}</h1>
        </div>
    </section>'''
    
    # Replace the header section
    content = re.sub(pattern, new_header, content, flags=re.DOTALL)
    
    # Also update the <title> tag in head
    title_pattern = r'(<title>)[^<]*(</title>)'
    content = re.sub(title_pattern, f'\\1{exact_title} | JAC Interiors\\2', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Updated {filepath}")

def main():
    # Script is in docs/ directory, so files are in same directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename, exact_title in SPACES_PAGES.items():
        filepath = os.path.join(script_dir, filename)
        if os.path.exists(filepath):
            fix_spaces_page(filepath, exact_title)
        else:
            print(f"⚠ File not found: {filepath}")

if __name__ == '__main__':
    main()
