#!/usr/bin/env python3
"""
PROPERLY extract ALL content from jacinteriors.com city pages
Handle both <p data-start> and <p dir="ltr"><span> formats
"""

import re
import html as html_lib
from pathlib import Path
from bs4 import BeautifulSoup

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

# All cities that should have service pages
CITY_MAPPINGS = {
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
    'deerfield-beach': 'deerfield-beach-interior-design-services',
    'fort-lauderdale': 'fort-lauderdale-interior-design-services',
    'boca-raton': 'interior-designer-boca-raton',
    'pompano-beach': 'pompano-beach-interior',
}

def extract_full_html_content(backup_file):
    """Extract the ENTIRE main content area as HTML"""
    with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Find the main content div
    main_div = soup.find('div', class_='one-whole column')
    if not main_div:
        return None
    
    # Get all the HTML content, clean it up
    content_html = str(main_div)
    
    # Remove contact form and footer sections
    content_html = re.sub(r'<h2[^>]*>Contact Us</h2>.*', '', content_html, flags=re.DOTALL)
    content_html = re.sub(r'<h2[^>]*>Ready to .*?</h2>.*?<p[^>]*>.*?</p>', '', content_html, flags=re.DOTALL)
    
    return content_html

def convert_to_clean_html(content_html):
    """Convert the extracted HTML to clean, modern HTML"""
    if not content_html:
        return ""
    
    soup = BeautifulSoup(content_html, 'html.parser')
    
    sections_html = []
    current_section = {'title': '', 'content': []}
    
    for element in soup.find_all(['h2', 'h3', 'p', 'ul']):
        if element.name == 'h2':
            # Save previous section if it has content
            if current_section['content']:
                sections_html.append(generate_section_html(current_section))
            
            # Start new section
            current_section = {
                'title': element.get_text(strip=True),
                'content': []
            }
        
        elif element.name in ['p', 'ul']:
            text = element.get_text(strip=True)
            if text and len(text) > 20 and not text.startswith('Contact'):
                if element.name == 'p':
                    current_section['content'].append(f'<p>{text}</p>')
                else:
                    # Handle lists
                    list_items = [li.get_text(strip=True) for li in element.find_all('li')]
                    if list_items:
                        list_html = '<ul style="margin-left: 1.5rem; line-height: 1.8;">'
                        for item in list_items:
                            list_html += f'<li>{item}</li>'
                        list_html += '</ul>'
                        current_section['content'].append(list_html)
    
    # Add last section
    if current_section['content']:
        sections_html.append(generate_section_html(current_section))
    
    return '\n\n'.join(sections_html)

def generate_section_html(section):
    """Generate HTML for a section"""
    title = section['title']
    content = '\n                '.join(section['content'])
    
    html = f'''    <section class="section" style="background-color: var(--color-bg-alt);">
        <div class="container">'''
    
    if title:
        html += f'''
            <div class="section-header">
                <h2>{title}</h2>
            </div>'''
    
    html += f'''
            <div style="max-width: 900px; margin: 0 auto;">
                {content}
            </div>
        </div>
    </section>'''
    
    return html

def rebuild_city_page(city_slug, backup_slug):
    """Completely rebuild a city page with authentic content"""
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists():
        return False, "No backup"
    
    if not city_file.exists():
        return False, "No city file"
    
    # Extract content from backup
    content_html = extract_full_html_content(backup_file)
    if not content_html:
        return False, "No content extracted"
    
    # Convert to clean HTML sections
    sections_html = convert_to_clean_html(content_html)
    
    # Read current city page to preserve header/footer
    with open(city_file, 'r') as f:
        city_content = f.read()
    
    # Replace everything between intro header and CTA
    pattern = r'(</section>\s*)(<section class="section".*?)?(<section class="section cta-section">)'
    replacement = f'\\1\n{sections_html}\n\n\\3'
    
    city_content_new = re.sub(pattern, replacement, city_content, count=1, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w') as f:
        f.write(city_content_new)
    
    # Count sections
    section_count = city_content_new.count('<section class="section"')
    
    return True, f"{section_count} sections"

def main():
    print("="*70)
    print("REBUILDING CITY PAGES WITH COMPLETE AUTHENTIC CONTENT")
    print("="*70)
    
    updated = 0
    
    for city_slug, backup_slug in CITY_MAPPINGS.items():
        success, msg = rebuild_city_page(city_slug, backup_slug)
        if success:
            print(f"✅ {city_slug:25} - {msg}")
            updated += 1
        else:
            print(f"❌ {city_slug:25} - {msg}")
    
    print("\n" + "="*70)
    print(f"✨ Rebuilt {updated}/{len(CITY_MAPPINGS)} city pages")

if __name__ == '__main__':
    main()

