# Deploy Checklist

## 1) Notification Channels
- Telegram channel (choose one):
  - Recommended: `NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL` (Make/Pipedream/your relay).
  - Direct bot mode: `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` + `NEXT_PUBLIC_TELEGRAM_CHAT_ID`.

## 2) Contact Form Delivery
- Required: set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` to your Formspree endpoint.
- Submit a test message and confirm it reaches Formspree inbox.

## 3) Anti-Spam
- Optional Turnstile: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Confirm challenge appears in Contact form and submit works.

## 4) Quick Endpoint Check
After deploy, verify these URLs return 200:
- `/`

You can print all required URLs quickly with:
- `npm run postdeploy-check`

## 5) Search Console (Optional)
- Open Google Search Console.
- Add/verify your property.

## 6) Quick Monitoring Smoke Test
- Open site homepage and click a CTA (Hire/Projects/Book Call).
- Submit contact form (test message).
- Open CV modal and test Preview/Download buttons.
- Check mobile quick actions (Contact + CV) on a small viewport.
- Open a non-existing URL to trigger custom 404 page.
