import os
import re
from bs4 import BeautifulSoup

PORTFOLIO_FILE = "portfolio.html"
HOME_FILE = "index-variant-2.html"
PROJECTS_DIR = "projects"
IMAGES_DIR = "assets/images/projects"

def verify_logic():
    print("Verifying Site Logic...\n")
    
    # 1. Audit Portfolio Page
    print("--- Portfolio Page Audit ---")
    with open(PORTFOLIO_FILE, 'r') as f:
        soup = BeautifulSoup(f, 'html.parser')
        
    project_cards = soup.find_all('div', class_='project-list-item')
    print(f"Found {len(project_cards)} project cards.")
    
    for i, card in enumerate(project_cards):
        # Find link
        link = card.find('a', href=True)
        if not link:
            print(f"  Card {i+1}: No link found!")
            continue
            
        href = link['href']
        project_page = href.replace('projects/', '')
        
        # Verify Project Page exists
        if not os.path.exists(os.path.join(PROJECTS_DIR, project_page)):
            print(f"  Card {i+1}: BROKEN LINK -> {href} (File not found)")
        else:
            # Verify Images
            imgs = card.find_all('img')
            for img in imgs:
                src = img['src']
                # Check if src contains the project folder name (derived from filename)
                # e.g. projects/venice-beach-house.html -> assets/images/projects/venice-beach-house/
                expected_folder = project_page.replace('.html', '')
                if f"assets/images/projects/{expected_folder}" not in src:
                     print(f"  Card {i+1} ({project_page}): WRONG IMAGE -> {src}")
    
    print("\n--- Home Page Audit (Our Work Section) ---")
    with open(HOME_FILE, 'r') as f:
        soup = BeautifulSoup(f, 'html.parser')
        
    # Find the section "Our work speaks through spaces"
    # It usually has a specific structure. Let's look for the grid.
    # Based on previous edits, it might be a grid of 3 images or project-row.
    # Let's find links containing "projects/"
    
    project_links = soup.find_all('a', href=re.compile(r'projects/'))
    
    # Filter out footer/nav links if possible, or just check all of them.
    # We specifically want the "Featured Projects" section.
    # Let's assume any link to "projects/..." in the main content is a featured project.
    
    valid_links = 0
    for link in project_links:
        href = link['href']
        
        # Skip nav/footer links if we can identify them (usually in <nav> or <footer>)
        if link.find_parent('nav') or link.find_parent('footer'):
            continue
            
        # Also skip the "View All Projects" button linking to portfolio.html
        if 'portfolio.html' in href:
            continue
            
        valid_links += 1
        project_page = href.replace('projects/', '')
        
        # Verify Page Exists
        if not os.path.exists(os.path.join(PROJECTS_DIR, project_page)):
             print(f"  Home Link: BROKEN -> {href} (File not found)")
        else:
            # Verify Image
            # The image might be inside the link or a sibling/parent
            img = link.find('img')
            if not img:
                # Maybe background image? Or image is separate?
                # Let's check if there is an image inside.
                pass
            else:
                src = img['src']
                expected_folder = project_page.replace('.html', '')
                if f"assets/images/projects/{expected_folder}" not in src:
                    # Allow generic fallbacks if intentional, but flag it
                    print(f"  Home Link ({project_page}): IMAGE MISMATCH? -> {src}")
                else:
                    print(f"  Home Link ({project_page}): OK")

    if valid_links == 0:
        print("  No featured project links found in body content.")

if __name__ == "__main__":
    verify_logic()


