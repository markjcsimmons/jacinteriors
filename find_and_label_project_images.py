#!/usr/bin/env python3
"""
Find 6 unique high-res images for each project and label them properly
"""

import os
import shutil
from pathlib import Path

# Project slugs (excluding beverly-hills-alpine which already has 6 images)
projects = [
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

# Map project slugs to search patterns in filenames
project_patterns = {
    'calabasas-residence': ['calabasas'],
    'eclectic-sunnyside': ['sunnyside', 'eclectic'],
    'madison-club': ['madison'],
    'malibu-beach-house': ['malibu'],
    'mulholland-estate': ['mulholland'],
    'palm-desert-oasis': ['desert', 'palm'],
    'panorama-views': ['panorama', 'view'],
    'santa-monica-modern-spanish': ['santa-monica', 'spanish'],
    'toscana-country-club': ['toscana'],
    'venice-beach-house': ['venice'],
    'venice-boho-house': ['venice', 'boho'],
    'yellowstone-club': ['yellowstone', 'montana']
}

def get_image_size(filepath):
    """Get file size in bytes"""
    try:
        return os.path.getsize(filepath)
    except:
        return 0

def find_project_images(project_slug, patterns, flat_images_dir, min_count=6):
    """Find images that might belong to this project"""
    candidates = []
    
    # Get all jpg files in flat directory
    for img_file in flat_images_dir.glob('*.jpg'):
        filename_lower = img_file.name.lower()
        
        # Check if any pattern matches
        for pattern in patterns:
            if pattern.lower() in filename_lower:
                # Prefer _2000x images (high-res)
                size = get_image_size(img_file)
                is_high_res = '_2000x' in filename_lower
                candidates.append((img_file, size, is_high_res))
                break
    
    # Sort by: high-res first, then by size
    candidates.sort(key=lambda x: (not x[2], -x[1]))
    
    # Get top images
    selected = [c[0] for c in candidates[:min_count]]
    
    return selected

def main():
    base_dir = Path('assets/images/projects')
    flat_dir = base_dir
    
    print("Finding and labeling 6 unique images for each project...\n")
    
    for project in projects:
        print(f"Processing: {project}")
        project_dir = base_dir / project
        
        # Get existing images
        existing = list(project_dir.glob(f'{project}-*.jpg'))
        numbered_images = [img for img in existing if any(img.stem.endswith(f'-{i}') for i in range(1, 7))]
        
        if len(numbered_images) >= 6:
            print(f"  ✓ Already has 6+ numbered images\n")
            continue
        
        # Find candidate images
        patterns = project_patterns.get(project, [project.replace('-', ' ').split()[0]])
        candidates = find_project_images(project, patterns, flat_dir, 6)
        
        if len(candidates) < 6:
            # Use existing primary/hover/secondary to fill
            existing_imgs = [
                project_dir / f'{project}-primary.jpg',
                project_dir / f'{project}-hover.jpg',
                project_dir / f'{project}-secondary.jpg'
            ]
            # Add existing that actually exist
            for img in existing_imgs:
                if img.exists() and len(candidates) < 6:
                    candidates.append(img)
        
        # Copy and label the first 6
        for i, img_path in enumerate(candidates[:6], 1):
            target_path = project_dir / f'{project}-{i}.jpg'
            
            if not target_path.exists():
                try:
                    shutil.copy2(img_path, target_path)
                    print(f"  ✓ Created: {target_path.name} (from {img_path.name})")
                except Exception as e:
                    print(f"  ✗ Error copying {img_path.name}: {e}")
        
        # Verify we have 6
        final_count = len(list(project_dir.glob(f'{project}-[1-6].jpg')))
        print(f"  → Total labeled images: {final_count}/6\n")
    
    print("Done! All projects should now have 6 labeled images.")

if __name__ == '__main__':
    main()

