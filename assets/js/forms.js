/**
 * SMR EVEREST — Forms & Lead Management
 * Handles: Floor Plan Modal, Contact Form, Google Sheets submission
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Apps Script at https://script.google.com
 * 2. Paste the Apps Script code from README.md
 * 3. Deploy as Web App → Anyone
 * 4. Replace GOOGLE_APPS_SCRIPT_URL below with your deployed URL
 */

'use strict';

/* ═══════════════════════════════════════════
   CONFIGURATION
   Replace with your Google Apps Script URL
═══════════════════════════════════════════ */
const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbycj8qtwmXNsAmZ5zQgNwwl3Y8TzD92L_7-KCu0FLTxezPbfqh-oLEEgoT5thRmGzcYLg/exec';

/* Track which floor plan was clicked */
let currentFloorPlanIndex = null;
let currentFloorPlanName = '';
let formSubmitted = {};  // Track which floor plans are already unlocked
let pendingBrochureDownload = false; // Track if user wants brochure

const BROCHURE_PDF_URL = 'smr-broucher - everest.pdf';

document.addEventListener('DOMContentLoaded', () => {
  initLeadForm();
  initContactForm();
  restoreUnlockedPlans();
});

/* ═══════════════════════════════════════════
   FLOOR PLAN MODAL
═══════════════════════════════════════════ */

/**
 * Open floor plan modal — called from HTML onclick
 * @param {HTMLElement} btn - The button that was clicked
 */
function openFloorPlanModal(target) {
  // Extract target element with dataset
  const el = (target && target.closest) ? (target.closest('[data-index]') || target) : target;
  const index = el && el.dataset && el.dataset.index !== undefined ? el.dataset.index : 0;
  const planName = el && el.dataset && el.dataset.plan ? el.dataset.plan : 'Floor Plan';

  currentFloorPlanIndex = index;
  currentFloorPlanName = planName;

  // If already unlocked for this plan, open full viewer directly
  if (formSubmitted[index]) {
    unlockFloorPlan(index);
    openFullFloorPlanViewer(index, planName);
    return;
  }

  // Set modal fields
  const sourceField = document.getElementById('lead-source');
  const planField = document.getElementById('lead-floor-plan');
  const title = document.getElementById('lead-modal-title');
  const subtitle = document.getElementById('lead-modal-subtitle');
  const submitBtn = document.getElementById('lead-btn-text');

  if (sourceField) sourceField.value = 'Floor Plan Modal';
  if (planField) planField.value = planName;
  if (title) title.textContent = 'Unlock Exclusive Access';
  if (subtitle) subtitle.textContent = `Enter your details to view the ${planName} floor plan`;
  if (submitBtn) submitBtn.textContent = 'Unlock Floor Plan';

  // Open modal
  const modal = document.getElementById('leadModal');
  if (!modal) return;

  // Reset state
  const form = document.getElementById('leadForm');
  const success = document.getElementById('leadSuccess');
  if (form) form.style.display = '';
  if (success) success.style.display = 'none';
  clearFormErrors('leadForm');

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const firstInput = document.getElementById('lead-name');
    if (firstInput) firstInput.focus();
  }, 150);
}

/**
 * Unlock the floor plan at given index
 */
function unlockFloorPlan(index) {
  const img = document.getElementById(`fp-img-${index}`);
  const overlay = document.getElementById(`fp-blur-${index}`);
  const btn = document.getElementById(`fp-btn-${index}`);

  if (img) {
    img.classList.remove('locked');
    img.classList.add('unlocked');
    img.style.filter = 'none';
    img.style.transform = 'scale(1)';
  }

  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }, 400);
  }

  if (btn) {
    btn.textContent = '🔍 View Full Floor Plan';
    btn.disabled = false;
    btn.style.background = 'linear-gradient(135deg, #0B2238, #16385C)';
    btn.style.cursor = 'pointer';
  }

  // Save unlock state
  formSubmitted[index] = true;
  saveUnlockState();
}

/**
 * Open full-screen high-res Floor Plan Viewer Modal
 */
