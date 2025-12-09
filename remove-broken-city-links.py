#!/usr/bin/env python3
import re

DELETED_CITIES = [
    'downtown-la',
    'los-feliz',
    'miami-beach',
    'san-marino',
    'silverlake',
    'torrance',
    'westwood',
    'woodland-hills',
    'edgewater',
    'hollywood-hills',
    'miami'
]

# Read the file
with open('cities-we-serve.html', 'r') as f:
    html = f.read()

# Remove links matching the deleted cities
# Pattern matches <a href="cities/slug.html" ...>...</a>
# Also handling possible newlines/spacing
count = 0
for city_slug in DELETED_CITIES:
    pattern = re.compile(f'\\s*<a href="cities/{city_slug}\\.html".*?>.*?</a>', re.DOTALL | re.IGNORECASE)
    
    if re.search(pattern, html):
        html = re.sub(pattern, '', html)
        count += 1
        print(f"Removed link for {city_slug}")
    else:
        print(f"Link not found for {city_slug} (maybe already gone?)")

# Write back
with open('cities-we-serve.html', 'w') as f:
    f.write(html)

print(f"\nRemoved {count} broken links from Cities We Serve page.")

