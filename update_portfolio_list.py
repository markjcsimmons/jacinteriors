import re

PORTFOLIO_FILE = "portfolio.html"

def update_portfolio():
    with open(PORTFOLIO_FILE, 'r') as f:
        content = f.read()
        
    # 1. Remove Malibu Beach House block
    # Regex to match the whole project-list-item for malibu
    # It starts with <div class="project-list-item"> and contains malibu-beach-house
    # This regex is tricky. 
    # Let's verify if we can identify it by ID or Link.
    # The links look like: href="projects/malibu-beach-house.html"
    
    # We will split the content by "project-list-item" and filter.
    
    parts = content.split('<div class="project-list-item">')
    header = parts[0]
    items = parts[1:]
    
    new_items = []
    
    for item in items:
        # Check if malibu
        if "projects/malibu-beach-house.html" in item:
            print("Removing Malibu Beach House item")
            continue
            
        new_items.append(item)
        
        # Check if Madison Club (I) -> Add II after
        if "projects/madison-club.html" in item:
            print("Adding Madison Club II after Madison Club")
            # Create Madison II item based on Madison I item
            # Replace identifiers
            new_item = item.replace("projects/madison-club.html", "projects/madison-club-ii.html")
            new_item = new_item.replace("assets/images/projects/madison-club", "assets/images/projects/madison-club-ii")
            new_item = new_item.replace("madison-club-primary", "madison-club-ii-primary")
            new_item = new_item.replace("madison-club-hover", "madison-club-ii-hover")
            new_item = new_item.replace("madison-club-secondary", "madison-club-ii-secondary")
            new_item = new_item.replace("Madison Club", "Madison Club II")
            # Clean up alt tags if they got messy
            new_item = new_item.replace('alt="Madison Club II"', 'alt="Madison Club II"') 
            new_items.append(new_item)
            
        # Check if Beverly Hills (Alpine) -> Add II after
        if "projects/beverly-hills-alpine.html" in item:
            print("Adding Beverly Hills II after Beverly Hills")
            # Ensure Alpine title is just "Beverly Hills"
            # (It might be already, checking...)
            # Actually, let's inject the new item
            new_item = item.replace("projects/beverly-hills-alpine.html", "projects/beverly-hills-ii.html")
            new_item = new_item.replace("assets/images/projects/beverly-hills-alpine", "assets/images/projects/beverly-hills-ii")
            new_item = new_item.replace("beverly-hills-alpine-primary", "beverly-hills-ii-primary")
            new_item = new_item.replace("beverly-hills-alpine-hover", "beverly-hills-ii-hover")
            new_item = new_item.replace("beverly-hills-alpine-secondary", "beverly-hills-ii-secondary")
            # Replace Title
            # The regex replace for title is harder without knowing exact string. 
            # But the alt tags etc will update.
            # We assume the H2 title is "Beverly Hills Alpine" or similar.
            new_item = re.sub(r'<h2 class="project-title">.*?</h2>', '<h2 class="project-title">Beverly Hills II</h2>', new_item)
            new_items.append(new_item)

    # Reassemble
    new_content = header + '<div class="project-list-item">'.join(new_items)
    
    with open(PORTFOLIO_FILE, 'w') as f:
        f.write(new_content)

    print("Portfolio updated.")

if __name__ == "__main__":
    update_portfolio()


