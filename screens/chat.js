'use strict';

/**
 * Chat — contact list. No Figma source (screenshot + spec only, see
 * handoff.md). Reuses menu-shared.js's mountSimpleScreenChrome() for
 * header/popover/bottom-nav, same as Solicitar Asistencia.
 */

const CONTACTS = [
  { id: 'tomas-sanchez', name: 'Tomás Sánchez', role: 'Tutor 3 ESO', child: 'Lucía', initials: 'TS', color: 'var(--color-primary-500)' },
  { id: 'alex-garcia', name: 'Alex García', role: 'Tutor 2 ESO', child: 'Daniel', initials: 'AG', color: 'var(--color-secondary-500)' },
];

const CHAT_BUBBLE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6866 20 9.44014 19.7392 8.31459 19.2683C8.01756 19.1442 7.86905 19.0822 7.75439 19.0521C7.63973 19.0221 7.53412 19.0148 7.39825 19.0148L4.5 19.0148L5.28956 16.9642C5.42084 16.6289 5.48648 16.4613 5.47234 16.3096C5.4582 16.1579 5.35931 16.0203 5.16154 15.7451C4.11576 14.2984 3.5 12.5581 3.5 10.75C3.5 6.05558 7.52944 2.25 12.5 2.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="9" r="1" fill="currentColor"/><circle cx="16" cy="9" r="1" fill="currentColor"/></svg>';

function avatarHtml(contact) {
  return `<span class="avatar avatar--md avatar--initials" style="background-color:${contact.color}">${contact.initials}</span>`;
}

function contactRowHtml(contact) {
  return `
    <button class="chat-contact-card" type="button" data-contact-id="${contact.id}">
      ${avatarHtml(contact)}
      <span class="chat-contact-card__info">
        <span class="chat-contact-card__name">${contact.name}</span>
        <span class="chat-contact-card__meta">${contact.role} · ${contact.child}</span>
      </span>
      <span class="chat-contact-card__icon" aria-hidden="true">${CHAT_BUBBLE_ICON_SVG}</span>
    </button>
  `;
}

const screenContent = mountSimpleScreenChrome({
  backHref: '../index.html',
  title: 'Chat',
  popover: {
    title: 'Chat',
    body: 'Aquí puedes hablar directamente con los tutores de cada menor. Copy definitivo pendiente de confirmar con el equipo de contenido.',
  },
  activeTab: 'chat',
});

screenContent.innerHTML = `
  <div class="chat-contact-list">
    ${CONTACTS.map(contactRowHtml).join('')}
  </div>
`;

screenContent.querySelector('.chat-contact-list').addEventListener('click', (event) => {
  const card = event.target.closest('.chat-contact-card');
  if (!card) return;
  window.location.href = `chat-conversation.html?contact=${encodeURIComponent(card.dataset.contactId)}`;
});
