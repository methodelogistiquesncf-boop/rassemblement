/* ══════════════════════════════════════════════
   auth.js — Authentification Firebase
   ══════════════════════════════════════════════ */

import { restart } from "./navigation.js";

/* Références Firebase (initialisées dans app.js avant l'import) */
export const getAuth = () => firebase.auth();

/* ── Messages d'erreur localisés ── */
const AUTH_ERRORS = {
  "auth/user-not-found":        "Aucun compte trouvé pour cet e-mail.",
  "auth/wrong-password":        "Mot de passe incorrect.",
  "auth/invalid-email":         "Adresse e-mail invalide.",
  "auth/too-many-requests":     "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/invalid-credential":    "Identifiants incorrects. Vérifiez votre e-mail et mot de passe.",
  "auth/network-request-failed":"Erreur réseau. Vérifiez votre connexion.",
};

/* ── Connexion ── */
export async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-password").value;
  const btn   = document.getElementById("login-btn");

  document.getElementById("login-error").classList.remove("show");
  ["login-email", "login-password"].forEach(id =>
    document.getElementById(id).classList.remove("error")
  );

  if (!email || !pass) {
    showLoginError("Veuillez remplir tous les champs.");
    if (!email) document.getElementById("login-email").classList.add("error");
    if (!pass)  document.getElementById("login-password").classList.add("error");
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span>&nbsp;Connexion…';

  try {
    await getAuth().signInWithEmailAndPassword(email, pass);
  } catch (err) {
    btn.disabled  = false;
    btn.innerHTML = "Se connecter";
    showLoginError(AUTH_ERRORS[err.code] || "Erreur : " + err.message);
  }
}

/* ── Déconnexion ── */
export async function doLogout() {
  if (!confirm("Se déconnecter ?")) return;
  await getAuth().signOut();
}

/* ── Afficher l'écran de login ── */
export function showLogin() {
  document.getElementById("login-view").style.display = "flex";
  document.getElementById("app-view").style.display   = "none";
  document.getElementById("login-email").value    = "";
  document.getElementById("login-password").value = "";
  document.getElementById("login-error").classList.remove("show");
  const btn = document.getElementById("login-btn");
  btn.disabled  = false;
  btn.innerHTML = "Se connecter";
}

/* ── Afficher l'application ── */
export function showApp(user) {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("app-view").style.display   = "block";

  const email = user.email || "";
  document.getElementById("user-avatar").textContent        = email.charAt(0).toUpperCase();
  document.getElementById("user-email-display").textContent = email;

  // Fermeture de la modale de confirmation en cliquant sur l'overlay
  const overlay = document.getElementById("confirm-overlay");
  if (overlay && !overlay.dataset.listenerSet) {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeConfirm();
    });
    overlay.dataset.listenerSet = "1";
  }

  restart();
}

/* ── Helpers internes ── */
function showLoginError(msg) {
  const b = document.getElementById("login-error");
  b.textContent = "⚠ " + msg;
  b.classList.add("show");
}

export function closeConfirm() {
  document.getElementById("confirm-overlay").classList.remove("show");
}
