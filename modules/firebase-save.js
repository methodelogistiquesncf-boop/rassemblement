/* ══════════════════════════════════════════════
   firebase-save.js — Enregistrement d'une anomalie
   ══════════════════════════════════════════════ */

import { state } from "./state.js";

export const getDb   = () => firebase.firestore();
export const getAuth = () => firebase.auth();

/* ══════════════════════════════════════════════
   SAUVEGARDE
   ══════════════════════════════════════════════ */
export async function saveAnomaly() {
  const btn = document.getElementById("save-btn");
  btn.disabled  = true;
  btn.innerHTML =
    '<span class="spinner" style="border-top-color:#fff;border-color:#fff4;width:18px;' +
    'height:18px;display:inline-block;vertical-align:middle;margin-right:8px;' +
    'border-radius:50%;animation:spin .7s linear infinite;border-width:2.5px;' +
    'flex-shrink:0"></span>Enregistrement…';

  /* Reconstruction du chemin d'anomalie */
  const path = [];
  for (let i = 1; ; i++) {
    if (state.collected["n" + i]) path.push(state.collected["n" + i]);
    else break;
  }

  const user = getAuth().currentUser;
  try {
    await getDb().collection("anomalies").add({
      chemin:          path,
      categorie:       path[0]                       || "",
      support:         state.collected.support        || "",
      kit:             state.collected.kit            || "",
      engin:           state.collected.engin          || "",
      commentaire:     state.collected.commentaire    || "",
      preco:           state.collected.preco          || "",
      stockage_hs:     state.collected.stockage_hs    || "",
      date:            new Date().toISOString(),
      ts:              firebase.firestore.FieldValue.serverTimestamp(),
      declarant_uid:   user?.uid   ?? "",
      declarant_email: user?.email ?? "",
      photos:          state.pendingPhotos.map(p => p.base64),
    });

    state.pendingPhotos = [];
    document.getElementById("success-state").classList.add("show");
    btn.style.display = "none";
  } catch (err) {
    btn.disabled  = false;
    btn.innerHTML = "✅ Enregistrer l'anomalie";
    alert("❌ Erreur Firebase :\n" + err.message);
  }
}
