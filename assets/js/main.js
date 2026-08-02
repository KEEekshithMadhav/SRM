/**
 * SMR EVEREST — Main JavaScript (Luxury Gold Redesign)
 * Handles: Navbar, Smooth Scroll, Back-to-Top, Master Plan Zoom,
 *           AOS Init, Floating Buttons, General Utilities
 */

'use strict';

/* ─── DOM Ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initBackToTop();
  initMasterPlanZoom();
  initAOS();
  initKeyboardNavigation();
  console.log('%c SMR EVEREST ✦ ', 'background:#0C1B2E;color:#C8CED8;font-size:14px;padding:4px 8px;border-radius:4px;font-weight:bold;');
});

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  // Scroll state
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateNavbar();

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      mobileMenu.classList.add('open');
      mobileMenu.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } else {
      closeMobileMenu();
    }
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu?.classList.contains('open') &&
      !navbar.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  function closeMobileMenu() {
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (mobileMenu && !mobileMenu.classList.contains('open')) {
        mobileMenu.style.display = '';
      }
    }, 350);
  }

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(section => sectionObserver.observe(section));
}

/* ═══════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 84;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════
   AOS INITIALIZATION
═══════════════════════════════════════════ */
function initAOS() {
  // Wait for AOS to load (it's deferred)
  function tryInitAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        delay: 0,
        anchorPlacement: 'top-bottom',
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    } else {
      setTimeout(tryInitAOS, 100);
    }
  }
  tryInitAOS();
}

/* ═══════════════════════════════════════════
   MASTER PLAN ZOOM MODAL
═══════════════════════════════════════════ */
let mpScale = 1;
const MP_MIN_SCALE = 0.5;
const MP_MAX_SCALE = 4;

function initMasterPlanZoom() {
  const modal = document.getElementById('masterplanModal');
  const img   = document.getElementById('mpZoomImg');
  const container = document.getElementById('mpZoomContainer');

  if (!modal || !img) return;

  // Mouse wheel zoom
  container?.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    mpScale = Math.min(Math.max(mpScale + delta, MP_MIN_SCALE), MP_MAX_SCALE);
    img.style.transform = `scale(${mpScale})`;
  }, { passive: false });

  // Touch pinch zoom
  let initDistance = 0;
  let initScale = 1;

  container?.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initDistance = getTouchDistance(e.touches);
      initScale = mpScale;
    }
  }, { passive: true });

  container?.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches);
      const ratio = dist / initDistance;
      mpScale = Math.min(Math.max(initScale * ratio, MP_MIN_SCALE), MP_MAX_SCALE);
      img.style.transform = `scale(${mpScale})`;
    }
  }, { passive: false });

  // Drag to pan
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  container?.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop  = container.scrollTop;
    container.style.cursor = 'grabbing';
  });

  container?.addEventListener('mouseup',   () => { isDragging = false; container.style.cursor = 'grab'; });
  container?.addEventListener('mouseleave', () => { isDragging = false; container.style.cursor = 'grab'; });

  container?.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    container.scrollLeft = scrollLeft - (x - startX);
    container.scrollTop  = scrollTop  - (y - startY);
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeMasterplanZoom();
  });

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      closeMasterplanZoom();
    }
  });
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function openMasterplanZoom() {
  const modal = document.getElementById('masterplanModal');
  if (!modal) return;
  mpScale = 1;
  const img = document.getElementById('mpZoomImg');
  if (img) img.style.transform = 'scale(1)';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.style.opacity = '1');
}

