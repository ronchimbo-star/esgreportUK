# Deployment Guide for ESGReport Platform

## Important: Understanding the Build Process

**The `dist` folder should NOT be in your Git repository.** It's correctly listed in `.gitignore`.

Your hosting platform will:
1. Clone your repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to generate the `dist` folder
4. Serve the contents of the `dist` folder

## Platform-Specific Instructions

### Netlify (Recommended)

I've created a `netlify.toml` configuration file for you. Just push your code to GitHub and:

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. **Netlify will auto-detect the settings from `netlify.toml`**
5. Click "Deploy site"

**Custom Domain Setup:**
1. Go to Site Settings → Domain Management
2. Add your custom domain: `esgreport.co.uk`
3. Follow Netlify's DNS instructions

**Environment Variables:**
1. Go to Site Settings → Environment Variables
2. Add your Supabase credentials from `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel

I've created a `vercel.json` configuration file for you. Just push your code and:

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Vercel will auto-detect the Vite framework**
5. Click "Deploy"

**Custom Domain Setup:**
1. Go to Project Settings → Domains
2. Add `esgreport.co.uk`
3. Configure DNS as instructed

**Environment Variables:**
1. Go to Project Settings → Environment Variables
2. Add your Supabase credentials from `.env`

### GitHub Pages

For GitHub Pages, you'll need to set up a GitHub Action:

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Add your Supabase credentials as GitHub Secrets
3. Enable GitHub Pages to use the `gh-pages` branch

## Troubleshooting

### Issue: Styling is broken / CSS not loading

**Solution:**
1. Check that your hosting platform is configured to build the project
2. Verify build command is: `npm run build`
3. Verify publish/output directory is: `dist`
4. Clear your deployment cache and redeploy
5. Hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)

### Issue: Environment variables not working

**Solution:**
1. Add all `VITE_*` variables from your `.env` file to your hosting platform's environment variables
2. Redeploy the site

### Issue: Routes return 404

**Solution:**
This is a Single Page Application (SPA). Your hosting platform needs to redirect all routes to `index.html`.
- **Netlify**: Handled automatically by `netlify.toml`
- **Vercel**: Handled automatically by `vercel.json`
- **Others**: Add a redirect rule: `/*` → `/index.html` (200)

## Verification Checklist

After deployment, verify:
- [ ] Homepage loads with proper styling
- [ ] Navigation works correctly
- [ ] Login/signup functionality works
- [ ] CSS is loading (check Network tab for `index-*.css`)
- [ ] No console errors
- [ ] Environment variables are accessible

## Current Build Output

The latest build generates:
- **CSS**: `dist/assets/index-DB2OZSYl.css` (47.90 kB)
- **Total JS**: ~600 kB across multiple optimized chunks
- **Build time**: ~15 seconds

## Need Help?

If you're still experiencing issues:
1. Check your hosting platform's build logs
2. Verify all environment variables are set
3. Ensure the build command and output directory are correct
4. Clear deployment cache and rebuild
