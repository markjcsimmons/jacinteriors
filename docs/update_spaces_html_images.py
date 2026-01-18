#!/usr/bin/env python3
"""
Update spaces HTML pages to dynamically include all available images.
This script counts available images and updates the HTML to display them all.
"""

import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"
SPACES_IMAGES_DIR = os.path.join(DOCS_DIR, "assets/images/spaces")

SPACE_PAGES = [
    'bathrooms',
    'bedrooms',
    'kitchens',
    'dining-rooms',
    'living-spaces',
    'office-spaces',
    'kids-bedrooms',
    'entryways',
    'bar-area',
    'laundry-rooms',
    'outdoor-spaces',
]

def count_images(space_name):
    """Count available images for a space."""
    space_dir = os.path.join(SPACES_IMAGES_DIR, space_name)
    if not os.path.exists(space_dir):
        return []
    
    # Get all image files
    image_files = []
    for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
        pattern = f"{space_name}-*{ext}"
        import glob
        image_files.extend(glob.glob(os.path.join(space_dir, pattern)))
    
    # Sort by number
    def get_number(filename):
        match = re.search(rf'{re.escape(space_name)}-(\d+)', filename)
        return int(match.group(1)) if match else 999999
    
    image_files.sort(key=get_number)
    
    # Get just filenames
    return [os.path.basename(f) for f in image_files]

def update_html_images(space_name, image_files):
    """Update HTML file to include all available images."""
    html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
    if not os.path.exists(html_file):
        print(f"  ⚠ HTML file not found: {html_file}")
        return False
    
    if not image_files:
        print(f"  ⚠ No images found for {space_name}")
        return False
    
    print(f"\nUpdating {space_name}.html:")
    print(f"  Found {len(image_files)} images")
    
    # Read HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the first-row-grid image (should be image 1)
    first_image = None
    if len(image_files) > 0:
        first_image = image_files[0]
        first_img_tag = soup.find('img', src=re.compile(rf'assets/images/spaces/{re.escape(space_name)}/{re.escape(space_name)}-\d+'))
        if first_img_tag:
            first_img_tag['src'] = f'assets/images/spaces/{space_name}/{first_image}'
            first_img_tag['alt'] = space_name.replace('-', ' ').title()
            print(f"  ✓ Updated first image: {first_image}")
    
    # Find the image-gallery-grid div
    gallery_grid = soup.find('div', class_='image-gallery-grid')
    if not gallery_grid:
        # Try to find by style attribute
        gallery_grids = soup.find_all('div', style=re.compile(r'margin-bottom.*2rem'))
        for div in gallery_grids:
            if 'image-gallery-grid' in div.get('class', []) or div.find('img', src=re.compile(rf'assets/images/spaces/{re.escape(space_name)}')):
                gallery_grid = div
                break
    
    if gallery_grid:
        # Clear existing images (keep first one for first-row)
        # We want images 2+ in the gallery
        # Find all divs with parallax-image class inside gallery_grid
        gallery_imgs = gallery_grid.find_all('div', class_=lambda x: x and 'parallax-image' in ' '.join(x) if isinstance(x, list) else 'parallax-image' in str(x))
        
        # Remove old images from gallery (images 2-6)
        for img_div in gallery_imgs[:]:
            img_div.decompose()
        
        # Add new images (images 2 through end)
        images_to_add = image_files[1:] if len(image_files) > 1 else []
        
        for idx, img_file in enumerate(images_to_add):
            # Create new image div with proper HTML attributes
            img_div = soup.new_tag('div', attrs={'class': 'parallax-image scale-in-image hover-zoom-image', 'style': 'width: 100%;'})
            img_container = soup.new_tag('div', attrs={'class': 'image-container'})
            img_tag = soup.new_tag('img', attrs={
                'alt': space_name.replace('-', ' ').title(),
                'src': f'assets/images/spaces/{space_name}/{img_file}',
                'loading': 'lazy'
            })
            img_container.append(img_tag)
            img_div.append(img_container)
            gallery_grid.append(img_div)
        
        print(f"  ✓ Added {len(images_to_add)} images to gallery grid")
    else:
        print(f"  ⚠ Could not find image-gallery-grid div")
    
    # Write updated HTML with proper formatting
    html_str = soup.prettify()
    # Fix any double spaces from prettify
    html_str = re.sub(r'\n\s*\n', '\n', html_str)
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_str)
    
    return True

def main():
    print("=" * 60)
    print("Updating Spaces HTML Pages with All Images")
    print("=" * 60)
    
    for space_name in SPACE_PAGES:
        image_files = count_images(space_name)
        if image_files:
            update_html_images(space_name, image_files)
        else:
            print(f"\n⚠ {space_name}: No images found")
    
    print("\n" + "=" * 60)
    print("✓ Update complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
