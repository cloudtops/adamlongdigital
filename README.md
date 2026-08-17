# Adam Long Digital

Marketing studio site. Static HTML, CSS, and JS. No build step, no dependencies.

## Deploying

Drop everything in this folder at the root of the repo and push. Vercel serves it as-is.

    index.html
    styles.css
    main.js
    assets/
    favicon.svg  favicon-32.png  favicon-16.png  apple-touch-icon.png  icon-512.png
    site.webmanifest  robots.txt  sitemap.xml  vercel.json

If you keep the old repo files, delete these first so nothing stale gets served:
the previous `index.html`, `styles.css`, `main.js`, and the unused `assets/out-*.jpg` set.

## If the domain changes

Five places hardcode `https://adam-long-digital.vercel.app`:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and the JSON-LD block
- `robots.txt` — the `Sitemap:` line
- `sitemap.xml` — the `<loc>` line

Find and replace the domain across those three files.

## Structure

| Section | What it is |
| --- | --- |
| Hero | Headline auto-fits its container via `fitMega()` in `main.js` |
| Band | Full-bleed Hope Landing rendering, parallax on scroll |
| Marquee | Scrolling services list |
| Work | Four case studies plus a two-up row for Houghton and Holly Hall |
| Carousel | Instagram-style post viewer, four posts, swipe / arrows / dots |
| Studio | About plus the stats row |
| Services | Four numbered services |
| Process | Four steps, clay background |
| Inquire | Contact form |

## The carousel

Post content lives in the `POSTS` array at the top of the carousel block in `main.js`.
To add a post, push an object with `tab`, `client`, `title`, `body`, `tag`, `meta`,
`ratio` (`'1/1'` or `'4/5'`), and a `slides` array of `{src, alt}`. The viewer reads
`ratio` to reshape the frame, so slides inside one post should share an aspect ratio.

## Known gaps

- **The contact form posts to `mailto:`.** That opens the visitor's mail client rather
  than sending. Wire it to Formspree, Vercel Forms, or a serverless function before
  you rely on it for leads.
- **Houghton and Holly Hall have no images.** They sit in the compact row under the
  main case studies until you add screenshots.
- **Beyond Brokers is case 01** and its assets appear throughout the page and the
  carousel. Clear that with Val before this goes public.
- **The OG image type is set in Lora**, not Instrument Serif, because the render
  environment did not have the brand font. Re-export `assets/og-hero.jpg` if you want
  it exact.

## Fonts

Instrument Serif from Google Fonts, one family throughout, with
`Iowan Old Style, Georgia, serif` as the fallback stack.

## Palette

    --paper      #F4F1EC   page background
    --paper-alt  #EBE5DA   alternate band
    --ink        #14120F   dark sections and text
    --body       #46423B   body copy
    --muted      #7C7469   secondary text
    --rule       #C9C3B8   hairlines
    --clay       #9A6B4F   accent
    --navy       #002349   carousel slide backdrop
