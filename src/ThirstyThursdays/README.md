# Thirsty Thursdays page: integration notes

A self-contained React + TypeScript page. Only `react` and `react-dom` are required.

## Use it

```tsx
import ThirstyThursdaysPage from './ThirstyThursdays';

<ThirstyThursdaysPage />
```

Copy this whole folder (`ThirstyThursdays/`) into the host app. It has no required props.

## What it assumes

- **Vite-style asset imports** (`import logo from './assets/logo.png'`). `vite/client` types must be in scope.
- **No router.** In-page navigation scrolls with `scrollIntoView` and never changes the URL, so it won't fight the host's routing.
- **All CSS is scoped** under `.tt-root` with a `tt-` prefix. Nothing targets `html`, `body`, or `:root`, and no web fonts are loaded: type inherits from the host.
- **Sticky nav.** If the host has its own fixed header, set `--tt-nav-top` (e.g. `--tt-nav-top: 64px`) on `.tt-root` or an ancestor.
- **DOM ids** are prefixed `tt-`.

## Content

Everything editable lives in `content.ts` (`defaultContent`). Any key can be overridden by prop, which is how it can later be fed from Firestore:

```tsx
<ThirstyThursdaysPage events={eventsFromFirestore} showImpact />
```

Props are shallow-merged over the defaults, so pass a whole `venue` or `contact` object, not part of one.

- **Events** are data-driven. Past dates drop off automatically. An event with no `organization` shows under "Future Events" as coming soon; adding an `organization` promotes it to a full card.
- **Tickets**: set `ticketUrl` (the Posh page) on an event. Until then, "Get Tickets" scrolls to the events list.
- **Flyers**: set `flyer: { src }` on an event. The next event's flyer shows in the hero under the date and buttons, and clicking it goes to the same place as Get Tickets. No `flyer`, no slot.
- **Our Impact** is hidden unless `showImpact` is true.
- **Contact form** posts to a Cloudflare Worker (`worker/` in the source repo, not part of this folder). The Worker checks the Cloudflare Turnstile token, then emails the message via Resend. The destination address is a Worker secret, so it never appears in the page. Configure with `form.endpoint` and `form.turnstileSiteKey`.
  - The Turnstile widget only works on hostnames registered for the site key, and the Worker only accepts requests from `ALLOWED_ORIGINS` (`worker/wrangler.jsonc`). **When the page moves to its final domain, add that domain in both places.**
  - The component loads `challenges.cloudflare.com/turnstile` itself. If the host site uses a Content-Security-Policy, allow that origin for `script-src`/`frame-src`, and the Worker URL for `connect-src`.
- Values in `[brackets]` are placeholders from the copy doc.
