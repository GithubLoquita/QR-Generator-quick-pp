/**
 * QR Studio — Subpage helper script
 * Handles cookie reset and consent clearance safely without inline scripts or alerts.
 */

window.addEventListener('DOMContentLoaded', () => {
  const btnReset = document.getElementById('btn-reset-cookie-consent');
  const feedbackEl = document.getElementById('reset-feedback');

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      try {
        localStorage.removeItem('qr_studio_terms_consent');
        localStorage.removeItem('qr_studio_file_upload_consent');
        localStorage.removeItem('qr_studio_last_known_count');
      } catch (e) {
        // Local storage unavailable
      }

      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        setTimeout(() => {
          feedbackEl.classList.add('hidden');
        }, 4500);
      }
    });
  }
});
