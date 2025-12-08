#!/usr/bin/env python3
"""
Extract original city page content from jacinteriors.com backup
and update city pages with correct SEO-optimized content
"""

import re
import html as html_lib
import os
from pathlib import Path

# Cities that have dedicated interior design services pages in backup
CITY_SERVICE_PAGES = {
    'aventura': 'aventura-golden-isles-interior-design-services',
    'bal-harbour': 'bal-harbour-bay-harbor-islands-interior-design-services',
    'bel-air': 'bel-air-interior-design-services',
    'brentwood': 'brentwood-interior-design-services',
    'brickell': 'brickell-downtown-miami-interior-design-services',
    'burbank': 'burbank-interior-design-services',
    'coconut-grove': 'coconut-grove-interior-design-services',
    'coral-gables': 'coral-gables-interior-design-services',
    'doral': 'doral-interior-design-services',
    'el-segundo': 'el-segundo-interior-design-services-nbsp-nbsp',
    'encino': 'encino-interior-design-services',
    'hermosa-beach': 'hermosa-beach-interior-design-services',
    'hialeah': 'hialeah-interior-design-services',
    'hollywood': 'hollywood-interior-design-services',
    'key-biscayne': 'key-biscayne-interior-design-services',
    'marina-del-rey': 'marina-del-rey-interior-design-services',
    'north-hollywood': 'north-hollywood-interior-design-services',
    'pacific-palisades': 'pacific-palisades-interior-design-services',
    'plantation': 'plantation-interior-design-services',
    'playa-del-rey': 'playa-del-rey-interior-design-services',
    'santa-monica': 'our-signature-interior-design-services-in-santa-monica',
    'south-beach': 'south-beach-interior-design-services',
    'tarzana': 'tarzana-interior-design-services',
    'wynwood': 'wynwood-edgewater-interior-design-services',
}

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

def extract_city_content(html_content, city_name):
    """Extract H1, intro paragraph, and key sections from city page"""
    
    # Extract H1
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.DOTALL)
    h1_text = ""
    if h1_match:
        h1_text = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
        h1_text = html_lib.unescape(h1_text).replace('\n', ' ').replace('  ', ' ')
    
    # Extract first paragraph after H1 (intro text)
    intro_match = re.search(r'<p data-start[^>]*>(.*?)</p>', html_content, re.DOTALL)
    intro_text = ""
    if intro_match:
        intro_text = re.sub(r'<[^>]+>', '', intro_match.group(1)).strip()
        intro_text = html_lib.unescape(intro_text)
    
    # Extract service list (ul/li items)
    services = []
    ul_match = re.search(r'<ul data-start[^>]*>(.*?)</ul>', html_content, re.DOTALL)
    if ul_match:
        li_items = re.findall(r'<p data-start[^>]*>(.*?)</p>', ul_match.group(1))
        services = [html_lib.unescape(re.sub(r'<[^>]+>', '', item).strip()) for item in li_items]
    
    # Extract H2 sections with content
    sections = []
    h2_pattern = r'<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|<h3|</div>|$)'
    h2_matches = re.finditer(h2_pattern, html_content, re.DOTALL)
    
    for match in h2_matches:
        h2_title = re.sub(r'<[^>]+>', '', match.group(1)).strip()
        h2_title = html_lib.unescape(h2_title)
        
        # Skip contact section
        if 'Contact' in h2_title or 'Ready to' in h2_title:
            continue
            
        h2_content = match.group(2)
        
        # Extract paragraphs
        paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', h2_content, re.DOTALL)
        content_text = []
        for p in paragraphs[:2]:  # First 2 paragraphs
            text = re.sub(r'<[^>]+>', '', p).strip()
            text = html_lib.unescape(text)
            if text and len(text) > 50:
                content_text.append(text)
        
        # Extract H3 subsections
        h3_items = []
        h3_matches = re.finditer(r'<h3[^>]*>(.*?)</h3>(.*?)(?=<h3|<h2|</div>|$)', h2_content, re.DOTALL)
        for h3_match in list(h3_matches)[:4]:  # First 4 H3s
            h3_title = re.sub(r'<[^>]+>', '', h3_match.group(1)).strip()
            h3_title = html_lib.unescape(h3_title)
            
            h3_content = h3_match.group(2)
            h3_paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', h3_content, re.DOTALL)
            h3_text = ""
            if h3_paragraphs:
                h3_text = re.sub(r'<[^>]+>', '', h3_paragraphs[0]).strip()
                h3_text = html_lib.unescape(h3_text)
            
            if h3_title:
                h3_items.append((h3_title, h3_text))
        
        if h2_title and (content_text or h3_items):
            sections.append({
                'title': h2_title,
                'content': content_text,
                'subsections': h3_items
            })
    
    return {
        'h1': h1_text,
        'intro': intro_text,
        'services': services,
        'sections': sections[:3]  # First 3 major sections
    }

def update_city_page(city_slug, data):
    """Update city page with extracted content"""
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not city_file.exists():
        print(f"⚠️  City file not found: {city_file}")
        return False
    
    with open(city_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update H1 if we have good content
    if data['h1'] and len(data['h1']) > 10:
        h1_pattern = r'(<h1>)(.*?)(</h1>)'
        content = re.sub(h1_pattern, f'\\1{data["h1"]}\\3', content)
    
    # Update intro paragraph
    if data['intro']:
        intro_pattern = r'(<div class="section-header">.*?<p>)(.*?)(</p>)'
        intro_short = data['intro'][:300] + "..." if len(data['intro']) > 300 else data['intro']
        content = re.sub(intro_pattern, f'\\1{intro_short}\\3', content, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """Main function"""
    print("Extracting city page content from jacinteriors.com backup...")
    print("="*60)
    
    updated_count = 0
    
    for city_slug, backup_slug in CITY_SERVICE_PAGES.items():
        backup_file = BACKUP_DIR / f"{backup_slug}.html"
        
        if not backup_file.exists():
            print(f"⚠️  Backup not found: {backup_slug}.html")
            continue
        
        try:
            with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
                backup_content = f.read()
            
            data = extract_city_content(backup_content, city_slug)
            
            if data['h1']:
                print(f"\n📍 {city_slug}")
                print(f"   H1: {data['h1'][:70]}...")
                print(f"   Sections: {len(data['sections'])}")
                
                if update_city_page(city_slug, data):
                    updated_count += 1
                    print(f"   ✅ Updated")
            else:
                print(f"⚠️  No H1 found for: {city_slug}")
        
        except Exception as e:
            print(f"❌ Error processing {city_slug}: {e}")
    
    print("\n" + "="*60)
    print(f"✨ Updated {updated_count} city pages")

if __name__ == '__main__':
    main()

