#!/usr/bin/env python3
"""
Extract original project descriptions from jacinteriors.com backup
and update project pages with correct content and SEO-optimized structure
"""

import re
import html
import os
from pathlib import Path

# Mapping of project slugs: new_site -> backup_file (without .html extension)
PROJECT_MAPPING = {
    'beverly-hills-alpine': 'beverly-hills-alpine',
    'brentwood-estate': 'beverly-hills-project',  # Use Beverly Hills project
    'calabasas-residence': 'calabasas-project',
    'eclectic-sunnyside': 'eclectic-sunnyside',
    'madison-club': 'madison-club',
    'malibu-beach-house': 'malibu',
    'mulholland-estate': 'mulholland',
    'pacific-palisades-villa': 'panorama-views',  # Use Panorama Views as similar
    'palm-desert-oasis': 'palm-desert-oasis',
    'panorama-views': 'panorama-views',
    'santa-monica-modern-spanish': 'santa-monica-modern-spanish',
    'studio-city-modern': 'studio-city',
    'toscana-country-club': 'toscana-country-club',
    'venice-beach-house': 'venice-beach-house',
    'venice-boho-house': 'venice-boho-house',
    'yellowstone-club': 'yellowstone-club'
}

BACKUP_DIR = Path('/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages')
PROJECT_DIR = Path('/Users/mark/Desktop/JAC web design/jac-website-custom/projects')

def extract_description(html_content):
    """Extract project description from original HTML"""
    # Try to find description div
    desc_match = re.search(r'<div class="description">(.*?)</div>', html_content, re.DOTALL)
    if desc_match:
        desc = desc_match.group(1)
        # Clean up HTML tags but keep paragraph structure
        desc = re.sub(r'<p>', '', desc)
        desc = re.sub(r'</p>', '\n\n', desc)
        desc = re.sub(r'<a[^>]*>', '', desc)
        desc = re.sub(r'</a>', '', desc)
        desc = re.sub(r'<br/?>','\n', desc)
        desc = html.unescape(desc)
        desc = desc.strip()
        # Remove contact info at the end
        desc = re.sub(r'\s*Contact:.*$', '', desc, flags=re.DOTALL)
        return desc
    return None

def extract_title(html_content):
    """Extract project title"""
    # Try collection_title first
    title_match = re.search(r'class="collection_title"[^>]*>\s*([^<]+)', html_content)
    if title_match:
        return title_match.group(1).strip()
    
    # Try h1
    h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html_content)
    if h1_match:
        return h1_match.group(1).strip()
    
    return None

def update_project_page(project_slug, title, description):
    """Update project page with correct content"""
    project_file = PROJECT_DIR / f"{project_slug}.html"
    
    if not project_file.exists():
        print(f"⚠️  Project file not found: {project_file}")
        return False
    
    with open(project_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update the project description section
    # Find and replace the generic description
    desc_pattern = r'(<div class="project-description">)(.*?)(</div>)'
    
    # Convert description paragraphs to proper HTML
    desc_paragraphs = description.split('\n\n')
    desc_html = '\n                '.join(f'<p>{p.strip()}</p>' for p in desc_paragraphs if p.strip())
    
    new_desc = f'\\1\n                {desc_html}\n            \\3'
    content = re.sub(desc_pattern, new_desc, content, flags=re.DOTALL)
    
    # Write back
    with open(project_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated: {project_slug}")
    return True

def main():
    """Main function to extract and update all projects"""
    print("Extracting project descriptions from jacinteriors.com backup...")
    print("="*60)
    
    updated_count = 0
    
    for new_slug, backup_slug in PROJECT_MAPPING.items():
        backup_file = BACKUP_DIR / f"{backup_slug}.html"
        
        if not backup_file.exists():
            print(f"⚠️  Backup file not found: {backup_slug}.html")
            continue
        
        try:
            with open(backup_file, 'r', encoding='utf-8', errors='ignore') as f:
                backup_content = f.read()
            
            title = extract_title(backup_content)
            description = extract_description(backup_content)
            
            if description:
                print(f"\n📄 {new_slug}")
                print(f"   Title: {title}")
                print(f"   Description: {len(description)} characters")
                
                if update_project_page(new_slug, title, description):
                    updated_count += 1
            else:
                print(f"⚠️  No description found for: {backup_slug}")
        
        except Exception as e:
            print(f"❌ Error processing {backup_slug}: {e}")
    
    print("\n" + "="*60)
    print(f"✨ Updated {updated_count} project pages")

if __name__ == '__main__':
    main()

