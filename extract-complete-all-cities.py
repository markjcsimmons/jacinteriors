#!/usr/bin/env python3
"""
COMPLETE extraction - get EVERY paragraph including intro paragraphs before H2s
"""
from pathlib import Path
from bs4 import BeautifulSoup
import re

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

CITIES = {
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
    'beverly-hills': 'beverly-hills-project',
    'culver-city': 'culver-city',
    'pasadena': 'pasadena',
    'manhattan-beach': 'manhattan-beach',
    'studio-city': 'studio-city',
    'west-hollywood': 'west-hollywood',
    'calabasas': 'calabasas',
    'palos-verdes': 'palos-verdes',
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

def extract_all_content(soup):
    """Extract EVERYTHING including intro paragraphs before first H2"""
    all_sections = []
    
    # Find main content div
    main_div = soup.find('div', class_='one-whole column')
    if not main_div:
        # Try description div for project pages
        desc_div = soup.find('div', class_='description')
        if desc_div:
            content = []
            for p in desc_div.find_all('p'):
                text = p.get_text(strip=True)
                if text and len(text) > 20 and 'Contact' not in text:
                    content.append(('p', text))
            if content:
                all_sections.append({'h2': '', 'content': content})
        return all_sections
    
    # Extract intro paragraphs BEFORE first H2
    first_h2 = main_div.find('h2')
    if first_h2:
        intro_content = []
        for elem in main_div.children:
            if elem == first_h2:
                break
            if hasattr(elem, 'name') and elem.name == 'p':
                text = elem.get_text(strip=True)
                if text and len(text) > 20 and 'Now Open' not in text and 'Caption' not in text:
                    intro_content.append(('p', text))
        
        if intro_content:
            all_sections.append({'h2': '', 'content': intro_content})
    
    # Extract ALL H2 sections
    for h2 in main_div.find_all('h2'):
        h2_text = h2.get_text(strip=True)
        
        if any(stop in h2_text for stop in ['Contact', 'Ready to create', 'Ready to transform']):
            break
        
        section_content = []
        current = h2.find_next_sibling()
        
        while current:
            if hasattr(current, 'name'):
                if current.name == 'h2':
                    break
                
                if current.name == 'h3':
                    section_content.append(('h3', current.get_text(strip=True)))
                
                elif current.name == 'p':
                    text = current.get_text(strip=True)
                    if text and len(text) > 15 and 'Now Open' not in text:
                        if text.startswith('-') or text.startswith('•') or text.startswith('→'):
                            section_content.append(('li', text.lstrip('-•→ ').strip()))
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

def generate_html(sections):
    """Generate HTML"""
    parts = []
    
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
        parts.append(html)
    
    return '\n\n'.join(parts)

def get_images(city_slug):
    img_dir = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/cities')
    images = []
    for img in img_dir.glob('*.jpg'):
        if city_slug.replace('-', '') in img.name.lower() or city_slug in img.name.lower():
            images.append(img.name)
    return sorted(images)

def rebuild(city_slug, backup_slug):
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists() or not city_file.exists():
        return False, "Missing"
    
    with open(backup_file, 'r', errors='ignore') as f:
        backup_html = f.read()
    soup = BeautifulSoup(backup_html, 'html.parser')
    
    sections = extract_all_content(soup)
    if not sections:
        return False, "No content"
    
    content_html = generate_html(sections)
    
    images = get_images(city_slug)
    if images:
        gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
        for img in images:
            gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        gallery += '\n            </div>\n        </div>\n    </section>'
        content_html += '\n\n' + gallery
    
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    pattern = r'(</section>\s*\n\s*).*?(<section class="section cta-section">)'
    city_html = re.sub(pattern, f'\\1\n{content_html}\n\n\\2', city_html, count=1, flags=re.DOTALL)
    
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    # Verify
    with open(city_file, 'r') as f:
        new_html = f.read()
    new_soup = BeautifulSoup(new_html, 'html.parser')
    new_text = re.sub(r'\s+', ' ', new_soup.get_text()).strip()
    
    backup_soup2 = BeautifulSoup(backup_html, 'html.parser')
    backup_text = re.sub(r'\s+', ' ', backup_soup2.get_text()).strip()
    
    ratio = len(new_text) / len(backup_text) * 100 if len(backup_text) > 0 else 0
    
    return True, f"{ratio:.0f}%"

# Execute
for city_slug, backup_slug in sorted(CITIES.items()):
    success, msg = rebuild(city_slug, backup_slug)
    status = "✅" if success and int(msg.rstrip('%')) >= 90 else "❌"
    print(f"{status} {city_slug:25} {msg}")

