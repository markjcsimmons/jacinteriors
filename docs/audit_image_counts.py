import os
import hashlib
from pathlib import Path

PROJECTS_DIR = "assets/images/projects"

def get_file_hash(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def audit_counts():
    print(f"Auditing unique high-res images in {PROJECTS_DIR}...\n")
    
    if not os.path.exists(PROJECTS_DIR):
        print(f"Directory not found: {PROJECTS_DIR}")
        return

    projects = [d for d in os.listdir(PROJECTS_DIR) if os.path.isdir(os.path.join(PROJECTS_DIR, d))]
    projects.sort()
    
    incomplete_projects = []

    for project in projects:
        project_path = os.path.join(PROJECTS_DIR, project)
        
        valid_images = []
        hashes = set()
        
        # Check 1-6
        for i in range(1, 7):
            img_name = f"{project}-{i}.jpg"
            img_path = os.path.join(project_path, img_name)
            
            if not os.path.exists(img_path):
                continue
                
            size_kb = os.path.getsize(img_path) / 1024
            file_hash = get_file_hash(img_path)
            
            # Criteria: > 100KB and Unique Content
            if size_kb >= 100:
                if file_hash not in hashes:
                    hashes.add(file_hash)
                    valid_images.append(img_name)
        
        count = len(valid_images)
        if count < 6:
            incomplete_projects.append((project, count))
            print(f"Project: {project}")
            print(f"  Unique High-Res Count: {count}/6")
            print("-" * 20)

    print("\nSUMMARY (Projects with < 6 unique high-res images):")
    if not incomplete_projects:
        print("None! All projects have 6 unique high-res images.")
    else:
        for p, c in incomplete_projects:
            print(f" - {p}: {c} images")

if __name__ == "__main__":
    audit_counts()