function openFullFloorPlanViewer(index, planName) {
  const modal = document.getElementById('fpImageModal');
  const img = document.getElementById('fpFullImg');
  const title = document.getElementById('fpFullTitle');

  if (!modal) return;

  if (title) title.textContent = planName || 'Floor Plan Layout';
  if (img) img.src = 'images/floor_plan.jpg';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFullFloorPlanViewer() {
  const modal = document.getElementById('fpImageModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/**
 * Save unlock state to sessionStorage
 */
function saveUnlockState() {
  try {
    sessionStorage.setItem('smr_unlocked', JSON.stringify(formSubmitted));
  } catch (e) { /* ignore */ }
}

/**
 * Restore unlock state on page load
 */
function restoreUnlockedPlans() {
  try {
    const saved = sessionStorage.getItem('smr_unlocked');
    if (saved) {
      formSubmitted = JSON.parse(saved);
      Object.keys(formSubmitted).forEach(index => {
        if (formSubmitted[index]) {
          unlockFloorPlan(index);
        }
      });
    }
  } catch (e) { /* ignore */ }
}

/* ═══════════════════════════════════════════
   LEAD FORM SUBMISSION
═══════════════════════════════════════════ */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateLeadForm()) return;

    const submitBtn = document.getElementById('lead-submit-btn');
    const btnText = document.getElementById('lead-btn-text');
    const btnLoader = document.getElementById('lead-btn-loader');

    // Show loader
    setButtonLoading(submitBtn, btnText, btnLoader, true);

    // Collect data
    const payload = {
      timestamp: new Date().toISOString(),
      name: getVal('lead-name'),
      phone: getVal('lead-phone'),
      email: getVal('lead-email'),
      city: getVal('lead-city'),
      source: getVal('lead-source') || 'Lead Modal',
      floorPlan: getVal('lead-floor-plan') || '',
    };

    try {
      await submitToGoogleSheets(payload);
      showLeadSuccess();

      // Unlock floor plan if applicable
      if (currentFloorPlanIndex !== null) {
        setTimeout(() => {
          unlockFloorPlan(currentFloorPlanIndex);
        }, 500);
      }

      // Auto-trigger brochure download if that was the intent
      if (pendingBrochureDownload) {
        setTimeout(() => {
          triggerBrochureDownload();
        }, 800);
      }
    } catch (err) {
      console.error('Submission error:', err);

      // On API error, still unlock (demo mode) and show success
      showLeadSuccess();
      if (currentFloorPlanIndex !== null) {
        setTimeout(() => unlockFloorPlan(currentFloorPlanIndex), 500);
      }
      if (pendingBrochureDownload) {
        setTimeout(() => triggerBrochureDownload(), 800);
      }
    } finally {
      setButtonLoading(submitBtn, btnText, btnLoader, false);
    }
  });
}

function showLeadSuccess() {
  const form = document.getElementById('leadForm');
  const success = document.getElementById('leadSuccess');

  if (form) form.style.display = 'none';
  if (success) success.style.display = 'block';

  // Update success button text based on context
  const closeSuccessBtn = document.getElementById('lead-success-close-btn');
  if (closeSuccessBtn) {
    if (pendingBrochureDownload) {
      closeSuccessBtn.textContent = 'Download Brochure';
    } else if (currentFloorPlanIndex !== null) {
      closeSuccessBtn.textContent = 'View Floor Plan';
    } else {
      closeSuccessBtn.textContent = 'Close';
    }
    closeSuccessBtn.onclick = handleLeadSuccessClick;
  }

  // Update success message
  const successTitle = success?.querySelector('h3');
  const successMsg = success?.querySelector('p');
  if (pendingBrochureDownload) {
    if (successTitle) successTitle.textContent = 'Brochure Ready!';
    if (successMsg) successMsg.textContent = 'Your exclusive SMR Everest brochure is ready for download.';
  } else if (currentFloorPlanIndex !== null) {
    if (successTitle) successTitle.textContent = 'Access Granted!';
    if (successMsg) successMsg.textContent = 'Your floor plan has been unlocked. Our consultant will call you within 30 minutes.';
  } else {
    if (successTitle) successTitle.textContent = 'Thank You!';
    if (successMsg) successMsg.textContent = 'Our luxury consultant will reach out within 30 minutes.';
  }
}

