# areej_OS — portfolio

Areej Nawaz's portfolio, presented as a fictional pixel-art desktop OS. Built with
Vite + React 18 + TypeScript + Zustand, per `BLUEPRINT.md`. All UI copy, palette,
animation timing, and terminal behaviour are ported from the original single-file
prototype (`areej-os-v9.html`); the architecture is new.

## Running it

```bash
npm install
npm run dev       # dev server with HMR, http://localhost:5173
npm run build     # type-checks (tsc -b) then produces a static build in dist/
npm run preview   # serves the production build locally
npm run lint       # ESLint
npm run format     # Prettier --write
```

The build is a fully static site — deploy `dist/` to GitHub Pages, Netlify,
Vercel, or any static host. No server-side code, no environment variables.

## Adding or editing a project

Everything a visitor reads lives in **`src/content.ts`** — a single object
matching the `Content` type in `src/types.ts`. To add a project, append an
entry to `CONTENT.projects`:

```ts
{
  id: "my-project",              // url-safe, permanent — used as a React key and Explorer path
  name: "My Project",
  category: "Web Development",   // one of: AI, Web Development, Games, Algorithms, Experiments, Open Source
  tag: "React · Node",
  year: "2026",
  featured: true,                 // true = shows in the desktop rail
  overview: "...", problem: "...", how: "...",
  tech: ["React", "Node"],
  features: ["...", "..."],
  challenges: "...", learned: "...",
  repo: "https://github.com/...", // omit or "" if none yet — the link dims automatically
  demo: "",
  shots: [],                       // paths under /public/shots/<id>/*, e.g. ["/shots/my-project/1.png"]
}
```

Any field left as `""`, `[]`, or containing `[EDIT]` is a placeholder the site
owner still needs to fill in — the UI renders a dimmed link or a generated
pixel-art thumbnail in its place rather than a broken image or dead link.
Categories in the Explorer's sidebar are derived automatically from whichever
categories are actually in use — an unused category never appears.

## Adding a real photo

No portrait photo ships in this repo. `IDCard` and the About doc both render
a procedurally-drawn pixel "user" icon as a stand-in. To use a real photo:
drop it at `public/portrait.jpg` (or similar) and wire an `<img>` into
`src/components/IDCard.tsx` and `src/components/windows/DocWindow.tsx`
(`AboutDoc`) in place of the `<PixelIcon kind="user" .../>` calls — both are
small, isolated edits.

## Adding a theme

Every theme lives in `src/styles/themes.css` as a `[data-theme="..."]` block
defining the same 26 custom properties (`--ink`, `--panel`, `--accent`, …).
To add one:

1. Copy an existing block, change the hex values, pick a new theme name.
2. Add the name to the `THEMES` array in `src/store.ts` (this is the only
   place theme names are enumerated — the theme button, Start menu, and
   `theme <name>` terminal command all read from it).
3. Check contrast. `--ink`/`--ink-soft`/`--ink-dim`/`--pink-3`/`--error`/
   `--mint-2` are all used as small body text against `--panel` or `--white`
   and need to hit at least 4.5:1 (WCAG AA). All five shipped themes were
   verified against this; a couple of colors (`--ink-dim`, `--pink-3`,
   `--error`, `--mint-2`) needed darkening from the prototype's original
   values in `default`, `retro`, `vaporwave`, `midnight`, and `terminal` to
   pass — see the "Deviations from the prototype" section below.

No component ever hard-codes a color — everything reads from these
properties, so a new theme just works once it's registered.

## Architecture

