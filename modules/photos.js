/* ══════════════════════════════════════════════
   photos.js — Capture, compression & gestion photos
   ══════════════════════════════════════════════ */

import { state }                from "./state.js";
import { MAX_PHOTOS, MAX_PX, JPEG_QUALITY } from "./config.js";
import { showToast }            from "./utils.js";
import { renderPhotoPreview }   from "./summary.js";

/* ── Déclencheurs d'input ── */
export function triggerPhotoCamera() {
  const input = document.getElementById("photo-input");
  input.removeAttribute("capture");
  input.setAttribute("capture", "environment");
  input.value = "";
  input.click();
}

export function triggerPhotoGallery() {
  const input = document.getElementById("photo-input");
  input.removeAttribute("capture");
  input.value = "";
  input.click();
}

/* ── Traitement de la sélection ── */
export async function handlePhotoInput(event) {
  const files     = Array.from(event.target.files);
  if (!files.length) return;

  const remaining = MAX_PHOTOS - state.pendingPhotos.length;
  const toProcess = files.slice(0, remaining);

  for (const file of toProcess) {
    try {
      const base64 = await compressToBase64(file);
      state.pendingPhotos.push({ base64, size: base64.length });
    } catch (e) {
      showToast("❌ Erreur photo : " + e.message);
    }
  }

  if (files.length > remaining)
    showToast(`⚠ Max ${MAX_PHOTOS} photos — ${files.length - remaining} ignorée(s)`);

  renderPhotoPreview();
}

/* ── Suppression d'une photo ── */
export function removePhoto(index) {
  state.pendingPhotos.splice(index, 1);
  renderPhotoPreview();
}

/* ── Compression canvas → base64 JPEG ── */
function compressToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible"));
    reader.onload  = e => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide"));
      img.onload  = () => {
        let { width: w, height: h } = img;
        if (w > MAX_PX || h > MAX_PX) {
          if (w >= h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
          else        { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
