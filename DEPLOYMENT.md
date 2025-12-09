# Deployment Guide for Netlify

## Prerequisites
- Netlify account connected to your GitHub repository
- Supabase project configured and running

## Netlify Configuration

### 1. Build Settings
The `netlify.toml` file is already configured with the correct settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### 2. Environment Variables
You must configure these environment variables in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=https://nlvxyjnivfouszieykrx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdnh5am5pdmZvdXN6aWV5a3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTM4NTgsImV4cCI6MjA4MDc4OTg1OH0.zy35U6gqeU6pjv4YmjtXc3MxESJ_ak3feD-KG8tXu0U
```

### 3. Deploy
After setting the environment variables:
1. Trigger a new deploy in Netlify (Site settings → Deploys → Trigger deploy → Clear cache and deploy)
2. Wait for the build to complete
3. Your site should now work correctly

## Troubleshooting

### Blank Page
- Check browser console for errors
- Verify environment variables are set correctly in Netlify
- Ensure you've triggered a new deploy after adding environment variables

### 404 Errors on Routes
- The `_redirects` file in the `public` folder handles SPA routing
- This should be automatically included in the build

### Build Failures
- Check the deploy logs in Netlify
- Ensure all dependencies are properly installed
- Verify Node version compatibility (v18 recommended)
