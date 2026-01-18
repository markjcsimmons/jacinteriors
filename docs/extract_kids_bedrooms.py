#!/usr/bin/env python3
"""
Extract the 5 high-res kids bedroom images from the bedrooms folder.
Based on the download script output, the "Kid's Bedrooms" folder had 12 images
that were incorrectly processed as bedrooms-1 through bedrooms-12.
The user wants the 5 high-res ones extracted to kids-bedrooms folder.
"""

import os
import shutil

bedrooms_dir = "assets/images/spaces/bedrooms"
kids_dir = "assets/images/spaces/kids-bedrooms"

# From the download output, these were the original filenames in "Kid's Bedrooms" folder:
# They were renamed to bedrooms-1.jpg through bedrooms-12.jpeg
kids_original_files = [
    '0E9A9657-Edit.jpg',  # → bedrooms-1.jpg
    '0E9A9680-Edit.jpg',  # → bedrooms-2.jpg
    '2500_Redondo_-9142.jpg',  # → bedrooms-3.jpg
    'Andrea Putman4845 72dpi.jpg',  # → bedrooms-4.jpg
    'Annie Meisel Photography -14.jpg',  # → bedrooms-5.jpg
    'Annie Meisel Photography -31.jpg',  # → bedrooms-6.jpg
    'Annie Meisel Photography -33.jpg',  # → bedrooms-7.jpg
    'Annie Meisel Photography -34.jpg',  # → bedrooms-8.jpg
    'Annie Meisel Photography -35.jpg',  # → bedrooms-9.jpg
    'Jacobs_Peter-Peary-way-1472-Edit.jpg',  # → bedrooms-10.jpg
    'Jacobs_Peter-Peary-way-1840-2-Edit.jpg',  # → bedrooms-11.jpg
    'unspecified (1).jpeg',  # → bedrooms-12.jpeg
]

# Check file sizes to identify the 5 high-res images
# High-res images are typically larger (>1MB), regular images are smaller

print("Checking file sizes to identify high-res kids bedroom images...\n")

bedroom_files = sorted([f for f in os.listdir(bedrooms_dir) if f.startswith('bedrooms-') and f.endswith(('.jpg', '.jpeg', '.JPG', '.JPEG'))])

# Get file sizes for bedrooms-1 through bedrooms-12 (the kids bedrooms images)
kids_candidates = []
for i in range(1, 13):
    for ext in ['.jpg', '.jpeg', '.JPG', '.JPEG']:
        filename = f'bedrooms-{i}{ext}'
        filepath = os.path.join(bedrooms_dir, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            size_mb = size / (1024 * 1024)
            kids_candidates.append({
                'old_name': filename,
                'path': filepath,
                'size': size,
                'size_mb': size_mb,
                'original': kids_original_files[i-1] if i <= len(kids_original_files) else 'unknown'
            })
            break

# Sort by size (largest first) to find the 5 high-res images
kids_candidates.sort(key=lambda x: x['size'], reverse=True)

print("All kids bedroom candidates (bedrooms-1 through bedrooms-12):")
print("-" * 70)
for i, item in enumerate(kids_candidates, 1):
    print(f"{i:2d}. {item['old_name']:20s} - {item['size_mb']:6.2f} MB - {item['original'][:50]}")

# The 5 largest should be the high-res images
high_res_kids = kids_candidates[:5]

print(f"\n✓ Identified 5 high-res images (largest files):")
print("-" * 70)
for i, item in enumerate(high_res_kids, 1):
    print(f"{i}. {item['old_name']} ({item['size_mb']:.2f} MB)")

# Create kids-bedrooms directory if it doesn't exist
os.makedirs(kids_dir, exist_ok=True)

# Move the 5 high-res images to kids-bedrooms folder
print(f"\nMoving 5 high-res images to {kids_dir}...")
print("-" * 70)

for i, item in enumerate(high_res_kids, 1):
    old_path = item['path']
    # Rename to kids-bedrooms-1.jpg, kids-bedrooms-2.jpg, etc.
    ext = os.path.splitext(item['old_name'])[1]
    new_filename = f"kids-bedrooms-{i}{ext}"
    new_path = os.path.join(kids_dir, new_filename)
    
    shutil.move(old_path, new_path)
    print(f"✓ Moved: {item['old_name']} → {new_filename} ({item['size_mb']:.2f} MB)")

print(f"\n✓ Done! {len(high_res_kids)} images moved to kids-bedrooms folder")
