#!/usr/bin/env python3
"""
Extract AUTHENTIC original content from jacinteriors.com backup
and apply it to city pages with proper HTML structure
"""

import re
import html as html_lib
from pathlib import Path
from bs4 import BeautifulSoup

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

# Mapping of city slugs to backup filenames
CITY_MAPPINGS = {
    'hollywood': 'hollywood-interior-design-services',
    'bel-air': 'bel-air-interior-design-services',
    'brentwood': 'brentwood-interior-design-services',
    'santa-monica': 'our-signature-interior-design-services-in-santa-monica',
    'burbank': 'burbank-interior-design-services',
    'encino': 'encino-interior-design-services',
    'hermosa-beach': 'hermosa-beach-interior-design-services',
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
    # Florida cities
    'aventura': 'aventura-golden-isles-interior-design-services',
    'bal-harbour': 'bal-harbour-bay-harbor-islands-interior-design-services',
    'brickell': 'brickell-downtown-miami-interior-design-services',
    'coconut-grove': 'coconut-grove-interior-design-services',
    'coral-gables': 'coral-gables-interior-design-services',
    'hialeah': 'hialeah-interior-design-services',
    'key-biscayne': 'key-biscayne-interior-design-services',
    'plantation': 'plantation-interior-design-services',
    'wynwood': 'wynwood-edgewater-interior-design-services',
    # Additional cities from backup
    'beverly-hills': 'beverly-hills-project',
    'culver-city': 'culver-city',
    'pasadena': 'pasadena',
    'manhattan-beach': 'manhattan-beach',
    'studio-city': 'studio-city',
    'west-hollywood': 'west-hollywood',
    'calabasas': 'calabasas',
    'doral': 'doral-interior-design-services-nbsp-nbsp',
    'deerfield-beach': 'deerfield-beach',
    'fort-lauderdale': 'fort-lauderdale',
    'boca-raton': 'interior-designer-boca-raton',
    'palos-verdes': 'palos-verdes',
    'pompano-beach': 'pompano-beach-interior',
    'edgewater': 'wynwood-edgewater-interior-design-services',  # Edgewater is in Wynwood page
}

