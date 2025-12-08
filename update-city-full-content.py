#!/usr/bin/env python3
"""
Extract FULL original city page content from jacinteriors.com backup
and rebuild city pages with complete SEO-optimized structure
"""

import re
import html as html_lib
import os
from pathlib import Path

# Cities that have dedicated interior design services pages in backup
CITY_SERVICE_PAGES = {
    'santa-monica': 'our-signature-interior-design-services-in-santa-monica',
    'bel-air': 'bel-air-interior-design-services',
    'brentwood': 'brentwood-interior-design-services',
    'burbank': 'burbank-interior-design-services',
    'encino': 'encino-interior-design-services',
    'hermosa-beach': 'hermosa-beach-interior-design-services',
    'hollywood': 'hollywood-interior-design-services',
    'marina-del-rey': 'marina-del-rey-interior-design-services',
    'north-hollywood': 'north-hollywood-interior-design-services',
    'pacific-palisades': 'pacific-palisades-interior-design-services',
    'playa-del-rey': 'playa-del-rey-interior-design-services',
    'tarzana': 'tarzana-interior-design-services',
}

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
CITY_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/cities')

def clean_text(text):
    """Clean HTML entities and extra whitespace"""
    text = html_lib.unescape(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_full_content(html_content):
    """Extract all content sections from original city page"""
    
    # Extract H1
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.DOTALL)
    h1_text = ""
    if h1_match:
        h1_text = clean_text(re.sub(r'<[^>]+>', '', h1_match.group(1)))
    
    # Extract intro paragraph
    intro_match = re.search(r'<p data-start[^>]*>(.*?)</p>', html_content, re.DOTALL)
    intro_text = ""
    if intro_match:
        intro_text = clean_text(re.sub(r'<[^>]+>', '', intro_match.group(1)))
    
    # Extract service list
    services = []
    ul_match = re.search(r'<ul data-start[^>]*>(.*?)</ul>', html_content, re.DOTALL)
    if ul_match:
        li_items = re.findall(r'<p data-start[^>]*>(.*?)</p>', ul_match.group(1), re.DOTALL)
        services = [clean_text(re.sub(r'<[^>]+>', '', item)) for item in li_items if item.strip()]
    
    # Extract all H2 sections with their content
    sections = []
    
    # Find all H2 headings
    h2_matches = list(re.finditer(r'<h2[^>]*>(.*?)</h2>', html_content, re.DOTALL))
    
    for i, h2_match in enumerate(h2_matches):
        h2_title = clean_text(re.sub(r'<[^>]+>', '', h2_match.group(1)))
        
        # Skip contact/footer sections
        if any(skip in h2_title for skip in ['Contact', 'Ready to']):
            continue
        
        # Get content between this H2 and the next H2 (or end)
        start_pos = h2_match.end()
        end_pos = h2_matches[i+1].start() if i+1 < len(h2_matches) else len(html_content)
        section_content = html_content[start_pos:end_pos]
        
        # Extract paragraphs
        paragraphs = []
        p_matches = re.findall(r'<p data-start[^>]*>(.*?)</p>', section_content, re.DOTALL)
        for p in p_matches:
            text = clean_text(re.sub(r'<[^>]+>', '', p))
            if text and len(text) > 30:
                paragraphs.append(text)
        
        # Extract H3 subsections
        h3_sections = []
        h3_matches = re.finditer(r'<h3[^>]*>(.*?)</h3>(.*?)(?=<h3|<h2|<ul|$)', section_content, re.DOTALL)
        for h3_match in h3_matches:
            h3_title = clean_text(re.sub(r'<[^>]+>', '', h3_match.group(1)))
            h3_content = h3_match.group(2)
            
            h3_paragraphs = re.findall(r'<p data-start[^>]*>(.*?)</p>', h3_content, re.DOTALL)
            h3_text = ""
            if h3_paragraphs:
                h3_text = clean_text(re.sub(r'<[^>]+>', '', h3_paragraphs[0]))
            
            if h3_title and h3_text:
                h3_sections.append({'title': h3_title, 'content': h3_text})
        
        # Extract lists
        lists = []
        ul_matches = re.finditer(r'<ul[^>]*>(.*?)</ul>', section_content, re.DOTALL)
        for ul_match in ul_matches:
            li_items = re.findall(r'<p data-start[^>]*>(.*?)</p>', ul_match.group(1), re.DOTALL)
            list_items = [clean_text(re.sub(r'<[^>]+>', '', item)) for item in li_items if item.strip()]
            if list_items:
                lists.append(list_items)
        
        if h2_title and (paragraphs or h3_sections or lists):
            sections.append({
                'title': h2_title,
                'paragraphs': paragraphs,
                'h3_sections': h3_sections,
                'lists': lists
            })
    
    return {
        'h1': h1_text,
        'intro': intro_text,
        'services': services,
        'sections': sections
    }

