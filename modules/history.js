/* ══════════════════════════════════════════════
   history.js — Historique, filtres, suppression & export
   ══════════════════════════════════════════════ */

import { state }                          from "./state.js";
import { esc, highlight, showToast,
         triggerDownload, dateStamp }     from "./utils.js";
import { getDb }                          from "./firebase-save.js";
import { openLightboxHistory }            from "./lightbox.js";
import { closeConfirm }                   from "./auth.js";
import { restart }                        from "./navigation.js";

/* ══════════════════════════════════════════════
   TOGGLE HISTORIQUE
   ══════════════════════════════════════════════ */
export function toggleHistory() {
  state.historyVisible = !state.historyVisible;
  document.getElementById("form-view").style.display = state.historyVisible ? "none" : "block";
  document.getElementById("history-view").classList.toggle("show", state.historyVisible);
  if (state.historyVisible) loadHistory();
}

/* ══════════════════════════════════════════════
   CHARGEMENT DEPUIS FIRESTORE
   ══════════════════════════════════════════════ */
async function loadHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "<p class='empty-state' style='padding:20px 0'>Chargement…</p>";
  try {
    const snap = await getDb()
      .collection("anomalies")
      .orderBy("ts", "desc")
      .limit(200)
      .get();
    state.allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    populateCategoryFilter();
    applyFilters();
  } catch (err) {
    list.innerHTML =
      `<p class='empty-state' style='color:#dc2626'>Erreur : ${err.message}</p>`;
  }
}

/* ══════════════════════════════════════════════
   FILTRES
   ══════════════════════════════════════════════ */
function populateCategoryFilter() {
  const sel  = document.getElementById("f-categorie");
  const cats = [...new Set(state.allDocs.map(d => d.categorie).filter(Boolean))].sort();
  sel.innerHTML =
    '<option value="">Toutes catégories</option>' +
    cats.map(c => `<option value="${esc(c)}">${c}</option>`).join("");
}

