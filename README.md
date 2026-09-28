# Jac&Mac Photography — Website

Official website for **Jac&Mac Photography**, a husband-and-wife wedding, portrait, quinceañera, event and photo booth photography team based in Fredericksburg, Virginia, serving the DMV, Maryland, Delaware and Eastern Pennsylvania.

Live site: https://www.jacnmacphotography.com

## Stack

- Static HTML, CSS and vanilla JavaScript — no frameworks, no build step.
- Single-page layout with in-page sections: Services, About, Gallery, Testimonials, Locations and Booking.
- Responsive images in AVIF + WebP (`srcset`), lazy-loaded below the fold.
- Booking through an embedded Calendly widget, loaded only when the section comes into view.
- English / Spanish switch in the header; the visitor's choice is remembered on their device.

## Structure

```
.
├── index.html          # the whole site
├── styles.css          # design tokens + all styles
├── main.js             # header, mobile menu, reveals, counters, carousel, lightbox, Calendly, EN/ES switch
├── i18n.js             # Spanish texts for the EN/ES switch
├── .htaccess           # HTTPS, caching, compression, 301 redirects from the old URLs
├── robots.txt
├── sitemap.xml
├── favicon.ico / favicon-32.png / apple-touch-icon.png
└── assets/
    ├── logo-512.png
    └── img/            # photos (AVIF + WebP, 640 / 1280 / 1920 px), badges, logos, social image
```

## Run locally

Any static server works, for example:

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

## Deploy (Hostinger)

Upload the contents of this folder to `public_html`, including the hidden `.htaccess` file. No build is required.

After each deploy, bump the `?v=YYYYMMDD` query string on `styles.css` and `main.js` in `index.html` so browsers fetch the new versions.

## Common edits

| What | Where |
|---|---|
| Calendly booking link | `CALENDLY_URL` at the top of `main.js` (single place) |
| Texts, reviews, services | `index.html` (and the matching Spanish text in `i18n.js`) |
| Spanish translation | `i18n.js` — keys are the exact English texts; values are the Spanish version |
| Colors, fonts, spacing | `:root` tokens at the top of `styles.css` |
| Old-URL redirects | `.htaccess` |

## Pending content (to confirm with the client)

- Exact number of five-star reviews (currently shown as **170+**; marked `TODO` in `index.html`).
- Client's own Calendly URL (`main.js`).
- Public LinkedIn and Yelp profile links (marked `TODO` in the footer).
- Exact locations for some photo descriptions (`alt` texts).
- Migration of the previous blog posts (old `/blog` and `/post/*` URLs currently redirect to the home page).

© Jac & Mac Photography. All rights reserved.
