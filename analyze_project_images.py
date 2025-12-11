import os
import re
from bs4 import BeautifulSoup

BACKUP_PAGES_DIR = "/Users/mark/Desktop/jacinteriors-backup/jacinteriors.com/pages"

PROJECTS = {
    "Madison Club": "madison-club.html",
    "Madison Club II": "madison-club-ii.html",
    "Beverly Hills (Alpine)": "beverly-hills-alpine.html",
    "Beverly Hills II": "beverly-hills-project.html"
}

def analyze_images():
    print("Analyzing image usage in backup files...\n")
    
    for project_name, filename in PROJECTS.items():
        file_path = os.path.join(BACKUP_PAGES_DIR, filename)
        if not os.path.exists(file_path):
            print(f"MISSING FILE: {filename}")
            continue
            
        print(f"--- {project_name} ({filename}) ---")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
                
            # Find all images
            images = []
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if not src: continue
                
                # Filter out obvious non-project images (logos, icons)
                if any(x in src.lower() for x in ['logo', 'favicon', 'icon', 'badge', 'share']):
                    continue
                
                # Extract filename
                basename = os.path.basename(src.split('?')[0])
                images.append(basename)
            
            # Remove duplicates and sort
            unique_images = sorted(list(set(images)))
            
            for img in unique_images:
                print(f"  {img}")
                
            if not unique_images:
                print("  (No project images found)")
                
        except Exception as e:
            print(f"  Error reading file: {e}")
        print("\n")

if __name__ == "__main__":
    analyze_images()

