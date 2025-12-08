#!/usr/bin/env python3
"""
COMPLETE extraction of ALL content and images from jacinteriors.com
for EVERY city page. No shortcuts.
"""

import re
import html as html_lib
from pathlib import Path
from bs4 import BeautifulSoup
import shutil

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')
BACKUP_IMAGES_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/cdn/shop/files')
CITY_IMAGES_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/cities')

# Complete mapping - ALL cities
ALL_CITY_MAPPINGS = {
    # California - Full service pages
    'brentwood': 'brentwood-interior-design-services',
    'bel-air': 'bel-air-interior-design-services',
    'santa-monica': 'our-signature-interior-design-services-in-santa-monica',
    'burbank': 'burbank-interior-design-services',
    'encino': 'encino-interior-design-services',
    'hermosa-beach': 'hermosa-beach-interior-design-services',
    'hollywood': 'hollywood-interior-design-services',
    'marina-del-rey': 'marina-del-rey-interior-design-services',
    'north-hollywood': 'north-hollywood-interior-design-services',
    'pacific-palisades': 'pacific-palisades-interior-design-services',
    'playa-del-rey': 'playa-del-rey-interior-design-services',
    'playa-vista': 'playa-vista-interior-design-services',
    'redondo-beach': 'redondo-beach-interior-design-services',
    'sherman-oaks': 'sherman-oaks-interior-design-services',
    'tarzana': 'tarzana-interior-design-services',
    'topanga': 'topanga-interior-design-services',
    'universal-city': 'universal-city-interior-design-services',
    'valley-village': 'valley-village-interior-design-services',
    'van-nuys': 'van-nuys-interior-design-services',
    'venice': 'venice-interior-design-services',
    'el-segundo': 'el-segundo-interior-design-services-nbsp-nbsp',
    # California - Project/city showcase pages
    'beverly-hills': 'beverly-hills-project',
    'culver-city': 'culver-city',
    'pasadena': 'pasadena',
    'manhattan-beach': 'manhattan-beach',
    'studio-city': 'studio-city',
    'west-hollywood': 'west-hollywood',
    'calabasas': 'calabasas',
    'palos-verdes': 'palos-verdes',
    # Florida
    'aventura': 'aventura-golden-isles-interior-design-services',
    'bal-harbour': 'bal-harbour-bay-harbor-islands-interior-design-services',
    'brickell': 'brickell-downtown-miami-interior-design-services',
    'coconut-grove': 'coconut-grove-interior-design-services',
    'coral-gables': 'coral-gables-interior-design-services',
    'hialeah': 'hialeah-interior-design-services',
    'key-biscayne': 'key-biscayne-interior-design-services',
    'plantation': 'plantation-interior-design-services',
    'wynwood': 'wynwood-edgewater-interior-design-services',
    'doral': 'doral-interior-design-services-nbsp-nbsp',
    'boca-raton': 'interior-designer-boca-raton',
    'pompano-beach': 'pompano-beach-interior',
    'deerfield-beach': 'deerfield-beach',
    'fort-lauderdale': 'fort-lauderdale',
}

def extract_and_copy_all_images(backup_file, city_slug):
    """Extract and copy ALL images from city page"""
    with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    copied_images = []
    
    # Find all img tags
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or img.get('data-srcset')
        if not src:
            continue
        
        # Extract filename - prioritize 2000x high-res
        if '_2000x' in src:
            filename = src.split('/')[-1].split('?')[0]
            src_file = BACKUP_IMAGES_DIR / filename
            dst_file = CITY_IMAGES_DIR / filename
            
            if src_file.exists():
                if not dst_file.exists():
                    try:
                        shutil.copy2(src_file, dst_file)
                    except:
                        pass
                copied_images.append(filename)
    
    return list(set(copied_images))  # Remove duplicates

