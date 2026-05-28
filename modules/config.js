/* ══════════════════════════════════════════════
   config.js — Constantes & configuration Firebase
   ══════════════════════════════════════════════ */

export const MAX_PHOTOS   = 4;
export const MAX_PX       = 900;
export const JPEG_QUALITY = 0.72;
export const WARN_SIZE_B  = 200_000; // 200 Ko
export const ESTIMATED_MAX = 9;

export const LABEL_MAP = {
  support:     "Support",
  kit:         "Kit",
  engin:       "Engin",
  commentaire: "Commentaire",
  preco:       "Préconisation",
  stockage_hs: "Emplacement HS",
};

export const firebaseConfig = {
  apiKey:            "AIzaSyB_L59ptLWbd5y4mlvHpqNmbJBn705JWjk",
  authDomain:        "rassemblement-1a51c.firebaseapp.com",
  projectId:         "rassemblement-1a51c",
  storageBucket:     "rassemblement-1a51c.firebasestorage.app",
  messagingSenderId: "303649098218",
  appId:             "1:303649098218:web:7b892712822dd715688a93",
};
