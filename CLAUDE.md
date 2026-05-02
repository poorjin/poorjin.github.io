# Jin's Latent Space — blog repo

Custom static site (no framework). Posts are Markdown files in `posts/`; a shell
script (`build-index.sh`) parses their frontmatter into `posts/index.json`,
which the front-end (`article.js`, `archive.js`, etc.) reads at runtime. There
is no build step beyond running that script.

## Publishing a new post

When the user says something like "publish this as a new post" or "upload this
md file":

1. Place the file at `posts/<slug>.md`. The slug becomes the URL
   (`/article.html?slug=<slug>`), so use kebab-case and keep it short.
2. Add YAML frontmatter at the top of the file:
   ```yaml
   ---
   title: "Post title"
   lede: "One-sentence subtitle shown under the title."
   date: "Month D, YYYY"          # e.g. "May 2, 2026"
   dateShort: "Mon D"              # e.g. "May 2"
   featured: false                 # true to feature on the home page
   tags: ["tag1", "tag2"]
   ---
   ```
   - `title` is required — `build-index.sh` skips files without it.
   - Use today's date (available in your system context) unless the user says
     otherwise.
   - Only one post should be `featured: true` at a time; if a new one is
     featured, ask whether to un-feature the previous one.
3. Run `./build-index.sh` to refresh `posts/index.json`.
4. Verify by previewing `/article.html?slug=<slug>` — confirm title, lede,
   date, and body render. Check the homepage if `featured: true`, the archive
   page (`/archive.html`), and that no console errors appear.

## Updating an existing post

Posts are intended to be living documents — the user updates them as their
thinking evolves, and the site shows a "Last updated" stamp.

When the user says "bump the date", "update this post", or asks for a content
revision:

1. Edit the post's content as requested.
2. Stamp today's date into the frontmatter. Easiest path:
   ```sh
   ./bump-updated.sh <slug>
   ```
   This sets `updated` and `updatedShort` to today and reruns
   `build-index.sh`.
3. If you'd rather edit by hand (e.g. backdating, or adding the fields for the
   first time), add or change these two lines under `dateShort:`:
   ```yaml
   updated: "Month D, YYYY"
   updatedShort: "Mon D"
   ```
   Then run `./build-index.sh`.
4. The article header renders `Updated <date>` only when `updated !== date`,
   so it's safe to leave `updated` equal to `date` — nothing extra will show.
5. Do NOT touch `date` / `dateShort` when updating. Those are the original
   publish date and stay frozen forever.

## Date format conventions

- Long form (`date`, `updated`): `"February 28, 2026"` — full month, no
  leading zero on the day, four-digit year. This must parse via
  `new Date(...)` because `archive.js` uses it for year/month grouping.
- Short form (`dateShort`, `updatedShort`): `"Feb 28"` — three-letter month,
  no leading zero, no year.
- Always quote both fields. Never use ISO dates like `2026-02-28` — the
  templates render the strings verbatim.

## Common pitfalls

- After ANY frontmatter change, rerun `./build-index.sh`. The site reads
  `posts/index.json`, not the markdown directly.
- `build-index.sh` parses frontmatter line-by-line with `sed`/`awk`. Keep
  one field per line; don't use multi-line YAML values.
- Quotes in frontmatter values are stripped of one outer pair only — don't
  nest quotes.
- The dev server is plain `python3 -m http.server` and aggressively HTTP-
  caches `posts/index.json`. If a verify-in-browser step shows stale data,
  it's the browser cache, not the file. Hard-reload or fetch with
  `cache: 'reload'` to confirm.
- Files under `posts/` whose frontmatter lacks a `title` are silently
  skipped by `build-index.sh`. If a new post doesn't show up, check that.

## Tone of voice (when drafting or editing posts on the user's behalf)

The blog's voice is reflective, low-ceremony, and personal — not corporate
or listicle-style. Plain English, short paragraphs, occasional sidenotes
(`[^n]` syntax — they float into the right gutter on wide screens). Don't
add headings, bullet lists, or emoji unless the source draft already uses
them. Match the existing demo post's register if unsure.
