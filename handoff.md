# Handoff Notes

Per-component annotations (token → CSS value → intended Gluestack prop) plus
every place this pass guessed at something the Figma file didn't show.
Read alongside `components.md` (what each thing *is*) and `tokens.css`/
`tokens.json` (provenance-tagged values).

## How to read this file
Everything under **"Flagged — not guessed silently"** is exactly what the
brief asked for: places where the design was ambiguous or incomplete, called
out instead of quietly invented. Confirm these with design before a dev
builds against them as if they were spec.

---

# Home / Dashboard

## Component annotations

### Header greeting
- `--text-xl-size` (20px) / `--font-weight-semibold` / `--color-primary-500` → `Heading size="xl"` (or `Text` if Gluestack's `Heading` scale doesn't have a matching step — check against the real config).
- The "Juan" run is a *separate* style: `--text-md-size` (16px) in `--color-secondary-300`. In Figma this is two spans in one text layer, not a template string — build it as two `Text` children, not string interpolation into one node, so each can carry its own color/weight.

### Notification icon button + badge
- Button: 48×48px circle, `--radius-full`, icon 26×26px, `--color-primary-900` icon tint (via the icon's own `--stroke-0` custom property, not a CSS `color`/`fill` on the wrapper).
- Badge: 16×16px min, `--radius-full`, `--color-error-500` background, white text, `12px`/`bold`.
- **⚠️ Off-system as found**: in Figma this badge is bound to `New palette/Default/Primary/Primary1` (`#e60000`) and set in `Vodafone Rg Bold`, not Poppins — tokens/typeface that don't exist anywhere else in this file. Reads like a pasted-in instance from a different library rather than this app's own `Badge`. **Recommend**: rebuild on a real Gluestack `error` token once one exists in the actual config, and confirm the font is intentional before shipping — as built here it silently falls back to `--font-family-base` (Poppins), which will look different from the Figma comp.

### Avatars
- Header avatar → `Avatar` + `AvatarFallbackText` ("JM" baked into the exported SVG as vector paths, not real text — a dev will need to regenerate this from actual initials logic, it isn't editable content here).
- Student row avatar, photo variant (Lucía) → `Avatar` + `AvatarImage`.
- Student row avatar, initials variant (Daniel, "DM") → `Avatar` + `AvatarFallbackText`, `--color-primary-500` background.
- All avatars: 48×48px (`--space-12`), `--radius-full`.

### Student card
- Container: `--color-background-surface` (#fbfbfb) fill, `1px` `--color-border-50` border, `--radius-xl` (12px) corners, `--shadow-hard-5`.
- **⚠️ Token overlap**: the 12px corner radius is not its own Figma variable — the source file literally reuses the spacing token (`space.3`) for it. Kept as-is here (`--radius-xl` == `--space-3` in value) but flagging so the real Gluestack `config.ts` doesn't accidentally hard-couple `radius.xl` to `space[3]` going forward.
- Student name: `heading-sm` style (16px/700/0.2px tracking) — **not** the same as `text-semibold-md` even though both are 16px. Don't merge these two type styles.
- School/grade sub-label: `--text-sm-size` in `--color-primary-500` at `--opacity-50`. The 50% opacity is a raw layer value in Figma, not a named token — call it out to design as a candidate for a real `opacity.50` step if it's used elsewhere.

### Service row (Desayuno / Comida)
- Closed state exactly matches Figma: icon 30×30px, `--text-xs-size`/`bold` label in `--color-primary-500`, `--text-sm-size` value text, chevron rotated -90° (`icon-chevron.svg`).
- **Expanded state** pulls from Figma node `14790:18207` ("Main_nav_bottom_Button Group"): a 4-item quick-link row — Menús, Asistencia, Autorizados, Chat — on a `--color-secondary-0` background that caps the card's own bottom corners (`--radius-xl`). It reuses the exact same "Button-outline" component as the bottom tab bar (59×57px, 30×30px icon, 10px Poppins Regular label), just laid out inline with a `17px` gap instead of pinned to the screen edge. That 17px value, and the `4px 10px` gap/padding split on the real bottom nav bar (corrected in this pass — it was previously built with even flex-stretched items instead of Figma's fixed 59px-wide buttons), are one-off values with no named token behind them.
- "Autorizados" isn't one of the 5 bottom-nav tabs — it has no screen yet, so its quicklink lands on the shared placeholder without lighting up any tab (same pattern as the header avatar → profile). Menús/Asistencia/Chat quicklinks switch the actual bottom-nav tab, matching what a user would expect.
- Built on the `Accordion` pattern (closest Gluestack primitive). Only the chevron is the toggle's hit area (a 32×32px button around it, per touch-target guidelines) — the rest of the row (icon, label, time) is static, non-interactive content.
- The chevron icon itself is rendered at 8×14px, 2× its native 6×10.5 Figma export size, keeping the same aspect ratio — sized up for legibility since the raw export size reads as barely visible at 1×.

### Bottom navigation bar
- Container: 347×75px, floating, `--color-typography-white` fill, `--radius-pill` (80px — a one-off value, not on the formal radius scale), `--shadow-hard-5`.
- Item label: `--text-2xs-size` (10px), weight jumps from `regular` (400) to `extrabold` (800) on the active tab; active tab's icon and label both recolor to `--color-secondary-500` via the icon's `--stroke-0` custom property.
- **No Gluestack primitive for this** — Gluestack v5 doesn't ship a tab bar (RN apps normally get this from React Navigation, themed to match). Built from scratch here; flagged in `components.md` too.
- **⚠️ Scope note**: only "Inicio" has a real screen. Menús / Asistencia / Chat / Gestión are wired for navigation (tapping them does switch the active tab and view) but render a shared placeholder, since none of those screens have been pulled from Figma yet. Not a design ambiguity — just explicitly out of scope for this pass per your answer to the scope question.

### Institution logo footer
- Sits behind the bottom nav, `--opacity-36` (a raw one-off value, no named token), `--color-background-surface` backing.
- **⚠️** Only appears on the Home frame in the file provided — unconfirmed whether it should persist across every screen (built here as persistent app-shell chrome, on the assumption it's a global watermark rather than Home-specific branding). Confirm with design.

### Status bar (9:41, signal/wifi/battery)
- Pure prototype device-frame decoration so the HTML reads as a phone screen in a browser. **Not a component** — the real RN app gets this from the OS. Don't build it.

---

## Interaction states covered in this pass
- **Hover / active(press)**: icon button, avatar buttons, service rows, nav items (including the quicklink row) — all use token-driven color shifts (`--color-secondary-0`/`--color-secondary-50`) since Figma only shows the default state for each (no hover/press variants exist in a Figma file for a touch-first RN app, which is expected — these are informed guesses at reasonable RN `Pressable` press-state opacity/color, not pulled from any comp).
- **Expand/collapse**: service accordion, per-row, independent state.
- **Tab switching**: bottom nav, single active tab, view swapped via JS template cloning (no page reload).
- **Modal**: notifications sheet (bottom sheet), open on bell tap, closes on backdrop click or Escape.

## Explicitly not built (out of scope this pass)
- Asistencia, Chat, Gestión, Autorizados screens — placeholders only, per scope. Menús now has a real screen (`screens/menu-semanal.html`) and no longer renders the placeholder — see its own section below.
- Form validation states — no forms exist on the Home/Dashboard screen.
- Any state for "service already confirmed" or for the quicklink buttons actually doing something on their target screens — those screens aren't all built yet, so some quicklinks navigate but land on placeholders.

## Assets
All icons/avatars/logo in `/assets` are the **real exported assets from Figma** (downloaded while the file's temporary asset URLs were live), not placeholders — except the notifications sheet content, which has no Figma source at all (see flag above). One icon (`icon-food.svg`, the COMIDA fork/knife glyph) had a corrupted path command in Figma's own SVG export (`Cnan nan`, invalid curve coordinates) — patched with plausible control-point values to render correctly; visually a sub-pixel curve on the icon, unlikely to be noticeable, but flagging the source-of-truth discrepancy.

---

# Menú Semanal

Figma node `14756:9701`. Lives at `screens/menu-semanal.html` — a standalone
HTML document (own `<head>`, own font imports, own copy of the device chrome
and bottom nav), not a template inside index.html's SPA. Reached from Home
via the bottom-nav "Menús" tab or any "Menús" quicklink, both of which now do
a real page navigation instead of rendering the old internal placeholder.

## Why a standalone file instead of another SPA template
The brief's suggested structure explicitly allows either "one HTML file per
screen" or a single JS view-switcher. Home used the latter; this screen uses
the former, because it's reached by an actual navigation (not a same-screen
tab switch) and needed its own `<head>` (three font families now, see below)
— forcing every screen through one shared SPA shell would mean loading fonts
for every screen on every screen. Both patterns share `tokens.css` and
`styles.css`, so styling stays consistent either way.

## Component annotations

### Screen header
- Back chevron → `secondary500`, rendered via an SVG **mask** technique in Figma's own export (the visible color comes from a `<rect>` behind a path-shaped mask, not the path's own fill) — reproduced as-is via `icon-back-chevron.svg`, no simplification needed, it just works via `<img>`.
- Title: `Heading` size `xl` (20px/700/0.2px tracking), `secondary500`, absolutely centered independent of the two icon buttons — not a 3-column flex split. If the real component library centers titles differently (e.g. flex-basis balancing), confirm which approach matches actual header-bar behavior when the title is long enough to risk colliding with the icons.
- Help icon → `secondary500`, 24×24px. Now the popover trigger (see below).
- **Sticky on scroll** — Figma's frame (1074px tall) is taller than the device viewport (844px), so this screen scrolls and Figma's static comp doesn't show what happens to the header when it does. Assumption: header stays pinned to the top (`position: sticky`). Flag if the intended behavior is for it to scroll away with the rest of the content. This also turned out to matter for the popover: it's nested inside `.screen-header` and absolutely positioned against it (`position: sticky` establishes a containing block for absolutely-positioned descendants same as `relative` would), so it stays anchored to the help icon regardless of scroll position.

### Popover ("Alimentación saludable", Figma node `14792:21042`)
- Approximates Gluestack v5's `Popover`/`PopoverContent`/`PopoverArrow`/`PopoverBody`. Structure: `.popover` (position/animation wrapper) → `.popover__arrow` (14px square rotated 45°, tucked half-behind the card) → `.popover__card` (`typography0` white, `radius-lg`/8px — a newly-**confirmed** token this pass, was previously an assumed placeholder) → title (`heading-sm` style, reused from Home) → body (plain text + `<br>` line breaks, not a styled list, per spec and per Figma — it's literally one `<p>` with manual breaks) → "Entendido!" button (`primary500` fill, `radius-sm`/4px, also newly-confirmed).
- **No backdrop**, per your spec — implemented via a capture-phase `document` click listener that closes the popover when the click target is outside both the popover and the help button, rather than a visible dimming overlay like the notifications sheet on Home uses. Content behind stays fully visible and interactive.
- **Animation**: opacity 0→1 + `scale(0.95)→scale(1)`, 200ms ease-out, via a `.popover--open` class toggle rather than relying on `hidden`/`[hidden]` alone (the same specificity issue flagged earlier in this doc — `.popover[hidden]{display:none}` is declared to beat `.popover{display:flex}`). Closing removes the class immediately (so the fade-out plays) and defers `hidden = true` by a `setTimeout(200)` so the element stays in the layout for the duration of the exit transition instead of vanishing instantly.
- Figma positions the arrow via `align-items: flex-end` + a fixed right margin, landing it roughly under the help icon rather than through precise measurement against the icon's actual DOM position (no floating-point anchoring library like Floating UI is in use here — this is a fixed-position approximation appropriate for a single fixed-width mobile frame, not a responsive popover). If this component needs to work at other viewport widths, real anchor-positioning logic would be needed.
- Arrow is a plain rotated CSS square (matching the card's own background/shadow), not the flattened `Arrow` image Figma exports — same reasoning as the pagination dots on this screen: a real shape stays token-driven and themeable, a raster/vector image doesn't.

### Profile card
- `backgroundCard` (`#ffffff`, "Background/background0") — **not** the same white as Home's student cards (`backgroundSurface`, `#fbfbfb`, "background - light"). Both confirmed via named Figma variables, genuinely two different tokens. Flagged for reconciliation — two near-identical "card white" tokens is very likely unintentional drift, not a deliberate two-surface system.
- Name: `text-bold-sm` (14px/700/0.2px tracking) in `primary500` — yet another distinct type style from `heading-sm` (16px/700/0.2px) used for student names on Home. Same weight/tracking, different size; don't assume these two are interchangeable.
- Chevron-right: `neutral600` (`#747474`, "Background/background600"). Figma applies a `scaleY(-1) rotate(180deg)` double-transform to arrive at this orientation from a shared base chevron asset; reproduced here more simply by using the icon at its native orientation (visually identical result, confirmed against the screenshot) rather than replicating the double-transform.

### Pagination dots
Figma exports this as one flattened raster/vector image (`Indicators`), which isn't token-driven or stateful. Rebuilt as two plain CSS dots instead — matches the token system's spirit even though it isn't a literal 1:1 layer reproduction. Non-interactive in this pass (see "Explicitly not built" below).

### Segmented toggle (DESAYUNO / COMIDA)
- Track: `secondary100` (`#aec0ea`), fully rounded (`radius-full`) — Figma's literal radius value (34px) exceeds what's needed for a full pill at this height anyway, so no separate one-off token was added for it.
- Inactive segment: no separate fill (track color shows through), text `secondary0` (`#e8edf9`) — a deliberately low-contrast "muted" look against the track.
- Active segment: white (`backgroundCard`) pill, `secondary500` text, `hardShadow5`. Default active = **COMIDA**, per your spec (also what Figma shows).
- Gap between the two segments is a literal `38px` in Figma with no matching step on the space scale — kept as an exact one-off rather than rounded to the nearest token.

### Day selector
- Container: white, `radius-2xl` (16px), a **distinct, lighter shadow** (`--shadow-soft`, `0px 1px 2px rgba(0,0,0,0.05)`) from the `hardShadow5` used everywhere else — not a named Figma token, just what's on that one layer.
- **Off-system font**: weekday letter + date number use **Hanken Grotesk**, not Poppins. This is the *third* distinct font family across two screens (Poppins base, Roboto for the emoji + CTA button, now Hanken Grotesk here) with no stated rationale for any of the departures. Worth a design-system conversation before more screens multiply the list further.
- Active day: `secondary500` fill, a one-off drop shadow (Figma's own "Button:shadow" layer, distinct from both named shadow tokens), white text. The weekday letter specifically sits at Figma's literal `opacity: 0.8` — not on our `--opacity-*` scale (which only has 0/20/36/50 so far), added as a bare CSS value rather than force-fitting an existing step.

### Date heading ("Jueves, 18 de Junio")
Poppins Semibold 18px — a font-size with no named Figma variable behind it at all (the named styles jump from `Heading/xs` 14px to `Heading/lg` 20px with nothing at 18). Text is **center-aligned** per Figma's actual layer (`text-align: center`); your written spec described it as left-aligned. Built centered, trusting Figma as the more authoritative source — flag if that's backwards and the spec was actually right.

### Meal/dish cards (Primer Plato / Segundo Plato / Postre / Sugerencia)
- Numbered badge: Figma's actual asset is a repurposed "rewind 10 seconds" icon (a ring + small accent mark, originally meant for a media-player control) with the digit typed on top as real text — an odd reuse, seemingly grabbed just for its circular ring shape. **Simplified here** to a plain 30×30px circle with a `1.5px` `secondary500` border and the number as text — visually equivalent to the Figma comp per the screenshot, without importing an unrelated icon asset for its shape alone. Flagging as a deliberate simplification, not a missed detail.
- Dish name color (`#111827`) has no named Figma variable and doesn't match `text900` (`#262627`) either — kept as its own flagged raw token rather than silently coerced to the nearest existing one.
- **Now driven by mock data** (`menuData` in `menu-semanal.js`, provided by you): keyed by ISO date, each with a `comida` object (`primerPlato`/`segundoPlato`/`postre`) and a `desayuno` object (`suggestion`). The three-card COMIDA layout and single-card DESAYUNO layout are both built via `renderMealContent()`, which re-renders on every day-selector click and every toggle click, reading the currently-active date + meal type. The DESAYUNO card reuses `icon-breakfast.svg` (already in `/assets` from Home) in place of the numbered badge, with label "SUGERENCIA" — no separate coffee/sun icon was fetched since the existing breakfast cup icon already fits and keeps the asset set smaller. Markup for `#meal-content` is intentionally empty in the HTML — it's fully owned by JS now, so there's exactly one source of truth for its content instead of static HTML that JS would otherwise have to overwrite on load.

### "Menú Celiacos" allergen card — static placeholder
- Background (`#fff9e9`) and heading text color (`#e1a504`) both have no named Figma variable — flagged raw tokens.
- Chip background (`tertiary50`, `#f1e1b7`) and checkmark icon (`tertiary500`, `#ddb54a`) **are** named tokens, unlike the card chrome around them.
- Chip labels read **"Pescado", "Vegetariano", "Sin gluten", "Pescado"** — "Pescado" appears twice in the source Figma file itself (not a transcription error on this end). Reproduced exactly as Figma shows it; very likely a content mistake in the original design (probably meant to be a 4th distinct allergen) rather than intentional duplication — flag to design rather than silently "fixing" it to a guessed 4th value.
- **Not date/toggle-dependent** — per your instruction, left static regardless of selected day or DESAYUNO/COMIDA state, pending real logic (e.g. per-day allergen data, or per-meal-type visibility) in a future pass.

### "Consultar informe" button
Figma's fill is a redundant double `linear-gradient` (a flat `secondary500` layered over an unrelated black gradient that's fully obscured) — almost certainly a Figma export artifact from how the layer's fill history was authored, not an intentional two-layer effect. Simplified to a solid `secondary500` background here, which renders identically. Label font is Roboto SemiBold 18px (`--font-family-alt`, `Text-semibold/lg` token) — same off-system font as the Home screen's emoji run, now renamed from `--font-family-emoji-fallback` to `--font-family-alt` since it has a second real use. **Now a real link** (`<a class="button-cta">`, same visual styling) to `menu-semanal-report.html` — the "Menú Celiacos" card is still a static placeholder, but this button does its one real job now.

### Bottom nav
Same component as Home's, "Menús" now active. **Rebuilt with inline `<svg>` icons instead of `<img src=".svg">`** — a real technical fix, not just a style choice: an `<img>`-loaded SVG is an isolated resource that cannot be recolored by the host page's CSS custom properties, no matter what `var(--stroke-0, ...)` the SVG file itself declares internally. Home's nav icons only ever looked "correctly colored" because each icon file happened to have the right color baked in for that one screen's context (Inicio active, everything else inactive) — that fragile coincidence breaks the moment the same bottom nav needs a *different* tab active, which is exactly what happens here. Inlining the icons as real `<svg>` markup with `stroke="currentColor"`/`fill="currentColor"` lets them inherit `color` from `.nav-item` / `.nav-item[aria-current="page"]` properly. **Recommend retrofitting Home's nav icons the same way** for consistency — not done in this pass to avoid touching a screen that wasn't part of this request, but flagged clearly since it's a real latent bug, not a nitpick.

## Interaction states covered in this pass
- **Segmented toggle switching** (DESAYUNO ↔ COMIDA, single-select) — now also re-renders `#meal-content` for the newly-active meal type.
- **Day selector click states** (single-select across the 5 days) — updates the date heading text and re-renders `#meal-content` from `menuData` for the newly-active date, respecting whichever meal type is currently toggled.
- **Bottom tab bar active states** (shared pattern with Home, real cross-document navigation for Menús/Inicio, hash-based deep link for Asistencia/Chat/Gestión back on the SPA).
- **Help icon popover**: click to open/close, "Entendido!" button closes it, clicking anywhere outside closes it (no backdrop), Escape closes it. Fade + scale transition on both open and close.
- Back-chevron navigates to Home but isn't otherwise interactive.

## Explicitly not built (out of scope this pass)
- Profile card tap / pagination dot tap (presumably switches between Lucía/Daniel) — no interaction spec given yet, left static.
- "Menú Celiacos" card — explicitly kept static/non-functional per your instruction, pending real logic. ("Consultar informe" is no longer in this list — it now links to `menu-semanal-report.html`.)

---

## Refactor: shared chrome extracted into `screens/menu-shared.js`

When the report screen was added, you asked for the header, profile card,
toggle, day selector, and bottom nav to be reused rather than rebuilt —
this section explains how, since "shared partial" doesn't have an obvious
answer in a no-build-step static HTML project.

**Why not `fetch()`-based HTML partials.** The natural instinct for sharing
markup across static pages is to fetch a `.html` fragment and inject it.
That breaks the brief's "should run by just opening the files" requirement:
`fetch()` of a local file is blocked by the browser under the `file://`
protocol (CORS), so it only works when served over HTTP — fine for the dev
server this prototype has been verified against, silently broken for anyone
who double-clicks `menu-semanal.html` from Finder/Explorer.

**What was built instead**: `menu-shared.js` exports one function,
`mountMenuChrome(options)`, which builds the header (+ popover), profile
card, toggle, day selector, date heading, and bottom nav via template
strings assigned through `innerHTML`, wires all of their shared
interactions (toggle switching, day selection, popover open/close), and
returns an empty `#screen-content` element for the calling screen to fill
with whatever's actually different about it. This is plain DOM
construction — no fetch, no build step, works identically whether the file
is opened directly or served. Both `menu-semanal.js` and
`menu-semanal-report.js` now call the same function with different
`backHref`/`activeTab`/`onMealChange`/`onDayChange` arguments; there is
exactly one copy of the shared markup and its behavior to maintain.

**What's still duplicated on purpose**: the outer device-frame/status-bar
markup in each screen's `<body>`, and the `<head>` (font imports,
stylesheet links). Both are inert boilerplate with zero interactivity or
data-binding — extracting them would add indirection without removing any
real risk of drift, unlike the five components that actually had
behavior and content to keep in sync.

**Using `innerHTML` for the shared chrome, `createElement` for
data-driven cards.** `mountMenuChrome()`'s template strings only ever
interpolate fixed, developer-authored config (a `backHref` string, day
names from a constant array) — never anything resembling user input, so
`innerHTML` is safe and far more readable than the equivalent
`createElement` chains would be for this much static structure. The
per-screen dish cards, by contrast, are built with `createElement` +
`textContent` (not `innerHTML` string interpolation) precisely because
they render values coming from a data object — `textContent` can't be
tricked into parsing markup, `innerHTML` interpolation could be if that
data object ever stopped being fully trusted, hardcoded mock content.

**Nav icon set now lives in one place.** `NAV_ICON_SVG` in
`menu-shared.js` is the single canonical copy of the 5 inline nav-icon
paths (previously duplicated verbatim inside `menu-semanal.html`). Home's
`index.html` still has its own separate copy (`<img src=".svg">`-based,
per the earlier flag about that being unable to recolor via CSS) — not
touched in this pass, still flagged as a good candidate for the same
`currentColor` treatment.

---

# Menú Semanal — Informe (report screen)

`screens/menu-semanal-report.html`. **No Figma source exists for this
screen at all** — built entirely from the screenshot you attached and the
written spec in your message, not pulled from the Figma file. Treat
everything below as this pass's best-effort interpretation, not something
verified against a source of truth the way the other two screens were.

## Reused via shared chrome
Header (+ popover), profile card, DESAYUNO/COMIDA toggle, day selector,
bottom nav ("Menús" active) — identical to `menu-semanal.html`, see the
refactor section above. One behavioral difference: **the back chevron
returns to `menu-semanal.html`**, not `../index.html` — this screen is one
level deeper in the flow (Home → Menú Semanal → Consultar informe →
Informe), so "back" should undo the most recent navigation, not skip past
it to Home. Flag if the intended back target is actually Home.

## Mood icons
- Three new tokens: `--color-mood-happy` (`#4caf6e`), `--color-mood-neutral` (aliases the existing `--color-tertiary-500`, `#ddb54a`, rather than adding a near-duplicate amber), `--color-mood-sad` (`#8c3a5c`). The happy/sad values are **invented** — matched by eye to your reference screenshot, not sourced from any design file. Confirm with design before treating these as final.
- Face icons (simple eyes + curved mouth, smile/flat-line/frown) are inline SVG built by `moodIconSvg(mood)` in `menu-semanal-report.js`, using `currentColor` so they pick up white from `.dish-card__mood`'s `color` — same reasoning as the bottom-nav icons on the base screen (an `<img src=".svg">` couldn't be recolored this way).
- Per your instruction, mood only applies to the three COMIDA dish cards (Primer Plato / Segundo Plato / Postre). The DESAYUNO single-card view reuses the exact same layout as the base screen's desayuno card, with no mood — your spec's `reportData[date][dish].mood` path only ever named the three comida dishes, so this was read as intentional rather than an oversight to "fix" by inventing a desayuno mood too. Flag if desayuno should have one.
- Layout: `.dish-card__text` now has `flex: 1` (previously unconstrained) so it grows to fill the available width and pushes the new `.dish-card__mood` circle to the card's right edge — a small change to the shared `.dish-card` styling, but it doesn't affect the base screen since that screen never has a third element in the card.

