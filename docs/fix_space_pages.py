#!/usr/bin/env python3
"""
Fix space pages to have proper head structure matching portfolio.html
"""

import os
import re

SPACE_PAGES = [
    'bathrooms.html',
    'bedrooms.html', 
    'kitchens.html',
    'dining-rooms.html',
    'living-spaces.html',
    'office-spaces.html',
    'kids-bedrooms.html',
    'entryways.html',
    'bar-area.html',
    'laundry-rooms.html',
    'outdoor-spaces.html'
]

# The correct head section (matching portfolio.html style)
def get_head_template(title):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        @media (max-width: 768px) {{
            .first-row-image {{ order: 2 !important; }}
            .first-row-text {{ order: 1 !important; }}
            .first-row-grid {{ grid-template-columns: 1fr !important; }}
        }}
        @media (min-width: 769px) {{
            .first-row-image {{ order: 1 !important; }}
            .first-row-text {{ order: 2 !important; }}
        }}
        .image-container {{
            width: 100%;
            border-radius: 4px;
            overflow: hidden;
        }}
        .image-container img {{
            width: 100%;
            height: auto;
            display: block;
        }}
        .image-gallery-grid {{
            position: relative;
            width: 100%;
            box-sizing: border-box;
        }}
        .image-gallery-grid > div {{
            position: absolute;
            width: calc(50% - 1rem);
            box-sizing: border-box;
            transition: transform 0.3s ease;
        }}
        .image-gallery-grid .image-container {{
            margin: 0;
        }}
        .image-gallery-grid .image-container img {{
            margin: 0;
            display: block;
            width: 100%;
            height: auto;
        }}
        .first-row-grid {{
            width: 100%;
            box-sizing: border-box;
        }}
        @media (max-width: 768px) {{
            .image-gallery-grid > div {{
                width: 100%;
            }}
        }}
        @media (min-width: 1200px) {{
            .image-gallery-grid > div {{
                width: calc(33.333% - 1.33rem);
            }}
        }}
    </style>
</head>'''

def fix_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'<title>([^<]+)</title>', content)
    if not title_match:
        return False, "No title found"
    title = title_match.group(1)
    
    # Find where body starts
    body_match = re.search(r'<body>', content)
    if not body_match:
        return False, "No body tag found"
    
    # Get everything from <body> onwards
    body_content = content[body_match.start():]
    
    # Create new content with proper head
    new_head = get_head_template(title)
    new_content = new_head + '\n' + body_content
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, "Fixed"

def main():
    docs_dir = '/Users/mark/Desktop/JAC web design/jac-website-custom/docs'
    
    for filename in SPACE_PAGES:
        filepath = os.path.join(docs_dir, filename)
        if os.path.exists(filepath):
            success, msg = fix_page(filepath)
            print(f"{'✓' if success else '✗'} {filename}: {msg}")
        else:
            print(f"- {filename}: Not found")
    
    print("\nDone!")

if __name__ == '__main__':
    main()
