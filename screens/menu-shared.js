'use strict';

/**
 * Shared chrome for the Menú Semanal screen family
 * (menu-semanal.html and menu-semanal-report.html): header + help popover,
 * profile card, DESAYUNO/COMIDA toggle, day selector, bottom nav.
 *
 * Markup and interaction wiring live here once so the two screens can't
 * drift out of sync. Each screen calls mountMenuChrome() once, gets back a
 * content-mount element, and owns everything below that point itself
 * (its own data, its own render function for meal content).
 */

const MENU_SCREEN_DAYS = [
  { date: '2026-06-15', letter: 'L', number: '15', name: 'Lunes' },
  { date: '2026-06-16', letter: 'M', number: '16', name: 'Martes' },
  { date: '2026-06-17', letter: 'X', number: '17', name: 'Miércoles' },
  { date: '2026-06-18', letter: 'J', number: '18', name: 'Jueves' },
  { date: '2026-06-19', letter: 'V', number: '19', name: 'Viernes' },
];
const MENU_SCREEN_DEFAULT_DATE = '2026-06-18';

const NAV_ICON_SVG = {
  home: `<path d="M9.6875 19.0208C10.7505 19.8087 12.0432 20.2708 13.4375 20.2708C14.8317 20.2708 16.1245 19.8087 17.1875 19.0208" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M25.4824 14.6349L25.134 17.0565C24.5246 21.2909 24.22 23.408 22.7512 24.6728C21.2824 25.9375 19.1282 25.9375 14.8201 25.9375H12.0549C7.74671 25.9375 5.59261 25.9375 4.12379 24.6728C2.65495 23.408 2.35031 21.2909 1.74105 17.0565L1.39259 14.6349C0.918287 11.3385 0.681137 9.69036 1.35671 8.28119C2.03229 6.872 3.47024 6.01543 6.34614 4.30226L8.07719 3.27109C10.6888 1.71536 11.9946 0.9375 13.4375 0.9375C14.8804 0.9375 16.1862 1.71536 18.7977 3.27109L20.5289 4.30226C23.4047 6.01543 24.8427 6.872 25.5182 8.28119" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>`,
  menus: `<path d="M16.3738 21.0489L16.875 20.8817L18.4245 20.3652C18.9085 20.204 19.1504 20.1232 19.3781 20.0147C19.6466 19.8867 19.9005 19.7299 20.1351 19.547C20.334 19.3919 20.5144 19.2115 20.8751 18.8507L26.2009 13.525L26.7801 12.9456C27.74 11.9858 27.74 10.4297 26.7801 9.46986C25.8204 8.51005 24.2641 8.51005 23.3044 9.46986L22.725 10.0492L17.3993 15.3749C17.0385 15.7356 16.8581 15.916 16.703 16.1149C16.5201 16.3495 16.3633 16.6034 16.2353 16.8719C16.1268 17.0996 16.046 17.3415 15.8848 17.8255L15.3683 19.375L15.2011 19.8762L15.034 20.3776C14.9546 20.6157 15.0166 20.8784 15.1941 21.0559C15.3716 21.2334 15.6343 21.2954 15.8724 21.216L16.3738 21.0489ZM22.725 10.0492C22.725 10.0492 22.7975 11.2802 23.8836 12.3664C24.9699 13.4525 26.2009 13.525 26.2009 13.525M15.2011 19.8762L16.3738 21.0489" stroke="currentColor" stroke-width="1.875"/>
    <path d="M9.99969 16.25H13.1247" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M9.99969 11.25H18.1247" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M9.99969 21.25H11.8747" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M3.75 17.5V12.5C3.75 7.78595 3.75 5.42894 5.21446 3.96446C6.67894 2.5 9.03595 2.5 13.75 2.5H16.25C20.964 2.5 23.3211 2.5 24.7855 3.96446M26.25 17.5C26.25 22.214 26.25 24.5711 24.7855 26.0355M26.2391 20C26.1943 23.0995 25.9644 24.8566 24.7855 26.0355C23.3211 27.5 20.964 27.5 16.25 27.5H13.75C9.03595 27.5 6.67894 27.5 5.21446 26.0355" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>`,
  asistencia: `<path d="M17.5002 27.5H12.5002C7.7861 27.5 5.42909 27.5 3.96462 26.0355C2.50015 24.5711 2.50015 22.214 2.50015 17.5V15C2.50015 10.286 2.50015 7.92894 3.96462 6.46446C5.42909 5 7.7861 5 12.5002 5H17.5002C22.2142 5 24.5713 5 26.0356 6.46446C27.5001 7.92894 27.5002 10.286 27.5002 15V17.5C27.5002 22.214 27.5001 24.5711 26.0356 26.0355C25.2192 26.852 24.1253 27.2133 22.5002 27.3731" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M8.75031 5V3.125" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M21.2502 5V3.125" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M26.8752 11.25H20.7814H13.4377M2.50015 11.25H7.3439" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M22.5003 21.25C22.5003 21.9404 21.9407 22.5 21.2503 22.5C20.5599 22.5 20.0003 21.9404 20.0003 21.25C20.0003 20.5596 20.5599 20 21.2503 20C21.9407 20 22.5003 20.5596 22.5003 21.25Z" fill="currentColor"/>
    <path d="M22.5003 16.25C22.5003 16.9404 21.9407 17.5 21.2503 17.5C20.5599 17.5 20.0003 16.9404 20.0003 16.25C20.0003 15.5596 20.5599 15 21.2503 15C21.9407 15 22.5003 15.5596 22.5003 16.25Z" fill="currentColor"/>
    <path d="M16.2502 21.25C16.2502 21.9404 15.6905 22.5 15.0002 22.5C14.3098 22.5 13.7502 21.9404 13.7502 21.25C13.7502 20.5596 14.3098 20 15.0002 20C15.6905 20 16.2502 20.5596 16.2502 21.25Z" fill="currentColor"/>
    <path d="M16.2502 16.25C16.2502 16.9404 15.6905 17.5 15.0002 17.5C14.3098 17.5 13.7502 16.9404 13.7502 16.25C13.7502 15.5596 14.3098 15 15.0002 15C15.6905 15 16.2502 15.5596 16.2502 16.25Z" fill="currentColor"/>
    <path d="M10 21.25C10 21.9404 9.44035 22.5 8.75 22.5C8.05965 22.5 7.5 21.9404 7.5 21.25C7.5 20.5596 8.05965 20 8.75 20C9.44035 20 10 20.5596 10 21.25Z" fill="currentColor"/>
    <path d="M10 16.25C10 16.9404 9.44035 17.5 8.75 17.5C8.05965 17.5 7.5 16.9404 7.5 16.25C7.5 15.5596 8.05965 15 8.75 15C9.44035 15 10 15.5596 10 16.25Z" fill="currentColor"/>`,
  chat: `<path d="M15.9375 7.27532C14.4666 6.42447 12.7589 5.9375 10.9375 5.9375C5.41465 5.9375 0.9375 10.4146 0.9375 15.9375C0.9375 17.5371 1.31311 19.0491 1.98096 20.39C2.15844 20.7463 2.21751 21.1536 2.11461 21.5381L1.51901 23.7641C1.26045 24.7305 2.14451 25.6145 3.11085 25.356L5.33689 24.7604C5.72144 24.6575 6.12871 24.7166 6.48502 24.894C7.82586 25.5619 9.33781 25.9375 10.9375 25.9375C16.4604 25.9375 20.9375 21.4604 20.9375 15.9375C20.9375 14.1161 20.4505 12.4084 19.5996 10.9375" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M20.9375 16.5647C21.0206 16.5301 21.103 16.4941 21.1846 16.4569C21.6372 16.2501 22.1451 16.1728 22.6257 16.3014L23.2209 16.4606C24.4287 16.7837 25.5337 15.6787 25.2106 14.4709L25.0514 13.8757C24.9228 13.3951 25.0001 12.8872 25.2069 12.4346C25.676 11.4075 25.9375 10.2655 25.9375 9.0625C25.9375 7.4699 25.4793 5.98431 24.6875 4.73039M10.3125 5.932C11.5382 2.99874 14.4346 0.9375 17.8125 0.9375C19.4232 0.9375 20.9246 1.40625 22.1875 2.21477" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>
    <path d="M6.58535 15.9375H6.5966M10.9488 15.9375H10.96M15.3125 15.9375H15.3238" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  gestion: `<path d="M8.97278 13.4375C8.97278 15.5072 10.6531 17.1875 12.7228 17.1875C14.7925 17.1875 16.4728 15.5072 16.4728 13.4375C16.4728 11.3678 14.7925 9.6875 12.7228 9.6875C10.6531 9.6875 8.97278 11.3678 8.97278 13.4375V13.4375" stroke="currentColor" stroke-width="1.875"/>
    <path d="M2.2993 11.7365C2.88999 12.1076 3.27005 12.7399 3.27005 13.4374C3.27004 14.135 2.88998 14.7673 2.2993 15.1384C1.89735 15.3909 1.63838 15.5928 1.45413 15.8329C1.05049 16.359 0.872354 17.0238 0.958904 17.6811C1.0238 18.1741 1.31502 18.6785 1.89744 19.6874C2.47988 20.6961 2.77109 21.2005 3.1656 21.5033C3.69163 21.9069 4.35645 22.085 5.01383 21.9985C5.31387 21.959 5.61813 21.8356 6.03773 21.6139C6.65458 21.2879 7.39225 21.2749 7.99647 21.6238C8.60062 21.9726 8.95812 22.6179 8.98418 23.315C9.00193 23.7894 9.04725 24.1146 9.16308 24.3943C9.41682 25.0068 9.9035 25.4935 10.516 25.7473C10.9755 25.9375 11.5579 25.9375 12.7228 25.9375C13.8877 25.9375 14.47 25.9375 14.9295 25.7473C15.542 25.4935 16.0288 25.0068 16.2825 24.3943C16.3983 24.1146 16.4437 23.7894 16.4614 23.3151C16.4874 22.6179 16.8449 21.9726 17.4492 21.6238C18.0533 21.275 18.7909 21.288 19.4077 21.614C19.8274 21.8358 20.1317 21.9591 20.4317 21.9986C21.089 22.0853 21.7539 21.907 22.2799 21.5034C22.6744 21.2007 22.9657 20.6963 23.5482 19.6875C23.8074 19.2384 24.009 18.8893 24.1585 18.5965M23.1462 15.1385C22.5555 14.7674 22.1755 14.1351 22.1754 13.4376C22.1754 12.74 22.5555 12.1076 23.1462 11.7365C23.5482 11.484 23.807 11.2821 23.9913 11.042C24.3949 10.516 24.573 9.85115 24.4865 9.19378C24.4217 8.70075 24.1304 8.19635 23.5479 7.18756C22.9655 6.17876 22.6743 5.67438 22.2798 5.37165C21.7538 4.96801 21.0889 4.78988 20.4315 4.87641C20.1315 4.91593 19.8273 5.03925 19.4077 5.26104C18.7908 5.58705 18.0532 5.60005 17.449 5.2512C16.8449 4.90238 16.4874 4.25713 16.4614 3.56004C16.4437 3.08565 16.3983 2.76044 16.2825 2.48079C16.0288 1.86823 15.542 1.38154 14.9295 1.1278C14.47 0.937501 13.8877 0.937501 12.7228 0.937501C11.5579 0.937501 10.9755 0.937501 10.516 1.1278C9.9035 1.38154 9.41682 1.86823 9.16308 2.48079C9.04725 2.76041 9.00193 3.0856 8.98418 3.55993C8.9581 4.25708 8.60059 4.90239 7.99642 5.2512C7.39224 5.60003 6.65463 5.58699 6.03784 5.261C5.61819 5.0392 5.3139 4.91586 5.01384 4.87635C4.35647 4.78981 3.69164 4.96795 3.16562 5.37159C2.7711 5.67431 2.47989 6.17871 1.89745 7.1875C1.63817 7.63661 1.43659 7.98574 1.287 8.27841" stroke="currentColor" stroke-width="1.875" stroke-linecap="round"/>`,
};

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', viewBox: '0 0 26.456 26.875', href: '../index.html' },
  { id: 'menus', label: 'Menús', viewBox: '0 0 30 30', href: 'menu-semanal.html' },
  { id: 'asistencia', label: 'Asistencia', viewBox: '0 0 30 30', href: '../index.html#asistencia' }, // viewBox/href unused — bottomNavHtml() special-cases this id, see below
  { id: 'chat', label: 'Chat', viewBox: '0 0 26.875 26.875', href: 'chat.html' },
  { id: 'gestion', label: 'Gestión', viewBox: '0 0 25.4454 26.875', href: 'gestion.html' },
];

const DEFAULT_POPOVER = {
  title: 'Alimentación saludable',
  body: '1. Contamos con más de 16 menús para cuidar una alimentación saludable de nuestros niños y niñas.<br>2. A través de este apartado podrás ver el menú que tiene asignado cada menor y que platos come cada día.<br>3. Puedes navegar entre los diferentes días y ver el informe en detalle con las observaciones de los monitores.',
};

/**
 * @param {string} backHref
 * @param {string} title - header <h1> text
 * @param {{title: string, body: string}} [popover] - defaults to the
 *   Menú Semanal copy for backward compatibility with the two screens
 *   that were already calling this before it took a 3rd argument.
 * @param {boolean} [showHelp] - defaults to true for the same reason
 */
function headerHtml(backHref, title, popover, showHelp = true) {
  const { title: popoverTitle, body: popoverBody } = popover || DEFAULT_POPOVER;
  const helpMarkup = showHelp ? `
    <button class="screen-header__help" type="button" aria-label="Ayuda" aria-haspopup="dialog" aria-expanded="false" aria-controls="menu-help-popover">
      <img src="../assets/icon-help-circle.svg" alt="">
    </button>
    <div class="popover" id="menu-help-popover" hidden>
      <div class="popover__arrow" aria-hidden="true"></div>
      <div class="popover__card" role="dialog" aria-label="Ayuda: ${popoverTitle}">
        <p class="popover__title">${popoverTitle}</p>
        <p class="popover__body">${popoverBody}</p>
        <button class="popover__button" type="button" data-action="close-popover">Entendido!</button>
      </div>
    </div>
  ` : '';
  return `
    <a class="screen-header__back" href="${backHref}" aria-label="Volver">
      <img src="../assets/icon-back-chevron.svg" alt="">
    </a>
    <h1 class="screen-header__title">${title}</h1>
    ${helpMarkup}
  `;
}

function profileCardHtml() {
  return `
    <section class="profile-card" aria-label="Hijo/a seleccionado/a">
      <span class="avatar avatar--md">
        <img src="../assets/avatar-placeholder.jpg" alt="" class="avatar__image">
      </span>
      <p class="profile-card__name">Lucía Martínez Crespo</p>
      <span class="profile-card__chevron" aria-hidden="true">
        <img src="../assets/icon-chevron-right.svg" alt="">
      </span>
    </section>
    <div class="pagination-dots" aria-hidden="true">
      <span class="pagination-dots__dot pagination-dots__dot--active"></span>
      <span class="pagination-dots__dot"></span>
    </div>
  `;
}

function segmentedToggleHtml() {
  return `
    <div class="segmented-toggle" role="tablist" aria-label="Tipo de servicio">
      <button class="segmented-toggle__option" type="button" role="tab" aria-selected="false" data-meal="desayuno">DESAYUNO</button>
      <button class="segmented-toggle__option segmented-toggle__option--active" type="button" role="tab" aria-selected="true" data-meal="comida">COMIDA</button>
    </div>
  `;
}

function daySelectorHtml() {
  const days = MENU_SCREEN_DAYS.map((day) => {
    const isActive = day.date === MENU_SCREEN_DEFAULT_DATE;
    return `
      <button class="day-selector__day${isActive ? ' day-selector__day--active' : ''}" type="button" role="tab" aria-selected="${isActive}" data-date="${day.date}" data-day-name="${day.name}" data-day-number="${day.number}">
        <span class="day-selector__letter">${day.letter}</span>
        <span class="day-selector__number">${day.number}</span>
      </button>
    `;
  }).join('');
  return `<div class="day-selector" role="tablist" aria-label="Seleccionar día">${days}</div>`;
}

function dateHeadingHtml() {
  const defaultDay = MENU_SCREEN_DAYS.find((d) => d.date === MENU_SCREEN_DEFAULT_DATE);
  return `<p class="date-heading" id="date-heading">${defaultDay.name}, ${defaultDay.number} de Junio</p>`;
}

function bottomNavHtml(activeTab) {
  const items = NAV_ITEMS.map((item) => {
    // Asistencia never navigates — it opens the tray via the floating FAB
    // (asistencia-tray.js), so its own icon is an invisible spacer (keeps
    // the label's vertical position matching its siblings) and it's
    // always a button, never a link.
    if (item.id === 'asistencia') {
      return `
        <button class="nav-item nav-item--asistencia" type="button" data-action="open-asistencia-tray">
          <span class="nav-item__icon" aria-hidden="true"></span>
          <span class="nav-item__label">${item.label}</span>
        </button>
      `;
    }
    const isActive = item.id === activeTab;
    const tag = isActive ? 'button' : 'a';
    const attrs = isActive ? 'type="button" aria-current="page"' : `href="${item.href}"`;
    return `
      <${tag} class="nav-item" ${attrs}>
        <svg class="nav-item__icon" viewBox="${item.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">${NAV_ICON_SVG[item.id]}</svg>
        <span class="nav-item__label">${item.label}</span>
      </${tag}>
    `;
  }).join('');
  return `<nav class="bottom-nav" aria-label="Navegación principal">${items}</nav>`;
}

function wireSegmentedToggle(onMealChange) {
  const toggle = document.querySelector('.segmented-toggle');
  toggle.addEventListener('click', (event) => {
    const option = event.target.closest('.segmented-toggle__option');
    if (!option) return;
    toggle.querySelectorAll('.segmented-toggle__option').forEach((el) => {
      const isSelected = el === option;
      el.classList.toggle('segmented-toggle__option--active', isSelected);
      el.setAttribute('aria-selected', String(isSelected));
    });
    onMealChange(option.dataset.meal);
  });
}

function wireDaySelector(onDayChange) {
  const selector = document.querySelector('.day-selector');
  const dateHeading = document.getElementById('date-heading');
  selector.addEventListener('click', (event) => {
    const day = event.target.closest('.day-selector__day');
    if (!day) return;
    selector.querySelectorAll('.day-selector__day').forEach((el) => {
      const isSelected = el === day;
      el.classList.toggle('day-selector__day--active', isSelected);
      el.setAttribute('aria-selected', String(isSelected));
    });
    dateHeading.textContent = `${day.dataset.dayName}, ${day.dataset.dayNumber} de Junio`;
    onDayChange(day.dataset.date);
  });
}

function wirePopover() {
  const helpButton = document.querySelector('.screen-header__help');
  const popover = document.getElementById('menu-help-popover');
  if (!helpButton || !popover) return; // showHelp: false — nothing to wire
  const popoverCloseButton = popover.querySelector('[data-action="close-popover"]');
  let popoverCloseTimer = null;

  function openPopover() {
    clearTimeout(popoverCloseTimer);
    popover.hidden = false;
    void popover.offsetWidth; // force reflow so the open transition runs from the closed state
    popover.classList.add('popover--open');
    helpButton.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', handleOutsideClick, true);
    document.addEventListener('keydown', handleEscape);
  }

  function closePopover() {
    popover.classList.remove('popover--open');
    helpButton.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick, true);
    document.removeEventListener('keydown', handleEscape);
    popoverCloseTimer = setTimeout(() => { popover.hidden = true; }, 200);
  }

  function handleOutsideClick(event) {
    if (popover.contains(event.target) || helpButton.contains(event.target)) return;
    closePopover();
  }

  function handleEscape(event) {
    if (event.key === 'Escape') closePopover();
  }

  helpButton.addEventListener('click', () => {
    if (popover.hidden) openPopover(); else closePopover();
  });
  popoverCloseButton.addEventListener('click', closePopover);
}

/**
 * Builds the full shared chrome into #app-view / .app-shell and wires its
 * interactions. Returns the empty content-mount element for the calling
 * screen to fill with its own (meal-content, observaciones, CTA, ...).
 *
 * @param {Object} options
 * @param {string} options.backHref - where the back chevron navigates to
 * @param {string} [options.title] - header <h1> text, defaults to "Menú Semanal"
 * @param {string} options.activeTab - which NAV_ITEMS id is the current tab
 * @param {(meal: 'desayuno'|'comida') => void} options.onMealChange
 * @param {(date: string) => void} options.onDayChange - ISO date, e.g. '2026-06-18'
 */
function mountMenuChrome({ backHref, title = 'Menú Semanal', activeTab, onMealChange, onDayChange }) {
  const appView = document.getElementById('app-view');
  const appShell = document.querySelector('.app-shell');

  appView.innerHTML = `
    <header class="screen-header">${headerHtml(backHref, title)}</header>
    <div class="screen-menu-semanal__body">
      ${profileCardHtml()}
      ${segmentedToggleHtml()}
      ${daySelectorHtml()}
      ${dateHeadingHtml()}
      <div id="screen-content"></div>
    </div>
  `;

  appShell.insertAdjacentHTML('beforeend', bottomNavHtml(activeTab));

  wireSegmentedToggle(onMealChange);
  wireDaySelector(onDayChange);
  wirePopover();
  wireAsistenciaNavItem();

  return document.getElementById('screen-content');
}

// The Asistencia nav item never navigates — it opens the tray from
// asistencia-tray.js (loaded before this script, see each screen's
// <head>/<body>). window.openAsistenciaTray is looked up at click time,
// not here, so script load order doesn't matter.
function wireAsistenciaNavItem() {
  const asistenciaNavItem = document.querySelector('[data-action="open-asistencia-tray"]');
  if (asistenciaNavItem) {
    asistenciaNavItem.addEventListener('click', () => window.openAsistenciaTray());
  }
}

/**
 * Lighter-weight version of mountMenuChrome() for screens that only need
 * the header (+ popover), profile card, and bottom nav — no meal toggle
 * or day selector. Same content-mount-element return contract.
 *
 * @param {Object} options
 * @param {string} options.backHref
 * @param {string} options.title
 * @param {{title: string, body: string}} [options.popover] - custom popover copy; defaults to the Menú Semanal content if omitted
 * @param {string} [options.activeTab] - omit for screens with no matching bottom-nav tab (e.g. stub screens)
 * @param {boolean} [options.showHelp] - defaults to true
 * @param {boolean} [options.showProfileCard] - defaults to true
 * @param {boolean} [options.showBottomNav] - defaults to true
 */
function mountSimpleScreenChrome({ backHref, title, popover, activeTab, showHelp = true, showProfileCard = true, showBottomNav = true }) {
  const appView = document.getElementById('app-view');
  const appShell = document.querySelector('.app-shell');

  appView.innerHTML = `
    <header class="screen-header">${headerHtml(backHref, title, popover, showHelp)}</header>
    <div class="screen-menu-semanal__body">
      ${showProfileCard ? profileCardHtml() : ''}
      <div id="screen-content"></div>
    </div>
  `;

  if (showBottomNav) {
    appShell.insertAdjacentHTML('beforeend', bottomNavHtml(activeTab));
    wireAsistenciaNavItem();
  }

  wirePopover();

  return document.getElementById('screen-content');
}
