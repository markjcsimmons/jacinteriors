# Image Management Guide for JAC Interiors Website

## Current Structure

The site currently uses:
- **Projects**: `assets/images/projects/{project-name}/`
- **Cities**: `assets/images/cities/`
- **Spaces**: `assets/images/spaces/{space-name}/` (to be created)

## Image Organization

### For Spaces Pages

Create directories for each space type:
```
assets/images/spaces/
├── bathrooms/
│   ├── bathrooms-1.jpg
│   ├── bathrooms-2.jpg
│   └── ...
├── bedrooms/
├── kitchens/
├── dining-rooms/
├── living-spaces/
├── office-spaces/
├── kids-bedrooms/
├── entryways/
├── bar-area/
├── laundry-rooms/
└── outdoor-spaces/
```

## Image Delivery Options

### Option 1: Direct from GitHub (Current Setup)
**Pros:**
- Simple, no additional services
- Works with GitHub Pages
- Free

**Cons:**
- GitHub has 100MB file size limit per file
- Repository can become very large (currently 844MB)
- Slower loading for large images
- No automatic optimization

**Best for:** Small to medium sites, low traffic

### Option 2: GitHub + Git LFS (Large File Storage)
**Pros:**
- Can handle large files (>100MB)
- Still integrated with GitHub
- Free for up to 1GB/month

**Cons:**
- Requires Git LFS setup
- Still stored in repository
- Limited bandwidth on free tier

### Option 3: CDN + Cloud Storage (Recommended for Production)
**Pros:**
- Fast global delivery
- Automatic image optimization
- Scalable bandwidth
- Separate from code repository

**Popular Services:**
- **Cloudinary** (free tier: 25GB storage, 25GB bandwidth)
- **Cloudflare Images** (free tier: 100,000 images/month)
- **AWS S3 + CloudFront**
- **Imgix** (paid, professional)

**Best for:** Production sites, high traffic, large image libraries

### Option 4: Hybrid Approach (Recommended)
- **Development**: Store optimized images in GitHub (smaller, web-ready)
- **Production**: Use CDN for high-res images and faster delivery

## Image Optimization

### Before Uploading
1. **Resize** to maximum display size:
   - Desktop: 1920px width max
   - Mobile: 800px width max
   - Keep aspect ratio

2. **Compress** without visible quality loss:
   - Use tools like ImageOptim, TinyPNG, or Squoosh
   - Target: 70-85% JPEG quality
   - File size should be <500KB for most images

3. **Format**:
   - Use JPEG for photos
   - Use WebP for modern browsers (with JPEG fallback)
   - Use PNG only for graphics/logos with transparency

## Workflow for Adding Images

### Method 1: Dropbox → Download → Optimize → Upload

1. **Download from Dropbox**:
   ```bash
   # You can share a Dropbox folder link
   # Download images to a temp folder first
   ```

2. **Optimize images** (create a script):
   ```bash
   # Example using ImageMagick or Python PIL
   python optimize_images.py /path/to/images /path/to/output
   ```

3. **Organize into spaces folders**:
   ```bash
   mkdir -p assets/images/spaces/bathrooms
   # Move optimized images with correct naming
   ```

### Method 2: Direct Upload Script

I can create a script that:
- Accepts Dropbox shared links
- Downloads images
- Automatically optimizes them
- Organizes into correct folders
- Updates HTML files with correct paths

## Production Storage Recommendations

### For Live Site:

**Best Practice:**
1. Keep code repository lightweight (<100MB)
2. Store optimized web images in repository (for backup/version control)
3. Use CDN for production delivery (faster, scalable)

**Example Setup:**
- **GitHub**: Stores code + optimized images (smaller, backup)
- **Cloudinary/CDN**: Serves images in production with automatic optimization
- **Image URLs**: Use environment variables to switch between local/CDN

```html
<!-- Development -->
<img src="assets/images/spaces/bathrooms/bathrooms-1.jpg">

<!-- Production (via CDN) -->
<img src="https://res.cloudinary.com/jacinteriors/image/upload/spaces/bathrooms/bathrooms-1.jpg">
```

## Next Steps

1. **Immediate**: Share Dropbox links, I'll help organize and optimize
2. **Short-term**: Set up spaces image directories
3. **Before launch**: Decide on CDN strategy and migrate if needed

Would you like me to:
- Create the spaces image directory structure?
- Build a script to download from Dropbox and optimize?
- Set up a CDN configuration for production?