function closeMasterplanZoom() {
  const modal = document.getElementById('masterplanModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function openFullscreen() {
  const img = document.getElementById('masterplanImg');
  if (!img) return;

  if (img.requestFullscreen) {
    img.requestFullscreen();
  } else if (img.webkitRequestFullscreen) {
    img.webkitRequestFullscreen();
  } else {
    // Fallback: open in new tab
    window.open(img.src, '_blank');
  }
}

function mpZoomIn() {
  mpScale = Math.min(mpScale + 0.3, MP_MAX_SCALE);
  const img = document.getElementById('mpZoomImg');
  if (img) img.style.transform = `scale(${mpScale})`;
}

function mpZoomOut() {
  mpScale = Math.max(mpScale - 0.3, MP_MIN_SCALE);
  const img = document.getElementById('mpZoomImg');
  if (img) img.style.transform = `scale(${mpScale})`;
}

function mpZoomReset() {
  mpScale = 1;
  const img = document.getElementById('mpZoomImg');
  if (img) img.style.transform = 'scale(1)';
  const container = document.getElementById('mpZoomContainer');
  if (container) { container.scrollLeft = 0; container.scrollTop = 0; }
}

/* ═══════════════════════════════════════════
   MODAL HELPERS — Enquiry / Booking
═══════════════════════════════════════════ */
function openEnquiryModal(source) {
  // Reset brochure flag
  if (typeof pendingBrochureDownload !== 'undefined') pendingBrochureDownload = false;

  // Set source and open lead modal
  const sourceField = document.getElementById('lead-source');
  const planField   = document.getElementById('lead-floor-plan');
  const title       = document.getElementById('lead-modal-title');
  const subtitle    = document.getElementById('lead-modal-subtitle');
  const submitBtn   = document.getElementById('lead-btn-text');

  if (sourceField) sourceField.value = source || 'Enquiry';
  if (planField)   planField.value   = '';
  if (title)       title.textContent = 'Request a Callback';
  if (subtitle)    subtitle.textContent = 'Our luxury consultant will connect with you shortly';
  if (submitBtn)   submitBtn.textContent = 'Submit Enquiry';

  openLeadModal();
}

function openBookingModal(source) {
  // Reset brochure flag
  if (typeof pendingBrochureDownload !== 'undefined') pendingBrochureDownload = false;

  const sourceField = document.getElementById('lead-source');
  const planField   = document.getElementById('lead-floor-plan');
  const title       = document.getElementById('lead-modal-title');
  const subtitle    = document.getElementById('lead-modal-subtitle');
  const submitBtn   = document.getElementById('lead-btn-text');

  if (sourceField) sourceField.value = source || 'Book Site Visit';
  if (planField)   planField.value   = '';
  if (title)       title.textContent = 'Book a Site Visit';
  if (subtitle)    subtitle.textContent = 'Schedule your exclusive tour of SMR Everest';
  if (submitBtn)   submitBtn.textContent = 'Book My Visit';

  openLeadModal();
}

function downloadBrochure() {
  // Set brochure download intent flag (used in forms.js)
  if (typeof pendingBrochureDownload !== 'undefined') {
    pendingBrochureDownload = true;
  }
  // Clear floor plan context
  if (typeof currentFloorPlanIndex !== 'undefined') {
    currentFloorPlanIndex = null;
    currentFloorPlanName = '';
  }

  const sourceField = document.getElementById('lead-source');
  const title       = document.getElementById('lead-modal-title');
  const subtitle    = document.getElementById('lead-modal-subtitle');
  const submitBtn   = document.getElementById('lead-btn-text');

  if (sourceField) sourceField.value = 'Brochure Download';
  if (title)       title.textContent = 'Download Brochure';
  if (subtitle)    subtitle.textContent = 'Share your details to receive the exclusive brochure';
  if (submitBtn)   submitBtn.textContent = 'Get Brochure';

  openLeadModal();
}

function openLeadModal() {
  const modal = document.getElementById('leadModal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeLeadModal() {
  const modal   = document.getElementById('leadModal');
  const form    = document.getElementById('leadForm');
  const success = document.getElementById('leadSuccess');

  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';

  // Reset form
  setTimeout(() => {
    if (form)    { form.reset(); form.style.display = ''; }
    if (success) success.style.display = 'none';
    clearFormErrors('leadForm');
  }, 300);
}

/* ═══════════════════════════════════════════
   KEYBOARD NAVIGATION
═══════════════════════════════════════════ */
function initKeyboardNavigation() {
  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const leadModal = document.getElementById('leadModal');
      const lightbox  = document.getElementById('lightbox');

      if (leadModal?.style.display !== 'none') {
        closeLeadModal();
      }
      if (lightbox?.style.display !== 'none') {
        if (typeof closeLightbox === 'function') closeLightbox();
      }
    }

    // Arrow keys for lightbox
    const lightbox = document.getElementById('lightbox');
    if (lightbox?.style.display !== 'none') {
      if (e.key === 'ArrowLeft' && typeof lightboxPrev === 'function')  lightboxPrev();
      if (e.key === 'ArrowRight' && typeof lightboxNext === 'function') lightboxNext();
    }
  });
}

/* ═══════════════════════════════════════════
   FORM UTILITIES
═══════════════════════════════════════════ */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

/* ═══════════════════════════════════════════
   ACTIVE NAV LINK STYLE (CSS injection)
═══════════════════════════════════════════ */
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
  .nav-link.active { color: #FFFFFF !important; }
  .nav-link.active::after { width: 50% !important; background: #FFFFFF !important; }
`;
document.head.appendChild(activeNavStyle);
