'use strict';

/**
 * Chat conversation thread. No Figma source — built from the screenshot
 * + spec text in the request. See handoff.md for everything invented
 * (Alex García's conversation, the artwork placeholder image, avatar
 * initials instead of real photos).
 */

const BACK_ICON = '<img src="../assets/icon-back-chevron.svg" alt="">';
const SEND_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M3 11.5L20 4L12.5 21L10.5 13.5L3 11.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/></svg>';
const READ_RECEIPT_SVG = '<svg viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="11"><path d="M1 6.5L4.5 10L11 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 6.5L10 10L16.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Simple flat-illustration placeholder — no real photo asset exists for
// this (no Figma source this pass). Loosely depicts a painted picture on
// an easel, matching the screenshot's description without pretending to
// be the real photo.
const ARTWORK_PLACEHOLDER_SVG = `
  <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <rect width="280" height="160" fill="#fdf6e3"/>
    <rect x="24" y="20" width="180" height="110" rx="4" fill="#ffffff" stroke="#d6dff4" stroke-width="3"/>
    <circle cx="150" cy="45" r="14" fill="#ffd166"/>
    <path d="M40 118 Q70 70 100 100 Q130 60 160 95 Q180 75 196 118 Z" fill="#8fbf7f"/>
    <circle cx="70" cy="55" r="8" fill="#f4a5a5"/>
    <circle cx="95" cy="48" r="6" fill="#f4a5a5"/>
    <circle cx="60" cy="70" r="5" fill="#e8c15c"/>
    <rect x="215" y="90" width="10" height="46" rx="2" fill="#b08968"/>
    <circle cx="230" cy="100" r="7" fill="#e63946"/>
    <circle cx="245" cy="112" r="7" fill="#3663ca"/>
    <circle cx="238" cy="128" r="7" fill="#ffd166"/>
  </svg>
`;

/* ---------------------------------------------------------------------
   MOCK DATA — only Tomás Sánchez's thread was given in the spec/
   screenshot. Alex García's is invented (short, plausible) so the
   contact list's second row doesn't lead to an empty/broken thread.
   See handoff.md.
--------------------------------------------------------------------- */
const CONVERSATIONS = {
  'tomas-sanchez': {
    contact: { name: 'Tomás Sánchez', role: 'Tutor 3 ESO', child: 'Lucía', initials: 'TS', color: 'var(--color-primary-500)' },
    messages: [
      { sender: 'them', type: 'text', text: '¡Hola, familia García! Les escribo para confirmar que Lucía ha participado hoy muy bien en el taller de arte. ¿Podrían traer mañana una bata vieja para que no se manche?', time: '09:15 AM' },
      { sender: 'me', type: 'text', text: '¡Hola, muchas gracias por el aviso! Claro que sí, mañana la llevará en la mochila. ¿Algún color de pintura en especial que debamos evitar?', time: '09:22 AM', read: true },
      { sender: 'them', type: 'image_text', image: ARTWORK_PLACEHOLDER_SVG, text: '¡No se preocupen por los colores! Usamos témperas lavables. Miren qué dibujo tan bonito está terminando.', time: '10:05 AM' },
    ],
  },
  'alex-garcia': {
    // Invented — no spec/screenshot content given for this contact.
    contact: { name: 'Alex García', role: 'Tutor 2 ESO', child: 'Daniel', initials: 'AG', color: 'var(--color-secondary-500)' },
    messages: [
      { sender: 'them', type: 'text', text: 'Buenos días, les escribo para recordarles que mañana Daniel tiene que traer el material de educación física.', time: '08:40 AM' },
      { sender: 'me', type: 'text', text: 'Gracias por el recordatorio, se lo prepararé esta noche.', time: '08:52 AM', read: true },
    ],
  },
};

const params = new URLSearchParams(window.location.search);
const contactId = params.get('contact');
const conversation = CONVERSATIONS[contactId] || CONVERSATIONS['tomas-sanchez'];

/* ---------------------------------------------------------------------
   HEADER (custom shape for this screen only — not menu-shared.js's
   headerHtml(): avatar + stacked name/subtitle, no help icon/popover)
--------------------------------------------------------------------- */
function headerHtml(contact) {
  return `
    <header class="chat-thread-header">
      <a class="chat-thread-header__back" href="chat.html" aria-label="Volver">${BACK_ICON}</a>
      <span class="avatar avatar--xs avatar--initials" style="background-color:${contact.color}">${contact.initials}</span>
      <span class="chat-thread-header__info">
        <span class="chat-thread-header__name">${contact.name}</span>
        <span class="chat-thread-header__subtitle">${contact.role} · ${contact.child}</span>
      </span>
    </header>
  `;
}

/* ---------------------------------------------------------------------
   MESSAGE BUBBLES
--------------------------------------------------------------------- */
function bubbleHtml(message) {
  const isMe = message.sender === 'me';
  const classes = ['chat-bubble', isMe ? 'chat-bubble--outgoing' : 'chat-bubble--incoming'];

  const imageBlock = message.type === 'image_text'
    ? `<span class="chat-bubble__image">${message.image}</span>`
    : '';

  const readReceipt = isMe && message.read
    ? `<span class="chat-message__receipt" aria-hidden="true">${READ_RECEIPT_SVG}</span>`
    : '';

  return `
    <div class="chat-message ${isMe ? 'chat-message--outgoing' : 'chat-message--incoming'}">
      <div class="${classes.join(' ')}">
        ${imageBlock}
        <p class="chat-bubble__text">${message.text}</p>
      </div>
      <span class="chat-message__meta">
        <span class="chat-message__time">${message.time}</span>
        ${readReceipt}
      </span>
    </div>
  `;
}

function renderThread() {
  const html = [
    '<div class="chat-date-divider"><span class="chat-date-divider__label">Hoy</span></div>',
    ...conversation.messages.map(bubbleHtml),
  ].join('');
  threadEl.innerHTML = html;
  threadEl.scrollTop = threadEl.scrollHeight;
}

/* ---------------------------------------------------------------------
   INPUT BAR
--------------------------------------------------------------------- */
function formatCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

function sendMessage() {
  const text = inputFieldEl.value.trim();
  if (!text) return;
  conversation.messages.push({ sender: 'me', type: 'text', text, time: formatCurrentTime(), read: false });
  inputFieldEl.value = '';
  renderThread();
}

/* ---------------------------------------------------------------------
   MOUNT
--------------------------------------------------------------------- */
const appView = document.getElementById('app-view');
appView.innerHTML = `
  ${headerHtml(conversation.contact)}
  <div class="chat-thread" id="chat-thread"></div>
`;

document.querySelector('.app-shell').insertAdjacentHTML('beforeend', `
  <div class="chat-input-bar">
    <button class="chat-input-bar__attach" type="button" aria-label="Adjuntar" data-action="mock-attach">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <input class="chat-input-bar__field" type="text" placeholder="Escribe un mensaje..." id="chat-input-field" aria-label="Mensaje">
    <button class="chat-input-bar__send" type="button" aria-label="Enviar" id="chat-send-button">${SEND_ICON_SVG}</button>
  </div>
`);

const threadEl = document.getElementById('chat-thread');
const inputFieldEl = document.getElementById('chat-input-field');

document.getElementById('chat-send-button').addEventListener('click', sendMessage);
inputFieldEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') sendMessage();
});
document.querySelector('[data-action="mock-attach"]').addEventListener('click', () => {
  console.log('[Chat] "+" attach button tapped — mock only, no real attachment behavior.');
});

renderThread();
