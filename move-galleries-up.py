#!/usr/bin/env python3
from pathlib import Path
import re

CITY_DIR = Path('cities')

for city_file in sorted(CITY_DIR.glob('*.html')):
    with open(city_file, 'r') as f:
        html = f.read()
    
    # 1. Extract the Gallery Section
    gallery_match = re.search(r'(<!-- Gallery Section -->.*?<section class="section">.*?<div class="container">.*?<div style="display: grid.*?</div>\s*</div>\s*</section>)', html, re.DOTALL)
    
    if not gallery_match:
        print(f"⚠️ {city_file.name}: Gallery not found")
        continue
        
    gallery_html = gallery_match.group(1)
    
    # Remove it from its current location
    html_without_gallery = html.replace(gallery_html, '')
    
    # 2. Find the Header Section (first section with h1 or page-header class)
    # Usually the first <section> after nav
    
    # Strategy: Find the closing tag of the first section
    # <section class="section" style="padding-top: 100px...
    
    header_end_match = re.search(r'(<section class="section".*?<h1>.*?</h1>.*?</section>)', html_without_gallery, re.DOTALL)
    
    if header_end_match:
        header_html = header_end_match.group(1)
        # Insert gallery AFTER header
        new_html = html_without_gallery.replace(header_html, f'{header_html}\n\n{gallery_html}')
        
        with open(city_file, 'w') as f:
            f.write(new_html)
        print(f"✅ Moved gallery up for {city_file.stem}")
    else:
        print(f"⚠️ {city_file.name}: Header section not found, skipping move")


