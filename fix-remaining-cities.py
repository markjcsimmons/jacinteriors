#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import re

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

# Cities that need fixing
PROBLEM_CITIES = {
    'beverly-hills': 'beverly-hills-project',
    'calabasas': 'calabasas',
    'culver-city': 'culver-city',
    'manhattan-beach': 'manhattan-beach',
    'palos-verdes': 'palos-verdes',
    'pasadena': 'pasadena',
    'studio-city': 'studio-city',
    'west-hollywood': 'west-hollywood',
    'fort-lauderdale': 'fort-lauderdale',
}

def extract_all(soup):
    sections = []
    
    # Try description div first
    desc = soup.find('div', class_='description')
    if desc:
        content = []
        for p in desc.find_all('p'):
            text = p.get_text(strip=True)
            if text and len(text) > 50 and 'Contact' not in text:
                content.append(('p', text))
        if content:
            sections.append({'h2': '', 'content': content})
            return sections
    
    # Try page div
    page = soup.find('div', class_='page')
    if page:
        content = []
        for p in page.find_all('p', recursive=False):
            text = p.get_text(strip=True)
            if text and len(text) > 50 and 'Contact' not in text:
                content.append(('p', text))
        if content:
            sections.append({'h2': '', 'content': content})
            return sections
    
    # Try main div with all content
    main = soup.find('div', class_='one-whole column')
    if not main:
        return sections
    
    # Get intro paragraphs before first H2
    first_h2 = main.find('h2')
    if first_h2:
        for elem in main.children:
            if elem == first_h2:
                break
            if hasattr(elem, 'name') and elem.name == 'p':
                text = elem.get_text(strip=True)
                if text and len(text) > 30:
                    if not sections:
                        sections.append({'h2': '', 'content': []})
                    sections[0]['content'].append(('p', text))
    
    # Get all H2 sections
    for h2 in main.find_all('h2'):
        h2_text = h2.get_text(strip=True)
        if 'Contact' in h2_text or 'Ready to' in h2_text:
            break
        
        content = []
        current = h2.find_next_sibling()
        
        while current:
            if hasattr(current, 'name'):
                if current.name == 'h2':
                    break
                elif current.name == 'h3':
                    content.append(('h3', current.get_text(strip=True)))
                elif current.name == 'p':
                    text = current.get_text(strip=True)
                    if text and len(text) > 15:
                        if text.startswith('-') or text.startswith('•'):
                            content.append(('li', text.lstrip('-• ').strip()))
                        else:
                            content.append(('p', text))
                elif current.name == 'ul':
                    for li in current.find_all('li'):
                        li_text = li.get_text(strip=True)
                        if li_text:
                            content.append(('li', li_text))
            
            current = current.find_next_sibling()
            if not current:
                break
        
        if content:
            sections.append({'h2': h2_text, 'content': content})
    
    return sections

def gen_html(sections):
    parts = []
    for i, sec in enumerate(sections):
        bg = 'var(--color-bg-alt)' if i % 2 == 0 else 'white'
        html = f'    <section class="section" style="background-color: {bg};">\n        <div class="container">'
        
        if sec['h2']:
            html += f'\n            <div class="section-header">\n                <h2>{sec["h2"]}</h2>\n            </div>'
        
        html += '\n            <div style="max-width: 900px; margin: 0 auto;">'
        
        in_list = False
        for t, text in sec['content']:
            if t == 'h3':
                if in_list:
                    html += '\n                </ul>'
                    in_list = False
                html += f'\n                <h3 style="font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">{text}</h3>'
            elif t == 'p':
                if in_list:
                    html += '\n                </ul>'
                    in_list = False
                html += f'\n                <p style="margin-bottom: 1rem;">{text}</p>'
            elif t == 'li':
                if not in_list:
                    html += '\n                <ul style="margin-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">'
                    in_list = True
                html += f'\n                    <li>{text}</li>'
        
        if in_list:
            html += '\n                </ul>'
        
        html += '\n            </div>\n        </div>\n    </section>'
        parts.append(html)
    
    return '\n\n'.join(parts)

def get_imgs(city):
    img_dir = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/cities')
    imgs = []
    for img in img_dir.glob('*.jpg'):
        if city.replace('-', '') in img.name.lower() or city in img.name.lower():
            imgs.append(img.name)
    return sorted(imgs)

for city_slug, backup_slug in PROBLEM_CITIES.items():
    backup_file = BACKUP_DIR / f"{backup_slug}.html"
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not backup_file.exists() or not city_file.exists():
        print(f"❌ {city_slug}: Missing files")
        continue
    
    with open(backup_file, 'r', errors='ignore') as f:
        backup_html = f.read()
    
    soup = BeautifulSoup(backup_html, 'html.parser')
    sections = extract_all(soup)
    
    if not sections:
        print(f"❌ {city_slug}: No content extracted")
        continue
    
    content_html = gen_html(sections)
    
    imgs = get_imgs(city_slug)
    if imgs:
        gallery = '\n    <section class="section">\n        <div class="container">\n            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">'
        for img in imgs:
            gallery += f'\n                <img src="../assets/images/cities/{img}" alt="Interior Design" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy">'
        gallery += '\n            </div>\n        </div>\n    </section>'
        content_html += '\n\n' + gallery
    
    with open(city_file, 'r') as f:
        city_html = f.read()
    
    pattern = r'(</section>\s*\n\s*).*?(<section class="section cta-section">)'
    city_html = re.sub(pattern, f'\\1\n{content_html}\n\n\\2', city_html, count=1, flags=re.DOTALL)
    
    with open(city_file, 'w') as f:
        f.write(city_html)
    
    print(f"✅ {city_slug}")

print("\nDone fixing problem cities")

