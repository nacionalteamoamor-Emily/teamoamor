/* ============================================================
   NACIONAL × AMOR · acceso + arranque del universo 3D
   El universo vive en universe.js. Todo el contenido editable
   (frases, fotos) está en CONFIG, dentro de universe.js.
   ============================================================ */
"use strict";

const CONFIG = {
  /* La contraseña distingue mayúsculas y minúsculas.
     Es una barrera visual, no una medida de seguridad real. */
  password: "Nacionalteamo1",

  /* Todos los textos de la pantalla de acceso se editan acá. */
  gate: {
    eyebrow: "UN LUGAR MUY ESPECIAL",
    title: 'Te amo igual que a <em>Nacional</em> entonces hice una Galaxia',
    subtitle: "Un pequeño detallito namas JAJAJA.",
    label: "La contraseña te la digo yo",
    placeholder: "Escribí la contraseña",
    hint: "Te amo",
    submit: "Entrar al Mundo",
    opening: "Abriendo nuestro lugar...",
    footer: "No paraba mas el tipo JAJAJA",
    footnote: "Azul, rojo y blanco porq me encanta y vos tambien amor.",
    errorWrong: "No es JAJAJ, escribila bien.",
    errorEmpty: "Sin contraseña, no te dejo pasar."
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

function initPasswordGate() {
  const gate = $("#gate");
  const gateCard = $("#gate-card");
  const form = $("#gate-form");
  const passwordInput = $("#password");
  const toggleButton = $("#toggle-password");
  const errorMessage = $("#password-error");
  const submitButton = $("#gate-submit");
  const experience = $("#experience");
  const stage = $("#universe-stage");

  if (!gate || !form || !passwordInput) return;

  /* Aplica los textos editables de CONFIG.gate. */
  const G = CONFIG.gate;
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText("gate-eyebrow", G.eyebrow);
  setText("gate-subtitle", G.subtitle);
  setText("gate-label", G.label);
  setText("gate-footer-text", G.footer);
  setText("gate-footnote", G.footnote);
  passwordInput.placeholder = G.placeholder;
  const gateTitle = $("#gate-title");
  if (gateTitle) gateTitle.innerHTML = G.title;
  const hintEl = $("#password-hint");
  if (hintEl) hintEl.textContent = G.hint;
  const submitLabel = $(".btn-label", submitButton);
  if (submitLabel) submitLabel.textContent = G.submit;

  let unlocking = false;

  const setError = (message) => {
    errorMessage.textContent = message;
    passwordInput.setAttribute("aria-invalid", "true");
  };

  const clearError = () => {
    errorMessage.textContent = "";
    passwordInput.removeAttribute("aria-invalid");
  };

  toggleButton.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleButton.setAttribute("aria-pressed", String(isPassword));
    toggleButton.setAttribute(
      "aria-label",
      isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
    );
    passwordInput.focus({ preventScroll: true });
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.getAttribute("aria-invalid") === "true") clearError();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (unlocking) return;

    const value = passwordInput.value;

    if (value === CONFIG.password) {
      unlocking = true;
      clearError();
      gateCard.classList.remove("is-error");
      gateCard.classList.add("is-success");
      submitButton.disabled = true;
      $(".btn-label", submitButton).textContent = G.opening;

      window.setTimeout(() => {
        gate.classList.add("is-leaving");
        document.body.classList.remove("is-locked");
        document.body.classList.add("unlocked");

        experience.inert = false;
        experience.removeAttribute("aria-hidden");
        stage.tabIndex = -1;

        // Arranca el universo 3D (universe.js): reemplaza toda la experiencia anterior.
        if (window.startUniverse) window.startUniverse();

        window.setTimeout(() => {
          gate.hidden = true;
          gate.setAttribute("aria-hidden", "true");
          passwordInput.value = "";
          stage.focus({ preventScroll: true });
        }, 780);
      }, 720);
      return;
    }

    setError(value.trim() ? G.errorWrong : G.errorEmpty);
    gateCard.classList.remove("is-error");
    // Reinicia la animación de error aunque se envíe dos veces seguidas.
    void gateCard.offsetWidth;
    gateCard.classList.add("is-error");
    window.setTimeout(() => gateCard.classList.remove("is-error"), 520);
    passwordInput.focus({ preventScroll: true });
    passwordInput.select();
  });

  // Mantiene el foco dentro de la pantalla de acceso mientras está bloqueada.
  gate.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || gate.hidden) return;
    const focusable = $$('button:not([disabled]), input:not([disabled])', gate).filter(
      (element) => element.offsetParent !== null
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // En escritorio enfocamos el campo; en móvil evitamos abrir el teclado solo.
  if (finePointer.matches) {
    window.setTimeout(() => {
      passwordInput.focus({ preventScroll: true });
    }, 450);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPasswordGate, { once: true });
} else {
  initPasswordGate();
}
