'use strict';

/**
 * Solicitar Asistencia — full booking flow: calendar with 6 day-cell
 * states, its own DESAYUNO/COMIDA toggle (visually distinct from Menú
 * Semanal's, per spec), a 2-state bottom card, and a 2-modal confirm flow.
 * Uses menu-shared.js's mountSimpleScreenChrome() for header/popover/
 * profile card/bottom nav (no meal toggle or day selector from that
 * module — this screen has its own calendar instead). See handoff.md.
 */

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CHECK_ICON_SVG = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLOSE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const BRAND_ICON_SVG = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2"/><path d="M15 24l6 6 12-13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------------------------------------------------------------------
   MOCK DATA
   Only 2026-09 and 2026-10 have real mock content, per your spec. Any
   other month falls back to a computed shell (real weekday/weekend math,
   no contratados/festivos/today) so month nav doesn't break — see
   getMonthData(). "weekends" for the two mocked months is trusted as
   given, not recomputed, even though it's only ever used for STATE
   (which days get the muted treatment); the grid's actual day-of-week
   LAYOUT always comes from real Date math regardless.
--------------------------------------------------------------------- */
const calendarData = {
  '2026-09': {
    contratados: [1, 2, 3, 4, 8, 9, 10, 11, 12],
    festivos: [24],
    weekends: [6, 7, 13, 14, 20, 21, 27, 28],
    today: 5,
  },
  '2026-10': {
    contratados: [],
    festivos: [],
    weekends: [3, 4, 10, 11, 17, 18, 24, 25, 31],
    today: null,
  },
};

let selectedDays = []; // [{month: "2026-09", day: 22}, ...]
let currentMonthKey = '2026-09';
let activeMeal = 'comida';
let currentModalKind = null; // 'confirm' | 'thanks' | null
let thanksAutoDismissTimer = null;

/* ---------------------------------------------------------------------
   DATE MATH
--------------------------------------------------------------------- */
function daysInMonth(year, month) { // month is 1-12
  return new Date(year, month, 0).getDate();
}
function firstWeekdayMondayIndex(year, month) { // returns 0=Monday..6=Sunday
  return (new Date(year, month - 1, 1).getDay() + 6) % 7;
}
function computeWeekends(year, month) {
  const total = daysInMonth(year, month);
  const weekends = [];
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 0 || dow === 6) weekends.push(d);
  }
  return weekends;
}
function getMonthData(monthKey) {
  // "weekends" isn't read from here — see renderCalendar()'s comment —
  // kept only because it's part of the shape calendarData entries have.
  if (calendarData[monthKey]) return calendarData[monthKey];
  return { contratados: [], festivos: [], weekends: [], today: null };
}

/* ---------------------------------------------------------------------
   CALENDAR RENDER
--------------------------------------------------------------------- */
let monthLabelEl, calendarGridEl;

function dayState(day, data, weekends) {
  if (data.contratados.includes(day)) return 'contratado';
  if (data.festivos.includes(day)) return 'festivo';
  if (weekends.includes(day)) return 'weekend';
  return 'available';
}

function isSelected(day) {
  return selectedDays.some((d) => d.month === currentMonthKey && d.day === day);
}

function buildDayCellHtml(day, data, weekends) {
  const state = dayState(day, data, weekends);
  const clickable = state === 'available';
  const isToday = data.today === day;
  const selected = clickable && isSelected(day);

  const classes = ['calendar-day', `calendar-day--${state}`];
  if (isToday) classes.push('calendar-day--today');
  if (selected) classes.push('calendar-day--selected');

  const tag = clickable ? 'button' : 'span';
  const attrs = clickable ? `type="button" data-day="${day}"` : 'aria-disabled="true"';
  const content = selected ? CHECK_ICON_SVG : String(day);

  return `<${tag} class="${classes.join(' ')}" ${attrs}>${content}</${tag}>`;
}

function renderCalendar() {
  const [year, month] = currentMonthKey.split('-').map(Number);
  const data = getMonthData(currentMonthKey);
  const total = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayMondayIndex(year, month);
  // Always computed from real Date math, never data.weekends — the mock
  // data's weekend lists don't actually align with real weekday math for
  // these months (off by exactly one day), which would render weekend
  // shading under the wrong day-of-week columns. See handoff.md.
  const weekends = computeWeekends(year, month);

  monthLabelEl.textContent = `${MONTH_NAMES[month - 1]} ${year}`;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push('<span class="calendar-day calendar-day--blank" aria-hidden="true"></span>');
  }
  for (let day = 1; day <= total; day++) {
    cells.push(buildDayCellHtml(day, data, weekends));
  }
  calendarGridEl.innerHTML = cells.join('');
}

function shiftMonth(delta) {
  const [year, month] = currentMonthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  renderCalendar();
}

