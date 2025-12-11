import os
import shutil
from pathlib import Path

SRC_DIR = "/Users/mark/Desktop/New-Project-Images/Beverly_Hills_2"
DST_DIR = "/Users/mark/Desktop/JAC web design/jac-website-custom/assets/images/projects/beverly-hills-ii"

def update():
    if not os.path.exists(SRC_DIR):
        print(f"Source dir not found: {SRC_DIR}")
        return
        
    # Ensure dest dir exists
    Path(DST_DIR).mkdir(parents=True, exist_ok=True)
        
    files = [f for f in os.listdir(SRC_DIR) if f.endswith(".jpg")]
    files.sort()
    
    print(f"Found {len(files)} images.")
    
    # Pick top 6
    selected = files[:6]
    
    for i, f in enumerate(selected):
        idx = i + 1
        src = os.path.join(SRC_DIR, f)
        dst = os.path.join(DST_DIR, f"beverly-hills-ii-{idx}.jpg")
        print(f"Copying {f} -> {os.path.basename(dst)}")
        shutil.copy2(src, dst)
        
        if idx == 1:
            shutil.copy2(src, os.path.join(DST_DIR, "beverly-hills-ii-primary.jpg"))
        elif idx == 2:
            shutil.copy2(src, os.path.join(DST_DIR, "beverly-hills-ii-hover.jpg"))
        elif idx == 3:
            shutil.copy2(src, os.path.join(DST_DIR, "beverly-hills-ii-secondary.jpg"))

if __name__ == "__main__":
    update()


