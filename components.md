# Component Inventory

Legend: 🟢 maps to an existing Gluestack v5 primitive · 🟠 custom, needs its own build.

---

# Home / Dashboard

Scope: `Dashboard_01` (Figma node `14756:9246`).

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Header greeting | `Heading` / `Text` | "Buenos días 👋 Juan" is two text runs at different sizes/colors (`text-semibold-xl` in primary-500, then a lighter `Juan` run in secondary-300) — likely two `Text` nodes in an `HStack`, not one string. |
| Notification icon button | `Pressable` + `Icon` | Bell icon, `icon-bell.svg`. |
| Notification count badge | `Badge` | See ⚠️ below — currently built off-system, should be rebuilt as a real `Badge`. |
| Header avatar | `Avatar` + `AvatarFallbackText` | Renders as initials-on-color-circle ("JM"), not a photo. Gluestack's `Avatar` supports this natively via `AvatarFallbackText`. |
| Student row avatar (photo) | `Avatar` + `AvatarImage` | Lucía's row uses a real photo (`avatar-lucia` in this build is actually still an initials SVG exported by Figma — see handoff.md). |
| Student row avatar (initials) | `Avatar` + `AvatarFallbackText` | Daniel's row ("DM" on primary-500 circle). |
| Student name | `Text` (`heading-sm` style) | Bold 16px, 0.2px tracking — a distinct style from the 16px `text-semibold-md` used elsewhere, don't collapse the two. |
| School / grade sub-label | `Text` | Two `Text` runs at 50% opacity, space-separated. |
| Card container | `Card` (or `Box`) | See ⚠️ below on radius token reuse. |
| Service row icon | `Icon` | Breakfast cup / fork-knife SVGs, colored via `--fill-0`/`--stroke-0` CSS custom properties baked into the exported SVGs — convenient for recoloring per state without re-exporting. |
| Service row label + time | `Text` (`text-bold-xs` label + `text-normal-sm` value) | e.g. "DESAYUNO" / "Horario entrega: 7:00 - 7:30h". |
| Nav item label | `Text` (`text-normal-2xs` / `text-extrabold-2xs` when active) | 10px, weight jumps to 800 for the active tab ("Inicio"). |

