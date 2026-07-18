'use strict';

/**
 * Informe Menú Semanal — owns reportData and its own content rendering.
 * Shared chrome comes from menu-shared.js's mountMenuChrome(), same as
 * menu-semanal.js. No Figma source exists for this screen at all (built
 * from a reference screenshot + written spec) — see handoff.md.
 */

const reportData = {
  '2026-06-15': { // Lunes
    comida: {
      primerPlato: { name: 'Ensalada campera', mood: 'happy' },
      segundoPlato: { name: 'Pollo al horno con verduras', mood: 'happy' },
      postre: { name: 'Yogur natural', mood: 'happy' },
    },
    desayuno: {
      suggestion: 'Tostada integral con aguacate y café con leche',
    },
    observaciones: 'Ha comido genial hoy, se ha terminado todos los platos sin problema y ha pedido repetir el postre.',
  },
  '2026-06-16': { // Martes
    comida: {
      primerPlato: { name: 'Sopa de fideos', mood: 'neutral' },
      segundoPlato: { name: 'Ternera guisada con patatas', mood: 'happy' },
      postre: { name: 'Fruta de temporada', mood: 'neutral' },
    },
    desayuno: {
      suggestion: 'Yogur con granola y zumo de naranja natural',
    },
    observaciones: 'Le ha costado un poco empezar con la sopa, pero ha disfrutado mucho de la ternera. El postre lo ha comido sin mucho entusiasmo.',
  },
  '2026-06-17': { // Miércoles
    comida: {
      primerPlato: { name: 'Puré de verduras', mood: 'happy' },
      segundoPlato: { name: 'Salmón a la plancha con arroz', mood: 'neutral' },
      postre: { name: 'Flan casero', mood: 'happy' },
    },
    desayuno: {
      suggestion: 'Bizcocho casero con leche',
    },
    observaciones: 'Ha comido muy bien el puré y el flan. Con el salmón ha comido más despacio de lo habitual pero ha terminado el plato.',
  },
  '2026-06-18': { // Jueves — matches the reference screenshot
    comida: {
      primerPlato: { name: 'Crema de calabacín', mood: 'happy' },
      segundoPlato: { name: 'Merluza al horno con patatas', mood: 'neutral' },
      postre: { name: 'Fruta de temporada o Yogurt', mood: 'sad' },
    },
    desayuno: {
      suggestion: 'Tortitas de avena con miel y leche',
    },
    observaciones: 'Se ha portado muy bien durante toda la comida. Ha comido bien la crema de calabacín, algo más despacio con la merluza, y apenas ha probado el postre.',
  },
  '2026-06-19': { // Viernes
    comida: {
      primerPlato: { name: 'Lentejas estofadas', mood: 'neutral' },
      segundoPlato: { name: 'Filete de cerdo con ensalada', mood: 'sad' },
      postre: { name: 'Macedonia de frutas', mood: 'happy' },
    },
    desayuno: {
      suggestion: 'Pan con tomate y jamón, zumo natural',
    },
    observaciones: 'Le ha costado comer las lentejas y ha comido muy poco del filete. Ha disfrutado mucho de la macedonia de frutas.',
  },
};

let currentDate = '2026-06-18';
let currentMeal = 'comida';
let mealContent;
let observacionesText;

function moodIconSvg(mood) {
  const mouth = {
    happy: 'M7 13c1.5 2 4.5 2 6 0',
    neutral: 'M7 13.5h6',
    sad: 'M7 15c1.5-2 4.5-2 6 0',
  }[mood];
  return `<svg class="dish-card__mood-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="8" r="1.2" fill="currentColor"/>
    <circle cx="13" cy="8" r="1.2" fill="currentColor"/>
    <path d="${mouth}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </svg>`;
}

function buildDishCard({ badgeText, badgeIcon, label, name, mood }) {
  const card = document.createElement('div');
  card.className = 'dish-card';

  const badge = document.createElement('span');
  badge.className = 'dish-card__badge';
  badge.setAttribute('aria-hidden', 'true');
  if (badgeIcon) {
    badge.classList.add('dish-card__badge--icon');
    const img = document.createElement('img');
    img.src = badgeIcon;
    img.alt = '';
    img.className = 'dish-card__badge-icon';
    badge.appendChild(img);
  } else {
    badge.textContent = badgeText;
  }

  const text = document.createElement('span');
  text.className = 'dish-card__text';

  const labelEl = document.createElement('span');
  labelEl.className = 'dish-card__label';
  labelEl.textContent = label;

  const nameEl = document.createElement('span');
  nameEl.className = 'dish-card__name';
  nameEl.textContent = name;

  text.append(labelEl, nameEl);
  card.append(badge, text);

  if (mood) {
    const moodEl = document.createElement('span');
    moodEl.className = `dish-card__mood dish-card__mood--${mood}`;
    moodEl.setAttribute('aria-hidden', 'true');
    moodEl.innerHTML = moodIconSvg(mood);
    card.append(moodEl);
  }

  return card;
}

function renderMealContent() {
  const data = reportData[currentDate];
  mealContent.replaceChildren();

  if (currentMeal === 'comida') {
    mealContent.append(
      buildDishCard({ badgeText: '1', label: 'PRIMER PLATO', name: data.comida.primerPlato.name, mood: data.comida.primerPlato.mood }),
      buildDishCard({ badgeText: '2', label: 'SEGUNDO PLATO', name: data.comida.segundoPlato.name, mood: data.comida.segundoPlato.mood }),
      buildDishCard({ badgeText: '3', label: 'POSTRE', name: data.comida.postre.name, mood: data.comida.postre.mood }),
    );
  } else {
    // No mood data for desayuno — only Primer/Segundo/Postre have moods per spec.
    mealContent.append(
      buildDishCard({ badgeIcon: '../assets/icon-breakfast.svg', label: 'SUGERENCIA', name: data.desayuno.suggestion }),
    );
  }
}

function renderObservaciones() {
  observacionesText.textContent = reportData[currentDate].observaciones;
}

const screenContent = mountMenuChrome({
  backHref: 'menu-semanal.html',
  title: 'Informe',
  activeTab: 'menus',
  onMealChange: (meal) => { currentMeal = meal; renderMealContent(); },
  onDayChange: (date) => { currentDate = date; renderMealContent(); renderObservaciones(); },
});

screenContent.innerHTML = `
  <!-- Populated by renderMealContent() from reportData -->
  <div class="meal-content" id="meal-content"></div>

  <!-- Populated by renderObservaciones() from reportData — day-level, not meal-dependent -->
  <section class="observaciones-card" aria-label="Observaciones">
    <p class="observaciones-card__heading">Observaciones</p>
    <p class="observaciones-card__text" id="observaciones-text"></p>
  </section>
`;

mealContent = document.getElementById('meal-content');
observacionesText = document.getElementById('observaciones-text');

// Initial paint — Jueves 18 / COMIDA, matching the reference screenshot.
renderMealContent();
renderObservaciones();