## Observaciones card
Replaces "Menú Celiacos" entirely on this screen (not a toggle/variant of it — a different card). Plain `--color-border-50` background (the same light-gray token already used elsewhere, no new token needed), bold heading, body paragraph. **Driven by `reportData[date].observaciones`** — per the literal path you gave (`reportData[date].observaciones`, not nested under `comida`/`desayuno`), this is **day-level, not meal-level**: switching the DESAYUNO/COMIDA toggle does not change the observation text, only switching days does. This resolved what would otherwise have been an ambiguity (does a monitor's note about a child's day depend on which meal you're currently viewing?) directly from the data shape you specified, so it wasn't a guess.

## reportData mock content
Dish names for COMIDA reuse the exact same text as `menuData` in
`menu-semanal.js` (on the assumption the report describes the same served
menu, just annotated with mood + notes) — moods and `observaciones` text
for all 5 days are entirely invented for this pass, written to loosely
narrate the mood pattern for each day (e.g. Jueves 18 — happy/neutral/sad —
"ha comido bien la crema de calabacín, algo más despacio con la merluza, y
apenas ha probado el postre") rather than being random. All 5 weekdays
have complete mock data, matching how `menuData` was structured.

## Removed from this screen (per your instruction)
- "Consultar informe" button — this screen *is* the informe, so there's nothing further for it to link to.
- "Menú Celiacos" card — replaced by "Observaciones," not present in any form here.

## Interaction states
Same three shared behaviors as the base screen (segmented toggle, day
selector, bottom nav / popover), now driving `reportData` instead of
`menuData` and additionally re-rendering the Observaciones text on day
change. Profile card / pagination dots remain static, same as the base
screen — no interaction spec for those yet on either screen.

---

# Asistencia FAB + tray (global overlay, `asistencia-tray.js`)

A floating action button docked into the bottom nav's Asistencia slot,
opening a bottom-sheet "actionsheet" tray over whatever screen is
currently active. One plain script (project root, not per-screen), loaded
on every screen, self-initializing.

## Why one global script instead of per-screen wiring
The brief for this component was explicit that it must "overlay whatever
screen is active" — Home's SPA and every `screens/*.html` document. Rather
than duplicate the FAB+tray markup and open/close logic per screen (the
exact problem the `menu-shared.js` extraction solved for the Menú Semanal
family), `asistencia-tray.js` is a single script that:
- Resolves its own `assets/` path via `new URL('assets/', document.currentScript.src)`, so it works whether the including page is at the project root (`index.html`) or one level down (`screens/*.html`) — no per-screen path config needed.
- Finds `.device-frame` and `.bottom-nav` on whatever page included it and injects the FAB + backdrop + tray into them directly.
- Exposes `window.openAsistenciaTray()` / `window.closeAsistenciaTray()` as the integration point, rather than wiring every possible trigger itself. Both `main.js` (the bottom-nav click delegate *and* the service-row quicklink handler, since a quicklink can also target "asistencia") and `menu-shared.js` (the Asistencia nav item) call these by name at click time — a lazy lookup, so it doesn't matter that those wiring calls happen before `asistencia-tray.js` has necessarily finished loading, only that the function exists by the time a real user click occurs.

## A real ordering bug this caught
On `screens/*.html`, `.bottom-nav` doesn't exist in the static markup — `menu-shared.js`'s `mountMenuChrome()` builds it at runtime. `asistencia-tray.js`'s init runs once, immediately, looking for `.bottom-nav`; if it ran *before* `mountMenuChrome()`, it would silently find nothing and never inject the FAB (its guard clause exits quietly rather than erroring, which would have made this a silent failure, not a crash). Fixed by loading `asistencia-tray.js` **last** on those two screens (after `menu-shared.js` and the screen's own script, which calls `mountMenuChrome()` synchronously) — order-dependent in a way `index.html` isn't, since Home's bottom nav is static HTML present from parse time. Documented with an inline comment at each `<script>` tag rather than left implicit.

## FAB (trigger)
- 59×61px, `--color-primary-300` (`#565f81`, confirmed via this pull — not previously in the token set), `border-radius: 80px` (exceeds half of either dimension, reads as a full circle/pill despite the non-square box), a one-off shadow (`0px 2px 5px rgba(38,38,38,0.1)` — lighter blur than `--shadow-hard-5`'s 10px, not the same token, not worth promoting to a named token for a single use).
- Positioned `top: -18px` inside `.bottom-nav` (which is already `position: absolute`, so no extra positioning context needed), centered horizontally — lands directly over the Asistencia slot without needing to know that slot's exact coordinates, since Asistencia is the middle item of 5 and the whole nav bar is itself centered on screen.
- Icon: calendar, inlined as `<svg>` with `currentColor` (not `<img src=".svg">`) so it can render white via `.asistencia-fab { color: white }` — same reasoning flagged repeatedly elsewhere in this doc for icons that need programmatic recoloring.
- Press state: `scale(0.96)` + `opacity: 0.7` on `:active`, 100ms ease-out, per spec.

## Asistencia nav item now has no icon of its own
Its `.nav-item__icon` is an empty spacer `<span>` (not removed entirely) — removing it outright would let the label vertically re-center in the 57px-tall item instead of sitting where its siblings' labels sit (below a 26px icon+gap). The spacer preserves that layout math without special-casing this one item's flexbox alignment. Same treatment applied identically in `index.html` and `menu-shared.js`'s `bottomNavHtml()`.

## Tray
- Backdrop: `--color-primary-500` at 80% opacity, fades in/out over 300ms, dismisses on click (checked via `event.target === backdrop`, so clicks that land on the tray itself — a sibling element, not a backdrop descendant — don't bubble into a false-positive close).
- Tray: white (`--color-background-card`), `--radius-xl` on the top two corners only, `--shadow-hard-5`, slides up via `transform: translateY(100%) → translateY(0)` over 300ms ease-out, with an opacity fade layered on top of the slide (0→1) rather than a pure slide with no fade at all.
- **Spec had two different animation descriptions for this component** — the TRAY section said "slides up… ~300ms ease-out, backdrop fades in simultaneously," while the separate INTERACTIONS section said "fade + scale (~200ms ease-out) — approximating Gluestack's Reanimated transition" (language that appears to have been reused from the earlier Menú Semanal popover spec, which *is* a scale-based component). Built as **slide + fade, 300ms**, since that's the more specific, tray-appropriate description and matches how actionsheet/bottom-sheet components conventionally animate (a centered popover scales, an edge-anchored sheet slides). Flag if a scale transform was actually intended here too.
- Swipe-down to close: implemented as a simple threshold check (`touchend` Y-delta > 60px triggers close), not a live finger-following drag — the tray doesn't visually track the gesture mid-swipe. A reasonable simplification for a static-file prototype; a production build would want the sheet to follow the touch position in real time (e.g., via `touchmove`) with a spring-back if released before the threshold.
- Escape key closes it (desktop-testing convenience — the spec didn't ask for this but it's free with the existing keydown-listener pattern used elsewhere in this project).

## Option rows (Asistencia / Renuncia)
Built to spec (icon tile + "+"/"−" badge + title/description + chevron, `secondary0` background, `hardShadow5`). **Tapping either row currently only `console.log`s** — per your instruction, since neither has a destination screen built yet. Flagged in-code with a comment, not silently left as a dead button.

## New/confirmed tokens from this pull
- `--color-primary-300` (`#565f81`) — CONFIRMED, FAB background. Also retroactively explains where the day-selector's weekday-letter color (`Primary/primary300`, seen on the Menú Semanal screen) comes from — that one was captured as a raw one-off (`--color-raw-day-label`) before this token existed in the set; **not** retro-fitted to reuse `--color-primary-300` in this pass to avoid an unrelated, unrequested change to an already-shipped screen, but worth doing as cleanup later.
- `--color-primary-600`, `--color-warning-800` — CONFIRMED, alert text and alert icon.
- `--color-alert-peach` (`#f6efeb`) — OBSERVED, no named Figma variable, the alert banner background you asked to be tokenized.
- The "lavender row background" you mentioned needing a token for turned out to already be covered by `--color-secondary-0` (confirmed earlier from Home) — no new token added for it, reused instead.
- `--space-2-5` (10px), `--space-0-5`, `--space-1`, `--space-4`, `--space-5`, `--space-6` all upgraded from ASSUMED to CONFIRMED this pass (their values didn't change, just their provenance — this pull's variable defs happened to include named Figma variables for steps that were previously educated guesses that turned out correct).
- `--space-4-5` (18px) — CONFIRMED, a genuinely new step not previously in the scale.
- `--radius-md` (6px) upgraded from ASSUMED to CONFIRMED.
- `--heading-xl-size` (24px) — CONFIRMED, new — the tray title. `Heading/xl` in Figma; the scale previously topped out at `--text-xl-size` (20px).

---

# Solicitar Asistencia (full booking flow)

`screens/solicitar-asistencia.html`, reached from the Asistencia tray's
"Asistencia" row (previously a `console.log` placeholder — now a real
link) or the `screens/solicitar-asistencia-prompt.md` spec's own Figma
nodes. **Figma coverage is partial**: the "Default" screen (node
`14756:19823`) was fully fetched — header, profile card, calendar grid
with contratado/festivo/weekend/today states, this screen's own toggle,
and the empty-state bottom banner all come from real Figma values. The
**"Selected days" screen (node `14800:3292`) and both confirmation
modals could not be fetched — the Figma MCP tool hit its Starter-plan
rate limit mid-task.** Everything below marked "from spec text, not
Figma" is built from your written description instead, since re-trying
the Figma calls wasn't possible this session.

## Why a new `mountSimpleScreenChrome()` instead of `mountMenuChrome()`
This screen reuses the header (+popover), profile card, and bottom nav —
but not the meal toggle or day selector, which are Menú Semanal-specific
and this screen has its own (very different) calendar and toggle
instead. Rather than force this screen through `mountMenuChrome()` and
then hide/override the parts it doesn't want, `menu-shared.js` now
exports a second, smaller orchestrator, `mountSimpleScreenChrome()`,
built by extracting the shared parts of the original function (`wireAsistenciaNavItem()` factored out to avoid duplicating that logic
between the two). `mountMenuChrome()` itself is unchanged in behavior —
still calls `headerHtml()` the same way, just with the new 3rd
`popover` argument implicitly `undefined`, which falls back to the
original Menú Semanal copy.

## `headerHtml()` now takes custom popover content
Previously hardcoded to "Alimentación saludable" + its 3-point body.
Now accepts an optional `{title, body}` third argument — used here for a
placeholder "Solicitar Asistencia" popover (real copy explicitly marked
TBD per your instruction, both in the visible text and in a code
comment). Both existing callers (`menu-semanal.js`, `menu-semanal-report.js`) needed zero changes since the parameter defaults to the original content.

## Calendar
- **Layout** (which weekday column each day falls into, how many days in
  the month) is always computed via real `Date` math — this has to work
  for months beyond the two mocked ones, since month nav is a real
  interaction. **State** (contratado/festivo/weekend/today) comes from
  `calendarData[monthKey]` when that month is mocked, or a computed
  fallback (empty contratados/festivos, real weekend math, no "today")
  when it isn't — so navigating to, say, November 2026 doesn't crash or
  show a blank grid, it just shows a plain available-day calendar.
- **Cell state precedence** implemented exactly as specified: contratado → festivo → weekend → (today / available), with "selected" layered on top of whichever of the last two applies (contratado/festivo/weekend cells are never clickable, so they can never end up in `selectedDays` in the first place — the precedence order effectively falls out of the click-target logic rather than needing an explicit rule).
- **Today + selected simultaneously** isn't addressed by your spec (the mock data's `today: 5` isn't itself selectable in the initial reference view) — built as an explicit combined state (`.calendar-day--today.calendar-day--selected`) that keeps the green ring *and* shows the blue fill/checkmark, rather than letting one silently win. Flag if today shouldn't be selectable at all, or if one state should fully override the other.
- **Selected-day visual** (filled blue circle, white checkmark) is from your spec text, not Figma (rate-limited before the "Selected days" screen could be fetched). The checkmark is inline `<svg>` with `currentColor` — reusing the existing `icon-checkmark-circle.svg` asset wasn't an option since it's baked amber (`tertiary500`) via `<img src>`, and this needed to be white on a blue fill. Same reasoning flagged repeatedly elsewhere for icons needing dynamic recoloring.
- **Two additional distinct greens/reds surfaced** on top of the ones already flagged from the Menú Semanal report screen: contratado cells use `success-background`/`raw-success-text` (`#edfcf2`/`#10b981`), today's ring uses the *named* `success500` (`#348352`) — a third shade — and the legend dot uses `success200` (`#84d3a2`) — a fourth. Same pattern on the red/festivo side (3 shades: `error-background`, `error300`, `error100`). All captured as distinct tokens rather than coerced together; flagged as a design-system cleanup candidate, now spanning two screens.
- Weekend cell colors (`#f8fafc`/`#94a3b8`) match Tailwind's default slate-50/slate-400 exactly — a strong signal the designer used a generic palette rather than this app's own tokens for this one state, same pattern as a couple of other one-off raw colors flagged on earlier screens.
- **Your mock `weekends` arrays don't match real calendar math, and this build intentionally ignores them.** Real September 2026 starts on a Tuesday, so its Saturdays/Sundays are `5, 6, 12, 13, 19, 20, 26, 27` — the mock data's `weekends: [6, 7, 13, 14, 20, 21, 27, 28]` is every one of those shifted one day later. Since the grid's day-of-week *layout* always comes from real `Date` math (it has to, for month nav to work at all beyond the two mocked months), trusting the mock array for *state* would have painted weekend-gray cells one column off from the actual S/D header columns — an obviously broken-looking calendar. `dayState()` now always computes weekends live (`computeWeekends()`) and never reads `data.weekends`; the field is still present in `calendarData` (kept verbatim as you provided it) but is dead data as far as rendering is concerned. Flag if the mock was intentionally offset for a reason that isn't apparent, otherwise this was very likely just an authoring slip when the mock was written.

## This screen's own toggle
Deliberately **not** built on `.segmented-toggle` (Menú Semanal's pill-track component) per your instruction — visually distinct: two independently-shaped pill buttons with a gap between them (no shared track), active state = solid `secondary500` fill + white checkmark + extrabold white text, inactive = white/outlined + muted `primary300` text. The Figma "unselected" chip is a Material 3 `InputChip` resolved via Code Connect to a placeholder component reference rather than literal styles, so the inactive appearance here is a reasonable outlined-chip approximation, not a pixel-confirmed value — flag if it needs adjusting once the M3 chip's actual resolved styles are available.

## Bottom card (2 states) + Solicitar button
Default state (`Selecciona los días que quieres`, muted `primary200` text) is straight from Figma. The active state (`Días seleccionados` label + grouped/formatted dates + full-width Solicitar button) is from your spec text — not in the fetched Figma data. Date grouping produces e.g. `"22-23-25 Septiembre"` for one month, and joins multiple months with `" / "` (that separator isn't specified anywhere — a reasonable default, flag if something else was intended). Solicitar reuses the existing `.button-cta` class rather than a new one, since it's visually identical to every other primary CTA already in the app.

## Modals 3 (confirm) & 4 (thanks) — entirely from spec text, no Figma
Neither modal appears in either fetched Figma node. Built to your exact copy and behavior:
- **Centered**, not a bottom sheet — a genuinely different pattern from the Asistencia tray, sharing the popover's fade+scale animation language instead of the tray's slide+fade (established distinction: edge-anchored sheets slide, centered dialogs scale).
- One shared `.modal-backdrop`/`.modal-card` pair is reused for both modals (content swapped via `innerHTML`, tracked by a `currentModalKind` variable) rather than two separate always-in-DOM modals — avoids duplicate backdrops/z-index bookkeeping for what's always a single-modal-at-a-time flow.
- **Backdrop-tap on the confirm modal treated as "cancel"** (same effect as X/No) — your spec only explicitly described this for the thanks modal, but dismiss-without-consequence on backdrop tap is the pattern already established for the popover and the Asistencia tray, so extending it here was a low-risk, consistent choice rather than a guess. Flag if confirmation dialogs should be backdrop-tap-proof instead (a legitimate alternative convention, just not the one this app has used elsewhere).
- **On "Sí"**: `calendarData` is mutated immediately (selected days pushed into that month's `contratados`) and the calendar re-renders right away — before the thanks modal even opens — because the contratado-state check happens unconditionally in `dayState()` regardless of whether the day is still sitting in `selectedDays` (which isn't cleared until the thanks modal dismisses). This meant no special-casing was needed to make the calendar "already look right" while the thanks modal is showing on top of it.
- A 220ms delay between closing the confirm modal and opening the thanks modal isn't in your spec — added so the confirm modal's own 200ms close transition finishes before the thanks modal's open transition starts, avoiding a visual collision. Small polish, not a behavior change.
- `console.log`s the mock submission payload (selected days + service type) in `confirmSolicitud()`, per "Solicitar submission is mocked."

## Back navigation
Uses `history.back()` (via a click handler that intercepts the header's normal `<a href>`) rather than a fixed `backHref`, since this screen is reachable from multiple places (Home, any Menú Semanal screen) via the Asistencia tray — a single hardcoded destination would be wrong from most entry points. Every other screen in this project uses a fixed `backHref` because each of them only has one real entry point; this is the first one that doesn't.

---

# Chat (contact list + conversation thread)

`screens/chat.html` + `screens/chat-conversation.html`. **No Figma link was
given for this request** — built entirely from the two screenshots you
attached plus the written spec. Treat every color/spacing value below as
a best-effort match to the screenshots, not a confirmed Figma pixel value
the way most of the rest of this project is.

## Why `chat.html` got built too, not just `chat-conversation.html`
The request was for `screens/chat-conversation.html`, described as
"linked from `chat.html` when a contact row is tapped" — but `chat.html`
didn't exist yet (Chat was still an internal SPA placeholder in
`index.html`). Since you attached a full screenshot of that contact-list
screen too, not just a passing reference to it, building only the
conversation screen would have shipped a dead link. Built both, using
the first screenshot as `chat.html`'s source. Also rewired the bottom
nav's Chat tab (`main.js`'s `goToTab()`, same pattern as `menus`, plus
`menu-shared.js`'s `NAV_ITEMS` href) to open the real screen instead of
the SPA's generic placeholder — same treatment `menus` and `asistencia`
already got in earlier passes.

## Contact list (`chat.html`)
Reuses `mountSimpleScreenChrome()` (same as Solicitar Asistencia) for
header/popover/bottom-nav — "Chat" title, placeholder popover copy
(explicitly marked TBD, same pattern as Solicitar Asistencia's). Contact
rows: avatar, bold name, gray `"{role} · {child}"` subtitle, chat-bubble
icon badge on the right (inline `<svg>`, not an image asset — no source
asset exists for it). Tapping a row navigates to
`chat-conversation.html?contact={id}`.

## Conversation thread (`chat-conversation.html`) — deliberately NOT using menu-shared.js
This screen's header is a different shape (avatar + stacked name/subtitle,
no help icon, no popover) from every other screen's shared header, and it
has no bottom nav at all (the input bar takes that space instead, matching
a real messaging app rather than this app's usual persistent nav). Built
its own header markup directly in `chat-conversation.js` rather than
stretching `headerHtml()`/`mountSimpleScreenChrome()` to accommodate a
shape they weren't designed for. Consequently this screen doesn't load
`menu-shared.js` or `asistencia-tray.js` at all — there's no nav item for
the FAB to dock into.

### Which contact's conversation loads
Read from a `?contact=` query-string param (`chat-conversation.html?contact=tomas-sanchez`), defaulting to Tomás Sánchez if missing or unrecognized. This is the only screen in the project that branches its content based on a URL parameter rather than being a fixed single-purpose page — necessary since one HTML file needs to serve both contacts' threads without duplicating the whole screen per contact.

### Content that's invented, not sourced
- **Avatars are colored-circle initials** ("TS"/"AG"), not the real photos shown in your screenshots — no photo assets exist for these two new contacts and none were provided. Same visual pattern as Home's existing initials avatars (Gluestack `Avatar` + `AvatarFallbackText`), just built with plain text instead of pre-baked vector letterforms since there's no Figma export to pull real letterform paths from this time.
- **The artwork image** in the image_text message is a simple flat-illustration placeholder (inline SVG: easel, sun, some plant shapes) — not the real photo from your screenshot. No image asset was available to source.
- **Alex García's entire conversation is invented** — your spec and screenshot only gave content for Tomás Sánchez's thread. Wrote two short, plausible messages for Alex García's thread so the contact list's second row doesn't lead to an empty conversation, clearly commented as invented in `chat-conversation.js`.

### Bubble styling
- Incoming: `--color-secondary-0` (light lavender), flat top-left corner (`--radius-xs` on that corner, `--radius-xl` elsewhere) — per spec.
- Outgoing: `--color-secondary-500` solid, white text, flat top-right corner (mirrored from incoming — your spec only specified the incoming corner explicitly, mirroring it for the outgoing side was the natural read of "rounded corners with flat top-left corner" as a directional/tail-pointing detail rather than one bubble type having a unique quirk the other doesn't).
- Image message: image sits inside the same lavender bubble as a regular incoming message, corners matched to the bubble's own flat-top-left treatment, text below inside the same bubble — exactly as specified.
- Read receipt: inline double-checkmark SVG, `--color-secondary-500` — no icon asset existed for this, built to match the conventional "read" checkmark pattern the screenshot's blue ticks implied.

### Send interaction
Enter key or the send button both work. New outgoing bubbles get the actual current device time (`formatCurrentTime()`), not a fixed mock value — matches "current time" in your spec. Mock only: nothing persists past the page's current in-memory `conversation.messages` array (a page reload resets to the original scripted thread), per "no real message persistence needed beyond the current session."

---

# Gestión (account hub + stub screens)

`screens/gestion.html` + a shared `screens/stub-screen.js` used by 6 tiny
stub HTML files (`perfil.html`, `facturacion.html`, `contratos.html`,
`documentos.html`, `notificaciones.html`, `ajustes.html`). No Figma
source — spec text only, see handoff.md conventions used throughout
this doc for what that means for confidence in the exact values below.

## `menu-shared.js` grew three new flags, not a new bespoke header
Gestión needed a header with no help icon and no profile card, plus the
6 stub screens needed all of that *and* no bottom nav. Rather than build
yet another one-off header (the choice made for Chat's conversation
screen, which has a genuinely different header *shape*), `headerHtml()`
and `mountSimpleScreenChrome()` gained `showHelp`, `showProfileCard`, and
`showBottomNav` boolean options (all default `true`, so every existing
caller — Menú Semanal, the report screen, Solicitar Asistencia, Chat's
contact list — needed zero changes). This was the right call here
specifically because Gestión's header *shape* is identical to every
other screen's (back chevron + centered title, optionally + help icon) —
only which pieces are present differs, not the layout itself.
`wirePopover()` also gained a guard clause so it's safe to call
unconditionally even when `showHelp: false` left nothing to wire.

## Icons are all invented — no Figma source
All 7 icons (user-circle, receipt, clipboard-list, file-text, bell,
settings, logout) are inline SVGs built from scratch this pass — no
Figma reference for any of them. Deliberately did **not** reuse the
existing `icon-bell.svg`/`icon-nav-gestion.svg` assets from Home despite
them being visually close matches (bell, gear) — those are `<img src>`
files baked with a specific fallback color (`primary-500`/`primary-900`)
that can't inherit `currentColor`, so reusing them would have made two
of the seven row icons a visibly different shade of blue from the other
five. Built all seven as matching inline `<svg>` instead, same 1.75px
stroke weight and line style throughout.

## The 6 stub screens share one script, not one copy-pasted per file
`stub-screen.js` reads its title from `document.title` (stripping the
"Prototype — " prefix already present on every screen) rather than a
second config value — one less thing to keep in sync per stub. Each
stub's own `<title>` tag is the only thing that differs between the 6
otherwise-identical HTML shells (generated via a short shell script
during this pass, not hand-duplicated one at a time — same content
either way, just faster and less error-prone to produce).

## Perfil is a genuinely shared destination, not a duplicate
Per your instruction, `screens/perfil.html` is linked from **two**
places: Gestión's "Perfil" row (`gestion.html` → `perfil.html` route,
matching your literal mock data) and the Home dashboard's header avatar
(`main.js`'s `data-action="open-profile"` handler, previously rendering
the SPA's internal `perfil` placeholder — now redirects to the same
`screens/perfil.html` file instead). Since Perfil has two real entry
points, its back button uses `history.back()` (via
`window.STUB_USE_HISTORY_BACK = true`, set in `perfil.html` before
`stub-screen.js` runs) rather than the fixed `gestion.html` target every
other stub uses — same reasoning as Solicitar Asistencia's back button
in an earlier pass.

**Cleanup while touching this file**: `main.js`'s `SCREEN_TITLES` map had
accumulated dead entries (`home`, `menus`, `asistencia`, `chat`,
`gestion`) from earlier passes where those tabs got redirected to real
screens one at a time — each redirect made that tab's entry in
`SCREEN_TITLES` unreachable, since it only ever backs the generic
`screen-placeholder` template's title, which those tabs no longer render.
Trimmed to just `autorizados`, the only id that still actually reaches
that code path. Not part of this request, but directly noticed while
editing the same function for Gestión's own redirect.

## Danger token
`--color-danger` added as a semantic alias for the existing
`--color-error-500` (`#e60000`) — reusing the already-defined red per
your instruction rather than adding a near-duplicate. Also gives that
color its first *intentional* semantic use; it previously only existed
as an off-system value on the header notification badge (flagged
elsewhere in this doc). The danger row's hover/active tints reuse the
existing `--color-error-background`/`--color-error-100` tokens from
Solicitar Asistencia's calendar rather than introducing a new raw
`rgba()` — caught and fixed during this pass after an initial draft used
a hardcoded value.

## Row press feedback
`scale(0.98)` + `opacity: 0.85` on `:active` — reads "same subtle press
state used elsewhere" as the FAB's `scale(0.96)`/`opacity: 0.7` pattern,
scaled down slightly since these are full-width rows (a more aggressive
scale on something that wide would look more like a bug than a press
effect at the row's edges).

## What's real vs. stub
Only Gestión's own list screen is "real" — all 6 destinations are
placeholder pages, exactly as scoped ("priority for this pass is
validating the navigation structure and list pattern, not building out
every sub-screen yet"). Logout shows a native `confirm()` and
`console.log`s on confirmation — no real auth, per spec. It now also
navigates to `login.html` on confirm (see that screen's section below) —
added when login.html was built in a later pass, since leaving a
confirmed logout as a dead end no longer made sense once a real
destination existed.

---

# Login

`login.html` — lives at the **project root**, not `/screens/`, so it
resolves at `localhost:8934/login.html`. Moved there in a follow-up pass
(originally built under `/screens/` like every other screen); every
internal relative path (`tokens.css`, `styles.css`, the post-login
redirect to `index.html`) was updated accordingly, and Gestión's
"Cerrar sesión" handler (`screens/gestion.js`) now points at
`../login.html` to match. `login.js` moved with it and stayed alongside
its HTML, same pattern as every other screen.

**No Figma data at all for this screen** — the MCP rate limit was hit
before design context, screenshot, *or* variables came back (worse than
Solicitar Asistencia's partial hit earlier, which at least got the
Default screen's real values before running out). Layout/color/spacing
choices not covered by your reference screenshot (see below) are still
best-effort spec-text guesses, checked against nothing.

## Collage: real photos now, per your reference screenshot
You attached a screenshot of the real, finished collage — that became
the source of truth for this component specifically, superseding the
"5 photo cells" ambiguity flagged in the original build (a 2-row/3-col
grid with a row-spanning center literally can't produce 5 photo cells;
your screenshot resolved it by showing it's **6 photos**, not 5, in an
**irregular masonry layout**, not a uniform grid — tennis and hiking run
taller than pasta/logo/bus).

**I can't extract images from a chat attachment onto disk** — no tool
available to this agent pulls image bytes out of a pasted screenshot
into a file. You're dropping the 6 photos + the real logo into `assets/`
yourself; `login.js` and `styles.css` are wired to expect these exact
filenames:

| File | Content |
|---|---|
| `assets/collage-salad.jpg` | kid eating salad |
| `assets/collage-pasta.jpg` | kids eating pasta |
| `assets/collage-tennis.jpg` | tennis lesson |
| `assets/collage-hiking.jpg` | hikers on trail |
| `assets/collage-bus.jpg` | bus excursion |
| `assets/collage-fruit.jpg` | fruit salad bowl |
| `assets/logo-ehabilis.png` | eHabilis logo + wordmark |

Until those files exist, each collage cell shows a browser's default
broken-image icon — deliberately not caught with an `onerror` fallback,
so a missing file is obvious rather than silently rendering as an empty
gray box that could be mistaken for "working as intended." The old
inline-SVG illustrations (crafts/sport/reading/music) and the abstract
placeholder logo mark are gone entirely, not kept as a fallback — once
real content was specified, keeping invented content alongside it would
just be confusing dead weight.

**Grid mechanics**: 3 columns × 6 fine-grained row-tracks (not 2), each
photo `grid-row`-spanning however many of those 6 tracks its cell needs
(salad/hiking split the left column 50/50; pasta/logo/bus split the
center column into thirds; tennis/fruit split the right column
roughly 2/3–1/3, tennis being the taller one) — this is what lets the
layout be irregular while still being a single CSS Grid, no manual
absolute positioning. Photos use `object-fit: cover` so whatever
aspect ratio your actual files are, they'll crop to fill their cell
rather than distorting.

## Other invented content (unrelated to the collage)
- **Eye/eye-off, right-arrow, and checkmark icons**: inline SVGs built from scratch, same reasoning as every other icon in this project built without a Figma source (Gestión's row icons, the mood faces, etc.).
- **Accent yellow** (`--color-accent-yellow`, `#f5c242`): invented to be visibly distinct from the existing `--color-tertiary-500` (`#ddb54a`, the app's existing muted "food" gold) so the arrow badge reads as a punchy CTA accent rather than blending into that unrelated existing token's role. Input border reuses the already-existing `--color-border-300` — no new token was needed for that half of the instruction.

## Mixed-language content, kept as given
Every other string on this screen ("Usuario", "Contrasinal", "Gardar
datos de acceso", "Olvidaches o teu contrasinal?") is Galician; the
legal paragraph you gave is Castilian Spanish ("Si continúas, aceptas
los Términos del Servicio..."). Reproduced **exactly as given**, not
normalized to one language — this reads like legal/compliance copy that
stays centrally maintained in Spanish regardless of UI locale, a
plausible real-world pattern, not an error to silently "fix". Flag with
content/legal if that's wrong. The page's `<html lang="gl">` reflects
the majority-Galician content; every other screen in this project uses
`lang="es"`.

## Standalone screen — no shared chrome
Login doesn't use `menu-shared.js` at all (no header pattern, no bottom
nav, no profile card fit a pre-authentication screen) — built entirely
in its own `login.js`, similar to how Chat's conversation screen went
fully custom rather than stretching `mountSimpleScreenChrome()`.

## Interactions
- Password field: click the eye icon to toggle `type="password"`/`type="text"`, icon swaps between eye/eye-off.
- "Gardar datos de acceso" checkbox: pre-checked by default per spec, tracked in a `rememberMe` variable (not persisted anywhere — mock only).
- Submit: both fields non-empty → `console.log`s a mock payload and navigates to `index.html` (Home/Inicio — treated as "the entry point" per your either/or, since it's literally this prototype's root file; both now live at the root, so no `../` needed). Either field empty → inline error text shown, no navigation, per spec.
- "Olvidaches o teu contrasinal?" and both legal links: `console.log` only, no destination screens — flagged in code, not silently inert.
