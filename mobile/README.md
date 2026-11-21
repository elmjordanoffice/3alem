# Aalim mobile (عالم)

The candidate app: a week at a fictional company, one scene at a time, as a
vertical stack of cards you swipe up through. Expo SDK 58, React
Native 0.88 (New Architecture), expo-router, Reanimated 4 and Gesture Handler 3.
English and Arabic (full RTL), light and dark.

It talks only to the candidate API in the web app (`/api/m/:token`, see
`src/app/api/m/[token]/route.ts` and `src/lib/hire/candidate-actions.ts`). The
invitation token is the only credential.

## Run it

```bash
cd mobile
npm install
npx expo start            # then scan the QR code with Expo Go (iOS / Android)
npx expo start --web      # or in a browser
```

Start the backend first, from the repo root: `npm run build && AUTH_RATE_LIMIT=off npm run start -- -p 3400`.

On a phone, `localhost` is the phone itself: point the app at your computer's
LAN address, either with the env var below or from the server link at the
bottom of the welcome screen (it is remembered on the device).

Everything the app uses ships in Expo Go, so no custom native code is needed.
For a development build (needed for universal links and the app's own icon and
splash): `npx expo run:ios` or `npx expo run:android`, locally.

| Env var | Default | What it does |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3400` | API base URL, baked in at build time |
| `APP_LINK_HOST` | (unset) | Host for universal links, e.g. `aalim.example.com` (read by `app.config.ts`) |

Checks: `npx tsc --noEmit`, `npx expo-doctor`, `npx expo export --platform web`.

## Links

- `aalim://a/<token>` opens the invitation (custom scheme, works in dev builds).
- `https://<APP_LINK_HOST>/a/<token>`, the same path as the web invitation
  email, opens the app once the host serves the usual
  `apple-app-site-association` / `assetlinks.json` files.
- Or paste the link or bare code on the welcome screen. The token is kept in
  the Keychain / Keystore (expo-secure-store; AsyncStorage on web).

## Architecture

```
src/
  app/                 expo-router routes
    _layout.tsx        fonts, splash, providers (theme, locale, session, gestures)
    index.tsx          welcome: paste a link, or continue the saved one
    a/[token].tsx      deep / universal link → save token → /assessment
    assessment.tsx     the journey: one screen per server view, inside <Flow>
  api/                 client.ts (fetch, timeouts, errors, link parsing), types.ts
  state/
    session.tsx        token + API base URL
    assessment.ts      view state machine, the offline outbox and its retries
    drafts.ts          per-stage drafts on the device (same keys as the web)
    integrity.ts       context events for reviewers (paste-sized inserts, app backgrounded)
  deck/                the scene deck
    pager.tsx          native vertical pager, full-bleed or a card stack (Reanimated + Gesture Handler)
    pager.web.tsx      web pager (CSS scroll snapping; depth from scroll-driven animations)
    pager-context.ts   the pager's contract and the card geometry (radius, inset, peek)
    slide.tsx(.web)    one page; its own scroller, edge hand-off to the pager; card surface
    flow.tsx           screen-to-screen motion: the old one slides up, the next rises
    scene.tsx          builds a scene's cards, follow-ups, sealed answers, submit bar
    cover.tsx, art.tsx the situation card and its scene art (../src/lib/brand/scene-art.ts)
    chrome.tsx         floating top bar, chapter rail, page rail, quiet timer, next hint
    materials.tsx      email, memo (letterhead), table (sticky column), chart (react-native-svg)
    index-store.ts     the current page outside React state
  tasks/               one hook per task kind, returning its pages and its answer
    choice, ranking (+ allocation), written (+ design, follow-ups), inbox,
    sequence (chain, forced choice), roleplay, rank-list (drag to reorder)
  screens/             landing, briefing + world intro, chapter break, paused,
                       complete (+ recap, feedback, fairness), state screens, AI sheet
  ui/                  type scale, buttons, press feedback, sheet, brand mark, primitives,
                       motion (drawn check, entrances, burst, count-up)
  theme/               Range tokens (light/dark), fonts, reduced motion, larger text
  i18n/                translator over ../messages/*.json + mobile-only copy
```

### The deck

A scene is a list of pages: the situation, one page per material, then the
task's own pages (a choice and its "why", one page per forced-choice pair,
chain round, design section or inbox message, then the inbox's priority order
and replies). Each task is a hook (`src/tasks/*`) that returns its pages, its
answer (or `null` until complete) and a digest for later.

- **Cards.** Each page is a rounded card (radius 22) inset 12pt from the sides,
  under the floating bar; the next card peeks 20pt at the bottom. The situation
  is an ink card: the scene's art (`sceneArt(title)` from the web app's
  `src/lib/brand/scene-art.ts`, imported directly so both draw the same picture;
  Metro watches that folder), then the chapter, the title, the situation, the
  materials and the people it names. Materials are paper cards that look like
  the real thing (a mail app, letterhead, a spreadsheet with a sticky first
  column, a framed chart). Task cards open with a header band and a chip saying
  how to answer. Ink stays ink in dark mode (with a hairline); paper takes the
  dark surface.
