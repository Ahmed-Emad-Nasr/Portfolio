# Deploy Checklist

## 1) Analytics
- Set `NEXT_PUBLIC_GA_ID` in your production environment variables.
- Optional heatmap: set `NEXT_PUBLIC_CLARITY_ID`.
- Redeploy after setting env vars.

## 2) Notification Channels
- Email channel: set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (or keep default endpoint).
- Telegram channel (choose one):
  - Recommended: `NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL` (Make/Pipedream/your relay).
  - Direct bot mode: `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` + `NEXT_PUBLIC_TELEGRAM_CHAT_ID`.
- Optional remote event ingest for online dashboard: `NEXT_PUBLIC_LOG_INGEST_URL`.

## 3) Online Dashboard (Optional)
- Set `NEXT_PUBLIC_REMOTE_INSIGHTS_URL` to a GET endpoint returning JSON like:
  - `{ "stats": { "site_visit": 10, "cv_download": 4 }, "recentEvents": [{ "timestamp": "...", "event": "cv_download", "details": "..." }] }`
- Open `/insights` to verify remote mode status.

## 4) Anti-Spam
- Optional Turnstile: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Confirm challenge appears in Contact form and submit works.

## 5) SEO Endpoints
After deploy, verify these URLs return 200:
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`

You can print all required URLs quickly with:
- `npm run postdeploy-check`

## 6) Search Console
- Open Google Search Console.
- Add/verify your property.
- Submit sitemap URL:
  - `https://ahmed-emad-nasr.github.io/Portfolio/sitemap.xml`

## 7) Quick Monitoring Smoke Test
- Open site homepage and click a CTA (Hire/Projects/Book Call).
- Submit contact form (test message).
- Open CV modal and test Preview/Download buttons.
- Check mobile quick actions (Contact + CV) on a small viewport.
- Open a non-existing URL to trigger custom 404 page.
- Confirm events in GA4 Realtime (if GA ID is configured).
