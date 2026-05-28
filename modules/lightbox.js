/* ══════════════════════════════════════════════
   lightbox.js — Visionneuse d'images plein écran
   ══════════════════════════════════════════════ */

import { state } from "./state.js";

/* ── Ouverture depuis le récapitulatif ── */
export function openLightboxLocal(i) {
  state.lbImages = state.pendingPhotos.map(p => p.base64);
  openLightbox(i);
}

/* ── Ouverture depuis l'historique ── */
export function openLightboxHistory(photos, i) {
  state.lbImages = photos;
  openLightbox(i);
}

/* ── Ouverture générique ── */
function openLightbox(i) {
  state.lbIndex = i;
  updateLightboxImage();
  document.getElementById("lightbox").classList.add("show");
  document.body.style.overflow = "hidden";
}

/* ── Fermeture ── */
export function closeLightbox() {
  document.getElementById("lightbox").classList.remove("show");
  document.body.style.overflow = "";
}

/* ── Navigation ── */
export function lightboxNav(dir) {
  state.lbIndex = (state.lbIndex + dir + state.lbImages.length) % state.lbImages.length;
  updateLightboxImage();
}

/* ── Clic sur le fond ── */
export function handleLightboxClick(e) {
  if (e.target === document.getElementById("lightbox")) closeLightbox();
}

/* ── Mise à jour de l'image affichée ── */
function updateLightboxImage() {
  document.getElementById("lightbox-img").src            = state.lbImages[state.lbIndex];
  document.getElementById("lightbox-counter").textContent =
    `${state.lbIndex + 1} / ${state.lbImages.length}`;
  const multi = state.lbImages.length > 1;
  document.getElementById("lightbox-prev").style.display = multi ? "grid" : "none";
  document.getElementById("lightbox-next").style.display = multi ? "grid" : "none";
}

/* ── Raccourcis clavier ── */
export function initLightboxKeyboard() {
  document.addEventListener("keydown", e => {
    if (!document.getElementById("lightbox").classList.contains("show")) return;
    if (e.key === "ArrowRight") lightboxNav(+1);
    if (e.key === "ArrowLeft")  lightboxNav(-1);
    if (e.key === "Escape")     closeLightbox();
  });
}
