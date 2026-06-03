// ═══════════════════════════════════════════
//  DONATION MODULE
// ═══════════════════════════════════════════

// URL Donasi utama, bisa diganti kapan saja.
// Rekomendasi: Saweria, Trakteer, SociaBuzz, dll.
const DONATION_URL = 'https://saweria.co/zarkasih081';

let _donationAmount = 10000;

/**
 * Update the selected nominal button UI
 * @param {number} amount - Nominal in Rupiah
 * @param {HTMLElement} btn - The clicked button element
 */
function setNominal(amount, btn) {
  _donationAmount = amount;
  
  // Remove .on from all buttons in the row
  const row = btn.closest('.dn-nominal-row');
  if (row) {
    row.querySelectorAll('.dn-nominal-btn').forEach(b => b.classList.remove('on'));
  }
  
  // Add .on to the clicked button
  btn.classList.add('on');
}

/**
 * Opens the donation link in a new tab.
 * Note: Most donation platforms like Saweria don't support amount pre-filling via URL easily,
 * so we just open the main page. The nominal selection on our UI is mostly to build intent.
 */
function openDonation() {
  window.open(DONATION_URL, '_blank');
}

/**
 * Copies the donation link to the clipboard and shows a toast.
 */
function copyDonationLink() {
  copyTextSafe(DONATION_URL).then(success => {
    if (success) {
      msg(window.t ? window.t('dn_copied') : 'Link copied!');
    } else {
      alert("Failed to copy link!");
    }
  });
}
