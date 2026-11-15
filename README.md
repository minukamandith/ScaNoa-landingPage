# ScaNoa landing page

A static site (plain HTML, CSS and JS, no build step). Open `index.html` in a browser to preview it.

```
index.html     page content
styles.css     all styling (colours are CSS variables at the top)
script.js      mobile menu, scroll effects, fit demo, contact form
assets/        logo (logo-word.svg is the sharp vector wordmark), tab icons for light and
               dark browsers, images, social preview image
```

## Before going live — things to fill in

1. **Email address**: `hello@scanoa.lk` appears in the footer and on the contact form (`data-mailto`).
2. **Contact form**: by default it opens the visitor's email app. To receive messages directly,
   create a free form at formspree.io (or similar) and paste the URL into `data-endpoint=""` on the `<form id="contactForm">`.
3. **YouTube video**: in `index.html`, find `data-youtube-id=""` and paste your video's ID between the quotes
   (for `https://www.youtube.com/watch?v=abc123XYZ` the ID is `abc123XYZ`). The video's thumbnail is used automatically,
   and the video only loads when someone presses play, so the page stays fast.
4. **Phone number**: in the footer, replace `+94 XX XXX XXXX` and the `tel:` link with your real number (or delete that line).
5. **Social media**: in the footer, replace each `href` (Instagram, Facebook, TikTok, YouTube, LinkedIn) with your profile URL.
   Delete the `<a>` for any platform you don't use.
6. **Domain in meta tags**: update `og:image` and `og:url` in `<head>` if your domain isn't `scanoa.lk`.

## Hosting on a .lk domain

The site is just static files, so any static host works. Free options:
GitHub Pages, Netlify, Vercel or Cloudflare Pages.

1. **Register the domain** through the LK Domain Registry (domains.lk / nic.lk) or one of its
   authorised agents. Check current requirements and prices on their site before applying —
   registration needs identification details and approval can take time, so start early.
2. **Deploy the site** — e.g. Netlify: drag this folder onto app.netlify.com/drop.
   GitHub Pages: push the folder to a repo and enable Pages in the repo settings.
3. **Connect the domain** — add the custom domain in your host's settings, then add the DNS records
   it gives you (usually an A record for `scanoa.lk` and a CNAME for `www`) in the domain's DNS panel.
4. **HTTPS** — all of the hosts above issue a free certificate automatically once DNS is pointing at them.
