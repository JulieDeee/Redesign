# Your AI room redesign site

**Renaming:** edit `lib/brand.js` — three lines change the name everywhere.

Landing page at `/`, the design tool at `/design`. Upload a room photo, pick a style, describe what stays, get a redesign plus a shoppable brief. Free, capped at 10 new designs per visitor per day.

## Deploy on Vercel (no coding needed)

1. **Put this folder on GitHub.** Go to github.com → New repository → name it `restyle` → "uploading an existing file" → drag every file in this folder in → Commit.
2. **Import into Vercel.** vercel.com → Add New → Project → pick the `restyle` repo → Deploy. (First deploy will run but the site won't work until steps 3–4.)
3. **Add file storage.** In the Vercel project: Storage → Create → Blob → Connect. This adds `BLOB_READ_WRITE_TOKEN` for you.
4. **Add your before/after photos.** Drop two images into the `public` folder named `before` and `after` (any photo extension: .jpg, .jpeg, .png, .webp) — a real room you have redesigned. That slider is the homepage.
5. **Add your keys.** Settings → Environment Variables:
   - `OPENAI_API_KEY` — from platform.openai.com → API keys (separate from your ChatGPT Business login; add a card there)
   - `ANTHROPIC_API_KEY` — from console.anthropic.com → API keys
   - `AMAZON_AFFILIATE_TAG` — your Amazon Associates tag (e.g. `restyle-20`); use `yourtag-20` until approved
6. **Redeploy.** Deployments → ⋯ on the latest → Redeploy. Open the site and test with a real photo.

Add your own domain later under Settings → Domains.

## Costs
- Vercel Hobby: free. Blob storage: free tier, then pennies.
- OpenAI GPT Image 2: about 5¢ per image at medium quality (set OPENAI_IMAGE_QUALITY=low for ~1¢).
- Anthropic: about $0.01 per design brief.

## Tuning
- Styles and their prompts: `lib/prompt.js`
- Free cap (10 new designs/day/IP, tweaks unlimited): `lib/ratelimit.js`
- Swap the image provider: only `app/api/redesign/route.js` talks to OpenAI.