---

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Bottom navigation bar** | Gluestack v5 has no shipped tab-bar component (in RN this is normally React Navigation's bottom tabs, styled to match). | 5-item pill-shaped bar, floats above content, `--shadow-hard-5`, `--radius-pill` (80px — not on the standard radius scale, a one-off). Each item = icon + label stacked, active item recolors both icon (`--stroke-0` override) and label to `secondary-500` and bumps label weight to extrabold. |
| **Service accordion row** (`Datos Servicio Desayuno/Comida`) | Visually a collapsible row with a rotating chevron. | Built on the Gluestack `Accordion` pattern (`AccordionItem`/`Header`/`Content`). Expanded content = a 4-item quick-link row (Menús/Asistencia/Autorizados/Chat), pulled from Figma node `14790:18207` — reuses the same "Button-outline" nav-item component as the bottom tab bar. See handoff.md. |
| **Student service card** (`Card_Student_ID_Container`) | Composite of student-row + 1–2 service rows; the header shows two of these stacked (one has both Desayuno + Comida rows, the other only Desayuno) — variable row count per card. | Build as a container component that accepts N service rows as children, not a fixed 2-row layout. |
| **Institution logo footer** | Purely decorative, low-opacity brand watermark behind the nav bar — not an interactive component. | Static `Image` in a `Box`, `opacity: 0.36`. Confirm with design whether this is meant to scroll with content or stay pinned (it's absolutely positioned in the source file). |
| **Status bar (9:41, signal/wifi/battery)** | Native OS chrome, not part of the app UI at all. | Included in this prototype purely as device-frame decoration so screens read as a phone. **Do not build this in the real app** — the OS provides it. |

---

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **Notification badge is off-system**: uses a color (`#e60000`) and font (`Vodafone Rg Bold`) that appear nowhere else in the file's token set — looks like a leftover instance from a different library, not this app's Gluestack `Badge`. Rebuild on-system before shipping.
- **Card corner radius (12px) isn't a radius token** — the source file reuses the spacing token `space.3` for it. Fine for this prototype (`--radius-xl` in tokens.css equals it), but worth a real `radius` token in the actual Gluestack config so radius and spacing scales don't silently couple.
- **Bottom nav pill radius (80px)** and **card shadow (`hardShadow:5`)** are used exactly twice each in this screen and aren't part of a named scale beyond the one shadow token — confirm these are meant to be reused site-wide before promoting them to first-class tokens.

---

# Menú Semanal

Scope: `Menu Semanal` (Figma node `14756:9701`), a standalone screen at
`screens/menu-semanal.html` (its own HTML document, not part of index.html's
single-page view switcher — reached via real navigation from Home's bottom
nav / Menús quicklinks).

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Screen header (back / title / help) | `HStack` + `Pressable` + `Icon` + `Heading` | Title is centered independent of the two icon buttons' widths (absolute-centered here, not a 3-column flex split — check which the real layout system supports). |
| Help popover | `Popover` + `PopoverContent` + `PopoverArrow` + `PopoverBody` | Triggered by the help icon. No backdrop (content stays visible). Fade + scale(0.95→1) transition, ~200ms ease-out, approximating Gluestack's Reanimated-powered transition. See handoff.md for the full breakdown. |
| Student profile card | `Card` or `Box` | Avatar + name + disclosure chevron. Uses a *different* white token (`backgroundCard`/`Background/background0`, `#ffffff`) than Home's student cards (`backgroundSurface`, `#fbfbfb`) — see flag below. |
| Avatar | `Avatar` + `AvatarImage` | Same component as Home. |
| Segmented toggle (DESAYUNO/COMIDA) | `Tabs` or a custom `SegmentedControl` if Gluestack v5 doesn't ship one | Pill track in `secondary100`, active segment is a white pill with a shadow. Default active = COMIDA per spec. |
| Day selector | `HStack` of `Pressable` | 5 fixed-width day cells, single-select, active cell filled `secondary500`. **Uses a 3rd font family, Hanken Grotesk** — not Poppins, not Roboto. Flagged below. |
| Meal/dish card | `Card` + `Text` | Numbered badge (bordered circle, built in plain CSS here rather than importing Figma's repurposed "rewind-10-seconds" icon asset — see handoff.md) + label + dish name. |
| "Menú Celiacos" allergen card | `Card` + `Badge`/chip row | Cream background, 2×2 grid of pill chips, each with a checkmark icon on `tertiary50`. |
| Primary CTA button | `Button` (`action="primary"`, pill) | "Consultar informe" — Figma's fill is a redundant double-gradient that resolves to a flat `secondary500`; simplified to a solid color here. |
| Bottom nav | *(custom, see Home's inventory)* | Same component, "Menús" active this time. Icons are inlined as `<svg>` here (not `<img src>`) specifically so `currentColor` can drive active/inactive state reliably — see flag below. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Pagination dots** | Figma exports this as one flattened image (`Indicators`); rebuilt here as two plain CSS dots so it stays token-driven and stateful. | 2 dots, first active (`secondary500`), second muted (`border300`). Non-interactive in this pass — no spec yet for switching between children via the dots. |
| **Numbered dish badge (1/2/3)** | Figma's actual icon is a repurposed "rewind 10 seconds" icon (ring + accent mark) with the number typed on top — an odd reuse of an unrelated icon purely for its ring shape. | Rebuilt as a plain 30×30px circle, `1.5px` `secondary500` border, number as real text. Visually equivalent to the Figma comp; flagged as a deliberate simplification, not a fidelity gap. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **Two different "white" card tokens exist across the two screens pulled so far**: Home uses `backgroundSurface` (`#fbfbfb`), Menú Semanal uses `backgroundCard` (`#ffffff`). Both are confirmed Figma values, not a build error — but worth reconciling into one card-surface token before more screens arrive.
- **A 3rd font family** (Hanken Grotesk) shows up on the day selector, on top of Poppins (base) and Roboto (buttons/emoji, already flagged on Home). None of the three off-Poppins uses share a rationale — worth a design-system audit.
- **`<img src="icon.svg">` can't be recolored via CSS.** Home's bottom-nav icons happened to work because each screen's export baked in the "correct" per-context color already. That breaks the moment the same icon needs to render both active and inactive (exactly what happens reusing the bottom nav across screens) — solved here by inlining the 5 nav icons as real `<svg>` markup with `stroke/fill="currentColor"`, which *does* inherit CSS `color` from `.nav-item`. Recommend applying the same pattern to Home's nav icons for consistency, and to any icon that needs per-state recoloring going forward.
- Several one-off raw values with no named Figma variable at all (not even off-system): `#464554`/`#1b1b23` (day selector), `#111827` (dish name), `#fff9e9`/`#e1a504` (celiac card), an 18px Poppins Semibold text style, a 38px toggle gap, and a distinct "soft" shadow separate from `hardShadow:5`. All captured as flagged tokens in `tokens.css`/`tokens.json` rather than inlined as magic numbers.
- **Date heading alignment**: the written spec for this screen said left-aligned; Figma's actual layer is `text-align: center`. Built centered, trusting Figma as source of truth — flag if the spec was actually correct and Figma is stale.
- Meal content is now driven by mock data (`menuData` in `screens/menu-semanal.js`) keyed by ISO date, covering all 5 weekdays and both DESAYUNO/COMIDA states — see handoff.md for the render logic. "Menú Celiacos" remains static regardless of date/toggle, per instruction; "Consultar informe" now links to the new report screen below.
- **Shared chrome extracted into `screens/menu-shared.js`** — header/popover, profile card, toggle, day selector, bottom nav are now built and wired in one place (`mountMenuChrome()`), called by both `menu-semanal.js` and `menu-semanal-report.js`. See handoff.md for why this uses JS-built DOM rather than `fetch()`-based HTML partials (the latter breaks under `file://`, which the brief requires supporting).

---

# Menú Semanal — Informe (report)

Scope: `screens/menu-semanal-report.html`. **No Figma node for this screen —
built from a reference screenshot + written spec only.** Everything here is
this pass's interpretation, not verified against a design file.

Reuses the exact same header/popover, profile card, toggle, day selector,
and bottom nav as `menu-semanal.html` via `screens/menu-shared.js` — see
that screen's inventory above, not repeated here.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Dish card (with mood) | `Card` + `Text` + `Badge`/`Icon` | Same `Card` as the base screen's dish card, extended with a third element. |
| Observaciones card | `Card` + `Heading` + `Text` | Plain surface, no icon/chip row — simpler than "Menú Celiacos" which it replaces. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Mood icon** | Not in Figma at all — invented to match your reference screenshot. | 36×36px circle, 3 modifier classes (`--happy`/`--neutral`/`--sad`) driving `background-color` from 3 new tokens. Face (2 dot eyes + a mouth curve that changes direction per mood) is inline `<svg>` using `currentColor`, not an image — same reasoning as the bottom-nav icons: only inline SVG can be recolored via CSS in this codebase. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **This entire screen has no design-file source.** Confirm the mood icon style (currently simple line-drawn eyes/mouth on a flat color circle — not a polished illustration) and the exact green/amber/maroon values with design before treating them as final.
- Mood only applies to the 3 COMIDA dish cards, not the DESAYUNO suggestion card — read directly from the `reportData[date][dish].mood` path you gave, which only ever named the three comida dishes.
- Observaciones text is **day-level**, not meal-level — `reportData[date].observaciones` doesn't change when the DESAYUNO/COMIDA toggle changes, only when the day changes. Also read directly from the data shape you specified.
- All `reportData` mood values and observation text for all 5 weekdays are invented mock content (dish names are reused verbatim from `menuData`), written loosely to narrate each day's mood pattern — not random filler, but not real data either.

---

# Asistencia FAB + tray

Scope: `asistencia-tray.js` (project root) — a **global** overlay, not tied
to one screen. Loaded on `index.html` and every `screens/*.html` file,
triggered by a floating action button docked into the bottom nav's
Asistencia slot on any of them.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| FAB | `Fab` / `Pressable` + `Icon` | Circular, docked into and overlapping the bottom nav — not a standalone floating button elsewhere on screen. |
| Tray | `Actionsheet` (`Actionsheet`/`ActionsheetContent`/`ActionsheetBackdrop`) | Closer to Gluestack's `Actionsheet` than `Popover` — full-width, slides from an edge, rounded on one side only. Different pattern from the Menú Semanal help `Popover`, which is anchored/arrow-based and much smaller. |
| Option row | `Pressable` + `Icon` + `Badge` + `Text` | Icon tile + numbered badge + title/description + chevron, same shape as a settings-list row. |
| Alert banner | `Alert` | Icon + body text, no title, no dismiss action. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **FAB docked into a nav slot** | Not a standard tab-bar pattern — the FAB overlaps a nav item that itself has no icon, only a label, with the FAB floating 18px above the bar's top edge. | Positioned via `top: -18px` + horizontal centering inside `.bottom-nav` itself, rather than computed against the specific nav item's coordinates — works because Asistencia is the middle of 5 items and the bar is centered on screen. Wouldn't generalize if the FAB needed to dock over a non-centered item. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **This component has no isolated Figma source.** The referenced nodes (FAB `14797:22410`, tray `14756:10091`) sit inside one large comp that also shows a full "Solicitar Asistencia" booking screen dimmed behind the tray — that booking screen is explicitly **not** built here, since the tray must overlay whatever screen is actually active, not one fixed background.
- **Script load order matters** for `screens/*.html` specifically: `asistencia-tray.js` must load *after* `menu-shared.js` + the screen's own script (which builds `.bottom-nav` at runtime), or its one-time init silently finds nothing and never injects the FAB. Not an issue on `index.html`, where the bottom nav is static markup present from parse time. See handoff.md for the full explanation — this is a real bug that was caught and fixed during this pass, not a hypothetical.
- **Spec gave two different animation descriptions** for the tray (slide+fade 300ms vs. fade+scale 200ms) — built as slide+fade/300ms as the more component-appropriate, specific instruction. Flagged in handoff.md in case scale was actually intended.
- **"Asistencia" row now navigates for real** to `screens/solicitar-asistencia.html` (see below); "Renuncia" still only `console.log`s — no destination screen exists for it.
- Swipe-to-close is threshold-based (checks total gesture distance on release), not a live drag-follow.

---

# Solicitar Asistencia

Scope: `screens/solicitar-asistencia.html`. **Figma coverage partial** —
the Default screen (`14756:19823`) was fully fetched; the Selected-days
screen (`14800:3292`) and both confirmation modals could not be, due to
hitting the Figma MCP's Starter-plan rate limit mid-task. Everything not
traceable to the Default screen's data is built from the written spec
text instead — flagged per-item below and in handoff.md.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Calendar card | `Card` + custom grid | Month nav + 7-column day grid + legend. No Gluestack calendar primitive covers the exact 6-state cell styling here. |
| Day cell | `Pressable` (available/today/selected) or plain `Box` (contratado/festivo/weekend — not interactive) | Same component, 6 style variants; only 2 of the 6 are ever clickable. |
| This screen's toggle | `Pressable` + `Icon` + `Text` | Checkmark + solid-fill active state — see "custom" note, this is NOT the same component as Menú Semanal's toggle despite similar purpose. |
| Bottom banner (both states) | `Card`/`Alert` + `Text` | Swaps content, not structure, between empty and active states. |
| Confirm/thanks modal | `Modal`/`AlertDialog` | Centered, not `Actionsheet` — the first centered (non-sheet) modal pattern in this prototype. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Calendar grid engine** | No Figma component reference — built from scratch as a data-driven grid. | Real `Date` math for layout (always), mock-data-driven state (when available) with a computed fallback (when not) — see handoff.md for why these are deliberately decoupled. |
| **Two-state bottom card** | Content and meaning change entirely between states (informational text vs. a data summary + submit action), not just a style toggle. | Re-rendered via `innerHTML` swap on every selection change, not two pre-built states toggled with CSS. |
| **Centered modal shell** | First non-sheet modal in this project — reuses the popover's fade+scale animation language (for centered dialogs) rather than the tray's slide+fade (for edge sheets), continuing that established distinction. | One shared backdrop+card pair, content swapped per modal rather than two separate DOM trees. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **Figma fetch was interrupted by a rate limit.** The Selected-days screen and both modals are built from your spec text only — treat their exact pixel values (colors already covered by existing tokens where possible, spacing approximated from established patterns) as provisional until a real Figma pull is possible.
- **A 3rd and 4th shade of green, and a 3rd shade of red/pink**, surfaced on this screen on top of the ones already flagged on the report screen — captured as distinct tokens, flagged as a recurring design-system inconsistency now spanning two screens' worth of "success"/"error" color usage.
- **Weekend cell colors are raw Tailwind defaults** (`slate-50`/`slate-400`), not this app's own token system — the only state on this calendar where that's true.
- **The mock `weekends` arrays don't match real calendar math** (off by exactly one day for both mocked months) — the build ignores them and always computes weekend shading from real `Date` math instead, to keep it aligned under the correct S/D columns. Full explanation in handoff.md.
- **This screen's toggle is deliberately not the same component as Menú Semanal's** — per instruction, don't try to unify them later without checking whether that's actually still wanted; they represent genuinely different Figma designs, not accidental duplication.
- Today+selected as a combined state, backdrop-tap-as-cancel on the confirm modal, and the 220ms gap between the confirm and thanks modals are all judgment calls made where the spec didn't say — each reasoned through in handoff.md, not arbitrary.

---

# Chat (contact list + conversation thread)

Scope: `screens/chat.html`, `screens/chat-conversation.html`. **No Figma
link given for this request** — built from two screenshots + spec text
only. `chat.html` wasn't explicitly requested but was built anyway since
`chat-conversation.html` is described as linked from it and a full
screenshot of it was provided — see handoff.md.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Contact row | `Pressable` + `Avatar` + `Text` + `Icon` | Same card shape as other list rows in this app. |
| Message bubble | `Box` + `Text` | Two visual variants (incoming/outgoing) sharing one component shape. |
| Date divider ("Hoy") | `Badge`/pill `Text` | Simple centered pill, no icon. |
| Input bar | `Input` + `Pressable`/`IconButton` (×2) | Standard chat-composer layout: attach, field, send. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Initials avatars** ("TS"/"AG") | No real photo assets exist for these contacts, and none were provided (no Figma source this pass). | Plain colored circle + centered text, same visual role as Home's Gluestack `AvatarFallbackText` avatars but built without pre-baked vector letterforms. |
| **Artwork placeholder image** | The image message needs *some* image; no real photo asset was available. | Flat inline-SVG illustration (easel, sun, plant shapes) — clearly a placeholder, not attempting to pass as the real photo from the screenshot. |
| **Chat thread header** | Different shape from every other screen's shared header (avatar + stacked name/subtitle, no help icon) — doesn't fit `menu-shared.js`'s `headerHtml()`. | Built directly in `chat-conversation.js`, not shared — this screen is the only one with this header shape so far. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **No Figma source at all for this request** — every color/spacing value is a best-effort screenshot match, not a confirmed pixel value. Re-verify against a real Figma file before treating anything here as final.
- **Alex García's entire conversation is invented** — only Tomás Sánchez's thread had real content in the spec/screenshot.
- **Conversation routing uses a `?contact=` query param** — the only screen in the project that branches content by URL parameter rather than being single-purpose; necessary so one HTML file can serve both contacts' threads.
- **Outgoing bubble's flat corner (top-right) is mirrored from the spec's explicit incoming-bubble instruction (top-left)**, not separately specified — a reasonable read of the "flat corner = tail direction" convention, flagged in case a symmetric or different treatment was actually intended.
- Message send/receive state doesn't persist past the page session — a reload resets the thread to its original scripted content, per "mock only" in the spec.

---

# Gestión (account hub) + stub screens

Scope: `screens/gestion.html`, plus `screens/stub-screen.js` shared by 6
placeholder destinations (`perfil.html`, `facturacion.html`,
`contratos.html`, `documentos.html`, `notificaciones.html`,
`ajustes.html`). **No Figma source** — spec text only.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| List row | `Pressable` + `Icon` + `Text` | Same shape used for every navigable row, plus a `--danger` modifier for "Cerrar sesión". |
| Stub screen body | `Text` | Just a centered muted placeholder line — nothing else built yet, by design. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Row icon set** (user-circle, receipt, clipboard-list, file-text, bell, settings, logout) | No Figma source for any of them. | All 7 built as matching inline `<svg>` rather than reusing 2 visually-close existing `<img>` assets, to keep icon color consistent via `currentColor` across the whole list — see handoff.md. |
| **Shared stub-screen module** | 6 near-identical placeholder screens would otherwise mean 6x duplicated header/layout logic. | One `stub-screen.js`, title read from each page's own `<title>` tag, called via `menu-shared.js`'s `mountSimpleScreenChrome()` with everything but the header switched off. |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **`menu-shared.js`'s shared chrome is now more configurable** (`showHelp`/`showProfileCard`/`showBottomNav` on `mountSimpleScreenChrome()`) rather than growing another bespoke per-screen header — all existing callers needed zero changes.
- **Perfil is a real shared destination**, not a duplicate — linked from both Gestión's row and the Home dashboard avatar, both pointing at `screens/perfil.html`. Its back button uses `history.back()` since it has two entry points (same pattern as Solicitar Asistencia).
- **`--color-danger` added as a semantic alias** for the existing (previously off-system-flagged) `--color-error-500` — reused per instruction rather than duplicated.
- **Dead `SCREEN_TITLES` entries cleaned up in `main.js`** while touching that file for Gestión's own redirect — several tab ids had become unreachable placeholder-title lookups across earlier passes as those tabs got real screens one at a time. Not part of this request, but caught in passing.
- All 6 stub destinations are genuinely empty placeholders, per spec — "priority for this pass is validating the navigation structure and list pattern, not building out every sub-screen yet."

---

# Login

Scope: `login.html` — moved to the project root in a follow-up pass so
it resolves at `localhost:8934/login.html` (every other screen lives
under `/screens/`). **Zero Figma data this pass** — the MCP rate limit
was hit before design context, screenshot, or variables returned
anything at all. The collage now uses real photos per your reference
screenshot rather than invented placeholders — see handoff.md for the
exact filenames it expects in `assets/`.

## 🟢 Maps to a Gluestack v5 primitive

| Component | Gluestack primitive | Notes |
|---|---|---|
| Text/email input | `Input` + `InputField` | Standard labeled field. |
| Password input | `Input` + `InputField` + `InputSlot`/`InputIcon` | The eye-toggle icon sits inside the field via a trailing slot — a documented Gluestack pattern. |
| Checkbox | `Checkbox` + `CheckboxIndicator` + `CheckboxLabel` | Custom-styled box + checkmark, native input visually hidden but still focusable/accessible. |
| Submit button | `Button` | Pill, dark navy, with a nested circular icon accent. |

## 🟠 Custom / from-scratch components

| Component | Why it's custom | Build notes |
|---|---|---|
| **Photo collage grid** | Irregular masonry layout, not a uniform grid — no standard component covers this shape. | 3 columns × 6 fine-grained row-tracks, each of the 6 real photos + the logo cell spanning however many tracks its cell needs. Built to match your reference screenshot exactly (tennis/hiking taller than pasta/logo/bus). |
| **Arrow-badge submit button** | Not a standard single-element button — a circular icon accent overlapping the pill button's edge. | Absolutely positioned circular badge (`--color-accent-yellow` background) inside the button, per spec's "small circular accent-yellow button ... on the right edge." |

## ⚠️ Flags for dev handoff (see handoff.md for full detail)

- **No Figma source at all** — re-verify every non-photo value (spacing, icons, form styling) against a real design file before treating any of it as final. The collage itself is now grounded in your reference screenshot, but everything else on this screen is still an unconfirmed spec-text guess.
- **Collage depends on 7 files existing in `assets/`** (6 photos + the real logo) — this agent can't extract images from a chat attachment onto disk, so you're adding those files yourself. Exact expected filenames are in handoff.md. Until they exist, those cells show broken-image icons on purpose (not silently hidden).
- **Mixed-language content kept exactly as given**: the form labels are Galician, the legal paragraph is Castilian Spanish — reproduced verbatim, not normalized to one language.
- **`--color-accent-yellow` is entirely invented** (no Figma source), deliberately distinct from the existing `--color-tertiary-500` so it doesn't blend into that token's unrelated existing role.
- **`login.html` lives at the project root**, not `/screens/` — the only screen in the project structured this way, per your request that it resolve at `localhost:8934/login.html`.
- **Gestión's "Cerrar sesión" now navigates to `../login.html`** after the mock confirm — a small addition made once this screen existed, since a logout that confirmed but went nowhere was a dead end. Not part of either spec individually, but the obvious connective step once both pieces existed.
