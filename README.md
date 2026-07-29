# Adam Long Digital

Marketing site for Adam Long Digital, a real estate marketing studio on the Seattle Eastside.
Static HTML/CSS/JS, no build step, no dependencies. Deploys to Vercel as-is.

```
index.html      the entire page
styles.css      all styling (design tokens live in :root at the top)
main.js         sticky nav, mobile menu, scroll reveal, async form submit
images/         og.jpg, favicon.svg, feature.jpg, eastside.jpg
images/work/    project card images
images/library/ spare Houghton photography, web-optimized (not used yet)
vercel.json     clean URLs + cache headers
robots.txt      / sitemap.xml
```

---

## 1. Run it locally

No install needed. From the project folder:

```bash
python3 -m http.server 8000
# or:  npx serve .
```

Then open http://localhost:8000

---

## 2. Deploy to Vercel

1. Create a new GitHub repo and push this folder to it.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory blank.
4. Deploy.

Every push to `main` redeploys automatically.

### Custom domain

Vercel → Project → Settings → Domains → add `adamlongdigital.com`, then point the
registrar's records at the values Vercel shows you.

---

## 3. Before you go live: four things to change

### a. Connect the inquiry form (required)

The form currently posts to a placeholder and will show an error instead of sending.

1. Sign up at [formspree.io](https://formspree.io) (free tier is fine), create a form,
   point it at `adamlongdigital@gmail.com`.
2. Copy the endpoint it gives you, e.g. `https://formspree.io/f/xyzabcde`.
3. In `index.html`, find:

   ```html
   <form ... action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

   Replace `YOUR_FORM_ID` with your real form ID.

Submissions post via `fetch`, so the visitor never leaves the page. They get an inline
confirmation. There's a hidden `_gotcha` honeypot field for spam; leave it alone.

### b. Replace the two remaining project images

Real Houghton photography is already in place across the site, pulled from the Home
Feature Booklet. Two project cards still need real images:

```
images/work/houghton.jpg      done, aerial of 10410 NE 58th
images/work/holly-hall.jpg    placeholder
images/work/hope-landing.jpg  placeholder
```

Drop replacements in at the same filenames and nothing else changes. Target roughly
**1600 x 1000** (16:10), JPG, under ~350 KB.

Easiest source: open each live site, ⌘⇧5 → capture window, crop to 16:10. A hero
photograph from the property works just as well.

### c. The social share image

`images/og.jpg` (1200 x 630) is the Houghton aerial with the wordmark over it. This is
what appears when the link gets texted or posted. It's real and ready; swap it only if
you'd rather lead with a different property.

### d. Update the domain in the metadata

`index.html` has `https://adamlongdigital.com/` in the canonical tag, Open Graph tags,
and the JSON-LD block. `robots.txt` and `sitemap.xml` have it too. Find-and-replace it
if you use a different domain.

---

## 4. Editing content

Everything is in `index.html` in reading order: hero, work, services, process, about,
inquiry form, footer. It's plain HTML; edit the text between the tags.

**To add a fourth project**, copy any `<li class="project">…</li>` block, paste it at the
end of the `<ol class="projects">` list, and update the number (`ALD 04`), title, meta
line, description, tags, and both links. The alternating left/right layout is automatic.

**To change the colors**, edit the tokens at the top of `styles.css`:

```css
--stone:  #F4F1EB;   /* page background        */
--stone-2:#EBE5DA;   /* alternating sections   */
--ink:    #1C1A17;   /* headings, dark section */
--ink-2:  #46423B;   /* body text              */
--muted:  #7C7469;   /* secondary text         */
--clay:   #9A6B4F;   /* the one accent color   */
```

**Type** is Instrument Serif (headings) and Inter (everything else), loaded from Google
Fonts in the `<head>`. Change both in the `<link>` and in `--serif` / `--sans`.

---

## 5. The image library

`images/library/` holds seven more Houghton photographs, cropped and optimized for web
but not used on the page yet. They're there so you can swap any of them in without going
back to the original files:

```
aerial-front.jpg        drive approach with Lake Washington and Seattle beyond
rear-elevation.jpg      back of the house, balconies and greenery
great-room-view.jpg     great room looking out to the water
dining-chandelier.jpg   dining room under the Shakúff chandelier
kitchen-open.jpg        kitchen open to the living space
covered-patio.jpg       covered patio seating with the view
primary-suite.jpg       primary suite (portrait orientation)
```

All from the Home Feature Booklet, so the rights situation is the same as the booklet
itself. Worth a quick check with the listing photographer before any of these go on a
public marketing site, since listing photos are usually licensed to the brokerage for a
specific listing rather than assigned outright.

---

## 6. Notes

- Fully responsive; breakpoints at 1000px, 820px, and 520px.
- Respects `prefers-reduced-motion`. Animations turn off for visitors who ask for that.
- Keyboard accessible: skip link, visible focus rings, labelled controls.
- No analytics installed. If you want them, Vercel Analytics is one toggle in the
  project settings and needs no code change.
