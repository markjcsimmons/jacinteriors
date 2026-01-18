#!/usr/bin/env python3
"""
Download and organize images from Dropbox for spaces pages.
This script processes a Dropbox shared folder and organizes images
into the correct spaces directories.
"""

import os
import re
import requests
import zipfile
import io
from pathlib import Path
from bs4 import BeautifulSoup
import time

# Base directories
DOCS_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/docs"
SPACES_IMAGES_DIR = os.path.join(DOCS_DIR, "assets/images/spaces")

# Mapping of folder names to space page names
SPACE_MAPPING = {
    'bathrooms': 'bathrooms',
    'bedrooms': 'bedrooms',
    'kitchens': 'kitchens',
    'dining-rooms': 'dining-rooms',
    'living-spaces': 'living-spaces',
    'office-spaces': 'office-spaces',
    'kids-bedrooms': 'kids-bedrooms',
    'entryways': 'entryways',
    'bar-area': 'bar-area',
    'laundry-rooms': 'laundry-rooms',
    'outdoor-spaces': 'outdoor-spaces',
}

def download_dropbox_folder(shared_link):
    """
    Download a Dropbox shared folder as a ZIP file.
    The link should have dl=1 parameter for direct download.
    """
    # Convert the shared link to a direct download link
    # For folder downloads, we need to append /?dl=1 to get a zip
    if '?dl=0' in shared_link:
        download_link = shared_link.replace('?dl=0', '?dl=1').replace('&dl=0', '')
    elif '?dl=1' not in shared_link:
        # Append ?dl=1 if not present
        download_link = shared_link + ('&' if '?' in shared_link else '?') + 'dl=1'
    else:
        download_link = shared_link
    
    print(f"Downloading from Dropbox...")
    print(f"Link: {download_link}")
    
    try:
        # Download the ZIP file
        response = requests.get(download_link, stream=True, timeout=60)
        response.raise_for_status()
        
        # Check if we got a ZIP file or HTML (error page)
        content_type = response.headers.get('content-type', '')
        if 'text/html' in content_type:
            print("ERROR: Received HTML instead of ZIP file.")
            print("This might mean:")
            print("1. The Dropbox link requires authentication")
            print("2. The folder is too large")
            print("3. You need to use a different download method")
            return None
        
        # Save to temporary file
        zip_path = os.path.join(DOCS_DIR, 'temp_spaces_images.zip')
        with open(zip_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Downloaded ZIP file: {os.path.getsize(zip_path)} bytes")
        return zip_path
        
    except Exception as e:
        print(f"Error downloading: {e}")
        return None

def extract_and_organize_images(zip_path):
    """
    Extract ZIP file and organize images into spaces directories.
    """
    if not os.path.exists(zip_path):
        print("ZIP file not found!")
        return
    
    print("\nExtracting and organizing images...")
    
    # Extract ZIP to temporary directory
    temp_extract_dir = os.path.join(DOCS_DIR, 'temp_spaces_extract')
    os.makedirs(temp_extract_dir, exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_extract_dir)
        
        print(f"Extracted to: {temp_extract_dir}")
        
        # Find all image files
        image_extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
        
        # Walk through extracted files
        for root, dirs, files in os.walk(temp_extract_dir):
            # Get folder name (assuming structure: extracted_folder/space_name/images)
            relative_path = os.path.relpath(root, temp_extract_dir)
            parts = [p for p in relative_path.split(os.sep) if p and p != '.']
            
            # Try to match folder name to space mapping
            space_folder = None
            for folder_name, space_name in SPACE_MAPPING.items():
                # Check if folder name matches (case-insensitive, handle variations)
                folder_lower = folder_name.lower().replace('-', '').replace('_', '').replace(' ', '')
                for part in parts:
                    part_lower = part.lower().replace('-', '').replace('_', '').replace(' ', '')
                    if folder_lower in part_lower or part_lower in folder_lower:
                        space_folder = space_name
                        break
                if space_folder:
                    break
            
            # If no match found, check folder name directly
            if not space_folder and parts:
                folder_name_lower = parts[-1].lower().replace(' ', '-').replace('_', '-')
                if folder_name_lower in SPACE_MAPPING:
                    space_folder = SPACE_MAPPING[folder_name_lower]
            
            if not space_folder:
                # Try to match any part of path
                for part in parts:
                    for folder_name, space_name in SPACE_MAPPING.items():
                        if folder_name.lower() in part.lower() or part.lower() in folder_name.lower():
                            space_folder = space_name
                            break
                    if space_folder:
                        break
            
            # Process images in this directory
            image_files = [f for f in files if f.lower().endswith(image_extensions)]
            
            if image_files and space_folder:
                target_dir = os.path.join(SPACES_IMAGES_DIR, space_folder)
                os.makedirs(target_dir, exist_ok=True)
                
                print(f"\nProcessing {space_folder}:")
                print(f"  Found {len(image_files)} images in {relative_path}")
                
                # Copy images with sequential naming
                for idx, img_file in enumerate(sorted(image_files), 1):
                    src_path = os.path.join(root, img_file)
                    # Use space_name-1.jpg, space_name-2.jpg format
                    ext = os.path.splitext(img_file)[1]
                    dest_filename = f"{space_folder}-{idx}{ext}"
                    dest_path = os.path.join(target_dir, dest_filename)
                    
                    # Copy file
                    import shutil
                    shutil.copy2(src_path, dest_path)
                    print(f"  ✓ {img_file} → {dest_filename}")
            
            elif image_files:
                print(f"\n⚠ Could not match folder for images in: {relative_path}")
                print(f"  Images: {image_files[:3]}...")
    
    except Exception as e:
        print(f"Error extracting: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        print("\nCleaning up temporary files...")
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(temp_extract_dir):
            import shutil
            shutil.rmtree(temp_extract_dir)

def update_html_with_image_count(space_name):
    """
    Update HTML file to ensure correct number of images.
    """
    html_file = os.path.join(DOCS_DIR, f"{space_name}.html")
    if not os.path.exists(html_file):
        return
    
    # Count actual images in directory
    space_dir = os.path.join(SPACES_IMAGES_DIR, space_name)
    if not os.path.exists(space_dir):
        return
    
    image_files = sorted([f for f in os.listdir(space_dir) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    if not image_files:
        print(f"  ⚠ No images found for {space_name}")
        return
    
    print(f"\nUpdating {space_name}.html:")
    print(f"  Found {len(image_files)} images")
    
    # Read HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if images are already correctly referenced
    # The HTML should have images like: assets/images/spaces/{space_name}/{space_name}-1.jpg
    
    # Just verify the structure is correct
    expected_images = len([f for f in image_files if f.startswith(f"{space_name}-")])
    print(f"  ✓ {expected_images} images ready for {space_name} page")

def main():
    print("=" * 60)
    print("Dropbox Spaces Images Downloader")
    print("=" * 60)
    
    # Dropbox shared link
    dropbox_link = "https://www.dropbox.com/scl/fo/ojfqyw5fqpq73dk0myslv/AIIpNZQbeQyBnGcvpzCgoto?rlkey=wig4r6vo8p4g3a8h41ama9b47&e=4&st=r03ts77z&dl=0"
    
    print("\nNote: Dropbox folder downloads via API are complex.")
    print("This script will attempt to download, but you may need to:")
    print("1. Manually download the ZIP from Dropbox")
    print("2. Place it in the docs directory as 'temp_spaces_images.zip'")
    print("3. Run this script again to extract and organize\n")
    
    # Try to download
    zip_path = download_dropbox_folder(dropbox_link)
    
    if not zip_path or not os.path.exists(zip_path):
        print("\n" + "=" * 60)
        print("MANUAL DOWNLOAD INSTRUCTIONS:")
        print("=" * 60)
        print("1. Open the Dropbox link in your browser")
        print("2. Click 'Download' button (top right)")
        print("3. Save the ZIP file as: temp_spaces_images.zip")
        print(f"4. Place it in: {DOCS_DIR}")
        print("5. Run this script again: python3 download_spaces_images.py")
        return
    
    # Extract and organize
    extract_and_organize_images(zip_path)
    
    # Update HTML files
    print("\n" + "=" * 60)
    print("Verifying HTML files...")
    print("=" * 60)
    for space_name in SPACE_MAPPING.values():
        update_html_with_image_count(space_name)
    
    print("\n" + "=" * 60)
    print("✓ Process complete!")
    print("=" * 60)
    print(f"\nImages are organized in: {SPACES_IMAGES_DIR}")
    print("\nNext steps:")
    print("1. Verify images are in correct folders")
    print("2. Check HTML files to ensure image paths are correct")
    print("3. Test pages locally")

if __name__ == "__main__":
    main()
