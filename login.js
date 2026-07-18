'use strict';

/**
 * Login screen. NO Figma source at all this pass — the MCP rate limit
 * was hit before any data (design context, screenshot, or variables)
 * came back, unlike earlier screens that at least got partial data.
 * Every color/spacing/icon/illustration choice below is built from the
 * written spec alone. See handoff.md for the full list of what's
 * invented vs. what maps to already-established tokens.
 */

// Real collage photos, provided as assets/photo_collage_01.jpg..06.jpg.
// Mapped by inspecting each file's actual content (identified visually,
// not by filename — the numbers alone don't say which photo is which):
// 01=salad, 02=pasta, 03=tennis, 04=hiking, 05=bus, 06=fruit.
const COLLAGE_PHOTOS = {
  salad:  { src: 'assets/photo_collage_01.jpg', alt: 'Niño comiendo una ensalada' },
  pasta:  { src: 'assets/photo_collage_02.jpg', alt: 'Niños comiendo pasta' },
  tennis: { src: 'assets/photo_collage_03.jpg', alt: 'Clase de tenis' },
  hiking: { src: 'assets/photo_collage_04.jpg', alt: 'Excursión de senderismo' },
  bus:    { src: 'assets/photo_collage_05.jpg', alt: 'Autobús de excursión' },
  fruit:  { src: 'assets/photo_collage_06.jpg', alt: 'Ensalada de frutas' },
};

function collagePhotoHtml(key, modifierClass) {
  const photo = COLLAGE_PHOTOS[key];
  return `<div class="login-collage__photo ${modifierClass}"><img src="${photo.src}" alt="${photo.alt}"></div>`;
}

const EYE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75"/></svg>';
const EYE_OFF_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.5 6.9C4 8.6 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.2M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7-.5.9-1.3 2.1-2.4 3.2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON_SVG = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const appView = document.getElementById('app-view');

appView.innerHTML = `
  <!-- Irregular masonry-style collage matching your reference screenshot —
       NOT a uniform grid: the tennis and hiking cells are taller than
       pasta/logo/bus. 3 columns × 6 fine-grained row tracks, each photo
       spanning however many rows its cell needs. See handoff.md. -->
  <div class="login-collage">
    ${collagePhotoHtml('salad', 'login-collage__photo--salad')}
    ${collagePhotoHtml('pasta', 'login-collage__photo--pasta')}
    ${collagePhotoHtml('tennis', 'login-collage__photo--tennis')}
    ${collagePhotoHtml('hiking', 'login-collage__photo--hiking')}
    <div class="login-collage__logo">
      <img src="assets/logo-ehabilis.png" alt="eHabilis activities">
    </div>
    ${collagePhotoHtml('bus', 'login-collage__photo--bus')}
    ${collagePhotoHtml('fruit', 'login-collage__photo--fruit')}
  </div>

  <div class="login-form-wrap">
    <h1 class="login-heading">Iniciar sesión</h1>

    <form class="login-form" id="login-form" novalidate>
      <div class="login-field">
        <label class="login-field__label" for="login-usuario">Usuario</label>
        <input class="login-field__input" type="email" id="login-usuario" placeholder="Introduce o teu correo electronico" autocomplete="username">
      </div>

      <div class="login-field">
        <label class="login-field__label" for="login-contrasinal">Contrasinal</label>
        <div class="login-field__password-wrap">
          <input class="login-field__input login-field__input--password" type="password" id="login-contrasinal" autocomplete="current-password">
          <button class="login-field__toggle" type="button" id="login-password-toggle" aria-label="Amosar contrasinal" aria-pressed="false">
            <span id="login-password-toggle-icon">${EYE_ICON_SVG}</span>
          </button>
        </div>
      </div>

      <p class="login-form__error" id="login-error" hidden>Introduce o teu usuario e contrasinal.</p>

      <label class="login-checkbox">
        <input type="checkbox" id="login-remember" checked>
        <span class="login-checkbox__box" aria-hidden="true">${CHECK_ICON_SVG}</span>
        <span class="login-checkbox__label">Gardar datos de acceso</span>
      </label>

      <button class="login-submit" type="submit">
        <span class="login-submit__label">INICIAR SESIÓN</span>
        <span class="login-submit__arrow" aria-hidden="true">${ARROW_ICON_SVG}</span>
      </button>
    </form>

    <p class="login-forgot">
      <span class="login-forgot__rule" aria-hidden="true"></span>
      <a href="#" id="login-forgot-link">Olvidaches o teu contrasinal?</a>
      <span class="login-forgot__rule" aria-hidden="true"></span>
    </p>

    <!-- Given verbatim in Castilian Spanish in the spec, while every
         other string on this screen is Galician — kept exactly as
         provided rather than "corrected" to match. See handoff.md. -->
    <p class="login-legal">Si continúas, aceptas los <a href="#" data-action="mock-link">Términos del Servicio</a> de eHabilis y confirmas que has leído nuestra <a href="#" data-action="mock-link">Política de Privacidad</a> sobre los datos</p>
  </div>
`;

/* ---------------------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE
--------------------------------------------------------------------- */
const passwordInput = document.getElementById('login-contrasinal');
const passwordToggle = document.getElementById('login-password-toggle');
const passwordToggleIcon = document.getElementById('login-password-toggle-icon');
let passwordVisible = false;

passwordToggle.addEventListener('click', () => {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? 'text' : 'password';
  passwordToggle.setAttribute('aria-pressed', String(passwordVisible));
  passwordToggle.setAttribute('aria-label', passwordVisible ? 'Ocultar contrasinal' : 'Amosar contrasinal');
  passwordToggleIcon.innerHTML = passwordVisible ? EYE_OFF_ICON_SVG : EYE_ICON_SVG;
});

/* ---------------------------------------------------------------------
   REMEMBER ME
--------------------------------------------------------------------- */
let rememberMe = true;
document.getElementById('login-remember').addEventListener('change', (event) => {
  rememberMe = event.target.checked;
});

/* ---------------------------------------------------------------------
   MOCK SUBMIT — no real auth. Both fields non-empty → "success" and
   navigate to Home (index.html, this prototype's entry point). Empty →
   inline error, no navigation.
--------------------------------------------------------------------- */
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const usuarioInput = document.getElementById('login-usuario');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const usuario = usuarioInput.value.trim();
  const contrasinal = passwordInput.value;

  if (!usuario || !contrasinal) {
    loginError.hidden = false;
    return;
  }

  loginError.hidden = true;
  console.log('[Login] mock login success', { usuario, rememberMe });
  window.location.href = 'index.html';
});

/* ---------------------------------------------------------------------
   MOCK LINKS (forgot password, legal) — no destination screens exist
   for any of these, per scope. Logged, not silently inert.
--------------------------------------------------------------------- */
document.getElementById('login-forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  console.log('[Login] "Olvidaches o teu contrasinal?" tapped — mock only, no destination screen.');
});

appView.querySelectorAll('[data-action="mock-link"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    console.log(`[Login] Legal link tapped: "${link.textContent}" — mock only.`);
  });
});
