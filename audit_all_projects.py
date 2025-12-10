#!/usr/bin/env python3
"""
Audit all project pages for correct images and text
"""

from pathlib import Path
from bs4 import BeautifulSoup

projects = [
    'beverly-hills-alpine',
    'calabasas-residence',
    'eclectic-sunnyside',
    'madison-club',
    'malibu-beach-house',
    'mulholland-estate',
    'palm-desert-oasis',
    'panorama-views',
    'santa-monica-modern-spanish',
    'toscana-country-club',
    'venice-beach-house',
    'venice-boho-house',
    'yellowstone-club'
]

def audit_project(project_slug):
    """Audit a single project page"""
    filepath = Path(f'projects/{project_slug}.html')
    
    if not filepath.exists():
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Extract title
    h1 = soup.find('h1')
    title = h1.get_text(strip=True) if h1 else "N/A"
    
    # Extract subtitle
    subtitle = ""
    subtitle_p = soup.find('p', style=lambda x: x and 'font-size: 16px' in x and 'color: #ccc' in x)
    if subtitle_p:
        subtitle = subtitle_p.get_text(strip=True)
    
    # Extract image paths
    images = []
    img_tags = soup.find_all('img', src=lambda x: x and 'projects/' in x and 'logo' not in x.lower())
    for img in img_tags[:6]:  # First 6 images
        src = img.get('src', '')
        # Extract just the filename
        filename = src.split('/')[-1] if '/' in src else src
        images.append(filename)
    
    # Extract some body text
    body_text = []
    paragraphs = soup.find_all('p', style=lambda x: x and 'font-size: 16px' in x and 'line-height: 24px' in x)
    for p in paragraphs[:3]:  # First 3 paragraphs
        text = p.get_text(strip=True)
        if text and len(text) > 20:
            body_text.append(text[:80] + '...' if len(text) > 80 else text)
    
    return {
        'title': title,
        'subtitle': subtitle[:100] + '...' if len(subtitle) > 100 else subtitle,
        'images': images,
        'body_text': body_text
    }

def main():
    print("=" * 100)
    print("PROJECT PAGES AUDIT - Images & Text Verification")
    print("=" * 100)
    print()
    
    for project in projects:
        result = audit_project(project)
        
        if not result:
            print(f"❌ {project}: FILE NOT FOUND")
            print()
            continue
        
        print(f"{'='*100}")
        print(f"📁 PROJECT: {project.upper()}")
        print(f"{'='*100}")
        
        print(f"\n📌 TITLE: {result['title']}")
        print(f"📝 SUBTITLE: {result['subtitle']}")
        
        print(f"\n🖼️  IMAGES USED:")
        for i, img in enumerate(result['images'], 1):
            # Check if image matches project
            is_correct = project in img or img.startswith(project)
            status = "✅" if is_correct else "⚠️"
            print(f"  {status} Image {i}: {img}")
        
        print(f"\n📄 TEXT SAMPLES:")
        for i, text in enumerate(result['body_text'], 1):
            print(f"  {i}. {text}")
        
        # Check if text seems generic
        generic_phrases = [
            'Luxury interior design that transforms living spaces',
            'Every detail was carefully considered',
            'The space features custom furnishings',
            'Natural light and open layouts'
        ]
        
        has_generic = any(phrase.lower() in ' '.join(result['body_text']).lower() for phrase in generic_phrases)
        
        if has_generic:
            print(f"\n  ⚠️  WARNING: Contains generic placeholder text")
        else:
            print(f"\n  ✅ Text appears project-specific")
        
        print()

if __name__ == '__main__':
    main()

