#!/usr/bin/env python3
"""
FINAL COMPLETE REBUILD - Extract EVERYTHING from jacinteriors.com
"""
from pathlib import Path
from bs4 import BeautifulSoup
import re

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

CITIES = {
    # Full service pages
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
    # Description div pages
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

def get_available_images_for_city(city_slug):
    """Get list of images already in assets folder for this city"""
    images = []
    for img_file in Path('/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/cities').glob('*.jpg'):
        filename = img_file.name.lower()
        city_clean = city_slug.replace('-', '')
        
        # Match images that contain city name
        if city_clean in filename or city_slug in filename:
            images.append(img_file.name)
    
    return sorted(images)

def extract_complete_sections(soup):
    """Extract ALL content sections - handles BOTH formats"""
    
    all_sections = []
    
    # FORMAT 1: Check for H2 at beginning (before description div)
    # This is the service intro + bullets section
    first_h2 = soup.find('h2')
    if first_h2:
        h2_text = first_h2.get_text(strip=True)
        
        if 'Interior Design' in h2_text or 'Services' in h2_text:
            section_content = []
            
            # Get paragraphs between H2 and H3
            current = first_h2.find_next_sibling()
            while current and current.name not in ['h3', 'h2', 'div']:
                if current.name == 'p':
                    text = current.get_text(strip=True)
                    if text and len(text) > 20:
                        section_content.append(('p', text))
                current = current.find_next_sibling() if current else None
            
            # Find H3 (Why Choose Us)
            h3 = first_h2.find_next('h3')
            if h3:
                h3_text = h3.get_text(strip=True)
                section_content.append(('h3', h3_text))
                
                # Get UL after H3
                ul = h3.find_next('ul')
                if ul:
                    for li in ul.find_all('li'):
                        li_text = li.get_text(strip=True)
                        if li_text:
                            section_content.append(('li', li_text))
                
                # Get paragraph after UL
                p_after = ul.find_next('p') if ul else h3.find_next('p')
                if p_after:
                    text = p_after.get_text(strip=True)
                    if text and len(text) > 20:
                        section_content.append(('p', text))
            
            if section_content:
                all_sections.append({'h2': h2_text, 'content': section_content})
    
    # FORMAT 2: Extract description div (detailed city content)
    desc_div = soup.find('div', class_='description')
    if desc_div:
        desc_paragraphs = []
        for p in desc_div.find_all('p'):
            text = p.get_text(strip=True)
            if text and not text.startswith('Contact') and len(text) > 30:
                desc_paragraphs.append(('p', text))
        
        if desc_paragraphs:
            all_sections.append({'h2': '', 'content': desc_paragraphs})
    
    # FORMAT 3: Extract remaining H2 sections (for service pages)
    main_div = soup.find('div', class_='one-whole column')
    if main_div:
        for h2 in main_div.find_all('h2')[1:]:  # Skip first H2 (already processed)
            h2_text = h2.get_text(strip=True)
            
            if 'Contact' in h2_text or 'Ready to' in h2_text:
                break
            
            section_content = []
            current = h2.find_next_sibling()
            
            while current and current.name != 'h2':
                if current.name == 'h3':
                    section_content.append(('h3', current.get_text(strip=True)))
                
                elif current.name == 'p':
                    text = current.get_text(strip=True)
                    if text and len(text) > 20:
                        if text.startswith('-') or text.startswith('•'):
                            section_content.append(('li', text.lstrip('-• ').strip()))
                        else:
                            section_content.append(('p', text))
                
                elif current.name == 'ul':
                    for li in current.find_all('li'):
                        li_text = li.get_text(strip=True)
                        if li_text:
                            section_content.append(('li', li_text))
                
                current = current.find_next_sibling()
                if not current:
                    break
            
            if section_content:
                all_sections.append({'h2': h2_text, 'content': section_content})
    
    return all_sections

def generate_section_html(section, index):
    """Generate HTML for one section"""
    bg = 'var(--color-bg-alt)' if index % 2 == 0 else 'white'
    
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
            html += f'\n                <h3 style="font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">{text}</h3>'
        
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
    
    return html

def rebuild_city_page_final(city_slug, backup_slug):
    """Final complete rebuild"""
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists() or not city_file.exists():
        return False, "Missing files"
    
    # Parse backup
    with open(backup_file, 'r', errors='ignore') as f:
        backup_html = f.read()
    
    soup = BeautifulSoup(backup_html, 'html.parser')
    
    # Extract all sections
    sections = extract_complete_sections(soup)
    if not sections:
        return False, "No content"
    
    # Get images for this city
    images = get_available_images_for_city(city_slug)
    
    # Generate HTML
    sections_html = [generate_section_html(s, i) for i, s in enumerate(sections)]
    
    # Add image gallery
    if images:
        gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
        for img in images:
            gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design Project" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        gallery += '\n            </div>\n        </div>\n    </section>'
        sections_html.append(gallery)
    
    all_content = '\n\n'.join(sections_html)
    
    # Read city page
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    # Replace content between header section and CTA
    pattern = r'(</section>\s*\n\s*).*?(<section class="section cta-section">)'
    city_html = re.sub(pattern, f'\\1\n{all_content}\n\n\\2', city_html, count=1, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    return True, f"{len(sections)} sections, {len(images)} images"

# Execute
print("="*80)
print("FINAL COMPLETE REBUILD - ALL CONTENT + ALL IMAGES")
print("="*80)

results = []
for city_slug, backup_slug in sorted(CITIES.items()):
    success, msg = rebuild_city_page_final(city_slug, backup_slug)
    status = "✅" if success else "❌"
    results.append((status, city_slug, msg))
    print(f"{status} {city_slug:30} {msg}")

print("\n" + "="*80)
success_count = sum(1 for s, c, m in results if s == "✅")
print(f"RESULT: {success_count}/{len(CITIES)} cities rebuilt")

failures = [c for s, c, m in results if s == "❌"]
if failures:
    print(f"Failed: {', '.join(failures)}")