def extract_city_content_beautifulsoup(html_content):
    """Extract content using BeautifulSoup for better parsing"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the main content div
    main_content = soup.find('div', class_='one-whole column')
    if not main_content:
        return None
    
    content_sections = []
    current_section = None
    
    # Iterate through all elements
    for element in main_content.find_all(['h2', 'p', 'ul']):
        if element.name == 'h2':
            # Save previous section if exists
            if current_section and (current_section['paragraphs'] or current_section['lists']):
                content_sections.append(current_section)
            
            # Start new section
            h2_text = element.get_text(strip=True)
            
            # Skip contact and footer sections
            if any(skip in h2_text for skip in ['Contact', 'Ready to']):
                current_section = None
                continue
            
            current_section = {
                'title': h2_text,
                'paragraphs': [],
                'lists': []
            }
        
        elif element.name == 'p' and current_section:
            text = element.get_text(strip=True)
            if text and len(text) > 30 and not text.startswith('Contact'):
                current_section['paragraphs'].append(text)
        
        elif element.name == 'ul' and current_section:
            list_items = []
            for li in element.find_all('li'):
                li_text = li.get_text(strip=True)
                if li_text:
                    list_items.append(li_text)
            if list_items:
                current_section['lists'].append(list_items)
    
    # Add last section
    if current_section and (current_section['paragraphs'] or current_section['lists']):
        content_sections.append(current_section)
    
    return content_sections[:4]  # Return first 4 major sections

def generate_html_from_sections(sections, city_name):
    """Generate clean HTML from extracted sections"""
    html_parts = []
    
    for i, section in enumerate(sections):
        bg_color = 'var(--color-bg-alt)' if i % 2 == 1 else 'transparent'
        
        section_html = f'''
    <section class="section" style="background-color: {bg_color};">
        <div class="container">
            <div class="section-header">
                <h2>{section['title']}</h2>
            </div>
            <div style="max-width: 900px; margin: 0 auto;">'''
        
        # Add paragraphs
        for p in section['paragraphs'][:3]:  # First 3 paragraphs
            section_html += f'\n                <p style="margin-bottom: 1rem;">{p}</p>'
        
        # Add lists
        for list_items in section['lists']:
            section_html += '\n                <ul style="margin-left: 1.5rem; line-height: 1.8; margin-top: 1rem;">'
            for item in list_items:
                section_html += f'\n                    <li>{item}</li>'
            section_html += '\n                </ul>'
        
        section_html += '''
            </div>
        </div>
    </section>'''
        
        html_parts.append(section_html)
    
    return '\n'.join(html_parts)

def get_city_image_path(city_slug):
    """Determine which image to use for this city"""
    city_images = {
        'beverly-hills': '../assets/images/cities/Beverly-Hills-07190926_2000x3d09.jpg',
        'culver-city': '../assets/images/cities/JAC-culver-city-04_2000x4a3c.jpg',
        'encino': '../assets/images/cities/JAC_Encino-14_3c86e541-dde6-4cd6-a271-7af30a5e7ad3_2000x7394.jpg',
        'hollywood': '../assets/images/cities/jac-cities-hollywood-1_1200x_db47aaec-7e62-4e7b-b047-e669869c01f7_2000xda8b.jpg',
        'manhattan-beach': '../assets/images/cities/jac-cities-manhattan-beach-1_2000x7394.jpg',
        'pasadena': '../assets/images/cities/jac-cities-pasadena-1_2000x37f0.jpg',
        'santa-monica': '../assets/images/cities/jac-cities-santa-monica-1-500x1000_2000xbbd7.jpg',
    }
    return city_images.get(city_slug, '../assets/images/projects/venice-beach-house.jpg')

def update_city_page_with_authentic_content(city_slug, backup_slug):
    """Update city page with authentic content from backup"""
    
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists():
        return False, "Backup not found"
    
    if not city_file.exists():
        return False, "City page not found"
    
    # Read backup content
    with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
        backup_content = f.read()
    
    # Extract sections
    sections = extract_city_content_beautifulsoup(backup_content)
    
    if not sections:
        return False, "No content extracted"
    
    # Read current city page
    with open(city_file, 'r', encoding='utf-8') as f:
        city_content = f.read()
    
    # Extract city name from H1
    h1_match = re.search(r'<h1>(.*?)</h1>', city_content)
    if h1_match:
        city_name = re.sub(r' Interior Design.*$', '', h1_match.group(1)).strip()
    else:
        city_name = city_slug.replace('-', ' ').title()
    
    # Generate HTML for sections
    sections_html = generate_html_from_sections(sections, city_name)
    
    # Get image path
    image_path = get_city_image_path(city_slug)
    
    # Replace content between intro section and CTA
    # Find and replace all content sections between intro and CTA
    pattern = r'(<section class="section" style="padding-top: 2rem;">.*?</section>)\s*(<section class="section".*?</section>)*\s*(<section class="section cta-section">)'
    
    replacement = f'\\1\n{sections_html}\n\n\\3'
    
    city_content = re.sub(pattern, replacement, city_content, flags=re.DOTALL)
    
    # Write back
    with open(city_file, 'w', encoding='utf-8') as f:
        f.write(city_content)
    
    return True, f"{len(sections)} sections"

def main():
    """Process all mapped cities"""
    print("Extracting authentic content from jacinteriors.com backup...")
    print("="*70)
    
    updated_count = 0
    
    for city_slug, backup_slug in CITY_MAPPINGS.items():
        try:
            success, message = update_city_page_with_authentic_content(city_slug, backup_slug)
            if success:
                print(f"✅ {city_slug:25} - {message}")
                updated_count += 1
            else:
                print(f"⚠️  {city_slug:25} - {message}")
        except Exception as e:
            print(f"❌ {city_slug:25} - Error: {e}")
    
    print("\n" + "="*70)
    print(f"✨ Updated {updated_count}/{len(CITY_MAPPINGS)} city pages with authentic content")

if __name__ == '__main__':
    main()