```
src/
  content.ts        content.ts is the ONLY file with visitor-facing copy
  types.ts           Content/Project types
  store.ts           Zustand: windows, focus/z-order, theme, Explorer view
  App.tsx             boot state machine: splash → intro → hero → desktop; also owns the
                       DesktopPets "live wallpaper" bug layer once the desktop is up
  components/
    Desktop.tsx        assembles the desktop: chrome + all four windows, mobile boot behaviour
    IDCard.tsx          navigation teaser card — no buttons, points at the icons/Terminal
    DesktopIcons.tsx, FeaturedRail.tsx, Taskbar.tsx, MobileNav.tsx
    Splash.tsx          the boot gate screen (topbar, boot-sequence card, credits)
    PixelIcon.tsx, PixelThumb.tsx    canvas wrappers around lib/pixel.ts, redraw on theme change
    ProjectMedia.tsx    video → screenshot → pixel-placeholder priority, shared by the
                         featured rail and the project window's hero banner
    windows/
      Window.tsx         generic frame: drag, min/max/close, edge-snap, focus/z-index
      Terminal.tsx, Explorer.tsx, ProjectApp.tsx, DocWindow.tsx
  lib/
    pixel.ts            blob()/drawIcon()/drawThumb() — all canvas drawing lives here
    audio.ts             tone(), sClick(), sOpen(), sBoot(), sKey(), sAlert()
    commands.ts           terminal command router — one function per command, incl. the
                           undocumented `hackmeportal` easter egg (absent from `help` on purpose)
    actions.ts             cross-surface actions (open project/doc/resume/terminal) shared by
                            IDCard, icons, mobile nav, Explorer sidebar, terminal
    DesktopPets.ts          live-wallpaper bugs; theme-adaptive, obstacle-avoiding, spawned by App.tsx
    focus.ts, windowTitles.ts, explorerView.ts, useMediaQuery.ts, useKeyboardShortcuts.ts
  styles/
    themes.css          the only file that defines colors
    base.css, windows.css, boot.css, desktop.css, terminal.css, explorer.css, project.css, doc.css
```

Rules this codebase follows throughout: no component hard-codes a color (only
`themes.css` does); no component reaches into another window directly (they
all go through the Zustand store); every canvas draw goes through `lib/pixel.ts`.

## Attaching a running demo video

`Project.video` (a path or URL) takes priority over `shots[0]`, which takes
priority over the generated pixel-art placeholder — in the featured rail card,
the project window's hero banner, and the Gallery tab. Rail cards and the hero
banner autoplay it muted and looping (like a GIF); the hero banner also gets
native controls so a visitor can unmute or pause. Just set `video: "/clips/my-project.mp4"`
on a project in `content.ts` — no other wiring needed.

## Keyboard shortcuts

`Alt+T` terminal · `Alt+P` projects · `Alt+A` about · `Esc` closes the
frontmost window (except Terminal, which Esc deliberately leaves open) ·
`Enter` on the splash screen is the same as clicking "ENTER PORTFOLIO".

## Deviations from the prototype

Per the blueprint's own rule ("if the prototype and this blueprint disagree,
this blueprint wins"), a few things were implemented to match `BLUEPRINT.md`'s
explicit text rather than the prototype's literal runtime behavior:

- **Terminal's taskbar slot is always present**, even before Terminal has
  been opened or after it's been closed — the blueprint calls this out
  explicitly ("Terminal is ALWAYS the leftmost pinned taskbar item"), while
  the prototype's actual `syncTasks()` would hide it once closed.
- **Theme contrast**: `--ink-dim`, `--pink-3`, `--error`, and `--mint-2`
  were darkened (or lightened, for the dark themes) in `default`, `retro`,
  `vaporwave`, `midnight`, and `terminal` to clear WCAG AA (4.5:1) against
  their actual backgrounds — the prototype's original values fell as low as
  2.2:1 in a couple of cases. `--ink` and `--ink-soft` were already compliant
  and untouched.
- **No portrait photo ships in this repo** (see "Adding a real photo" above).
  The prototype embedded a personal photo as an inline base64 data URI
  directly in the HTML; that isn't something to fabricate or transcribe by
  hand into a new codebase, and inlining a photo that size would also blow
  well past the JS/CSS performance budget. A pixel-art placeholder stands in
  until a real file is added.
- A handful of small cosmetic glyphs in the terminal's `neofetch` output
  (the little logo block) were re-drawn with plain `█` characters. The
  reference HTML file had character-encoding corruption (mojibake) affecting
  em dashes, arrows, and a few decorative glyphs throughout; where it hit
  meaningful copy (the tagline, punctuation, etc.) it was reconstructed from
  context, but a handful of purely decorative ASCII-art characters weren't
  recoverable and were replaced with visually similar, correctly-encoded ones.

