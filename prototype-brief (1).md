# Project Brief: Figma-to-HTML Prototype (Gluestack UI v5 Handoff)

_Last updated: running document — update as new screens/components are specced._

## Context
I'm a designer with a Figma app design ("Activities Design Kit") that
mostly uses **Gluestack UI v5** components, plus some custom-built
components. The real app will be built in **React Native**. I need a
browser-based prototype for two purposes:

1. **Interaction testing** — clickable flows that mirror the Figma prototype.
2. **Style handoff** — a clean CSS/token layer developers can use to match
   Gluestack v5 theming exactly, instead of eyeballing screenshots.

No backend or database — everything is mocked/in-memory.

Figma file:
https://www.figma.com/design/ugAYOo9iswfG2rH8spQ5By/🌍-Activities-Design-Kit_based-on-GlueStack-UI

## Constraints
- Plain **HTML, CSS, and vanilla JavaScript** only. No frameworks, no build
  step, no bundler. It should run by just opening the files / a simple
  local server.
- All state (navigation, toggles, form inputs, modals) lives in JS memory —
  nothing persisted, no backend calls.
- Styling must be **token-driven**, not hardcoded values, so it maps cleanly
  onto Gluestack v5's config shape (color, space, radius, font-size scales).
- Where a Figma node URL is available, pull exact values via
  `get_design_context` rather than approximating from screenshots.

## Suggested file structure
```
/prototype
  /screens
    menu-semanal.html
    menu-semanal-report.html
    solicitar-asistencia.html
    chat.html
    chat-conversation.html
    ...
  /components
    header.js / header.css        (2 variants — see below)
    profile-card.js
    popover.js
    tray.js
    nav-bar.js
  styles.css
  tokens.css
  tokens.json
  components.md
  handoff.md
  /assets
```

---

## Build order (recommended)
1. **Foundation**: `tokens.css` / `tokens.json`, extracted from Figma.
2. **Shared components** as reusable partials (not redefined per screen):
   header, profile card, popover, tray, nav bar — nav bar blocked on the
   open inconsistency below.
3. **Screens**, each referencing shared components.

---

## Screens — status

### ✅ Menú Semanal (base)
Weekly meal schedule. Day selector (L–V), Desayuno/Comida toggle,
3 meal cards (Primer plato/Segundo plato/Postre), "Menú Celiacos"
allergen card, "Consultar informe" CTA. Full interaction spec: day
click updates content, toggle swaps card layout (COMIDA = 3 cards,
DESAYUNO = 1 suggestion card).

### ✅ Menú Semanal — Report variant
Same shell, dish cards get a mood icon (happy/neutral/sad, green/amber/
maroon), allergen card replaced with "Observaciones" note card, no CTA
button.

### ✅ Solicitar Asistencia (full flow)
Calendar-based day picker. States: contratado (green), festivo (pink),
weekend (muted), today (ring), available, seleccionado (blue+check).
Desayuno/Comida toggle (distinct styling from Menú Semanal's toggle).
Bottom card: empty vs. selected-days-summary + Solicitar button.
Includes Modal 3 (Confirmation, Sí/No) and Modal 4 (Thanks, auto-dismiss).
See `solicitar-asistencia-prompt.md` for the full consolidated prompt.

### ✅ Chat — list
Contact rows: avatar, name, role+child subtitle, chat-bubble icon button.

### ✅ Chat — conversation
Header with avatar+name (different header variant, no info icon).
Date divider, incoming/outgoing bubbles, image+text message type,
fixed input bar with send.

### ✅ Login
Photo collage (2×3 grid, brand logo centered), "Iniciar sesión" heading,
Usuario/Contrasinal form fields (password visibility toggle), "Gardar
datos de acceso" checkbox, "INICIAR SESIÓN" button (navy + accent-yellow
arrow), "Olvidaches o teu contrasinal?" link, legal text with 2 inline
links. Copy is in Galician — kept as-is. **Values approximated from
screenshot — Figma MCP hit the Starter plan rate limit before exact
values could be pulled (node 14752:4855). Revisit for fine-tuning
(navy shade, accent yellow, input border, corner radii) once the limit
resets.**

### ✅ Gestión
Administrative/account hub (distinct from operational screens). Vertical
list of rows: Perfil, Facturación y pagos, Contratos de servicio,
Documentos y autorizaciones, Notificaciones, Ajustes generales, Cerrar
sesión (separated, danger color, no chevron). Perfil row shares the same
destination as the Dashboard avatar shortcut. Most sub-screens are stubs
for this pass — priority is validating navigation structure. See
`gestion-prompt.md` for the full prompt.

### 🚧 Not yet specced
- **Renuncia flow** — tray option exists, no screen built yet.
- **Inicio** (home screen)
- **Perfil, Facturación, Contratos, Documentos, Notificaciones, Ajustes**
  — currently stub routes linked from Gestión, not yet designed/specced
  individually.

---

## Shared components

| Component | Used in | Notes |
|---|---|---|
| Header — plain title | Menú Semanal, Solicitar Asistencia | Back chevron + centered title + info icon (popover) |
| Header — avatar variant | Chat conversation | Back chevron + avatar + name/subtitle, no info icon |
| Profile card + pagination dots | Menú Semanal, Solicitar Asistencia | Identical component, reuse as-is |
| Info Popover | Menú Semanal, Solicitar Asistencia (copy TBD per screen) | Gluestack `Popover`/`PopoverArrow`; exact values pulled from Figma node 14792:19182; closes on outside click or "Entendido!" |
| Asistencia Tray | Triggered from nav bar | Gluestack `Actionsheet` pattern; exact values from node 14756:10091; backdrop `#2c3761` @80%, slide-up |
| Asistencia FAB (nav) | Bottom nav bar | Exact values from node 14797:22410; 59×61px circle, `#565f81`, overlaps nav top edge by 18px — **see open issue below** |
| Bottom nav bar (flat tabs) | All screens | 5 tabs, active state = Poppins ExtraBold label + filled icon; Asistencia slot conflicts with FAB — see below |
| Settings-row list item | Gestión | Icon + label + chevron, rounded card with hairline border; reusable for any future "list of options" screen |

---

## ⚠️ Open issues — resolve before final build

1. **Nav bar Asistencia treatment is inconsistent across Figma screens.**
   Seen as: (a) elevated FAB circle (node 14797:22410), (b) flat tab like
   the other four (Menú Semanal, Chat screens), (c) implied as a tray
   trigger. Decision needed: is Asistencia a persistent tab with its own
   screen, or an elevated action button opening the tray? This determines
   whether "Solicitar Asistencia" is a tab destination or a sheet-launched
   flow. Leaning toward persistent tab per current majority of screens,
   pending confirmation.
2. **"Menú Celiacos" card has a duplicate "Pescado" tag** (appears twice
   among 4 chips: Pescado, Vegetariano, Sin gluten, Pescado). Unconfirmed
   if intentional or a design/data placeholder.

---

## Working style
- Build incrementally: tokens first, then one representative screen fully
  polished, confirm fidelity against Figma, then proceed to the rest.
- Flag anywhere the Figma design is ambiguous rather than guessing silently.
- When a Figma node URL is available, call `get_design_context` directly
  instead of working from screenshots.
