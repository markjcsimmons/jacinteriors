#!/usr/bin/env python3
import os
import re
from pathlib import Path

# CSS and JavaScript to add
MASONRY_CSS = """<style>
@media (max-width: 768px) {
  .first-row-image { order: 2 !important; }
  .first-row-text { order: 1 !important; }
  .first-row-grid { grid-template-columns: 1fr !important; }
}
@media (min-width: 769px) {
  .first-row-image { order: 1 !important; }
  .first-row-text { order: 2 !important; }
}
/* Smart grid layout that adapts to image aspect ratios */
.image-container {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}
.image-container img {
  width: 100%;
  height: auto;
  display: block;
}
/* Masonry grid container */
.image-gallery-grid {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}
.image-gallery-grid > div {
  position: absolute;
  width: calc(50% - 1rem);
  box-sizing: border-box;
  transition: transform 0.3s ease;
}
.image-gallery-grid .image-container {
  margin: 0;
}
.image-gallery-grid .image-container img {
  margin: 0;
  display: block;
  width: 100%;
  height: auto;
}
.first-row-grid {
  width: 100%;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .image-gallery-grid > div {
    width: 100%;
  }
}
@media (min-width: 1200px) {
  .image-gallery-grid > div {
    width: calc(33.333% - 1.33rem);
  }
}
</style>"""

MASONRY_JS = """<script>
// Masonry layout implementation
function initMasonry() {
  const grid = document.querySelector('.image-gallery-grid');
  if (!grid) return;
  
  const items = Array.from(grid.children);
  if (items.length === 0) return;
  
  const gap = 16; // 1rem = 16px
  let columns = 2;
  
  // Determine number of columns based on screen width
  if (window.innerWidth <= 768) {
    columns = 1;
  } else if (window.innerWidth >= 1200) {
    columns = 3;
  }
  
  // Calculate column width
  const containerWidth = grid.offsetWidth;
  const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
  
  // Initialize column heights
  const columnHeights = new Array(columns).fill(0);
  
  // Position each item
  items.forEach((item, index) => {
    // Find the shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Calculate position
    const left = shortestColumnIndex * (columnWidth + gap);
    const top = columnHeights[shortestColumnIndex];
    
    // Set position
    item.style.left = left + 'px';
    item.style.top = top + 'px';
    item.style.width = columnWidth + 'px';
    
    // Update column height
    const itemHeight = item.offsetHeight;
    columnHeights[shortestColumnIndex] += itemHeight + gap;
  });
  
  // Set container height
  grid.style.height = Math.max(...columnHeights) + 'px';
}

// Initialize on load and resize
window.addEventListener('load', () => {
  // Wait for images to load
  const images = document.querySelectorAll('.image-gallery-grid img');
  let loadedCount = 0;
  
  if (images.length === 0) {
    initMasonry();
    return;
  }
  
  images.forEach(img => {
    if (img.complete) {
      loadedCount++;
      if (loadedCount === images.length) {
        initMasonry();
      }
    } else {
      img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === images.length) {
          initMasonry();
        }
      });
    }
  });
});

window.addEventListener('resize', () => {
  initMasonry();
});
</script>"""

def extract_project_name_from_path(filepath):
    """Extract project name from file path"""
    filename = os.path.basename(filepath)
    return filename.replace('.html', '').replace('-', ' ').title()

def extract_project_slug(filepath):
    """Extract project slug from file path"""
    filename = os.path.basename(filepath)
    return filename.replace('.html', '')

def find_first_text_section(content):
    """Find the first text section (The Vision) from the old layout"""
    # Look for "The Vision" section
    pattern = r'<h3[^>]*>The Vision</h3>\s*<p[^>]*>(.*?)</p>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        text = match.group(1).strip()
        # Clean up HTML entities and tags
        text = re.sub(r'<[^>]+>', '', text)
        return text
    return None

def find_all_images(content, project_slug):
    """Find all image references in the content"""
    # Look for images in the project directory
    pattern = rf'../assets/images/projects/{project_slug}/([^"]+\.jpg)'
    images = re.findall(pattern, content)
    return images

def remove_year_field(content):
    """Remove the Year field from the header"""
    # Remove the Year div
    pattern = r'<div class="scroll-fade-in delay-3">\s*<div[^>]*>Year</div>\s*<div[^>]*>.*?</div>\s*</div>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def add_css_to_head(content):
    """Add masonry CSS to the head section"""
    # Check if CSS already exists
    if 'Masonry grid container' in content:
        return content
    
    # Find the closing </head> tag and insert CSS before it
    if '</meta></head>' in content:
        content = content.replace('</meta></head>', MASONRY_CSS + '\n</meta></head>')
    elif '</head>' in content:
        content = content.replace('</head>', MASONRY_CSS + '\n</head>')
    return content

