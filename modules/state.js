/* ══════════════════════════════════════════════
   state.js — État partagé de l'application
   ══════════════════════════════════════════════
   Un seul objet mutable exporté : toutes les
   mutations passent par cet objet, ce qui évite
   les problèmes de liaisons d'exports ES-modules.
   ══════════════════════════════════════════════ */

export const state = {
  /* Arbre de décision chargé depuis tree.json */
  TREE: null,

  /* Navigation formulaire */
  currentStepId: null,
  stepHistory:   [],
  collected:     {},
  breadcrumb:    [],

  /* Photos en attente d'envoi */
  pendingPhotos: [], // [{ base64, size }]

  /* Historique */
  historyVisible: false,
  allDocs:        [],

  /* Lightbox */
  lbImages: [],
  lbIndex:  0,

  /* Toast timer */
  toastTimer: null,
};
