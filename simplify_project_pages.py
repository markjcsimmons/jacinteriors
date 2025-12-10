#!/usr/bin/env python3
"""Create simplified Invero-styled project pages."""

from pathlib import Path
from bs4 import BeautifulSoup
import json

# Load image mapping
with open('image_mapping.json') as f:
    image_mapping = json.load(f)

# Project details
projects_info = {
    "beverly-hills-alpine": {
        "title": "Beverly Hills Alpine",
        "subtitle": "A refined Spanish-style residence transformed into a modern family sanctuary",
        "client": "Private Client",
        "location": "Beverly Hills, CA",
        "style": "Modern Spanish",
        "year": "2023"
    },
    "venice-beach-house": {
        "title": "Venice Beach House",
        "subtitle": "Coastal contemporary design celebrating light, texture, and beachside living",
        "client": "Private Client",
        "location": "Venice Beach, CA",
        "style": "Coastal Contemporary",
        "year": "2023"
    },
    "toscana-country-club": {
        "title": "Toscana Country Club",
        "subtitle": "Mediterranean elegance meets desert luxury in this Indian Wells retreat",
        "client": "Private Client",
        "location": "Indian Wells, CA",
        "style": "Mediterranean",
        "year": "2023"
    },
    # Add more as needed...
}

template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <meta content="{meta_description}" name="description"/>
    <title>{title} | JAC Interiors</title>
    <link href="../assets/css/style.css" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
</head>
<body>
    
    <!-- Navigation -->
    <nav class="navbar scrolled">
        <div class="container">
            <div class="nav-wrapper">
                <a class="logo" href="../index-variant-2.html">
                    <img alt="JAC Interiors" class="logo-img" src="../assets/images/jac-logo.png"/>
                </a>
                <div class="nav-menu">
                    <a class="nav-link" href="../index-variant-2.html">HOME</a>
                    <a class="nav-link active" href="../portfolio.html">PORTFOLIO</a>
                    <a class="nav-link" href="../services.html">SERVICES</a>
                    <a class="nav-link" href="../about.html">ABOUT</a>
                    <a class="nav-link" href="../contact.html">CONTACT</a>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Project Hero -->
    <section style="padding: 8rem 0 3rem 0;">
        <div class="container">
            <h1 style="font-size: 4rem; font-weight: 500; margin-bottom: 1rem; letter-spacing: -2px;">{title}</h1>
            <p style="font-size: 1.25rem; color: #666; max-width: 800px; line-height: 1.6;">{subtitle}</p>
            
            <a href="#details" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: #222;">
                Read about
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19 12L12 19L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </a>
        </div>
    </section>

    <!-- Project Details Grid -->
    <section id="details" style="padding: 2rem 0 4rem 0; border-top: 1px solid #e4e4e4; border-bottom: 1px solid #e4e4e4;">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 3rem;">
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 0.5rem;">Client</div>
                    <div style="font-weight: 500;">{client}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 0.5rem;">Location</div>
                    <div style="font-weight: 500;">{location}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 0.5rem;">Style</div>
                    <div style="font-weight: 500;">{style}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 0.5rem;">Year</div>
                    <div style="font-weight: 500;">{year}</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Project Story -->
    <section style="padding: 6rem 0;">
        <div class="container" style="max-width: 900px;">
            <div style="margin-bottom: 4rem;">
                <h6 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 1rem;">Project Story</h6>
                <h2 style="font-size: 2.5rem; font-weight: 500; margin-bottom: 2rem; letter-spacing: -1px;">The Vision</h2>
                {content}
            </div>
        </div>
    </section>

    <!-- Project Gallery -->
    <section style="padding: 4rem 0;">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                {gallery_images}
            </div>
        </div>
    </section>

    <!-- Footer -->
    {footer}

    <script src="../assets/js/main.js"></script>
</body>
</html>
'''

# For now, just create the template - we'll apply it next
print("✅ Template created - ready to apply to project pages")
print("   - Simplified structure")
print("   - Invero styling")
print("   - Clean, minimal layout")

