'use strict';

/**
 * "Solicitar Asistencia" tray — a global overlay triggered by the floating
 * FAB button docked into the bottom nav's Asistencia slot. Works from any
 * screen (index.html's SPA and every screens/*.html document) because it's
 * a single plain script that self-initializes and attaches to whatever
 * `.device-frame` / `.bottom-nav` already exist on the page — no per-screen
 * wiring required beyond adding the <script> tag and (already done) turning
 * each screen's own Asistencia nav item into an inert label + spacer.
 *
 * No Figma frame builds the FAB and tray as an isolated, reusable
 * component — this pass's node references (14797:22410 for the FAB,
 * 14756:10091 for the tray) sit inside one large comp that also shows a
 * full "Solicitar Asistencia" booking screen dimmed behind it. That
 * booking screen is NOT built here — out of scope, since the tray must
 * overlay whatever screen is actually active, not one fixed background.
 * See handoff.md.
 */

const scriptUrl = document.currentScript.src;
const assetsBase = new URL('assets/', scriptUrl).href;

const CALENDAR_ICON_PATH = `
  <path d="M17.5002 27.5H12.5002C7.7861 27.5 5.42909 27.5 3.96462 26.0355C2.50015 24.5711 2.50015 22.214 2.50015 17.5V15C2.50015 10.286 2.50015 7.92894 3.96462 6.46446C5.42909 5 7.7861 5 12.5002 5H17.5002C22.2142 5 24.5713 5 26.0356 6.46446C27.5001 7.92894 27.5002 10.286 27.5002 15V17.5C27.5002 22.214 27.5001 24.5711 26.0356 26.0355C25.2192 26.852 24.1253 27.2133 22.5002 27.3731" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
  <path d="M8.75031 5V3.125" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
  <path d="M21.2502 5V3.125" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
  <path d="M26.8752 11.25H20.7814H13.4377M2.50015 11.25H7.3439" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
  <path d="M22.5003 21.25C22.5003 21.9404 21.9407 22.5 21.2503 22.5C20.5599 22.5 20.0003 21.9404 20.0003 21.25C20.0003 20.5596 20.5599 20 21.2503 20C21.9407 20 22.5003 20.5596 22.5003 21.25Z" fill="currentColor"/>
  <path d="M22.5003 16.25C22.5003 16.9404 21.9407 17.5 21.2503 17.5C20.5599 17.5 20.0003 16.9404 20.0003 16.25C20.0003 15.5596 20.5599 15 21.2503 15C21.9407 15 22.5003 15.5596 22.5003 16.25Z" fill="currentColor"/>
  <path d="M16.2502 21.25C16.2502 21.9404 15.6905 22.5 15.0002 22.5C14.3098 22.5 13.7502 21.9404 13.7502 21.25C13.7502 20.5596 14.3098 20 15.0002 20C15.6905 20 16.2502 20.5596 16.2502 21.25Z" fill="currentColor"/>
  <path d="M16.2502 16.25C16.2502 16.9404 15.6905 17.5 15.0002 17.5C14.3098 17.5 13.7502 16.9404 13.7502 16.25C13.7502 15.5596 14.3098 15 15.0002 15C15.6905 15 16.2502 15.5596 16.2502 16.25Z" fill="currentColor"/>
  <path d="M10 21.25C10 21.9404 9.44035 22.5 8.75 22.5C8.05965 22.5 7.5 21.9404 7.5 21.25C7.5 20.5596 8.05965 20 8.75 20C9.44035 20 10 20.5596 10 21.25Z" fill="currentColor"/>
  <path d="M10 16.25C10 16.9404 9.44035 17.5 8.75 17.5C8.05965 17.5 7.5 16.9404 7.5 16.25C7.5 15.5596 8.05965 15 8.75 15C9.44035 15 10 15.5596 10 16.25Z" fill="currentColor"/>
`;

const FAB_HTML = `
  <button class="asistencia-fab" type="button" aria-label="Abrir Asistencia" data-action="open-asistencia-tray">
    <svg class="asistencia-fab__icon" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">${CALENDAR_ICON_PATH}</svg>
  </button>
`;

