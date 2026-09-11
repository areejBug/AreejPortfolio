# Suggestions (not implemented)

Per the build instructions, these are flagged rather than added unasked.

1. **Commit the contrast checker.** WCAG AA verification for all five themes
   was done with a throwaway Node script during this build (see the README's
   "Adding a theme" section for the specific pairs checked). If a sixth theme
   or a new small-text color gets added later, nothing will catch a
   regression automatically. Worth turning that script into a small
   `scripts/check-contrast.mjs` committed to the repo, run manually (or in
   CI) whenever `themes.css` changes.

2. **`robots.txt` / `sitemap.xml` / `humans.txt`.** Not part of the blueprint,
   but trivial to add and standard for a static portfolio site once it has a
   real deployed URL.

3. **A static pre-render fallback.** This is a client-rendered SPA — a
   visitor with JS disabled (or a crawler that doesn't execute JS) sees a
   blank page until React hydrates. Out of scope for this build, but worth
   knowing about if search visibility matters; a prerendering step
   (`vite-plugin-prerender` or similar) would fix it without changing the
   architecture.

4. **Optional privacy-respecting hit counter.** The blueprint explicitly
   scoped this as optional ("a single privacy-respecting hit counter, if
   any") and no analytics of any kind were added. Flagging that the door is
   open if the site owner wants basic traffic visibility later — e.g.
   Plausible or a simple self-hosted counter, not anything that tracks
   individuals.

None of the above block the current deliverable; the site is fully
functional and within budget without them.
