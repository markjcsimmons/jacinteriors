import os
import shutil

DIR = "assets/images/projects/santa-monica-modern-spanish"

def reorder():
    if not os.path.exists(DIR):
        print(f"Directory not found: {DIR}")
        return

    # Map old index to new index (Prioritize Portraits)
    # Old (from ls output) -> New
    # 2 (Port) -> 1
    # 3 (Port) -> 2
    # 5 (Port) -> 3
    # 6 (Port) -> 4
    # 1 (Land) -> 5
    # 4 (Land) -> 6
    
    mapping = {
        2: 1,
        3: 2,
        5: 3,
        6: 4,
        1: 5,
        4: 6
    }
    
    print("Renaming images to prioritize portraits...")
    
    # Rename to temporary names first to avoid collisions
    for old, new in mapping.items():
        src = os.path.join(DIR, f"santa-monica-modern-spanish-{old}.jpg")
        dst = os.path.join(DIR, f"temp-{new}.jpg")
        if os.path.exists(src):
            shutil.move(src, dst)
        else:
            print(f"Warning: Source {src} not found")
        
    # Rename temp to final
    for i in range(1, 7):
        src = os.path.join(DIR, f"temp-{i}.jpg")
        dst = os.path.join(DIR, f"santa-monica-modern-spanish-{i}.jpg")
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"  Created santa-monica-modern-spanish-{i}.jpg")
            
            # Update helpers
            if i == 1:
                shutil.copy2(dst, os.path.join(DIR, "santa-monica-modern-spanish-primary.jpg"))
            elif i == 2:
                shutil.copy2(dst, os.path.join(DIR, "santa-monica-modern-spanish-hover.jpg"))
            elif i == 3:
                shutil.copy2(dst, os.path.join(DIR, "santa-monica-modern-spanish-secondary.jpg"))
        else:
            print(f"Warning: Temp file {src} not found")

    print("Done reordering.")

if __name__ == "__main__":
    reorder()

