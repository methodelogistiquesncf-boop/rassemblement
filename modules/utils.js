/* ══════════════════════════════════════════════
   utils.js — Fonctions utilitaires génériques
   ══════════════════════════════════════════════ */

import { state } from "./state.js";

/** Échappe les caractères dangereux pour l'injection HTML. */
export function esc(s) {
  return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Formate la date du jour en YYYY-MM-DD. */
export function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

/** Déclenche le téléchargement d'un Blob. */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Affiche un message toast temporaire (3 s). */
export function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

/** Surligne un terme de recherche dans une chaîne (retourne du HTML). */
export function highlight(text, term) {
  if (!term || !text) return text || "";
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(text).replace(new RegExp(escaped, "gi"), m => `<mark>${m}</mark>`);
}