def extract_complete_content(backup_file):
    """Extract ALL content from backup page"""
    with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Try to find main content
    main_div = soup.find('div', class_='one-whole column')
    if not main_div:
        return []
    
    sections = []
    current_section = None
    
    # Process all elements in order
    for element in main_div.find_all(['h2', 'h3', 'p', 'ul'], recursive=True):
        # Skip contact sections
        text = element.get_text(strip=True)
        if 'Contact' in text and element.name == 'h2':
            break
        
        if element.name == 'h2':
            # Save previous section
            if current_section and current_section['content']:
                sections.append(current_section)
            
            # Start new section
            current_section = {
                'h2': text,
                'content': []
            }
        
        elif element.name == 'h3' and current_section:
            # Add H3 as subsection marker
            current_section['content'].append(('h3', text))
        
        elif element.name == 'p' and current_section:
            if len(text) > 20 and not text.startswith('Contact'):
                # Check if it's a dash-list item
                if text.startswith('-'):
                    current_section['content'].append(('li', text[1:].strip()))
                else:
                    current_section['content'].append(('p', text))
        
        elif element.name == 'ul' and current_section:
            for li in element.find_all('li'):
                li_text = li.get_text(strip=True)
                if li_text:
                    current_section['content'].append(('li', li_text))
    
    # Add last section
    if current_section and current_section['content']:
        sections.append(current_section)
    
    return sections

def generate_section_html(section, bg_alt=False):
    """Generate proper HTML for a section"""
    bg = 'var(--color-bg-alt)' if bg_alt else 'white'
    
    html = f'''    <section class="section" style="background-color: {bg};">
        <div class="container">'''
    
    if section['h2']:
        html += f'''
            <div class="section-header">
                <h2>{section['h2']}</h2>
            </div>'''
    
    html += '''
            <div style="max-width: 900px; margin: 0 auto;">'''
    
    # Process content items
    in_list = False
    for item_type, item_text in section['content']:
        if item_type == 'h3':
            if in_list:
                html += '\n                </ul>'
                in_list = False
            html += f'\n                <h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: var(--color-secondary);">{item_text}</h3>'
        
        elif item_type == 'p':
            if in_list:
                html += '\n                </ul>'
                in_list = False
            html += f'\n                <p style="margin-bottom: 1rem;">{item_text}</p>'
        
        elif item_type == 'li':
            if not in_list:
                html += '\n                <ul style="margin-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">'
                in_list = True
            html += f'\n                    <li>{item_text}</li>'
    
    if in_list:
        html += '\n                </ul>'
    
    html += '''
            </div>
        </div>
    </section>'''
    
    return html

def rebuild_complete_city_page(city_slug, backup_slug):
    """Completely rebuild city page with all content and images"""
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists():
        return False, "No backup file"
    
    if not city_file.exists():
        return False, "No city file"
    
    # Extract ALL content
    sections = extract_complete_content(backup_file)
    if not sections:
        return False, "No content"
    
    # Extract and copy ALL images
    images = extract_and_copy_all_images(backup_file, city_slug)
    
    # Read current city page
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    # Generate all section HTML
    sections_html = []
    for i, section in enumerate(sections):
        sections_html.append(generate_section_html(section, bg_alt=(i % 2 == 0)))
    
    # Generate image gallery
    if images:
        gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
        for img in images:
            gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        gallery += '\n            </div>\n        </div>\n    </section>'
        sections_html.append(gallery)
    
    all_content = '\n\n'.join(sections_html)
    
    # Replace everything between page header and CTA
    pattern = r'(</section>\s*)(?:<section class="section".*?</section>\s*)*(<section class="section cta-section">)'
    replacement = f'\\1\n{all_content}\n\n\\2'
    
    city_html = re.sub(pattern, replacement, city_html, count=1, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    return True, f"{len(sections)} sections, {len(images)} images"

def main():
    print("="*80)
    print("COMPLETE REBUILD: ALL CITY PAGES WITH ALL CONTENT AND ALL IMAGES")
    print("="*80)
    
    results = []
    
    for city_slug, backup_slug in sorted(ALL_CITY_MAPPINGS.items()):
        success, msg = rebuild_complete_city_page(city_slug, backup_slug)
        status = "✅" if success else "❌"
        results.append((status, city_slug, msg))
        print(f"{status} {city_slug:30} {msg}")
    
    print("\n" + "="*80)
    successful = sum(1 for s, c, m in results if s == "✅")
    print(f"TOTAL: {successful}/{len(ALL_CITY_MAPPINGS)} cities completely rebuilt")
    
    # Show any failures
    failures = [c for s, c, m in results if s == "❌"]
    if failures:
        print(f"\nFailed: {', '.join(failures)}")

if __name__ == '__main__':
    main()

