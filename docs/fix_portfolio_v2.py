import re

FILE = "portfolio.html"

def fix():
    with open(FILE, 'r') as f:
        content = f.read()
    
    print("Fixing Portfolio Page...")

    # 1. Fix First Item Wrapper (Beverly Hills Alpine)
    # Current state:
    # <!-- Beverly Hills Alpine -->
    # <div style="display: flex; width: 100%;">
    # ...
    # </div>
    # </div> (Closing the container? No, wait)
    
    # We want:
    # <!-- Beverly Hills Alpine -->
    # <div class="project-list-item">
    # <div style="display: flex; width: 100%;">
    # ...
    # </div>
    # </div>
    
    start_marker = "<!-- Beverly Hills Alpine -->"
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Find the div immediately following
        div_start = content.find("<div style=", start_idx)
        if div_start != -1:
            # Check if already wrapped (look backwards for project-list-item)
            pre_context = content[div_start-40:div_start]
            if "project-list-item" not in pre_context:
                print("  Wrapping first item in .project-list-item...")
                # Insert opening tag
                content = content[:div_start] + '<div class="project-list-item">\n                ' + content[div_start:]
                
                # Find closing. The item ends before the next comment.
                # Next comment is likely for the next project.
                # Note: The next comment in the file is WRONG (says Venice Beach House but is Beverly Hills II).
                # But we can search for "<!--"
                next_comment = content.find("<!--", div_start + 100)
                if next_comment != -1:
                    # Insert closing tag before the next comment
                    # But we need to be careful about whitespace/indentation
                    # Find the last </div> before the next comment
                    last_div = content.rfind("</div>", div_start, next_comment)
                    if last_div != -1:
                        # Insert after that div
                        content = content[:last_div+6] + '\n            </div>' + content[last_div+6:]
    
    # 2. Fix Santa Monica Aspect Ratio (and remove from Venice Boho)
    print("  Updating aspect ratios...")
    
    # Remove from Venice Boho
    # Find the Venice Boho link
    vb_link = 'href="projects/venice-boho-house.html"'
    vb_idx = content.find(vb_link)
    if vb_idx != -1:
        # Find the preceding project-list-image
        img_start = content.rfind('class="project-list-image"', 0, vb_idx)
        if img_start != -1:
            # Check if it has the style
            chunk = content[img_start:img_start+100]
            if 'style="aspect-ratio: 2/3 !important;"' in chunk:
                print("  Removing aspect ratio from Venice Boho")
                content = content[:img_start] + chunk.replace(' style="aspect-ratio: 2/3 !important;"', '') + content[img_start+100:]

    # Add to Santa Monica
    # Find Santa Monica link
    sm_link = 'href="projects/santa-monica-modern-spanish.html"'
    sm_idx = content.find(sm_link)
    if sm_idx != -1:
        # Find preceding image div
        img_start = content.rfind('class="project-list-image"', 0, sm_idx)
        if img_start != -1:
            # Add style if not present
            chunk = content[img_start:img_start+50]
            if 'aspect-ratio' not in chunk:
                print("  Adding aspect ratio to Santa Monica")
                content = content[:img_start] + 'class="project-list-image" style="aspect-ratio: 2/3 !important;"' + content[img_start+26:]

    # 3. Fix Wrong Comment for Beverly Hills II
    content = content.replace("<!-- Venice Beach House -->", "<!-- Beverly Hills II -->", 1) # Only replace the first one found (which is the wrong one)
    # Wait, there might be a real Venice Beach House later.
    # The WRONG one is the one before Beverly Hills II link.
    # The REAL one is before Venice Beach House link.
    # Let's use context.
    # Find link to beverly-hills-ii
    bh2_link = 'href="projects/beverly-hills-ii.html"'
    bh2_idx = content.find(bh2_link)
    if bh2_idx != -1:
        # Find comment before it
        comment_end = content.rfind("-->", 0, bh2_idx)
        comment_start = content.rfind("<!--", 0, comment_end)
        if comment_start != -1:
            comment = content[comment_start:comment_end+3]
            if "Venice Beach House" in comment:
                print("  Fixing wrong comment for Beverly Hills II")
                content = content[:comment_start] + "<!-- Beverly Hills II -->" + content[comment_end+3:]

    with open(FILE, 'w') as f:
        f.write(content)
        
    print("Done.")

if __name__ == "__main__":
    fix()

