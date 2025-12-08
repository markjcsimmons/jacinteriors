# JAC Interiors Website

Modern, custom-built website for JAC Interiors based on the Invero design template. Built with clean HTML, CSS, and JavaScript for fast performance and easy hosting.

## 🎉 Website Complete!

Your website includes:
- ✅ Homepage with hero section and service overview
- ✅ Portfolio page with 8+ projects
- ✅ About page with company information
- ✅ Services page with detailed offerings
- ✅ Contact page with form and locations
- ✅ Mobile responsive design
- ✅ Modern animations and interactions
- ✅ Your JAC Interiors branding and content

## 📁 Project Structure

```
jac-website-custom/
├── index.html          # Homepage
├── portfolio.html      # Portfolio/Projects page
├── about.html          # About Us page
├── services.html       # Services page
├── contact.html        # Contact page
├── assets/
│   ├── css/
│   │   └── style.css   # All styling
│   ├── js/
│   │   └── main.js     # Interactive features
│   └── images/
│       ├── jac-logo.png
│       ├── hero-main.jpg
│       ├── about-preview.jpg
│       └── projects/   # Portfolio images
└── README.md          # This file
```

## 🚀 Deploy to Vercel (FREE Hosting)

### Option 1: Deploy via Vercel Dashboard (Easiest - 5 minutes)

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub, GitLab, or Bitbucket (or email)
3. **Click** "Add New Project"
4. **Choose** "Import Git Repository" OR "Deploy from CLI"

#### Method A: Using GitHub (Recommended)

1. Create a free GitHub account at [github.com](https://github.com) if you don't have one
2. Create a new repository called "jac-interiors-website"
3. Upload this entire folder to GitHub:
   - Drag and drop all files into the repository
   - Or use GitHub Desktop app
4. In Vercel, click "Import Project"
5. Select your GitHub repository
6. Click "Deploy"
7. Done! Your site will be live at `your-project-name.vercel.app`

#### Method B: Drag and Drop (Fastest)

1. In Vercel dashboard, find the drag-and-drop area
2. Drag this entire `jac-website-custom` folder into Vercel
3. Wait for deployment (1-2 minutes)
4. Your site is live!

### Option 2: Deploy via Command Line

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project:**
   ```bash
   cd "/Users/mark/Desktop/JAC web design/jac-website-custom"
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Login to Vercel (first time only)
   - Confirm project settings
   - Deploy!

### Connect Your Custom Domain (jacinteriors.com)

Once deployed, connect your domain:

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `jacinteriors.com`
4. Vercel will show you DNS records to update
5. Go to your domain registrar (where you bought the domain)
6. Update DNS settings with Vercel's values:
   - Type: A Record
   - Name: @
   - Value: 76.76.21.21 (or whatever Vercel shows)
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
7. Wait 24-48 hours for DNS propagation
8. Your site will be live at jacinteriors.com!

## 📧 Contact Form Setup

The contact form is configured for Netlify Forms (works on Vercel too).

### To Enable Form Submissions:

**Option 1: Formspree (Free - Easiest)**
1. Go to [formspree.io](https://formspree.io)
2. Sign up (free for 50 submissions/month)
3. Create a new form
4. Copy your form endpoint
5. In `contact.html`, update the form tag:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

**Option 2: Basin (Free)**
1. Go to [usebasin.com](https://usebasin.com)
2. Create a form
3. Update form action in `contact.html`

**Option 3: Web3Forms (Free)**
1. Go to [web3forms.com](https://web3forms.com)
2. Get your access key
3. Add hidden field to form:
   ```html
   <input type="hidden" name="access_key" value="YOUR_KEY">
   ```

## 🎨 Customization

### Update Colors

Edit `assets/css/style.css` and modify the CSS variables:

```css
:root {
    --color-primary: #c9a961;  /* Gold/tan color */
    --color-secondary: #2c2c2c; /* Dark gray */
}
```

### Add More Images

1. Add images to `assets/images/projects/`
2. Update the HTML in `portfolio.html` to reference new images
3. Re-deploy

### Add More Projects

In `portfolio.html`, copy a portfolio item block and update:
```html
<div class="portfolio-item">
    <div class="portfolio-image">
        <img src="assets/images/projects/your-image.jpg" alt="Project Name">
    </div>
    <div class="portfolio-info">
        <h3>Project Name</h3>
        <p>Project Type • Location</p>
        <p>Description</p>
    </div>
</div>
```

## 📱 Mobile Responsive

The site is fully responsive and tested on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1200px-1920px)
- ✅ Tablet (768px-1200px)
- ✅ Mobile (320px-768px)

## ⚡ Performance

- Fast loading (optimized images)
- Clean, minimal code
- No heavy frameworks
- Smooth animations
- SEO-friendly structure

## 🔧 Making Updates

### Simple Text Updates:
1. Open the HTML file in any text editor
2. Find the text you want to change
3. Edit it
4. Save
5. Re-deploy (drag to Vercel or push to GitHub)

### Image Updates:
1. Replace image files in `assets/images/` folder
2. Keep the same filename, or
3. Update the image path in HTML
4. Re-deploy

## 💰 Costs

- **Hosting:** FREE (Vercel)
- **Domain:** ~$15/year (your existing domain)
- **Forms:** FREE (Formspree, Basin, or Web3Forms free tier)
- **Total:** $15/year (just the domain!)

Compare to:
- Shopify: $348-3,588/year
- Webflow: $276-4,788/year

**You save $260-3,500+ per year!**

## 🆘 Need Help?

### Common Issues:

**Site not updating after changes?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Wait 1-2 minutes for Vercel to rebuild

**Images not showing?**
- Check image paths are correct
- Make sure images are in `assets/images/` folder
- Check file extensions (.jpg vs .png)

**Form not working?**
- Make sure you've set up a form service (see Contact Form Setup above)
- Check browser console for errors (F12)

## 📞 Support

For questions about the website:
- Check this README
- Visit [vercel.com/docs](https://vercel.com/docs)
- Or come back to ask me!

## 🎉 You're All Set!

Your beautiful, modern JAC Interiors website is ready to go live. Deploy to Vercel and start attracting clients!

---

Built with ❤️ for JAC Interiors




