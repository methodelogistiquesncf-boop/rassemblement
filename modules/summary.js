/* ══════════════════════════════════════════════
   summary.js — Récapitulatif & aperçu photos
   ══════════════════════════════════════════════ */

import { state }                                    from "./state.js";
import { esc }                                      from "./utils.js";
import { LABEL_MAP, MAX_PHOTOS, WARN_SIZE_B }       from "./config.js";

/* ══════════════════════════════════════════════
   RÉCAPITULATIF
   ══════════════════════════════════════════════ */
export function renderSummary() {
  document.getElementById("progress-bar").style.width   = "100%";
  document.getElementById("progress-label").textContent = "Récapitulatif";

  /* Chemin d'anomalie (n1, n2, …) */
  const path = [];
  for (let i = 1; ; i++) {
    if (state.collected["n" + i]) path.push(state.collected["n" + i]);
    else break;
  }

  /* Champs saisis (hors nx) */
  const extras = Object.entries(state.collected)
    .filter(([k]) => !k.startsWith("n"))
    .map(([k, v]) => ({ key: LABEL_MAP[k] || k, val: v || "—" }));

  document.getElementById("step-container").innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="step-tag">Récapitulatif</div>
      <div class="step-question" style="font-size:17px">Vérifiez avant d'enregistrer</div>
    </div>

    <div class="summary-table">
      <div class="summary-header">📋 Chemin d'anomalie</div>
      ${path
        .map(
          (p, i) => `
        <div class="summary-row">
          <span class="s-key">Niveau ${i + 1}</span>
          <span class="s-val">${p}</span>
        </div>`
        )
        .join("")}
    </div>

    ${
      extras.length
        ? `<div class="summary-table">
             <div class="summary-header">📝 Données saisies</div>
             ${extras
               .map(
                 e => `
               <div class="summary-row">
                 <span class="s-key">${e.key}</span>
                 <span class="s-val">${e.val}</span>
               </div>`
               )
               .join("")}
           </div>`
        : ""
    }

    <div class="summary-table" style="margin-bottom:14px">
      <div class="summary-header">📷 Photos (optionnel · max ${MAX_PHOTOS})</div>
      <div style="padding:14px 16px">
        <div class="photo-size-warn" id="photo-warn">
          ⚠ Une ou plusieurs photos dépassent 200 Ko après compression.
        </div>
        <div class="photo-grid" id="photo-preview-grid"></div>
        <div id="photo-add-zone"
             style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <button class="btn btn-next"
                  style="flex:1;min-width:140px;font-size:14px;padding:13px 10px;"
                  onclick="triggerPhotoCamera()">
            📷 Prendre une photo
          </button>
          <button class="btn btn-back"
                  style="flex:1;min-width:140px;font-size:14px;padding:13px 10px;
                         background:#e5e7eb;color:#111827;"
                  onclick="triggerPhotoGallery()">
            🖼 Depuis la galerie
          </button>
        </div>
        <div id="photo-counter"
             style="font-size:12px;color:var(--muted);margin-top:8px;text-align:right;">
          0 / ${MAX_PHOTOS} photo
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <button class="btn btn-back" style="flex:0 0 auto;" onclick="restart()">
        ↺ Recommencer
      </button>
      <button class="btn-submit-main" id="save-btn" onclick="saveAnomaly()"
              style="flex:1;min-width:180px;">
        ✅ Enregistrer l'anomalie
      </button>
    </div>

    <div class="success-state" id="success-state">
      <div class="success-icon">✅</div>
      <h2>Anomalie enregistrée !</h2>
      <p>La déclaration a été sauvegardée avec succès.</p>
      <button class="btn-new" onclick="restart()">+ Nouvelle déclaration</button>
    </div>
  `;

  renderPhotoPreview();
}

/* ══════════════════════════════════════════════
   APERÇU PHOTOS (récapitulatif)
   ══════════════════════════════════════════════ */
export function renderPhotoPreview() {
  const grid    = document.getElementById("photo-preview-grid");
  const addZone = document.getElementById("photo-add-zone");
  const warn    = document.getElementById("photo-warn");
  const counter = document.getElementById("photo-counter");
  if (!grid) return;

  const hasLarge = state.pendingPhotos.some(p => p.size > WARN_SIZE_B);
  warn.classList.toggle("show", hasLarge);

  grid.innerHTML = state.pendingPhotos
    .map(
      (p, i) =>
        `<div class="photo-thumb-wrap">
           <img src="${p.base64}" alt="Photo ${i + 1}"
                onclick="openLightboxLocal(${i})" />
           <button class="photo-thumb-del" onclick="removePhoto(${i})">✕</button>
         </div>`
    )
    .join("");

  if (addZone) addZone.style.display = state.pendingPhotos.length >= MAX_PHOTOS ? "none" : "flex";
  if (counter) {
    const n = state.pendingPhotos.length;
    counter.textContent = `${n} / ${MAX_PHOTOS} photo${n > 1 ? "s" : ""}`;
  }
}