def generate_city_html_sections(data):
    """Generate HTML for additional sections"""
    html_sections = []
    
    for section in data['sections']:
        # Start section
        section_html = f'''
    <section class="section" style="background-color: var(--color-bg-alt);">
        <div class="container">
            <div class="section-header">
                <h2>{section['title']}</h2>
            </div>
            '''
        
        # Add H3 subsections if present
        if section['h3_sections']:
            section_html += '\n            <div style="max-width: 900px; margin: 0 auto;">'
            for h3 in section['h3_sections']:
                section_html += f'''
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--color-secondary);">{h3['title']}</h3>
                    <p>{h3['content']}</p>
                </div>'''
            section_html += '\n            </div>'
        
        # Add paragraphs
        if section['paragraphs'] and not section['h3_sections']:
            section_html += '\n            <div style="max-width: 900px; margin: 0 auto;">'
            for p in section['paragraphs'][:2]:  # First 2 paragraphs
                section_html += f'\n                <p style="margin-bottom: 1rem;">{p}</p>'
            section_html += '\n            </div>'
        
        # Add lists
        for list_items in section['lists']:
            section_html += '\n            <div style="max-width: 900px; margin: 0 auto;">'
            section_html += '\n                <ul style="margin-left: 1.5rem; line-height: 1.8;">'
            for item in list_items:
                section_html += f'\n                    <li>{item}</li>'
            section_html += '\n                </ul>'
            section_html += '\n            </div>'
        
        section_html += '''
        </div>
    </section>'''
        
        html_sections.append(section_html)
    
    return '\n'.join(html_sections)

def update_city_page_full(city_slug, data):
    """Completely rebuild city page with all content"""
    city_file = CITY_DIR / f"{city_slug}.html"
    
    if not city_file.exists():
        print(f"⚠️  City file not found: {city_file}")
        return False
    
    with open(city_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update H1
    if data['h1']:
        h1_pattern = r'(<h1>)(.*?)(</h1>)'
        content = re.sub(h1_pattern, f'\\1{data["h1"]}\\3', content)
    
    # Update intro paragraph
    if data['intro']:
        intro_pattern = r'(<div class="section-header">.*?<p>)(.*?)(</p>)'
        content = re.sub(intro_pattern, f'\\1{data["intro"]}\\3', content, flags=re.DOTALL)
    
    # Update main content section
    if data['services']:
        services_html = '\n                    <p><strong>Our Services:</strong></p>\n                    <ul style="margin-left: 1.5rem; line-height: 1.8; margin-top: 1rem;">'
        for service in data['services']:
            services_html += f'\n                        <li>{service}</li>'
        services_html += '\n                    </ul>'
        
        # Add services to about-content
        about_content_pattern = r'(</div>\s*</div>\s*</div>\s*</section>)'
        services_section = f'{services_html}\n                </div>\n            </div>\n        </div>\n    </section>'
        
        # Find and update the first section
        first_section_pattern = r'(</div>\s*</div>\s*</section>)'
        match = re.search(first_section_pattern, content)
        if match:
            pos = match.start()
            # Insert services before the closing tags
            content = content[:pos] + services_html + content[pos:]
    
    # Add additional sections before CTA
    if data['sections']:
        additional_html = generate_city_html_sections(data)
        
        # Insert before CTA section
        cta_pattern = r'(<section class="section cta-section">)'
        content = re.sub(cta_pattern, additional_html + '\n\n\\1', content, count=1)
    
    # Write back
    with open(city_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """Main function"""
    print("Extracting FULL city page content from jacinteriors.com backup...")
    print("="*70)
    
    updated_count = 0
    
    for city_slug, backup_slug in CITY_SERVICE_PAGES.items():
        backup_file = BACKUP_DIR / f"{backup_slug}.html"
        
        if not backup_file.exists():
            print(f"⚠️  Backup not found: {backup_slug}.html")
            continue
        
        try:
            with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
                backup_content = f.read()
            
            data = extract_full_content(backup_content)
            
            if data['h1']:
                print(f"\n📍 {city_slug}")
                print(f"   H1: {data['h1'][:60]}...")
                print(f"   Services: {len(data['services'])}")
                print(f"   Sections: {len(data['sections'])}")
                
                if update_city_page_full(city_slug, data):
                    updated_count += 1
                    print(f"   ✅ Fully updated with complete content")
            else:
                print(f"⚠️  No content found for: {city_slug}")
        
        except Exception as e:
            print(f"❌ Error processing {city_slug}: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*70)
    print(f"✨ Fully updated {updated_count} city pages with complete content")

if __name__ == '__main__':
    main()

