'use strict';

/**
 * Gestión — administrative/account hub. No Figma source (spec text
 * only, see handoff.md). Reuses menu-shared.js's mountSimpleScreenChrome()
 * for header (no help icon, per spec) + bottom nav (no profile card —
 * this is an account-level hub, not tied to a specific child).
 */

// All icons below are inline SVGs built from scratch — no Figma source
// exists for any of them this pass. Simple line-icon style (1.75px
// stroke, round caps) matching the visual weight of the app's other
// custom-built icons (chevron, checkmark, send, etc). See handoff.md.
const ICONS = {
  'user-circle': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.75"/><path d="M6.5 18.5C7.5 16 9.5 15 12 15C14.5 15 16.5 16 17.5 18.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'receipt': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3H18V21L16 19.5L14 21L12 19.5L10 21L8 19.5L6 21V3Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M9 8H15M9 12H15M9 16H12.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'clipboard-list': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" stroke-width="1.75"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'file-text': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M9 12.5h6M9 16h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'bell': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a5 5 0 0 0-5 5v3.5c0 .7-.3 1.4-.8 1.9L5 15h14l-1.2-1.6a2.8 2.8 0 0 1-.8-1.9V8a5 5 0 0 0-5-5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'settings': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
  'logout': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const gestionOptions = [
  { id: 'perfil', label: 'Perfil', icon: 'user-circle', route: 'perfil.html' },
  { id: 'facturacion', label: 'Facturación y pagos', icon: 'receipt', route: 'facturacion.html' },
  { id: 'contratos', label: 'Contratos de servicio', icon: 'clipboard-list', route: 'contratos.html' },
  { id: 'documentos', label: 'Documentos y autorizaciones', icon: 'file-text', route: 'documentos.html' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'bell', route: 'notificaciones.html' },
  { id: 'ajustes', label: 'Ajustes generales', icon: 'settings', route: 'ajustes.html' },
];

function rowHtml(option) {
  return `
    <button class="gestion-row" type="button" data-route="${option.route}">
      <span class="gestion-row__icon" aria-hidden="true">${ICONS[option.icon]}</span>
      <span class="gestion-row__label">${option.label}</span>
      <img src="../assets/icon-chevron-right.svg" alt="" class="gestion-row__chevron">
    </button>
  `;
}

function logoutRowHtml() {
  return `
    <button class="gestion-row gestion-row--danger" type="button" data-action="logout">
      <span class="gestion-row__icon" aria-hidden="true">${ICONS.logout}</span>
      <span class="gestion-row__label">Cerrar sesión</span>
    </button>
  `;
}

const screenContent = mountSimpleScreenChrome({
  backHref: '../index.html',
  title: 'Gestión',
  activeTab: 'gestion',
  showHelp: false,
  showProfileCard: false,
});

screenContent.innerHTML = `
  <div class="gestion-list">
    ${gestionOptions.map(rowHtml).join('')}
    ${logoutRowHtml()}
  </div>
`;

screenContent.addEventListener('click', (event) => {
  const logoutButton = event.target.closest('[data-action="logout"]');
  if (logoutButton) {
    // Native confirm() is fine for the prototype, per spec.
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      console.log('[Gestión] Mock logout confirmed — no real auth, no-op.');
    }
    return;
  }

  const row = event.target.closest('.gestion-row[data-route]');
  if (row) {
    window.location.href = row.dataset.route;
  }
});
