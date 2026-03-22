"""
Wrap inline blog post images in anchor tags linking to their project/space page,
and simplify captions to just the project/space name.
"""
import re
from pathlib import Path

BLOG_DIR = Path(__file__).resolve().parent.parent / "docs" / "blog"

# Maps R2 image path fragment → (destination URL relative to blog/, caption text)
IMAGE_MAP = {
    # Projects
    "projects/22nd-street/":        ("../projects/22nd-street.html",       "22nd Street"),
    "projects/alpine/":             ("../projects/alpine.html",             "Alpine"),
    "projects/columbus-way/":       ("../projects/columbus-way.html",       "Columbus Way"),
    "projects/fox-hills/":          ("../projects/fox-hills.html",          "Fox Hills"),
    "projects/frances/":            ("../projects/frances.html",            "Frances"),
    "projects/galewood/":           ("../projects/galewood.html",           "Galewood"),
    "projects/monaco/":             ("../projects/monaco.html",             "Monaco"),
    "projects/mulholland-drive/":   ("../projects/mulholland-drive.html",   "Mulholland Drive"),
    "projects/oakwood/":            ("../projects/oakwood.html",            "Oakwood"),
    "projects/peary-way/":          ("../projects/peary-way.html",          "Peary Way"),
    "projects/ronda/":              ("../projects/ronda.html",              "Ronda"),
    "projects/sherbourne/":         ("../projects/sherbourne.html",         "Sherbourne"),
    "projects/sunnyside/":          ("../projects/sunnyside.html",          "Sunnyside"),
    "projects/valley-vista/":       ("../projects/valley-vista.html",       "Valley Vista"),
    "projects/venice-beach-house/": ("../projects/venice-beach-house.html", "Venice Beach House"),
    "projects/via-pisa/":           ("../projects/via-pisa.html",           "Via Pisa"),
    # Spaces
    "spaces/bathrooms/":            ("../bathrooms.html",                   "Bathrooms"),
    "spaces/dining-rooms/":         ("../dining-rooms.html",               "Dining Rooms"),
    "spaces/kitchens/":             ("../kitchens-gallery.html",            "Kitchens"),
    "spaces/living-spaces/":        ("../living-spaces.html",               "Living Spaces"),
    "spaces/outdoor-spaces/":       ("../outdoor-spaces.html",              "Outdoor Spaces"),
}

def get_link_for_src(src: str):
    for fragment, (url, caption) in IMAGE_MAP.items():
        if fragment in src:
            return url, caption
    return None, None

def process_file(path: Path):
    html = path.read_text(encoding="utf-8")
    original = html

    # We only want to touch images INSIDE <article class="post-content">
    # Strategy: find the article block, process it, replace back.
    article_match = re.search(
        r'(<article class="post-content"[^>]*>)(.*?)(</article>)',
        html, re.DOTALL
    )
    if not article_match:
        print(f"  SKIP (no post-content article): {path.name}")
        return

    before_article = html[:article_match.start()]
    article_open   = article_match.group(1)
    article_body   = article_match.group(2)
    article_close  = article_match.group(3)
    after_article  = html[article_match.end():]

    # Pattern: <img ... src="..." ... />
    # Followed by optional whitespace then <p class="post-image-caption">...</p>
    img_pattern = re.compile(
        r'(<img\s[^>]*src="(https://jacinteriorscdn\.com/[^"]+)"[^>]*/?>)'
        r'(\s*<p class="post-image-caption">[^<]*</p>)?',
        re.DOTALL
    )

    changes = 0

    def replace_img(m):
        nonlocal changes
        img_tag = m.group(1)
        src     = m.group(2)
        caption_tag = m.group(3) or ""

        url, caption_text = get_link_for_src(src)
        if not url:
            print(f"    WARNING: no mapping for {src}")
            return m.group(0)

        # Check if already wrapped in an anchor (skip if so)
        # We'll check the character before the match in the original string
        pos = m.start()
        preceding = article_body[max(0, pos-50):pos]
        if re.search(r'<a\s[^>]*href=', preceding):
            return m.group(0)  # already linked

        new_caption = f'\n            <p class="post-image-caption">{caption_text}</p>'
        wrapped = (
            f'<a href="{url}" class="post-content-img-link">\n'
            f'            {img_tag}\n'
            f'          </a>'
            f'{new_caption}'
        )
        changes += 1
        return wrapped

    new_body = img_pattern.sub(replace_img, article_body)

    if changes == 0:
        print(f"  NO CHANGES: {path.name}")
        return

    new_html = before_article + article_open + new_body + article_close + after_article
    path.write_text(new_html, encoding="utf-8")
    print(f"  UPDATED ({changes} images): {path.name}")

posts = [
    "interior-design-trends-2026.html",
    "interior-designer-beverly-hills.html",
    "interior-designer-boca-raton.html",
    "what-does-full-service-interior-design-include.html",
    "open-plan-living-room-ideas.html",
    "interior-designer-los-angeles.html",
    "how-to-choose-an-interior-designer.html",
    "luxury-kitchen-design-ideas.html",
    "luxury-bathroom-design-ideas.html",
    "modern-vs-contemporary-interior-design.html",
]

for name in posts:
    p = BLOG_DIR / name
    if p.exists():
        process_file(p)
    else:
        print(f"  MISSING: {name}")
