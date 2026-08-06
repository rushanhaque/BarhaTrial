# BARHA — Haute Parfumerie · v2.0

A full-stack demonstration website for a **fictional** niche perfume house, built to
feel like the work of a high-end design studio. Dark editorial luxury with a light
counterpart: warm noir/bone/gold by night, warm ivory/espresso/gold by day — switchable
with a **Day ↔ Dusk** toggle (the house *is*, after all, about twilight).

> Everything here is invented — the brand, the people, the scents, the prices.
> It exists only to demonstrate design and front-end craft. No payment is processed.

**Stack:** React 18 + Vite (client) · Express / Node (API) · [Lenis](https://github.com/darkroomengineering/lenis)
smooth scroll · React Router. The motion + commerce systems are hand-built (no UI framework).

---

## Run it

```bash
npm run install:all     # installs root, server, and client deps
npm run dev             # API on :5180 + client on :5173 (proxied)
```

Open **http://localhost:5173**.

### Production

```bash
npm run build           # builds the client into client/dist
npm start               # Express serves the API + built client on :5180
```

In production the Express server serves the SPA **and** injects per-route `<title>` /
meta-description for SEO (including each fragrance), gzips responses, hard-caches hashed
assets, and exposes `robots.txt` + `sitemap.xml`.

---

## What's new in 2.0

**Commerce**
- **The Wardrobe** — a real cart (localStorage), slide-out drawer, size-based pricing,
  quantity controls, subtotal, and a checkout that posts to `/api/orders` and returns a
  reservation reference
- **Wishlist** — save any composition (heart), reviewed in the drawer's *Saved* tab
- **Discovery Sets** — build a 2 ml sampler of up to five scents → added to the wardrobe

**Experience**
- **Day ↔ Dusk theme** — a full second palette, persisted, no flash on load
- **⌘K command palette** — fuzzy search across compositions, notes and pages, keyboard-driven
- **Collections** — sort (featured / newest / price / intensity), grid ↔ list view, family filters
- **Toasts**, skeleton shimmer, refined micro-interactions throughout

**Deploy-ready**
- Compression, security headers, immutable asset caching
- Per-route SEO meta injection, `robots.txt`, `sitemap.xml`
- PWA `manifest.webmanifest` + maskable icons, `theme-color`
- `Dockerfile`, `render.yaml`, `Procfile`, `.env.example`, route-level error boundary

### Refinements

- **Hero atmosphere** — a performant canvas of drifting luminous motes (sprite-based,
  paused offscreen / on hidden tab, reduced-motion aware)
- **3D tilt + glare** on the hero and every fragrance card (rAF runs only while hovering)
- **Scent journey** — an SVG that visualises how each composition evolves on skin, scaled
  by its own wear profile; plus **ratings & impressions** per fragrance
- **Recently viewed** memory, a top **scroll-progress** hairline, a **back-to-top** control
- **Performance** — chromatic-plate drift rewritten to GPU `transform` (no paint), tilt/canvas
  pause at rest/offscreen, scroll widgets update via refs (no per-frame re-renders)
- **UX/A11y** — theme toggle reachable in the mobile menu, search palette locks scroll, native
  cursor restored under reduced motion, Router future-flags (clean console)

---

## Deploy

**Docker**
```bash
docker build -t barha .
docker run -p 5180:5180 barha        # http://localhost:5180
```

**Render** — push to a repo and point Render at `render.yaml` (one Node web service;
`buildCommand: npm run install:all && npm run build`, `startCommand: npm start`).

**Railway / Heroku / Fly** — any Node host works. `npm start` runs the Express server,
which serves `client/dist`. Hosts that inject `PORT` are honoured automatically. Set
`BASE_URL` to your domain so `sitemap.xml` emits absolute URLs.

---

## Routes & API

| Route | |
|---|---|
| `/` | Home — hero, horizontal library, signature, philosophy, journal |
| `/collections` | Filter / sort / grid-list library |
| `/fragrance/:slug` | Detail — pyramid, wear profile, add-to-wardrobe, related |
| `/atelier` | The Scent Atelier — 4-step recommendation |
| `/discovery` | Build-your-own discovery set |
| `/maison` · `/journal` · `/contact` | Story · editorial · forms + boutiques |

API: `GET /api/fragrances[/:slug]`, `/api/journal`, `/api/maison`, `GET /api/health` ·
`POST /api/scent-finder`, `/api/orders`, `/api/contact`, `/api/appointments`, `/api/newsletter`.

## Structure

```
.
├── Dockerfile · render.yaml · Procfile · .env.example
├── server/                 Express API + prod static serving (SEO, robots, sitemap)
│   └── data/               fragrances · journal · maison
└── client/                 Vite + React
    ├── public/             favicon · icons · manifest
    └── src/
        ├── lib/            SmoothScroll · theme · wardrobe · toast · search · transitions · api
        ├── components/     Cursor · Navbar · CartDrawer · ThemeToggle · ChromaticPlate …
        ├── pages/          Home · Collections · Fragrance · Maison · ScentFinder · Discovery · Journal · Contact
        └── styles/         tokens · base · layout · chrome · pages · v2
```

## Notes
- Fonts load from Google Fonts (Fraunces) + Fontshare (General Sans), with graceful fallbacks.
- Respects `prefers-reduced-motion`; best on a desktop width (layouts collapse to single column).
- Each scent is rendered as a **chromatic signature** (a living gradient) rather than a photo — by design.
