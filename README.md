# adamlongdigital.com

Static marketing site for Adam Long Digital. No build step, no framework, no
dependencies. Deployed on Vercel from this repo.

Live: https://www.adamlongdigital.com

## Structure

```
index.html      the whole page
styles.css      the design system
main.js         three behaviours: work accordion, output viewer, inquiry form
assets/         case images and carousel slides
vercel.json     cache headers
```

Everything else is favicons, the manifest, robots.txt and sitemap.xml.

## Design

One typeface, IBM Plex Mono, loaded from Google Fonts. Hierarchy comes from
rules, letter case and position rather than size: the largest type on the page
is 17px. The palette is defined as custom properties at the top of `styles.css`.

The accent colour `--sig` is only ever used on live things: section numbers, an
open row, a working link, a focused form field, the status dot. If it is being
used decoratively, that is a bug.

Deliberately absent: scroll-reveal animations, gradients, grain, shadows,
rounded corners, pill tags. The page has no decorative elements. Adding one is
a design decision, not a tweak.

## Editing the work index

Each project is one `<article class="row">` inside `#workIndex`. The row header
holds the number, title, kind and year. The body holds a `figure.plate` and a
`dl.specs`. Copy an existing row and renumber. Only one row carries `is-open`
plus `aria-expanded="true"`, and it should be the first.

At 1180px and wider the expanded row becomes three columns: label gutter, image,
writeup. Below that it stacks.

## Editing the output viewer

The carousels are data, not markup. Edit the `POSTS` array at the top of the
viewer section in `main.js`. Each entry needs `tab`, `client`, `title`, `body`,
`tag`, `meta` and a `slides` array of `{src, alt}`. Tabs are generated from the
array, so adding an entry is enough.

## Assets

Case images are referenced with a `?v=N` query key. **Bump the number whenever
you replace an image file**, otherwise browsers serve the cached version. This
matters because `vercel.json` sets a one hour cache on `/assets/*`.

Images carry explicit `width` and `height` so the page does not reflow as they
load. Keep those accurate when swapping a file for one of a different shape.

## The inquiry form

Posts to Web3Forms. Put the access key in the hidden `access_key` input in
`index.html`. Until a real key is there, submitting falls back to opening the
visitor's email client with the fields prefilled, so the form is never a dead
end. The same fallback catches a network failure or a rejected POST.

There is a honeypot checkbox named `botcheck`. Leave it hidden and unlabelled.

## Domain

Registered at Squarespace, pointed at Vercel.

- apex `A` record to `216.198.79.1`
- `www` `CNAME` to the project-specific Vercel target
- apex 308-redirects to www

## Local preview

Open `index.html` in a browser. There is no server to run and no step to build.
