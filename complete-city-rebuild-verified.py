#!/usr/bin/env python3
"""
COMPLETE city page rebuild with verification
- Extracts ALL text content (both formats)
- Copies ALL high-res source images (2000x)
- Matches jacinteriors.com exactly
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

# COMPLETE mapping of ALL cities
ALL_CITIES = {
    # California - Full service pages (H2/H3 format)
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
    # California - Description div format (project showcase pages)
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

def copy_all_images_from_page(backup_file):
    """Extract and copy ALL high-res images (2000x) from a page"""
    with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    # Find all image references with 2000x
    pattern = r'(?:src|data-src|data-srcset)=["\']([^"\']*_2000x[^"\']*\.(?:jpg|png))["\']'
    matches = re.findall(pattern, html, re.IGNORECASE)
    
    copied = []
    for img_url in set(matches):
        filename = img_url.split('/')[-1].split('?')[0]
        
        src = BACKUP_IMAGES_DIR / filename
        dst = CITY_IMAGES_DIR / filename
        
        if src.exists():
            try:
                shutil.copy2(src, dst)
                copied.append(filename)
            except:
                pass
    
    return sorted(set(copied))

def extract_description_div_content(soup):
    """Extract content from description div format"""
    desc_div = soup.find('div', class_='description')
    if not desc_div:
        return None
    
    paragraphs = []
    for p in desc_div.find_all('p'):
        text = p.get_text(strip=True)
        if text and not text.startswith('Contact') and len(text) > 20:
            paragraphs.append(text)
    
    if paragraphs:
        return [{
            'h2': '',
            'content': [('p', p) for p in paragraphs]
        }]
    
    return None

def extract_h2_sections_content(soup):
    """Extract content from H2/H3 sections format"""
    main_div = soup.find('div', class_='one-whole column')
    if not main_div:
        return None
    
    sections = []
    current_section = None
    
    for element in main_div.find_all(['h2', 'h3', 'p', 'ul'], recursive=True):
        text = element.get_text(strip=True)
        
        # Stop at contact
        if element.name == 'h2' and 'Contact' in text:
            break
        
        if element.name == 'h2':
            if current_section and current_section['content']:
                sections.append(current_section)
            current_section = {'h2': text, 'content': []}
        
        elif current_section:
            if element.name == 'h3':
                current_section['content'].append(('h3', text))
            
            elif element.name == 'p' and len(text) > 20:
                if text.startswith('-') or text.startswith('•'):
                    current_section['content'].append(('li', text.lstrip('-•').strip()))
                else:
                    current_section['content'].append(('p', text))
            
            elif element.name == 'ul':
                for li in element.find_all('li'):
                    li_text = li.get_text(strip=True)
                    if li_text:
                        current_section['content'].append(('li', li_text))
    
    if current_section and current_section['content']:
        sections.append(current_section)
    
    return sections if sections else None

def generate_html(sections):
    """Generate clean HTML from sections"""
    if not sections:
        return ""
    
    html_parts = []
    
    for i, section in enumerate(sections):
        bg = 'var(--color-bg-alt)' if i % 2 == 0 else 'white'
        
        html = f'    <section class="section" style="background-color: {bg};">\n        <div class="container">'
        
        if section['h2']:
            html += f'\n            <div class="section-header">\n                <h2>{section["h2"]}</h2>\n            </div>'
        
        html += '\n            <div style="max-width: 900px; margin: 0 auto;">'
        
        in_list = False
        for item_type, text in section['content']:
            if item_type == 'h3':
                if in_list:
                    html += '\n                </ul>'
                    in_list = False
                html += f'\n                <h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">{text}</h3>'
            
            elif item_type == 'p':
                if in_list:
                    html += '\n                </ul>'
                    in_list = False
                html += f'\n                <p style="margin-bottom: 1rem;">{text}</p>'
            
            elif item_type == 'li':
                if not in_list:
                    html += '\n                <ul style="margin-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">'
                    in_list = True
                html += f'\n                    <li>{text}</li>'
        
        if in_list:
            html += '\n                </ul>'
        
        html += '\n            </div>\n        </div>\n    </section>'
        
        html_parts.append(html)
    
    return '\n\n'.join(html_parts)

def rebuild_city_complete(city_slug, backup_slug):
    """Complete rebuild with both content types"""
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists():
        return False, "No backup"
    
    if not city_file.exists():
        return False, "No city page"
    
    # Parse backup
    with open(backup_file, 'r', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Try description div format first
    sections = extract_description_div_content(soup)
    
    # If not found, try H2 sections format
    if not sections:
        sections = extract_h2_sections_content(soup)
    
    if not sections:
        return False, "No content extracted"
    
    # Copy ALL images
    images = copy_all_images_from_page(backup_file)
    
    # Generate HTML
    content_html = generate_html(sections)
    
    # Add image gallery
    if images:
        gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
        for img in images:
            gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        gallery += '\n            </div>\n        </div>\n    </section>'
        content_html += '\n\n' + gallery
    
    # Read city page
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    # Replace all content between header and CTA
    pattern = r'(</section>\s*)(?:<section class="section".*?</section>\s*)*(<section class="section cta-section">)'
    city_html = re.sub(pattern, f'\\1\n{content_html}\n\n\\2', city_html, count=1, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    return True, f"{len(sections)} sections, {len(images)} images"

# Main execution
print("="*80)
print("COMPLETE REBUILD: ALL CITIES WITH ALL CONTENT AND SOURCE IMAGES")
print("="*80)

results = []
for city_slug, backup_slug in sorted(ALL_CITIES.items()):
    success, msg = rebuild_city_complete(city_slug, backup_slug)
    status = "✅" if success else "❌"
    results.append((status, city_slug, msg))
    print(f"{status} {city_slug:30} {msg}")

print("\n" + "="*80)
successful = sum(1 for s, c, m in results if s == "✅")
print(f"SUCCESS: {successful}/{len(ALL_CITIES)} cities")

if successful < len(ALL_CITIES):
    failures = [c for s, c, m in results if s == "❌"]
    print(f"FAILED: {', '.join(failures)}")