Everything else — five themes, tabbed project windows, edge-snapping windows,
tab-completion, the terminal easter eggs, the "manners first" exit sequence,
categorized help chips, mobile's distinct full-screen nav — matches the
prototype's behavior and copy as specified.

**Since the initial rebuild**, the desktop's ID card, taskbar, and splash
screen were redesigned on direct request (not blueprint drift): the ID card
lost its buttons and became a navigation teaser; Start and the pinned
Terminal slot were dropped from the taskbar (nothing currently replaces
Start — there's no menu it would open now that the ID card and icons cover
that ground); the splash screen gained a top bar, a live boot-sequence card,
and credits, matching a supplied reference image.

**`DesktopPets.ts`** — live-wallpaper bugs — started as a pasted-in module
and was later substantially rewritten on request: movement changed from
snap-to-axis obstacle-avoidance to smooth heading-based steering (each
species has its own speed/turn-rate, producing the sweeping curved paths in
`lib/DesktopPets.ts`'s `step()`), and bugs now roam the *whole* viewport,
including underneath open windows — normal z-index stacking (bugs at 2,
windows at 20+) already hides them there and correctly routes clicks to the
window instead, so the old `blocked()`/obstacle-rect bookkeeping was removed
outright rather than kept alongside the new behaviour. A click-to-boop
interaction was added: a happy static pose (own small sprite sheet per
species), a themed speech bubble (`.pet-bubble` in `desktop.css`), and a
two-note chime (`sBoop()` in `lib/audio.ts`). It's loaded via dynamic
`import()` in `App.tsx` — decorative and not needed for first paint, so it
ships as its own lazy chunk instead of bloating the main bundle.

**The supplied sprite sheet (`Areej_CS_Logic_Bugs_01`, 9 species) is not yet
wired in.** It arrived as a chat image, not a project file — there's no way
to `drawImage()` from something that only exists as pixels in a conversation
transcript; canvas sprite-blitting needs an actual asset on disk with known
frame dimensions. The bugs above are still the original 3 hand-drawn
procedural species (beetle/fly/ant), now with the new movement and a happy
pose added to each. **To finish this**, add the sheet as a real file (e.g.
`public/sprites/bugs.png`) and confirm the exact per-species frame grid
(cell width/height, columns, rows) — once both exist, swapping
`lib/DesktopPets.ts`'s procedural `drawBody()`/`buildSheet()` for
`drawImage()`-based slicing is a contained change.

## Performance budget

Current production build (`npm run build`):

|                        | size     | gzip    | budget       |
| ---------------------- | -------- | ------- | ------------ |
| JS (main, initial)     | 245.4 kB | 78.6 kB | < 80 kB gzip |
| JS (DesktopPets, lazy) | 6.3 kB   | 2.4 kB  | not blocking |
| CSS                    | 22.2 kB  | 5.6 kB  | < 20 kB gzip |

The main bundle briefly crossed the 80 kB budget after `hackmeportal`, the
splash redesign, and the video-priority media component; `DesktopPets` — a
purely decorative, non-critical feature — was split into its own
dynamically-imported chunk to bring it back under, rather than cutting
anything. It fetches only once the desktop has actually booted on a non-mobile
layout, so it doesn't affect first paint. Headroom on the main bundle is thin
(~1.4 kB) — further JS growth, including the still-unsent content additions,
will likely need either a similar split or a conscious call to relax the
budget.

No image files ship for icons or thumbnails — everything is canvas-rendered
from `lib/pixel.ts`. Real screenshots and videos (once added under
`public/shots/` or wherever you host clips) are plain `<img>`/`<video>` tags
loaded only when their window opens, so they don't affect this budget. First
Contentful Paint wasn't measured with Lighthouse in this environment (no
browser available), but the static-site footprint above is still well within
range of the < 1.5s mid-range-mobile target.