export function applyFilters() {
  const search    = document.getElementById("f-search").value.trim().toLowerCase();
  const categorie = document.getElementById("f-categorie").value;
  const dateFrom  = document.getElementById("f-date-from").value;
  const dateTo    = document.getElementById("f-date-to").value;
  const declarant = document.getElementById("f-declarant").value.trim().toLowerCase();

  const filtered = state.allDocs.filter(d => {
    if (categorie && d.categorie !== categorie) return false;
    if (d.date) {
      const docDate = d.date.slice(0, 10);
      if (dateFrom && docDate < dateFrom) return false;
      if (dateTo   && docDate > dateTo)   return false;
    }
    if (declarant && !(d.declarant_email || "").toLowerCase().includes(declarant)) return false;
    if (search) {
      const hay = []
        .concat(d.chemin || [])
        .concat([d.support, d.kit, d.engin, d.commentaire, d.preco, d.stockage_hs, d.declarant_email])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  document.getElementById("filter-count").textContent =
    `${filtered.length} / ${state.allDocs.length} entrée${state.allDocs.length > 1 ? "s" : ""}`;
  renderHistoryItems(filtered, search);
}

export function clearFilters() {
  ["f-search", "f-date-from", "f-date-to", "f-declarant"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("f-categorie").value = "";
  applyFilters();
}

/* ══════════════════════════════════════════════
   RENDU DES ITEMS
   ══════════════════════════════════════════════ */
function renderHistoryItems(docs, searchTerm) {
  const list = document.getElementById("history-list");
  if (!docs.length) {
    list.innerHTML =
      "<p class='empty-state' style='padding:30px 0'>Aucun résultat pour ces filtres.</p>";
    return;
  }

  list.innerHTML = docs.map(d => {
    const dt       = d.date ? new Date(d.date).toLocaleString("fr-FR") : "—";
    const dec      = d.declarant_email
      ? `<span style="opacity:.7">· ${highlight(d.declarant_email, searchTerm)}</span>`
      : "";
    const cheminHL = (d.chemin || []).map(c => highlight(c, searchTerm)).join(" › ");
    const photos   = d.photos || [];

    /* Champs labellisés */
    const infoFields = [
      { label: "Support",     val: d.support     },
      { label: "Kit",         val: d.kit         },
      { label: "Engin",       val: d.engin       },
      { label: "Stockage HS", val: d.stockage_hs },
      { label: "Préco.",      val: d.preco       },
    ].filter(f => f.val);

    const infosHTML = infoFields.length
      ? `<div class="hist-fields">` +
          infoFields.map(f =>
            `<span class="hist-field-item">
               <span class="hist-field-label">${f.label}</span>
               <span class="hist-field-sep">:</span>
               <span class="hist-field-value">${highlight(f.val, searchTerm)}</span>
             </span>`
          ).join("") +
        `</div>`
      : "";

    /* Commentaire */
    const commentHTML = d.commentaire
      ? `<div class="hist-comment">
           <span class="hist-comment-label">Commentaire :</span>
           <em>${highlight(d.commentaire, searchTerm)}</em>
         </div>`
      : "";

    /* Miniatures photos */
    let photoEl = "";
    if (photos.length) {
      window._histPhotos        = window._histPhotos || {};
      window._histPhotos[d.id]  = photos;
      const thumbs = photos.map((src, i) =>
        `<img class="hist-photo-thumb" src="${src}" alt="Photo ${i + 1}"
              data-index="${i}" data-docid="${d.id}"
              onclick="openHistoryPhoto(this)" />`
      ).join("");
      photoEl = `<div class="hist-photos">${thumbs}</div>`;
    }

    return `<div class="history-item" id="item-${d.id}">
      <div class="history-item-top">
        <span class="hist-badge">${highlight(d.categorie || "—", searchTerm)}</span>
        <span class="hist-date">${dt} ${dec}</span>
        <button class="btn-delete" onclick="deleteAnomaly('${d.id}')">🗑 Supprimer</button>
      </div>
      <div class="hist-path">${cheminHL}</div>
      ${infosHTML}
      ${commentHTML}
      ${photoEl}
    </div>`;
  }).join("");
}

/* ══════════════════════════════════════════════
   LIGHTBOX HISTORIQUE
   ══════════════════════════════════════════════ */
export function openHistoryPhoto(el) {
  const docId  = el.dataset.docid;
  const index  = parseInt(el.dataset.index, 10);
  const photos = (window._histPhotos || {})[docId] || [];
  openLightboxHistory(photos, index);
}

/* ══════════════════════════════════════════════
   SUPPRESSION
   ══════════════════════════════════════════════ */
export function deleteAnomaly(docId) {
  const overlay = document.getElementById("confirm-overlay");
  const okBtn   = document.getElementById("confirm-ok-btn");
  overlay.classList.add("show");

  /* Clone pour détacher l'ancien listener */
  const fresh = okBtn.cloneNode(true);
  okBtn.replaceWith(fresh);
  fresh.onclick = async () => {
    closeConfirm();
    const item = document.getElementById("item-" + docId);
    if (item) item.classList.add("removing");
    try {
      await getDb().collection("anomalies").doc(docId).delete();
      state.allDocs = state.allDocs.filter(d => d.id !== docId);
      setTimeout(() => { item?.remove(); applyFilters(); }, 280);
      showToast("✅ Anomalie supprimée");
    } catch (err) {
      item?.classList.remove("removing");
      showToast("❌ Erreur : " + err.message);
    }
  };
}

/* ══════════════════════════════════════════════
   EXPORT CSV / XLSX
   ══════════════════════════════════════════════ */
async function getExportRows() {
  let docs = state.allDocs;
  if (!docs.length) {
    const snap = await getDb().collection("anomalies").orderBy("ts", "desc").get();
    docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  return docs.map(d => ({
    "Date":           d.date ? new Date(d.date).toLocaleString("fr-FR") : "",
    "Catégorie":      d.categorie       || "",
    "Chemin complet": (d.chemin || []).join(" › "),
    "Support":        d.support         || "",
    "Kit":            d.kit             || "",
    "Engin":          d.engin           || "",
    "Commentaire":    d.commentaire     || "",
    "Préconisation":  d.preco           || "",
    "Stockage HS":    d.stockage_hs     || "",
    "Déclarant":      d.declarant_email || "",
    "Nb photos":      (d.photos || []).length,
  }));
}

export async function exportCSV() {
  showToast("⏳ Préparation du CSV…");
  try {
    const rows = await getExportRows();
    if (!rows.length) { showToast("⚠ Aucune anomalie à exporter"); return; }
    const headers = Object.keys(rows[0]);
    const escCSV  = v => '"' + String(v).replace(/"/g, '""') + '"';
    const lines   = [headers.map(escCSV).join(";")]
      .concat(rows.map(r => headers.map(h => escCSV(r[h])).join(";")));
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, "anomalies_" + dateStamp() + ".csv");
    showToast(`✅ CSV téléchargé (${rows.length} lignes)`);
  } catch (err) { showToast("❌ Erreur : " + err.message); }
}

export async function exportXLSX() {
  showToast("⏳ Préparation Excel…");
  try {
    const rows = await getExportRows();
    if (!rows.length) { showToast("⚠ Aucune anomalie à exporter"); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      {wch:18},{wch:18},{wch:50},{wch:16},{wch:14},
      {wch:14},{wch:35},{wch:35},{wch:20},{wch:28},{wch:10},
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anomalies");
    XLSX.writeFile(wb, "anomalies_" + dateStamp() + ".xlsx");
    showToast(`✅ Excel téléchargé (${rows.length} lignes)`);
  } catch (err) { showToast("❌ Erreur : " + err.message); }
}
