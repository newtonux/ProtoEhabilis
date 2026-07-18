'use strict';

/**
 * Menú Semanal — owns menuData and its own meal-content rendering.
 * Shared chrome (header/popover/profile card/toggle/day selector/bottom
 * nav) comes from menu-shared.js's mountMenuChrome(). See handoff.md.
 */

const menuData = {
  '2026-06-15': { // Lunes
    comida: {
      primerPlato: 'Ensalada campera',
      segundoPlato: 'Pollo al horno con verduras',
      postre: 'Yogur natural',
    },
    desayuno: {
      suggestion: 'Tostada integral con aguacate y café con leche',
    },
  },
  '2026-06-16': { // Martes
    comida: {
      primerPlato: 'Sopa de fideos',
      segundoPlato: 'Ternera guisada con patatas',
      postre: 'Fruta de temporada',
    },
    desayuno: {
      suggestion: 'Yogur con granola y zumo de naranja natural',
    },
  },
  '2026-06-17': { // Miércoles
    comida: {
      primerPlato: 'Puré de verduras',
      segundoPlato: 'Salmón a la plancha con arroz',
      postre: 'Flan casero',
    },
    desayuno: {
      suggestion: 'Bizcocho casero con leche',
    },
  },
  '2026-06-18': { // Jueves — matches the reference screenshot
    comida: {
      primerPlato: 'Crema de calabacín',
      segundoPlato: 'Merluza al horno con patatas',
      postre: 'Fruta de temporada o Yogurt',
    },
    desayuno: {
      suggestion: 'Tortitas de avena con miel y leche',
    },
  },
  '2026-06-19': { // Viernes
    comida: {
      primerPlato: 'Lentejas estofadas',
      segundoPlato: 'Filete de cerdo con ensalada',
      postre: 'Macedonia de frutas',
    },
    desayuno: {
      suggestion: 'Pan con tomate y jamón, zumo natural',
    },
  },
};

let currentDate = '2026-06-18';
let currentMeal = 'comida';
let mealContent;

function buildDishCard({ badgeText, badgeIcon, label, name }) {
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
  return card;
}

function renderMealContent() {
  const data = menuData[currentDate];
  mealContent.replaceChildren();

  if (currentMeal === 'comida') {
    mealContent.append(
      buildDishCard({ badgeText: '1', label: 'PRIMER PLATO', name: data.comida.primerPlato }),
      buildDishCard({ badgeText: '2', label: 'SEGUNDO PLATO', name: data.comida.segundoPlato }),
      buildDishCard({ badgeText: '3', label: 'POSTRE', name: data.comida.postre }),
    );
  } else {
    mealContent.append(
      buildDishCard({ badgeIcon: '../assets/icon-breakfast.svg', label: 'SUGERENCIA', name: data.desayuno.suggestion }),
    );
  }
}

const screenContent = mountMenuChrome({
  backHref: '../index.html',
  activeTab: 'menus',
  onMealChange: (meal) => { currentMeal = meal; renderMealContent(); },
  onDayChange: (date) => { currentDate = date; renderMealContent(); },
});

screenContent.innerHTML = `
  <!-- Populated by renderMealContent() from menuData -->
  <div class="meal-content" id="meal-content"></div>

  <!-- Static placeholder — not date/toggle-dependent yet. See handoff.md. -->
  <section class="celiac-card" aria-label="Menú celiacos">
    <p class="celiac-card__heading">
      <img src="../assets/icon-checkmark-circle.svg" alt="" class="celiac-card__heading-icon">
      MENÚ CELIACOS
    </p>
    <div class="celiac-card__chips">
      <span class="celiac-chip"><img src="../assets/icon-checkmark-circle.svg" alt="" class="celiac-chip__icon">Pescado</span>
      <span class="celiac-chip"><img src="../assets/icon-checkmark-circle.svg" alt="" class="celiac-chip__icon">Vegetariano</span>
      <span class="celiac-chip"><img src="../assets/icon-checkmark-circle.svg" alt="" class="celiac-chip__icon">Sin gluten</span>
      <span class="celiac-chip"><img src="../assets/icon-checkmark-circle.svg" alt="" class="celiac-chip__icon">Pescado</span>
    </div>
  </section>

  <a class="button-cta" href="menu-semanal-report.html">Consultar informe</a>
`;

mealContent = document.getElementById('meal-content');

// Initial paint — Jueves 18 / COMIDA, matching the reference screenshot.
renderMealContent();
