'use strict';

/**
 * Generic stub screen — header (back chevron + title) only, no help
 * icon, no profile card, no bottom nav. Used by every Gestión row that
 * doesn't have real content built yet, per spec: "just show a simple
 * placeholder page with the row's label as the title and a back
 * chevron, so the flow doesn't dead-end." See handoff.md.
 *
 * Title comes from <title> (stripping the "Prototype — " prefix) rather
 * than a second config value, since every screen already has a unique
 * <title> tag.
 *
 * Back target defaults to gestion.html (every stub's real entry point)
 * except when the including page sets `window.STUB_USE_HISTORY_BACK =
 * true` before this script runs — used only by perfil.html, which is
 * also reachable from the Home dashboard avatar.
 */

const title = document.title.replace(/^Prototype — /, '');

const screenContent = mountSimpleScreenChrome({
  backHref: window.STUB_USE_HISTORY_BACK ? '#' : 'gestion.html',
  title,
  showHelp: false,
  showProfileCard: false,
  showBottomNav: false,
});

screenContent.innerHTML = `
  <p class="stub-placeholder-text">Esta pantalla no está construida todavía.</p>
`;

if (window.STUB_USE_HISTORY_BACK) {
  document.querySelector('.screen-header__back').addEventListener('click', (event) => {
    event.preventDefault();
    history.back();
  });
}