function handleLeadSuccessClick() {
  if (pendingBrochureDownload) {
    triggerBrochureDownload();
    pendingBrochureDownload = false;
    closeLeadModal();
  } else if (currentFloorPlanIndex !== null) {
    closeLeadModal();
    openFullFloorPlanViewer(currentFloorPlanIndex, currentFloorPlanName);
  } else {
    closeLeadModal();
  }
}

/**
 * Trigger actual brochure PDF download
 */
function triggerBrochureDownload() {
  const link = document.createElement('a');
  link.href = BROCHURE_PDF_URL;
  link.download = 'SMR-Everest-Brochure.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ═══════════════════════════════════════════
   CONTACT FORM SUBMISSION
═══════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateContactForm()) return;

    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('contact-btn-text');
    const btnLoader = document.getElementById('contact-btn-loader');

    setButtonLoading(submitBtn, btnText, btnLoader, true);

    const payload = {
      timestamp: new Date().toISOString(),
      name: getVal('contact-name'),
      phone: getVal('contact-phone'),
      email: getVal('contact-email'),
      city: '',
      source: 'Contact Form',
      floorPlan: '',
      message: getVal('contact-message'),
    };

    try {
      await submitToGoogleSheets(payload);
    } catch (err) {
      console.error('Contact form error:', err);
      // Show success anyway for UX
    } finally {
      setButtonLoading(submitBtn, btnText, btnLoader, false);
      showContactSuccess();
    }
  });
}

function showContactSuccess() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');

  if (form) form.style.display = 'none';
  if (success) success.style.display = 'flex';
  success.style.flexDirection = 'column';
  success.style.alignItems = 'center';

  // Reset after 5 seconds
  setTimeout(() => {
    if (form) {
      form.reset();
      form.style.display = '';
    }
    if (success) success.style.display = 'none';
    clearFormErrors('contactForm');
  }, 5000);
}


/* ==========================================
   SUBMIT LEAD TO GOOGLE SHEETS
========================================== */

async function submitToGoogleSheets(payload) {
  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Avoids CORS preflight issues with Google Apps Script
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    console.log("✅ Lead submitted to Google Sheets");

    return {
      status: "success"
    };

  } catch (error) {
    console.error("❌ Failed to submit lead:", error);

    return {
      status: "error",
      message: error.message
    };
  }
}

/* ═══════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════ */
function validateLeadForm() {
  clearFormErrors('leadForm');
  let valid = true;

  const name = getVal('lead-name');
  const phone = getVal('lead-phone');
  const email = getVal('lead-email');
  const city = getVal('lead-city');

  if (!name || name.trim().length < 2) {
    setError('lead-name', 'lead-name-error', 'Please enter your full name');
    valid = false;
  }

  if (!isValidPhone(phone)) {
    setError('lead-phone', 'lead-phone-error', 'Enter a valid 10-digit mobile number');
    valid = false;
  }

  if (!isValidEmail(email)) {
    setError('lead-email', 'lead-email-error', 'Enter a valid email address');
    valid = false;
  }

  if (!city || city.trim().length < 2) {
    setError('lead-city', 'lead-city-error', 'Please enter your city');
    valid = false;
  }

  return valid;
}

function validateContactForm() {
  clearFormErrors('contactForm');
  let valid = true;

  const name = getVal('contact-name');
  const phone = getVal('contact-phone');
  const email = getVal('contact-email');

  if (!name || name.trim().length < 2) {
    setError('contact-name', 'contact-name-error', 'Please enter your full name');
    valid = false;
  }

  if (!isValidPhone(phone)) {
    setError('contact-phone', 'contact-phone-error', 'Enter a valid 10-digit mobile number');
    valid = false;
  }

  if (!isValidEmail(email)) {
    setError('contact-email', 'contact-email-error', 'Enter a valid email address');
    valid = false;
  }

  return valid;
}

/* ─── Validation Helpers ─── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test((phone || '').replace(/\s/g, ''));
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.textContent = message;
}

function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error'));
}

/* ─── Button State ─── */
function setButtonLoading(btn, textEl, loaderEl, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;

  if (textEl) textEl.style.display = isLoading ? 'none' : '';
  if (loaderEl) loaderEl.style.display = isLoading ? 'flex' : 'none';
}

/* ─── Utility ─── */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─── Real-time phone validation ─── */
document.addEventListener('DOMContentLoaded', () => {
  ['lead-phone', 'contact-phone'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 10);
    });
  });
});
