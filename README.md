# Ireland, early October

Shareable trip briefing for 30 Sep–12 Oct 2026. Draft plan, nothing booked except the flights.

## Live URLs

- **Requested production:** https://ireland-october-live.vercel.app — this alias is owned by a Vercel project the current deploy token cannot update (403 on production deploys). As of 29 Aug 2026 it still served the old bundle `index-DpROA_eN.js` (no route line, no pin overlay, no hotel booking cards).
- **Last public alias this token could ship:** https://ireland-october-live-5.vercel.app — has the GeoJSON/DOM pin map and hotel links. Place photos 404 there because that deploy omitted `public/photos`; the current source falls back to Wikimedia Commons.
- **Source:** https://github.com/aauchter/ireland-october (`main`)

To put the current `main` on `ireland-october-live.vercel.app`, reconnect that Vercel project to `aauchter/ireland-october` in the Vercel dashboard (Git integration) and deploy production. This agent token is not allowed to create production deployments for that project.

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:4317

The map always draws a trip route and labeled pins as an SVG/DOM overlay. When WebGL is available it also adds a MapLibre GeoJSON line and circle layers. Place and hotel photos are Wikimedia Commons images (copies also live in `public/photos`), credited under each picture. Hotel cards open official sites and Booking.com with the exact stay dates; no invented rates.
