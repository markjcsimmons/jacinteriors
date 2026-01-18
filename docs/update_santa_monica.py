import os
import shutil
from pathlib import Path

SRC_DIR = "/Users/mark/Desktop/New-Project-Images/Santa Monica"
DST_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/projects/santa-monica-modern-spanish"

def update():
    if not os.path.exists(SRC_DIR):
        print(f"Source dir not found: {SRC_DIR}")
        return
        
    files = [f for f in os.listdir(SRC_DIR) if f.endswith(".jpg")]
    files.sort()
    
    print(f"Found {len(files)} images.")
    
    # Pick top 6 (or up to 6)
    selected = files[:6]
    
    for i, f in enumerate(selected):
        idx = i + 1
        src = os.path.join(SRC_DIR, f)
        dst = os.path.join(DST_DIR, f"santa-monica-modern-spanish-{idx}.jpg")
        print(f"Copying {f} -> {os.path.basename(dst)}")
        shutil.copy2(src, dst)
        
        if idx == 1:
            shutil.copy2(src, os.path.join(DST_DIR, "santa-monica-modern-spanish-primary.jpg"))
        elif idx == 2:
            shutil.copy2(src, os.path.join(DST_DIR, "santa-monica-modern-spanish-hover.jpg"))
        elif idx == 3:
            shutil.copy2(src, os.path.join(DST_DIR, "santa-monica-modern-spanish-secondary.jpg"))

if __name__ == "__main__":
    update()