def replace_content_section(content, project_slug, project_name):
    """Replace the old alternating layout with new masonry layout"""
    # Find the start of the content section
    section_start = content.find('<!-- Project Story - Alternating Image/Text Rows -->')
    if section_start == -1:
        section_start = content.find('<!-- Project Image Gallery -->')
    
    if section_start == -1:
        # Try to find section with padding
        section_start = content.find('<section style="padding: 4rem 0;">')
    
    if section_start == -1:
        print(f"  Warning: Could not find content section start for {project_slug}")
        return content
    
    # Find the end of the content section (before CTA)
    section_end = content.find('<!-- CTA Section -->', section_start)
    if section_end == -1:
        section_end = content.find('<section style="padding: 6rem 0; background: #fafafa', section_start)
    
    if section_end == -1:
        print(f"  Warning: Could not find content section end for {project_slug}")
        return content
    
    # Extract first image and text
    old_section = content[section_start:section_end]
    
    # Find first image
    first_img_match = re.search(rf'<img[^>]*src="../assets/images/projects/{project_slug}/([^"]+\.jpg)"', old_section)
    if not first_img_match:
        print(f"  Warning: Could not find first image for {project_slug}")
        return content
    
    first_image = first_img_match.group(1)
    
    # Find "The Vision" text
    vision_match = re.search(r'<h3[^>]*>The Vision</h3>\s*<p[^>]*>(.*?)</p>', old_section, re.DOTALL)
    vision_text = "Luxury interior design project"  # Default
    if vision_match:
        vision_text = re.sub(r'<[^>]+>', '', vision_match.group(1)).strip()
    
    # Find all other images
    all_images = re.findall(rf'<img[^>]*src="../assets/images/projects/{project_slug}/([^"]+\.jpg)"', old_section)
    # Remove first image from list
    other_images = [img for img in all_images if img != first_image]
    # Remove duplicates while preserving order
    seen = set()
    other_images = [img for img in other_images if not (img in seen or seen.add(img))]
    
    # Build new section
    new_section = f'''<!-- Project Image Gallery -->
<section style="padding: 4rem 0;">
<div class="container" style="max-width: 1400px;">
<!-- First Row: Image Left, Text Card Right (on mobile: text card first) -->
<div class="first-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; width: 100%;">
<div class="parallax-image scale-in-image hover-zoom-image first-row-image" style="width: 100%;">
<div class="image-container">
<img alt="{project_name}" src="../assets/images/projects/{project_slug}/{first_image}"/>
</div>
</div>
<div class="first-row-text" style="background: #fafafa; padding: 2.5rem; border-radius: 4px; display: flex; flex-direction: column; justify-content: center;">
<h3 class="slide-in-right" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: -0.5px; color: #1a1a1a;">The Vision</h3>
<p class="slide-in-right delay-1" style="font-size: 16px; line-height: 24px; color: #444; margin-bottom: 0;">{vision_text}</p>
</div>
</div>
<!-- Image Grid - Mostly images layout (smart grid that adapts to aspect ratios) -->
<div class="image-gallery-grid" style="margin-bottom: 2rem;">
'''
    
    # Add all other images
    for img in other_images:
        new_section += f'''<div class="parallax-image scale-in-image hover-zoom-image" style="width: 100%;">
<div class="image-container">
<img alt="{project_name}" src="../assets/images/projects/{project_slug}/{img}"/>
</div>
</div>
'''
    
    new_section += '''</div>
</div>
</section>
'''
    
    # Replace the old section
    content = content[:section_start] + new_section + content[section_end:]
    return content

def add_masonry_js(content):
    """Add masonry JavaScript before closing body tag"""
    if 'initMasonry' in content:
        return content  # Already has the script
    
    # Find the closing body tag
    body_end = content.rfind('</body>')
    if body_end == -1:
        print("  Warning: Could not find </body> tag")
        return content
    
    # Insert JavaScript before </body>
    content = content[:body_end] + MASONRY_JS + '\n</body>'
    return content

def update_project_file(filepath):
    """Update a single project file with the new design"""
    project_slug = extract_project_slug(filepath)
    project_name = extract_project_name_from_path(filepath)
    
    print(f"Processing {project_slug}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already updated (has masonry CSS)
    if 'Masonry grid container' in content and 'image-gallery-grid' in content:
        print(f"  Already updated, skipping...")
        return
    
    # 1. Remove Year field
    content = remove_year_field(content)
    
    # 2. Add CSS to head
    content = add_css_to_head(content)
    
    # 3. Replace content section
    content = replace_content_section(content, project_slug, project_name)
    
    # 4. Add JavaScript
    content = add_masonry_js(content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✓ Updated {project_slug}")

def main():
    projects_dir = Path(__file__).parent / 'projects'
    
    # Get all HTML files except beverly-hills-alpine (already done)
    project_files = [f for f in projects_dir.glob('*.html') 
                     if f.name != 'beverly-hills-alpine.html']
    
    print(f"Found {len(project_files)} project files to update\n")
    
    for filepath in sorted(project_files):
        try:
            update_project_file(filepath)
        except Exception as e:
            print(f"  ✗ Error updating {filepath.name}: {e}")
    
    print(f"\n✓ Completed updating {len(project_files)} project files")

if __name__ == '__main__':
    main()
