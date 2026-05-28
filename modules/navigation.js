/* ══════════════════════════════════════════════
   navigation.js — Rendu & navigation dans l'arbre
   ══════════════════════════════════════════════ */

import { state }           from "./state.js";
import { esc }             from "./utils.js";
import { renderSummary }   from "./summary.js";

/* ══════════════════════════════════════════════
   RENDU PRINCIPAL
   ══════════════════════════════════════════════ */
export function render() {
  const { TREE, currentStepId, stepHistory, breadcrumb } = state;
  const step = TREE.nodes[currentStepId];
  const pct  = Math.min(Math.round((stepHistory.length / 9) * 100), 95);

  document.getElementById("progress-bar").style.width   = pct + "%";
  document.getElementById("progress-label").textContent = "Étape " + (stepHistory.length + 1);
  document.getElementById("breadcrumb").innerHTML = breadcrumb
    .map((b, i) =>
      (i > 0 ? '<span class="bc-sep">›</span>' : "") +
      `<span class="bc-item">${b}</span>`
    )
    .join("");

  let inner =
    `<div class="step-tag">${step.tag || ""}</div>` +
    `<div class="step-question">${step.question}</div>`;

  if (step.type === "select") {
    inner += `<div class="options">${step.options
      .map((o, i) =>
        `<button class="opt-btn" onclick="pickOption(${i})">
           <span>${o.label}</span><span class="chevron">›</span>
         </button>`
      )
      .join("")}</div>`;
    if (stepHistory.length > 0)
      inner += `<div class="btn-row">
                  <button class="btn btn-back" onclick="goBack()">← Retour</button>
                </div>`;

  } else if (step.type === "fields") {
    inner +=
      `<div class="fields">${step.fields
        .map(
          f =>
            `<div class="field">
               <label>${f.label}</label>
               <input id="f_${f.key}"
                      placeholder="${f.placeholder}"
                      value="${esc(state.collected[f.key] || "")}" />
             </div>`
        )
        .join("")}</div>` + navButtons("submitFields()");

  } else if (step.type === "text") {
    inner +=
      `<div class="fields"><div class="field">
         <input id="txt_field"
                placeholder="${step.placeholder}"
                value="${esc(state.collected[step.field] || "")}" />
       </div></div>` + navButtons("submitText()");

  } else if (step.type === "textarea") {
    const isLast = step.next === null;
    inner +=
      `<div class="fields"><div class="field">
         <textarea id="ta_field"
                   placeholder="${step.placeholder}">${esc(
                     state.collected[step.field || "commentaire"] || ""
                   )}</textarea>
       </div></div>` +
      navButtons(
        "submitTextarea()",
        isLast ? "📋 Voir le récapitulatif" : "Suivant →"
      );

  } else if (step.type === "info") {
    inner +=
      `<div class="info-banner">${step.message}</div>` +
      navButtons("advanceStep()");
  }

  document.getElementById("step-container").innerHTML =
    `<div class="card">${inner}</div>`;
}

/* ── Boutons de navigation réutilisables ── */
function navButtons(onNext, nextLabel = "Suivant →") {
  const back =
    state.stepHistory.length > 0
      ? `<button class="btn btn-back" onclick="goBack()">← Retour</button>`
      : "";
  return `<div class="btn-row">${back}
            <button class="btn btn-next" onclick="${onNext}">${nextLabel}</button>
          </div>`;
}

/* ══════════════════════════════════════════════
   ACTIONS DE NAVIGATION
   ══════════════════════════════════════════════ */
export function pickOption(i) {
  const step = state.TREE.nodes[state.currentStepId];
  const opt  = step.options[i];
  pushHistory();
  state.breadcrumb.push(opt.label);
  state.collected["n" + state.stepHistory.length] = opt.label;
  state.currentStepId = opt.next;
  render();
}

export function submitFields() {
  const step = state.TREE.nodes[state.currentStepId];
  let ok = true;
  step.fields.forEach(f => {
    const el  = document.getElementById("f_" + f.key);
    const val = el.value.trim();
    if (f.required && !val) {
      el.classList.add("error");
      ok = false;
    } else {
      el.classList.remove("error");
      state.collected[f.key] = val;
    }
  });
  if (!ok) { alert("❗ Veuillez remplir tous les champs obligatoires (*)"); return; }
  pushHistory();
  state.currentStepId = step.next;
  render();
}

export function submitText() {
  const step = state.TREE.nodes[state.currentStepId];
  const val  = document.getElementById("txt_field").value.trim();
  if (step.required && !val) { alert("❗ Ce champ est obligatoire."); return; }
  state.collected[step.field] = val;
  pushHistory();
  state.currentStepId = step.next;
  render();
}

export function submitTextarea() {
  const step = state.TREE.nodes[state.currentStepId];
  state.collected[step.field || "commentaire"] =
    document.getElementById("ta_field").value.trim();
  pushHistory();
  if (step.next === null) renderSummary();
  else { state.currentStepId = step.next; render(); }
}

export function advanceStep() {
  const step = state.TREE.nodes[state.currentStepId];
  pushHistory();
  state.currentStepId = step.next;
  render();
}

export function goBack() {
  if (!state.stepHistory.length) return;
  const prev = state.stepHistory.pop();
  state.currentStepId = prev.stepId;
  state.collected     = prev.collected;
  state.breadcrumb    = prev.breadcrumb;
  render();
}

/* ── Sauvegarde de l'historique de navigation ── */
function pushHistory() {
  state.stepHistory.push({
    stepId:    state.currentStepId,
    collected: JSON.parse(JSON.stringify(state.collected)),
    breadcrumb: [...state.breadcrumb],
  });
}

/* ── Réinitialisation complète ── */
export function restart() {
  state.currentStepId  = state.TREE.start;
  state.stepHistory    = [];
  state.collected      = {};
  state.breadcrumb     = [];
  state.pendingPhotos  = [];
  state.historyVisible = false;
  document.getElementById("form-view").style.display = "block";
  document.getElementById("history-view").classList.remove("show");
  render();
}
