/**
 * SMR EVEREST — Custom Lightbox Gallery
 * Accurate image mapping to real photo content
 */

'use strict';

/* ─── Gallery Data — Exact content mapping ─── */
const galleryData = [
  { src: 'images/imgi_3_Entry-plaza.webp', caption: 'Grand Entrance Plaza' },
  { src: 'images/imgi_11_1.webp',          caption: 'Luxury Living Room' },
  { src: 'images/imgi_12_2.webp',          caption: 'Dining Hall & Living Suite' },
  { src: 'images/imgi_13_3.webp',          caption: 'Modular Kitchen' },
  { src: 'images/imgi_8_4.webp',           caption: 'Master Bedroom Suite' },
  { src: 'images/imgi_9_5.webp',           caption: 'Guest Bedroom' },
  { src: 'images/imgi_10_6.webp',          caption: 'Open Air Amphitheatre' },
  { src: 'images/imgi_33_6.webp',          caption: 'Cricket Arena & Sports Ground' },
  { src: 'images/imgi_34_7.webp',          caption: 'Central Park & Podium Gardens' },
  { src: 'images/imgi_29_1.webp',          caption: 'Aerial View & Master Township' },
];

let currentLightboxIndex = 0;
let lightboxOpen = false;

/* ─── Touch Swipe ─── */
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initLazyImages();
});

/* ═══════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Touch swipe support
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        lightboxNext();
      } else {
        lightboxPrev();
      }
    }
  }, { passive: true });
}

/**
 * Open lightbox at given index
 * @param {number} index - Gallery item index
 */
function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  currentLightboxIndex = index;
  lightboxOpen = true;

  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  loadLightboxImage(index);

  // Animate in
  requestAnimationFrame(() => {
    lightbox.style.opacity = '1';
  });

  // Trap focus
  lightbox.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightboxOpen = false;
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
  lightbox.setAttribute('aria-hidden', 'true');
}

function lightboxPrev() {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
  loadLightboxImage(currentLightboxIndex);
}

function lightboxNext() {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length;
  loadLightboxImage(currentLightboxIndex);
}

/**
 * Load image into lightbox with fade
 * @param {number} index
 */
function loadLightboxImage(index) {
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const counter = document.getElementById('lightboxCounter');

  if (!img) return;

  const item = galleryData[index];
  if (!item) return;

  // Fade out
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.25s ease';

  const newImg = new Image();
  newImg.onload = () => {
    img.src = newImg.src;
    img.alt = item.caption;

    // Fade in
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
  };
  newImg.onerror = () => {
    img.src = item.src;
    img.style.opacity = '1';
  };
  newImg.src = item.src;

  if (caption) caption.textContent = item.caption;
  if (counter) counter.textContent = `${index + 1} / ${galleryData.length}`;
}

/* ═══════════════════════════════════════════
   LAZY LOADING (Intersection Observer)
═══════════════════════════════════════════ */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        img.classList.add('img-loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px 0px',
  });

  lazyImages.forEach(img => {
    img.addEventListener('load', () => img.classList.add('img-loaded'));
    imageObserver.observe(img);
  });
}

/* ─── CSS for loaded images ─── */
(function injectImageStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .gallery-item img {
      opacity: 0;
      transition: opacity 0.5s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .gallery-item img.img-loaded,
    .gallery-item img[loading="lazy"]:not([src=""]) {
      opacity: 1;
    }
    .about-img, .fp-img, .masterplan-img {
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    .about-img.img-loaded,
    .fp-img.img-loaded,
    .masterplan-img.img-loaded {
      opacity: 1;
    }
    .fp-img.locked {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'));
    }
  });
})();
