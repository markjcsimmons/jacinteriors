#!/usr/bin/env python3
"""
Filter all spaces folders to keep only high-resolution images suitable for desktop display.
For masonry layout with 3 images per row on desktop, we need images that are:
- High enough resolution to look good when displayed large
- Minimum size threshold: 500KB (images smaller are likely too low-res)
- Ideally >1MB for best quality
"""

import os
import shutil

DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"
SPACES_IMAGES_DIR = os.path.join(DOCS_DIR, "assets/images/spaces")

# Minimum file size for high-res images (500KB)
MIN_SIZE_KB = 500
MIN_SIZE_BYTES = MIN_SIZE_KB * 1024

# Maximum images to keep (for masonry with 3 per row, we want multiples of 3)
# But we'll keep all high-res images and let the layout handle it

SPACE_FOLDERS = [
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

def filter_space_images(space_name):
    """Filter images in a space folder to keep only high-res ones."""
    space_dir = os.path.join(SPACES_IMAGES_DIR, space_name)
    if not os.path.exists(space_dir):
        print(f"⚠ {space_name}: Folder not found")
        return 0, 0
    
    # Get all image files
    image_files = []
    for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
        pattern = f"{space_name}-*{ext}"
        import glob
        image_files.extend(glob.glob(os.path.join(space_dir, pattern)))
    
    if not image_files:
        print(f"⚠ {space_name}: No images found")
        return 0, 0
    
    # Sort by number in filename
    def get_number(filename):
        import re
        match = re.search(rf'{re.escape(space_name)}-(\d+)', os.path.basename(filename))
        return int(match.group(1)) if match else 999999
    
    image_files.sort(key=get_number)
    
    # Filter by size and collect stats
    high_res_images = []
    low_res_images = []
    
    for img_path in image_files:
        size = os.path.getsize(img_path)
        size_kb = size / 1024
        size_mb = size / (1024 * 1024)
        
        if size >= MIN_SIZE_BYTES:
            high_res_images.append({
                'path': img_path,
                'size': size,
                'size_kb': size_kb,
                'size_mb': size_mb
            })
        else:
            low_res_images.append({
                'path': img_path,
                'size_kb': size_kb
            })
    
    # Create backup directory for low-res images (optional - we'll just remove them)
    if low_res_images:
        backup_dir = os.path.join(SPACES_IMAGES_DIR, f'_removed_low_res_{space_name}')
        # Don't create backup, just remove
        
    # Remove low-res images
    removed_count = 0
    for item in low_res_images:
        try:
            os.remove(item['path'])
            removed_count += 1
        except Exception as e:
            print(f"  Error removing {os.path.basename(item['path'])}: {e}")
    
    # Renumber remaining high-res images to be sequential
    # Sort by original number
    def get_original_number(filename):
        import re
        match = re.search(rf'{re.escape(space_name)}-(\d+)', os.path.basename(filename))
        return int(match.group(1)) if match else 999999
    
    high_res_images.sort(key=lambda x: get_original_number(x['path']))
    
    # Rename to sequential numbers
    temp_dir = os.path.join(space_dir, '_temp_rename')
    os.makedirs(temp_dir, exist_ok=True)
    
    # First move all to temp with new names
    for idx, item in enumerate(high_res_images, 1):
        old_path = item['path']
        ext = os.path.splitext(old_path)[1]
        new_filename = f"{space_name}-{idx}{ext}"
        temp_path = os.path.join(temp_dir, new_filename)
        shutil.move(old_path, temp_path)
    
    # Then move back to main directory
    for filename in os.listdir(temp_dir):
        temp_path = os.path.join(temp_dir, filename)
        final_path = os.path.join(space_dir, filename)
        shutil.move(temp_path, final_path)
    
    os.rmdir(temp_dir)
    
    # Print summary
    total_size_mb = sum(item['size_mb'] for item in high_res_images)
    avg_size_mb = total_size_mb / len(high_res_images) if high_res_images else 0
    
    print(f"\n{space_name.upper()}:")
    print(f"  ✓ Kept {len(high_res_images)} high-res images")
    print(f"  ✗ Removed {removed_count} low-res images (<{MIN_SIZE_KB}KB)")
    print(f"  Total size: {total_size_mb:.2f} MB")
    print(f"  Average size: {avg_size_mb:.2f} MB per image")
    
    if len(high_res_images) > 0:
        print(f"  Largest: {max(high_res_images, key=lambda x: x['size'])['size_mb']:.2f} MB")
        print(f"  Smallest: {min(high_res_images, key=lambda x: x['size'])['size_mb']:.2f} MB")
    
    return len(high_res_images), removed_count

def main():
    print("=" * 70)
    print("Filtering Spaces Images - Keeping Only High-Resolution")
    print("=" * 70)
    print(f"Minimum size: {MIN_SIZE_KB}KB ({MIN_SIZE_KB/1024:.1f}MB)")
    print("=" * 70)
    
    total_kept = 0
    total_removed = 0
    
    for space_name in SPACE_FOLDERS:
        kept, removed = filter_space_images(space_name)
        total_kept += kept
        total_removed += removed
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total images kept: {total_kept}")
    print(f"Total images removed: {total_removed}")
    print(f"\n✓ All spaces filtered - only high-res images remain")
    print("=" * 70)

if __name__ == "__main__":
    main()