const TRAY_HTML = `
  <div class="tray-backdrop" id="asistencia-backdrop" hidden></div>
  <div class="asistencia-tray" id="asistencia-tray" hidden role="dialog" aria-modal="true" aria-labelledby="asistencia-tray-title">
    <div class="asistencia-tray__header">
      <h2 class="asistencia-tray__title" id="asistencia-tray-title">Asistencia</h2>
      <button class="asistencia-tray__close" type="button" aria-label="Cerrar" data-action="close-asistencia-tray">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <button class="asistencia-action" type="button" data-action="asistencia-request">
      <span class="asistencia-action__icon-wrap">
        <img src="${assetsBase}icon-nav-calendar.svg" alt="" class="asistencia-action__icon">
        <span class="asistencia-action__badge">+</span>
      </span>
      <span class="asistencia-action__text">
        <span class="asistencia-action__title">Asistencia</span>
        <span class="asistencia-action__desc">Contrata nuevos días para los servicios de madrugadores y/o comedor.</span>
      </span>
      <img src="${assetsBase}icon-chevron-right.svg" alt="" class="asistencia-action__chevron">
    </button>

    <button class="asistencia-action" type="button" data-action="asistencia-renuncia">
      <span class="asistencia-action__icon-wrap">
        <img src="${assetsBase}icon-nav-calendar.svg" alt="" class="asistencia-action__icon">
        <span class="asistencia-action__badge">−</span>
      </span>
      <span class="asistencia-action__text">
        <span class="asistencia-action__title">Renuncia</span>
        <span class="asistencia-action__desc">Renuncia a utilizar el servicio comunicándolo previamente.</span>
      </span>
      <img src="${assetsBase}icon-chevron-right.svg" alt="" class="asistencia-action__chevron">
    </button>

    <div class="asistencia-alert">
      <img src="${assetsBase}icon-warning.svg" alt="" class="asistencia-alert__icon">
      <p class="asistencia-alert__text">Ten en cuenta que las asistencias para poder estar operativas deben comunicarse 12 horas laborables antes de la prestación del servicio. En caso de renuncia si el aviso es posterior a 8 horas antes de la prestación del servicio éste se cobrará.</p>
    </div>
  </div>
`;

function initAsistenciaTray() {
  const deviceFrame = document.querySelector('.device-frame');
  const bottomNav = document.querySelector('.bottom-nav');
  if (!deviceFrame || !bottomNav) return;

  bottomNav.insertAdjacentHTML('beforeend', FAB_HTML);
  deviceFrame.insertAdjacentHTML('beforeend', TRAY_HTML);

  const backdrop = document.getElementById('asistencia-backdrop');
  const tray = document.getElementById('asistencia-tray');
  const fab = bottomNav.querySelector('.asistencia-fab');
  let closeTimer = null;
  let touchStartY = null;

  function openTray() {
    clearTimeout(closeTimer);
    backdrop.hidden = false;
    tray.hidden = false;
    void tray.offsetWidth; // force reflow so the open transition runs from the closed state
    backdrop.classList.add('tray-backdrop--open');
    tray.classList.add('asistencia-tray--open');
    document.addEventListener('keydown', handleEscape);
  }

  function closeTray() {
    backdrop.classList.remove('tray-backdrop--open');
    tray.classList.remove('asistencia-tray--open');
    document.removeEventListener('keydown', handleEscape);
    closeTimer = setTimeout(() => {
      backdrop.hidden = true;
      tray.hidden = true;
    }, 300);
  }

  function handleEscape(event) {
    if (event.key === 'Escape') closeTray();
  }

  // Exposed globally: index.html's main.js re-renders its screen content
  // (and any quicklink buttons targeting "asistencia") via template
  // cloning, so a one-time querySelectorAll here at init time can't see
  // elements that don't exist yet. Each screen's own delegated click
  // handler calls window.openAsistenciaTray() directly instead.
  window.openAsistenciaTray = openTray;
  window.closeAsistenciaTray = closeTray;

  // Trigger: the FAB itself, plus the (now icon-less) nav item behind it —
  // the whole overlapping region should feel tappable, not just the circle.
  fab.addEventListener('click', openTray);

  backdrop.addEventListener('click', closeTray);
  tray.querySelector('[data-action="close-asistencia-tray"]').addEventListener('click', closeTray);

  // Swipe-down to close: a simple threshold check on touchend, not a
  // live drag-follow — a reasonable simplification for this prototype.
  tray.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  tray.addEventListener('touchend', (event) => {
    if (touchStartY === null) return;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    touchStartY = null;
    if (deltaY > 60) closeTray();
  }, { passive: true });

  // "Asistencia" now has a real destination (screens/solicitar-asistencia.html).
  // Resolved relative to this script's own location, same trick as
  // assetsBase above, so it works whether the including page is at the
  // project root or one level down in screens/.
  const solicitarAsistenciaUrl = new URL('screens/solicitar-asistencia.html', scriptUrl).href;
  tray.querySelector('[data-action="asistencia-request"]').addEventListener('click', () => {
    window.location.href = solicitarAsistenciaUrl;
  });
  // "Renuncia" has no destination screen yet — log and flag rather than
  // guess at a real flow. See handoff.md.
  tray.querySelector('[data-action="asistencia-renuncia"]').addEventListener('click', () => {
    console.log('[Asistencia tray] "Renuncia" row tapped — no destination screen built yet.');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAsistenciaTray);
} else {
  initAsistenciaTray();
}