function toggleDaySelection(day) {
  const idx = selectedDays.findIndex((d) => d.month === currentMonthKey && d.day === day);
  if (idx >= 0) {
    selectedDays.splice(idx, 1);
  } else {
    selectedDays.push({ month: currentMonthKey, day });
  }
  renderCalendar();
  renderBottomCard();
}

/* ---------------------------------------------------------------------
   BOTTOM CARD (2 states)
--------------------------------------------------------------------- */
let bottomCardContainerEl;

function groupSelectedByMonth() {
  const byMonth = {};
  selectedDays.forEach(({ month, day }) => {
    (byMonth[month] = byMonth[month] || []).push(day);
  });
  return Object.keys(byMonth).sort().map((month) => {
    const [, m] = month.split('-').map(Number);
    const days = byMonth[month].slice().sort((a, b) => a - b).join('-');
    return `${days} ${MONTH_NAMES[m - 1]}`;
  }).join(' / ');
}

function renderBottomCard() {
  if (selectedDays.length === 0) {
    bottomCardContainerEl.innerHTML = `
      <div class="asistencia-info-banner">
        <p class="asistencia-info-banner__text">Selecciona los días que quieres</p>
      </div>
    `;
    return;
  }

  bottomCardContainerEl.innerHTML = `
    <div class="asistencia-selection-banner">
      <p class="asistencia-selection-banner__label">Días seleccionados</p>
      <p class="asistencia-selection-banner__value">${groupSelectedByMonth()}</p>
    </div>
    <button class="button-cta" type="button" id="solicitar-button">Solicitar</button>
  `;
  document.getElementById('solicitar-button').addEventListener('click', openConfirmModal);
}

/* ---------------------------------------------------------------------
   TOGGLE (this screen's own — checkmark + solid fill, not a shared
   component with Menú Semanal's pill toggle, per spec)
--------------------------------------------------------------------- */
function wireToggle() {
  const toggle = document.querySelector('.asistencia-toggle');
  toggle.addEventListener('click', (event) => {
    const option = event.target.closest('.asistencia-toggle__option');
    if (!option) return;
    toggle.querySelectorAll('.asistencia-toggle__option').forEach((el) => {
      const isActive = el === option;
      el.classList.toggle('asistencia-toggle__option--active', isActive);
      el.setAttribute('aria-selected', String(isActive));
    });
    activeMeal = option.dataset.meal;
  });
}

/* ---------------------------------------------------------------------
   MODALS (centered — a different pattern from the Asistencia tray's
   bottom sheet, per spec: "Centered modal (not a bottom sheet)")
--------------------------------------------------------------------- */
let modalBackdropEl, modalCardEl;

