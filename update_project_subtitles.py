#!/usr/bin/env python3
"""
Update all project pages with project-specific subtitles
"""

from pathlib import Path
from bs4 import BeautifulSoup

# Map of project slugs to their specific subtitles
subtitles = {
    'beverly-hills-alpine': 'A refined Spanish-style residence transformed into a modern family sanctuary',
    'calabasas-residence': 'Contemporary design meets family comfort in the heart of Calabasas',
    'eclectic-sunnyside': 'Modern Eclectic transformation of a tired residence into a vibrant sanctuary',
    'madison-club': 'Award-winning desert luxury design in La Quinta\'s prestigious Madison Club',
    'malibu-beach-house': 'Coastal Contemporary style blending European architecture with natural elements',
    'mulholland-estate': 'Modern luxury estate featuring clever space planning and stunning hillside views',
    'palm-desert-oasis': 'Desert modern oasis overlooking the golf course and majestic mountains',
    'panorama-views': 'Mountain retreat in Golden, Colorado featuring panoramic Rocky Mountain views',
    'santa-monica-modern-spanish': 'Spanish revival from the 1920s transformed into modern Mediterranean elegance',
    'toscana-country-club': 'Mediterranean design overlooking the 17th tee at Indian Wells\' Toscana Country Club',
    'venice-beach-house': 'Vibrant color-play townhouse for entertainment industry professionals',
    'venice-boho-house': 'Bohemian chic custom home with ocean views atop a Venice hill',
    'yellowstone-club': 'Mountain design-build retreat at the base of the Rocky Mountain range in Montana'
}

def update_subtitle(project_slug, new_subtitle):
    """Update the subtitle in a project HTML file"""
    filepath = Path(f'projects/{project_slug}.html')
    
    if not filepath.exists():
        print(f"❌ {project_slug}: File not found")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the subtitle paragraph (in the metadata section)
    subtitle_p = soup.find('p', class_='scroll-fade-in delay-1', style=lambda x: x and 'font-size: 16px' in x and 'color: #ccc' in x)
    
    if subtitle_p:
        old_subtitle = subtitle_p.get_text(strip=True)
        subtitle_p.string = new_subtitle
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        
        print(f"✅ {project_slug}")
        print(f"   OLD: {old_subtitle[:60]}...")
        print(f"   NEW: {new_subtitle}")
        return True
    else:
        print(f"⚠️  {project_slug}: Could not find subtitle element")
        return False

def main():
    print("Updating project subtitles to be project-specific...\n")
    
    success_count = 0
    for project, subtitle in subtitles.items():
        if update_subtitle(project, subtitle):
            success_count += 1
        print()
    
    print(f"\n✅ Updated {success_count}/{len(subtitles)} projects successfully!")

if __name__ == '__main__':
    main()


