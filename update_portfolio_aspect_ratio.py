import re

FILE = "portfolio.html"

def update():
    with open(FILE, 'r') as f:
        content = f.read()
    
    start_marker = 'href="projects/santa-monica-modern-spanish.html"'
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print("Santa Monica link not found")
        return
        
    class_marker = 'class="project-list-image"'
    image_div_idx = content.find(class_marker, start_idx)
    
    if image_div_idx == -1:
        print("Image div not found")
        return
        
    excerpt = content[image_div_idx:image_div_idx+100]
    if "aspect-ratio" in excerpt:
        print("Aspect ratio already set.")
        return
        
    # Insert style
    new_content = content[:image_div_idx] + 'class="project-list-image" style="aspect-ratio: 2/3 !important;"' + content[image_div_idx+len(class_marker):]
    
    with open(FILE, 'w') as f:
        f.write(new_content)
        
    print("Updated portfolio.html")

if __name__ == "__main__":
    update()


