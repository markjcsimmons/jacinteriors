#!/usr/bin/env python3
"""
Fix kids-bedrooms images that were incorrectly placed in bedrooms folder.
Based on the download script output, we know which images are kids bedrooms.
"""

import os
import shutil

bedrooms_dir = "assets/images/spaces/bedrooms"
kids_dir = "assets/images/spaces/kids-bedrooms"

# From the download script output, kids-bedrooms folder had these original files
# which were renamed to bedrooms-1.jpg through bedrooms-12.jpeg
# But they overwrote or mixed with adult bedroom images

# The download output showed:
# "Processing bedrooms:" found 26 images in Bedrooms (adult)
# "Processing bedrooms:" found 12 images in Kid's Bedrooms (but placed in bedrooms folder)

# Since the script processes folders sequentially and renames sequentially,
# The kids bedrooms images are likely the LAST 12 images numbered
# OR the ones that match the kids bedrooms original filenames

# Original kids bedroom filenames from script output:
kids_original_names = [
    '0E9A9657-Edit.jpg',
    '0E9A9680-Edit.jpg', 
    '2500_Redondo_-9142.jpg',
    'Andrea Putman4845 72dpi.jpg',
    'Annie Meisel Photography -14.jpg',
    'Annie Meisel Photography -31.jpg',
    'Annie Meisel Photography -33.jpg',
    'Annie Meisel Photography -34.jpg',
    'Annie Meisel Photography -35.jpg',
    'Jacobs_Peter-Peary-way-1472-Edit.jpg',
    'Jacobs_Peter-Peary-way-1840-2-Edit.jpg',
    'unspecified (1).jpeg'
]

# Actually, we can't match original names since they were renamed.
# Best approach: Check if the temp extract still exists or re-run with better matching
# OR manually identify by image content

# Let's check total count - bedrooms should have ~26 (adult), kids should have 12
# Current: bedrooms has 27 files

print("Checking bedroom images...")
bedroom_files = sorted([f for f in os.listdir(bedrooms_dir) if f.startswith('bedrooms-')])
print(f"Total bedroom files: {len(bedroom_files)}")

# The safest approach: Check if there's overlap in numbering
# Adults were numbered 1-26, kids were also numbered 1-12
# Since kids was processed AFTER adults in "Processing bedrooms:" but was actually "Kid's Bedrooms",
# The script might have continued numbering: adults 1-26, then kids 27-38? Or overlapped?

# Actually looking at the output more carefully:
# "Processing bedrooms:" for "Bedrooms" folder → 26 images → bedrooms-1 to bedrooms-26
# "Processing bedrooms:" for "Kid's Bedrooms" folder → 12 images → but where did they go?

# The script matches by folder name. "Kid's Bedrooms" doesn't match "bedrooms" exactly,
# but the script might have matched it anyway or the folder name was "Bedrooms" with kids inside.

# Let's be pragmatic: If bedrooms has 27 and we expect 26, the extra might be one kids image
# OR if there are more, we need to check

# Best solution: Re-run download with explicit kids-bedrooms matching OR manually move
# For now, let's check file count vs expected

expected_adult = 26
expected_kids = 12
actual_total = len(bedroom_files)

print(f"\nExpected: {expected_adult} adult bedrooms")
print(f"Expected: {expected_kids} kids bedrooms") 
print(f"Actual total in bedrooms folder: {actual_total}")

if actual_total > expected_adult:
    excess = actual_total - expected_adult
    print(f"\n⚠ Found {excess} extra files in bedrooms folder")
    print("These might be kids bedrooms images.")
    
    # List the extra files
    if excess > 0:
        print("\nLast few bedroom files (might be kids):")
        for f in bedroom_files[-excess:]:
            print(f"  {f}")
        
        # Ask user to verify, or auto-move if we're confident
        # For now, let's move the excess
        print(f"\nMoving last {excess} files to kids-bedrooms...")
        
        os.makedirs(kids_dir, exist_ok=True)
        for i, old_file in enumerate(bedroom_files[-excess:], 1):
            old_path = os.path.join(bedrooms_dir, old_file)
            new_file = f"kids-bedrooms-{i}.jpg"
            if old_file.endswith('.jpeg'):
                new_file = f"kids-bedrooms-{i}.jpeg"
            elif old_file.endswith('.png'):
                new_file = f"kids-bedrooms-{i}.png"
            elif old_file.endswith('.JPG'):
                new_file = f"kids-bedrooms-{i}.JPG"
                
            new_path = os.path.join(kids_dir, new_file)
            shutil.move(old_path, new_path)
            print(f"  Moved: {old_file} → {new_file}")

else:
    print("\n⚠ Bedrooms folder has fewer files than expected")
    print("Kids bedrooms images might have been processed separately or not at all")
    print("Check the download script output for 'Kid's Bedrooms' processing")

print("\nDone!")