function mountModalShell() {
  document.querySelector('.device-frame').insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="asistencia-modal-backdrop" hidden>
      <div class="modal-card" id="asistencia-modal-card"></div>
    </div>
  `);
  modalBackdropEl = document.getElementById('asistencia-modal-backdrop');
  modalCardEl = document.getElementById('asistencia-modal-card');

  modalBackdropEl.addEventListener('click', (event) => {
    if (event.target !== modalBackdropEl) return; // clicks on the card itself shouldn't close it
    if (currentModalKind === 'confirm') closeModalBackdrop();
    else if (currentModalKind === 'thanks') dismissThanksModal();
  });

  modalCardEl.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'modal-cancel') closeModalBackdrop();
    else if (action === 'modal-confirm') confirmSolicitud();
  });
}

function showModal() {
  modalBackdropEl.hidden = false;
  void modalBackdropEl.offsetWidth;
  modalBackdropEl.classList.add('modal-backdrop--open');
  document.addEventListener('keydown', handleModalEscape);
}

function closeModalBackdrop() {
  modalBackdropEl.classList.remove('modal-backdrop--open');
  document.removeEventListener('keydown', handleModalEscape);
  clearTimeout(thanksAutoDismissTimer);
  setTimeout(() => {
    modalBackdropEl.hidden = true;
    currentModalKind = null;
  }, 200);
}

function handleModalEscape(event) {
  if (event.key !== 'Escape') return;
  if (currentModalKind === 'confirm') closeModalBackdrop();
  else if (currentModalKind === 'thanks') dismissThanksModal();
}

function openConfirmModal() {
  const formatted = groupSelectedByMonth();
  const serviceWord = activeMeal === 'comida' ? 'comedor' : 'desayuno';
  currentModalKind = 'confirm';
  modalCardEl.innerHTML = `
    <button class="modal-card__close" type="button" aria-label="Cerrar" data-action="modal-cancel">${CLOSE_ICON_SVG}</button>
    <p class="modal-card__title">Modificación del servicio<br>- Solicitar</p>
    <p class="modal-card__body">Has indicado que deseas añadir los días ${formatted} al servicio de ${serviceWord}.<br><br>¿Estás seguro/a?</p>
    <div class="modal-card__actions">
      <button class="modal-card__text-button" type="button" data-action="modal-confirm">Sí</button>
      <button class="modal-card__text-button" type="button" data-action="modal-cancel">No</button>
    </div>
  `;
  showModal();
}

function openThanksModal() {
  currentModalKind = 'thanks';
  modalCardEl.innerHTML = `
    <div class="modal-card__brand" aria-hidden="true">${BRAND_ICON_SVG}</div>
    <p class="modal-card__thanks-text">Muchas gracias, hemos aplicado tu solicitud.<br>Verás que tienes el calendario actualizado.</p>
  `;
  showModal();
  thanksAutoDismissTimer = setTimeout(dismissThanksModal, 2500);
}

function confirmSolicitud() {
  // Mock submission — no backend, per spec.
  selectedDays.forEach(({ month, day }) => {
    if (!calendarData[month]) calendarData[month] = getMonthData(month);
    if (!calendarData[month].contratados.includes(day)) calendarData[month].contratados.push(day);
  });

  console.log('[Solicitar Asistencia] payload:', {
    days: selectedDays.map((d) => `${d.day} ${MONTH_NAMES[Number(d.month.split('-')[1]) - 1]} ${d.month.split('-')[0]}`),
    service: activeMeal === 'comida' ? 'comedor' : 'desayuno',
  });

  closeModalBackdrop();
  renderCalendar(); // days are now "contratado" in the data — reflect it immediately, even while the thanks modal is still queued
  setTimeout(openThanksModal, 220); // let the confirm modal's close transition finish first
}

function dismissThanksModal() {
  closeModalBackdrop();
  selectedDays = [];
  renderBottomCard();
  renderCalendar();
}

/* ---------------------------------------------------------------------
   MOUNT
--------------------------------------------------------------------- */
const screenContent = mountSimpleScreenChrome({
  backHref: '#',
  title: 'Solicitar Asistencia',
  popover: {
    title: 'Solicitar Asistencia',
    body: 'Selecciona en el calendario los días que necesitas contratar el servicio de comedor o madrugadores, y pulsa Solicitar para confirmarlos. (Copy definitivo pendiente de confirmar con el equipo de contenido.)',
  },
  activeTab: undefined,
});

// The back chevron needs to return to whatever screen the tray was opened
// from, not one fixed screen — this is reachable from Home and from every
// Menú Semanal screen. history.back() handles that; headerHtml() always
// renders a real <a>, so backHref="#" + preventDefault avoids a page jump
// on browsers that don't have anywhere to go back to.
document.querySelector('.screen-header__back').addEventListener('click', (event) => {
  event.preventDefault();
  history.back();
});

screenContent.innerHTML = `
  <div class="solicitar-calendar">
    <div class="solicitar-calendar__nav">
      <button class="solicitar-calendar__nav-button" type="button" id="calendar-prev" aria-label="Mes anterior">‹</button>
      <span class="solicitar-calendar__month-label" id="calendar-month-label"></span>
      <button class="solicitar-calendar__nav-button" type="button" id="calendar-next" aria-label="Mes siguiente">›</button>
    </div>
    <div class="solicitar-calendar__weekdays" aria-hidden="true">
      <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
    </div>
    <div class="solicitar-calendar__grid" id="calendar-grid" role="grid" aria-label="Calendario"></div>
    <div class="solicitar-calendar__legend">
      <span class="solicitar-legend-item"><span class="solicitar-legend-item__dot solicitar-legend-item__dot--contratados"></span>contratados</span>
      <span class="solicitar-legend-item"><span class="solicitar-legend-item__dot solicitar-legend-item__dot--festivos"></span>festivos</span>
      <span class="solicitar-legend-item"><span class="solicitar-legend-item__dot solicitar-legend-item__dot--seleccionados"></span>seleccionados</span>
    </div>
  </div>

  <div class="asistencia-toggle" role="tablist" aria-label="Tipo de servicio">
    <button class="asistencia-toggle__option" type="button" role="tab" aria-selected="false" data-meal="desayuno">
      <span class="asistencia-toggle__check">${CHECK_ICON_SVG}</span>
      Desayuno
    </button>
    <button class="asistencia-toggle__option asistencia-toggle__option--active" type="button" role="tab" aria-selected="true" data-meal="comida">
      <span class="asistencia-toggle__check">${CHECK_ICON_SVG}</span>
      Comida
    </button>
  </div>

  <div id="bottom-card-container"></div>
`;

monthLabelEl = document.getElementById('calendar-month-label');
calendarGridEl = document.getElementById('calendar-grid');
bottomCardContainerEl = document.getElementById('bottom-card-container');

document.getElementById('calendar-prev').addEventListener('click', () => shiftMonth(-1));
document.getElementById('calendar-next').addEventListener('click', () => shiftMonth(1));
calendarGridEl.addEventListener('click', (event) => {
  const cell = event.target.closest('.calendar-day');
  if (!cell || cell.tagName !== 'BUTTON') return;
  toggleDaySelection(Number(cell.dataset.day));
});

wireToggle();
mountModalShell();
renderCalendar();
renderBottomCard();