- **Depth.** Every card is placed from the pager's one shared position on the
  UI thread: the card leaving upward sinks to 0.94, dims toward the canvas and
  drifts up 28pt under the next card, which grows from 0.95 to full size with
  its top edge fixed (so the peek never slips off screen). Dimming is an
  overlay, never transparency, so the card underneath never shows through. The
  web gets the same from CSS scroll-driven animations where the browser has
  them. Paging never re-renders the scene: the current page lives in a small
  store (`index-store.ts`) read only by the page rail and each card's
  screen-reader visibility; the situation and materials are memoised.
- **Swipe hint.** The first time a deck appears on a device, its first card
  lifts 12pt and settles, twice (stored under `aalim:deck:swipeHint`).
- **Reduced motion.** No scaling, dimming, nudge or art draw-in; cards move
  only under the finger, and a card reached by a tap simply fades in.

- **Gestures (native).** The pager's pan runs simultaneously with each page's
  native scroller (`useNativeGesture({ simultaneousWith: pan })`). Scroll
  offsets are tracked on the UI thread; the pager claims a drag only when the
  page is at its top edge (dragging down) or bottom edge (dragging up), then
  pins the scroller so only the pages move. Release projects the fling and
  settles one page at a time on a velocity-aware spring; touching a page
  mid-flight catches it. Horizontal drags (tables, sliders) fail the pager.
- **Gestures (web).** The browser's own scroll snapping (`scroll-snap-stop:
  always`); a page's scroller keeps the gesture until its edge, then the next
  gesture chains to the pager.
- **Gates.** A page that must be answered before the next can exist (a chain
  round, a forced-choice pair) hides everything after it.
- **Follow-ups.** When the server moves to PROBE or TWIST, the task folds into a
  sealed "Answer sent" page with a digest, and the follow-up arrives as a new
  page below; the deck springs to it.
- **Scenes.** A new item id is a new `<Flow>` key: the old scene slides up and
  away while the next rises, like the next video. Earlier scenes are gone;
  pulling down past the first page rubber-bands and says they are sealed.
- **Progress.** Chapters on the top rail (never a question count); pages down
  the trailing edge; a quiet, hideable timer only on timed tasks.

### Moments

Small rewards for moving through the story. They never touch the assessment:
no points, no scores, no streaks, no urgency, and the answer is already on the
server before any of them plays. All run on the UI thread (Reanimated), on
springs from `theme/tokens.ts`; under reduced motion each becomes a short fade
where nothing moves and nothing bursts.

- **Sent.** A freshly sealed "Answer sent" page settles its ink disc, draws its
  check and drops a vermilion dot into the trailing corner (~530 ms, never
  holding the deck's spring to the follow-up). When the answer leads out of the
  scene, the submit button draws the check instead as the scene slides away.
  The success haptic fires when the server accepts.
- **Inside a scene.** The first time the deck comes to rest on the task, the
  page dots ripple down to the current one. A chapter's last answer fills that
  chapter on the top rail; the chapter break rises after a 480 ms beat
  (`CHAPTER_BEAT` in `state/assessment.ts`).
- **Chapter break.** A "Day 1 done" stamp lands (light haptic), tilted toward
  the reading start; the rail fills to the new chapter; the next title rises;
  your decisions are dealt in one by one from the reading side. The stamp's day
  comes from the chapter title ("Day 1: …", "اليوم الأول: …"), else "Chapter N".
- **Finish.** The Narrowing's dot pops with a ring and a few particles (~1 s,
  success haptic); the recap counts up from 0 in tabular figures; the habits
  fade in one by one.

### Saving and sending

Drafts are written to the device as you type (debounced) under the web's keys
(`aalim:draft:<item>:<stage>`) and read into memory before a scene appears.
A submit writes the payload to `aalim:outbox:<token>` first, then sends it with
a fresh `clientId`; if the network fails it stays there and is retried with
backoff, on reconnect (NetInfo) and on return to the app, and is dropped once
the server has moved past it.

### Copy and types

UI strings come from the web app's `messages/en.json` and `messages/ar.json`
(the `candidate` and `components` namespaces), imported directly; Metro watches
`../messages` (see `metro.config.js`). Strings only the app needs live in
`src/i18n/mobile.ts`. `src/i18n/fallback.ts` holds shared copy newer than this
branch's messages (the complete screen's recap) and is consulted only when a
key is missing, so the shared files always win.

Item and response shapes are type-only imports from
`src/lib/assessment/{item-schema,response-schema,materials}.ts`; `CandidateView`
mirrors `src/lib/hire/candidate-state.ts` (server-only, so it can't be imported).

### RTL

Every screen sets `direction` on its root, so Arabic mirrors immediately;
`I18nManager` is updated too, so system surfaces agree from the next launch
(no forced reload mid-assessment). Layout uses logical `start`/`end`; tables,
numbers and the 1–5 rating stay left to right; charts run right to left as on
the web. On web, react-native-web resolves logical styles (`start`/`end`,
`marginStart`, `textAlign: "start"`) from a `dir` attribute rather than the
`direction` style, so the root view in `app/_layout.tsx` carries `dir` too.
Transforms are physical everywhere: a slide in from the reading start passes
a mirrored x in Arabic. Arabic reading text is at least 17pt with line height of at least 1.7,
and never letter-spaced.
