# Prompt: Solicitar Asistencia screen (full flow)

Build `screens/solicitar-asistencia.html`, reusing the shared header
pattern, profile card, and info popover pattern already built in
`menu-semanal.html`.

## 1. Header
- Back chevron, title "Solicitar Asistencia", info icon — same layout
  as menu-semanal.html.
- Info icon opens the same Popover pattern already built (Popover,
  PopoverArrow, close on outside click or "Entendido!" button), with
  placeholder title/body copy for this screen's context (real copy TBD).

## 2. Profile card
- Reuse the exact profile card + pagination dots component from
  menu-semanal.html, unchanged.

## 3. Calendar card
- Month nav header: "‹ Septiembre 2026 ›" — arrows change the visible
  month and re-render the day grid from `calendarData`.
- 7-column day grid (L M X J V S D). Day cell states, in this
  precedence order (festivo/contratado override weekend/available, but
  not selection):
  1. **Contratado** — filled green circle, not clickable.
  2. **Festivo** — filled pink/coral circle, not clickable.
  3. **Weekend (S/D columns)** — muted gray, not clickable.
  4. **Today** — neutral fill, green ring border, clickable if otherwise
     available.
  5. **Available** — neutral fill, clickable.
  6. **Seleccionado** — filled blue circle, white checkmark icon,
     clickable to deselect.
- Legend row below the grid: 3 colored dots + labels
  (contratados / festivos / seleccionados).

### Mock data
```javascript
const calendarData = {
  "2026-09": {
    contratados: [1, 2, 3, 4, 8, 9, 10, 11, 12],
    festivos: [24],
    weekends: [6, 7, 13, 14, 20, 21, 27, 28],
    today: 5
  },
  "2026-10": {
    contratados: [],
    festivos: [],
    weekends: [3, 4, 10, 11, 17, 18, 24, 25, 31],
    today: null
  }
};

let selectedDays = []; // e.g. [{month: "2026-09", day: 22}, ...]
```

## 4. Desayuno/Comida toggle
- Same interaction pattern as menu-semanal.html (click to switch active
  segment), but this screen's active state shows a checkmark icon +
  solid blue fill — visually distinct from the other screen's toggle.
  Build as its own styled component here, don't reuse that one's exact
  CSS.

## 5. Bottom card — two states
- **Default** (0 days selected): static text "Selecciona los días que
  quieres", muted gray.
- **Active** (≥1 day selected): replaced with "Días seleccionados"
  label + selected dates grouped and formatted by month (e.g.
  "22-23-25 Septiembre" / "2 Octubre"), plus a full-width "Solicitar"
  button appearing below the card.

## 6. Interaction: day selection
- Tapping an available or selected day toggles it in/out of
  `selectedDays`, re-renders the cell state and the bottom card
  immediately, and persists selection when navigating between months.

## 7. Modal 3 — Confirmation (shown on "Solicitar" tap)
- Centered modal (not a bottom sheet): dimmed backdrop, white rounded
  card, centered in viewport.
- Header: two-line title "Modificación del servicio - Solicitar" in
  blue, bold, with an X close icon top-right (closes modal, no change).
- Body text, dynamically built from the current selection:
  `"Has indicado que deseas añadir los días {selectedDaysFormatted} al
  servicio de {activeToggle === 'comida' ? 'comedor' : 'desayuno'}."`
  followed by `"¿Estás seguro/a?"`.
- Two text-only blue buttons side by side: "Sí" and "No".
  - "No" or X: closes modal, no change.
  - "Sí": closes this modal, opens Modal 4 (Thanks), and marks the
    selected days as newly "contratados" in `calendarData`.

## 8. Modal 4 — Thanks (shown after confirming "Sí")
- Same backdrop/card style as Modal 3.
- Centered placeholder brand/logo icon at top.
- Centered body text, two lines: "Muchas gracias, hemos aplicado tu
  solicitud." / "Verás que tienes el calendario actualizado."
- No visible buttons — dismiss on backdrop tap, or auto-dismiss after
  ~2.5s. On dismiss, return to the Solicitar Asistencia screen with:
  - the calendar showing the newly selected days as "contratados"
    (green) instead of "seleccionados" (blue),
  - the bottom card reverted to its default empty state,
  - `selectedDays` cleared.

## Notes
- Use `tokens.css` for all colors/spacing/radii. Add new tokens as
  needed (e.g. green/pink/blue day states, `--color-modal-backdrop`)
  rather than hardcoding values.
- Nav bar pattern for Asistencia is currently inconsistent across
  screens (flat tab vs. elevated FAB seen elsewhere) — build this
  screen's own header/back navigation independently of that; don't
  block on resolving it here.
- "Solicitar" submission is mocked (console.log the payload), no real
  backend call.
