'use strict';

/**
 * Prototype interaction logic — no framework, no persistence.
 * Everything here is scoped to what's actually in the brief for this pass
 * (Home/Dashboard fully built; the other 4 tabs are wired for navigation
 * but intentionally show a placeholder, since they haven't been pulled
 * from Figma yet).
 */

// Only "autorizados" ever reaches the generic placeholder template now —
// every other former placeholder (menus/chat/gestion/asistencia) redirects
// to a real screen before renderScreen() runs, and "home" always uses the
// real template, not the placeholder. See goToTab() below.
const SCREEN_TITLES = {
  autorizados: 'Autorizados',
};

// Tabs that exist in the bottom nav — a quicklink to one of these should
// switch the active tab. Targets outside this set (e.g. "autorizados",
// which isn't a bottom-nav tab) just navigate without changing tab state,
// same as the profile avatar.
const NAV_TAB_IDS = new Set(['home', 'menus', 'asistencia', 'chat', 'gestion']);

const appView = document.getElementById('app-view');
const bottomNav = document.getElementById('bottom-nav');
let activeTabScreen = 'home';

function renderScreen(screenId) {
  const templateId = screenId === 'home' ? 'screen-home' : 'screen-placeholder';
  const template = document.getElementById(templateId);
  const fragment = template.content.cloneNode(true);

  if (templateId === 'screen-placeholder') {
    fragment.querySelector('.placeholder-title').textContent = SCREEN_TITLES[screenId] || screenId;
  }

  appView.replaceChildren(fragment);
  appView.scrollTop = 0;
  appView.focus();
}

function setActiveTab(screenId) {
  activeTabScreen = screenId;
  bottomNav.querySelectorAll('.nav-item').forEach((item) => {
    const isActive = item.dataset.screen === screenId;
    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function goToTab(screenId) {
  if (screenId === 'menus') {
    // Real screen now lives at screens/menu-semanal.html — leave the SPA
    // entirely rather than rendering the internal placeholder.
    window.location.href = 'screens/menu-semanal.html';
    return;
  }
  if (screenId === 'chat') {
    // Real screen now lives at screens/chat.html — same pattern as menus.
    window.location.href = 'screens/chat.html';
    return;
  }
  if (screenId === 'gestion') {
    // Real screen now lives at screens/gestion.html — same pattern.
    window.location.href = 'screens/gestion.html';
    return;
  }
  if (screenId === 'asistencia') {
    // Opens the tray (asistencia-tray.js) instead of switching screens —
    // handled in the bottomNav click listener below, not here, since it
    // must not change the underlying active tab/screen at all.
    return;
  }
  setActiveTab(screenId);
  renderScreen(screenId);
}

bottomNav.addEventListener('click', (event) => {
  const navItem = event.target.closest('.nav-item');
  if (!navItem) return;
  if (navItem.dataset.screen === 'asistencia') {
    window.openAsistenciaTray();
    return;
  }
  goToTab(navItem.dataset.screen);
});

// Delegate everything inside the swapped view — the DOM nodes get replaced
// on every navigation, so listeners attached directly to them would leak.
appView.addEventListener('click', (event) => {
  const serviceToggle = event.target.closest('[data-action="toggle-service"]');
  if (serviceToggle) {
    toggleServiceRow(serviceToggle);
    return;
  }

  const openNotifications = event.target.closest('[data-action="open-notifications"]');
  if (openNotifications) {
    openNotificationsPanel();
    return;
  }

  const openProfile = event.target.closest('[data-action="open-profile"]');
  if (openProfile) {
    // Real screen now lives at screens/perfil.html — the same route
    // Gestión's "Perfil" row links to (shared destination, not a
    // duplicate screen, per the Gestión spec). See handoff.md.
    window.location.href = 'screens/perfil.html';
    return;
  }

  const quicklink = event.target.closest('[data-action="quicklink"]');
  if (quicklink) {
    const target = quicklink.dataset.target;
    if (target === 'asistencia') {
      window.openAsistenciaTray();
    } else if (NAV_TAB_IDS.has(target)) {
      goToTab(target);
    } else {
      bottomNav.querySelectorAll('.nav-item').forEach((item) => item.removeAttribute('aria-current'));
      renderScreen(target);
    }
  }
});

function toggleServiceRow(toggleButton) {
  const expanded = toggleButton.getAttribute('aria-expanded') === 'true';

  // Only one row open at a time, across every card on screen. The panel is
  // a sibling of .service-row (the toggle's parent), not of the button.
  appView.querySelectorAll('.service-row__toggle[aria-expanded="true"]').forEach((openToggle) => {
    if (openToggle === toggleButton) return;
    openToggle.setAttribute('aria-expanded', 'false');
    openToggle.closest('.service-row').nextElementSibling.hidden = true;
  });

  const panel = toggleButton.closest('.service-row').nextElementSibling;
  toggleButton.setAttribute('aria-expanded', String(!expanded));
  if (panel) panel.hidden = expanded;
}

/* ---------------------------------------------------------------------
   NOTIFICATIONS SHEET
   Not shown in the Figma prototype (only the bell + badge exist there) —
   this modal content is an assumption to make the interaction testable.
   See handoff.md.
--------------------------------------------------------------------- */
let notificationsPanelEl = null;

function openNotificationsPanel() {
  if (notificationsPanelEl) return;
  const template = document.getElementById('notifications-panel');
  const fragment = template.content.cloneNode(true);
  document.querySelector('.app-shell').appendChild(fragment);
  notificationsPanelEl = document.querySelector('.sheet-backdrop');

  notificationsPanelEl.addEventListener('click', (event) => {
    if (event.target.dataset.action === 'close-notifications') {
      closeNotificationsPanel();
    }
  });

  document.addEventListener('keydown', handleNotificationsEscape);
}

function closeNotificationsPanel() {
  if (!notificationsPanelEl) return;
  notificationsPanelEl.remove();
  notificationsPanelEl = null;
  document.removeEventListener('keydown', handleNotificationsEscape);
}

function handleNotificationsEscape(event) {
  if (event.key === 'Escape') closeNotificationsPanel();
}

// Initial paint — supports deep links from screens/menu-semanal.html's nav
// bar (e.g. index.html#asistencia) landing on the right tab.
const initialHash = window.location.hash.replace('#', '');
const REDIRECTING_TABS = new Set(['menus', 'chat', 'gestion']); // goToTab() sends these straight to a real screen
goToTab(NAV_TAB_IDS.has(initialHash) && !REDIRECTING_TABS.has(initialHash) ? initialHash : 'home');
