# Deployment Guide for Vercel

## Problem

Vercel doesn't recognize client-side routes by default. When you navigate to `/admin` directly, Vercel looks for a file at that path, but since it's a React Router route, it doesn't exist as a physical file.

## Solution

I've added the necessary configuration files to handle client-side routing properly.

### Files Added:

1. **`vercel.json`** - Main Vercel configuration

   - Rewrites all routes to `index.html`
   - Handles service worker caching

2. **`public/_redirects`** - Alternative redirect approach

   - Redirects all routes to `index.html` with 200 status

3. **Updated `vite.config.ts`** - Build configuration

   - Added history API fallback for development
   - Optimized build output

4. **Updated `src/App.tsx`** - Router configuration
   - Added catch-all route (`*`) for unmatched paths

## Deployment Steps:

### 1. Build the Project

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub and connect to Vercel
git add .
git commit -m "Add Vercel routing configuration"
git push origin main
```

### 3. Verify Routes

After deployment, test these URLs:

- `https://your-app.vercel.app/` - Main lottery app
- `https://your-app.vercel.app/admin` - Admin panel
- `https://your-app.vercel.app/any-other-route` - Should redirect to main app

## Configuration Details:

### vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

### public/\_redirects

```
/*    /index.html   200
```

## Troubleshooting:

1. **If routes still don't work:**

   - Clear Vercel cache and redeploy
   - Check Vercel deployment logs
   - Ensure all files are committed

2. **If admin page loads but map doesn't work:**

   - Check browser console for CORS errors
   - Verify API endpoint is accessible
   - Check network tab for failed requests

3. **If build fails:**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check Vite configuration

## Testing Locally:

```bash
npm run build
npm run preview
```

Then test the routes:

- `http://localhost:4173/`
- `http://localhost:4173/admin`

## Notes:

- The `vercel.json` file takes precedence over `_redirects`
- Both approaches work, but `vercel.json` is more comprehensive
- The catch-all route in React Router provides additional fallback
- Service worker caching is properly configured for PWA features
