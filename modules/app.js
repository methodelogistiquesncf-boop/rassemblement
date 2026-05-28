/* ══════════════════════════════════════════════
   app.js — Point d'entrée & exposition des globaux
   ══════════════════════════════════════════════
   Ce fichier :
     1. Initialise Firebase
     2. Charge tree.json
     3. Démarre le flux auth → app
     4. Expose sur window toutes les fonctions
        appelées depuis les onclick HTML
   ══════════════════════════════════════════════ */

import { firebaseConfig }                          from "./config.js";
import { state }                                   from "./state.js";
import { doLogin, doLogout, showLogin, showApp,
         closeConfirm }                            from "./auth.js";
import { render, pickOption, submitFields,
         submitText, submitTextarea, advanceStep,
         goBack, restart }                         from "./navigation.js";
import { renderPhotoPreview }                      from "./summary.js";
import { triggerPhotoCamera, triggerPhotoGallery,
         handlePhotoInput, removePhoto }           from "./photos.js";
import { openLightboxLocal, openLightboxHistory,
         closeLightbox, lightboxNav,
         handleLightboxClick, initLightboxKeyboard } from "./lightbox.js";
import { saveAnomaly }                             from "./firebase-save.js";
import { toggleHistory, applyFilters, clearFilters,
         deleteAnomaly, openHistoryPhoto,
         exportCSV, exportXLSX }                  from "./history.js";

/* ══════════════════════════════════════════════
   1. INIT FIREBASE
   ══════════════════════════════════════════════ */
firebase.initializeApp(firebaseConfig);

/* ══════════════════════════════════════════════
   2. CHARGEMENT tree.json
   ══════════════════════════════════════════════ */
fetch("./tree.json")
  .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then(data => {
    state.TREE = data;
    firebase.auth().onAuthStateChanged(u => (u ? showApp(u) : showLogin()));
  })
  .catch(err => {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                  background:#151c2c;font-family:system-ui;text-align:center;padding:24px">
        <div style="background:#fff;border-radius:16px;padding:32px;max-width:400px">
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <h2 style="color:#151c2c;margin-bottom:8px">Impossible de charger tree.json</h2>
          <p style="color:#6b7280;font-size:14px">
            Vérifiez que <strong>tree.json</strong> est dans le même dossier que index.html.
          </p>
          <p style="color:#dc2626;font-size:12px;margin-top:12px">${err.message}</p>
        </div>
      </div>`;
  });

/* ══════════════════════════════════════════════
   3. RACCOURCIS CLAVIER
   ══════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  if (e.key === "Enter" &&
      document.getElementById("login-view").style.display !== "none") {
    doLogin();
  }
});

initLightboxKeyboard();

/* ══════════════════════════════════════════════
   4. VERSION BADGE + SERVICE WORKER
   ══════════════════════════════════════════════ */
(function initVersionBadge() {
  const v = localStorage.getItem("app-version");
  if (v) document.querySelectorAll(".version-badge").forEach(el => (el.textContent = "v" + v));
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.addEventListener("message", event => {
      if (event.data?.type === "VERSION") {
        const v = event.data.version;
        localStorage.setItem("app-version", v);
        document.querySelectorAll(".version-badge").forEach(el => (el.textContent = "v" + v));
        console.log("[PWA] Version active :", v);
      }
    });

    navigator.serviceWorker
      .register("./sw.js")
      .then(reg => {
        console.log("[PWA] SW enregistré :", reg.scope);
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({ type: "GET_VERSION" });
        });
        reg.addEventListener("updatefound", () => {
          reg.installing.addEventListener("statechange", function () {
            if (this.state === "activated") this.postMessage({ type: "GET_VERSION" });
          });
        });
      })
      .catch(err => console.error("[PWA] Erreur SW :", err));
  });
}

/* ══════════════════════════════════════════════
   5. EXPOSITION SUR window
   ══════════════════════════════════════════════
   Les attributs onclick="..." dans le HTML ont
   besoin que ces fonctions soient globales.
   On les attache explicitement à window plutôt
   que de polluer le scope global.
   ══════════════════════════════════════════════ */
Object.assign(window, {
  /* Auth */
  doLogin,
  doLogout,
  closeConfirm,

  /* Navigation */
  pickOption,
  submitFields,
  submitText,
  submitTextarea,
  advanceStep,
  goBack,
  restart,

  /* Photos */
  triggerPhotoCamera,
  triggerPhotoGallery,
  handlePhotoInput,
  removePhoto,

  /* Lightbox */
  openLightboxLocal,
  openLightboxHistory,
  closeLightbox,
  lightboxNav,
  handleLightboxClick,
  openHistoryPhoto,

  /* Firebase save */
  saveAnomaly,

  /* Historique & export */
  toggleHistory,
  applyFilters,
  clearFilters,
  deleteAnomaly,
  exportCSV,
  exportXLSX,
});
