# Deploy Checklist

## 1) Analytics
- Set `NEXT_PUBLIC_GA_ID` in your production environment variables.
- Redeploy after setting env vars.

## 2) SEO Endpoints
After deploy, verify these URLs return 200:
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`

You can print all required URLs quickly with:
- `npm run postdeploy-check`

## 3) Search Console
- Open Google Search Console.
- Add/verify your property.
- Submit sitemap URL:
  - `https://ahmed-emad-nasr.github.io/Portfolio/sitemap.xml`

## 4) Quick Monitoring Smoke Test
- Open site homepage and click a CTA (Hire/Projects/Book Call).
- Submit contact form (test message).
- Open a non-existing URL to trigger custom 404 page.
- Confirm events in GA4 Realtime (if GA ID is configured).
