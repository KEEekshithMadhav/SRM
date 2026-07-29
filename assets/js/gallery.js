/**
 * SMR EVEREST — Custom Lightbox Gallery
 * Masonry layout, keyboard, swipe, lazy loading
 */

'use strict';

/* ─── Gallery Data ─── */
const galleryData = [
  { src: 'images/imgi_6_1.jpg',  caption: 'Exterior View' },
  { src: 'images/imgi_30_3.webp', caption: 'Aerial View & Township' },
  { src: 'images/imgi_8_4.webp',  caption: 'Luxury Living Spaces' },
  { src: 'images/imgi_29_1.webp', caption: 'Premium Interiors' },
  { src: 'images/imgi_9_5.webp',  caption: 'Landscaped Surroundings' },
  { src: 'images/imgi_3_Entry-plaza.webp', caption: 'Grand Entry Plaza' },
  { src: 'images/imgi_10_6.webp', caption: 'Clubhouse Facilities' },
  { src: 'images/imgi_11_1.webp', caption: 'Sports Courts' },
  { src: 'images/imgi_33_6.webp', caption: '75% Open Green Spaces' },
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

        // Already loaded by browser native lazy loading — just add class
        img.classList.add('img-loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px 0px',
  });

  lazyImages.forEach(img => {
    // Add loading placeholder style
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
      transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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

  // Immediate load for visible images
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'));
    }
  });
})();
