import os
import shutil
import re
from pathlib import Path

BACKUP_DIR = "/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/cdn/shop/files"
BASE_TARGET_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/projects"

# Definition of image patterns for each project
PROJECT_PATTERNS = {
    "toscana-country-club": [r"Annie_Meisel_Photography-\d+"], # No underscore
    "beverly-hills-alpine": [r"Annie_Meisel_Photography_-\d+"], # With underscore
    "madison-club": [r"mad-cover", r"jac-projects-madison-club-1", r"3-hall", r"7-livingroom"],
    "madison-club-ii": [r"mad2-header", r"jac-projects-madison-club-II", r"Jacobs_Peary_Way"],
    "beverly-hills-ii": [r"bedhills2-cover", r"Sherbourne", r"Beverly-Hills-02190926"]
}

def update_project_images(project_name, patterns):
    print(f"Updating {project_name}...")
    target_dir = os.path.join(BASE_TARGET_DIR, project_name)
    Path(target_dir).mkdir(parents=True, exist_ok=True)
    
    candidates = {}
    
    try:
        files = os.listdir(BACKUP_DIR)
    except FileNotFoundError:
        print("Backup dir not found")
        return

    for f in files:
        if not f.endswith(".jpg"): continue
        
        for p in patterns:
            if re.search(p, f, re.IGNORECASE):
                # We found a match. Use file size to pick best.
                # Use full filename as key to allow multiple distinct images
                # But we want to group "duplicates" (same image, diff resolution)
                # Strategy: Group by the "base name" without resolution
                # e.g. "image-name_2000x.jpg" -> "image-name"
                
                base_name = re.sub(r'_\d+x.*\.jpg$', '', f)
                base_name = re.sub(r'_\d+x\d*\.jpg$', '', base_name)
                
                full_path = os.path.join(BACKUP_DIR, f)
                size = os.path.getsize(full_path)
                
                if size > 100 * 1024: # > 100KB
                    if base_name not in candidates:
                        candidates[base_name] = []
                    candidates[base_name].append((size, full_path))
                break
    
    unique_images = []
    for base_name in candidates:
        # Sort by size descending
        candidates[base_name].sort(key=lambda x: x[0], reverse=True)
        unique_images.append(candidates[base_name][0][1])
    
    # Sort by filename
    unique_images.sort()
    print(f"  Found {len(unique_images)} unique high-res images.")
    
    # Copy up to 6 images
    count = min(len(unique_images), 6)
    if count == 0:
        print("  NO IMAGES FOUND!")
        return

    for i in range(count):
        src_path = unique_images[i]
        idx = i + 1
        dst_name = f"{project_name}-{idx}.jpg"
        dst_path = os.path.join(target_dir, dst_name)
        print(f"  Copying {os.path.basename(src_path)} -> {dst_name}")
        shutil.copy2(src_path, dst_path)
        
        # Update primary/hover/secondary
        if idx == 1:
            shutil.copy2(src_path, os.path.join(target_dir, f"{project_name}-primary.jpg"))
        elif idx == 2:
            shutil.copy2(src_path, os.path.join(target_dir, f"{project_name}-hover.jpg"))
        elif idx == 3:
            shutil.copy2(src_path, os.path.join(target_dir, f"{project_name}-secondary.jpg"))

if __name__ == "__main__":
    for proj, patterns in PROJECT_PATTERNS.items():
        update_project_images(proj, patterns)


