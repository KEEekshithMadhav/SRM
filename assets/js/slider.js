/**
 * SMR EVEREST — Hero Slider (Swiper.js)
 * Auto-play, parallax, keyboard, touch support
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
});

function initHeroSlider() {
  // Wait for Swiper to be available
  function tryInit() {
    if (typeof Swiper === 'undefined') {
      setTimeout(tryInit, 100);
      return;
    }

    const heroSwiper = new Swiper('.hero-swiper', {
      // Core
      loop: true,
      speed: 1000,
      grabCursor: false,
      allowTouchMove: true,

      // Auto-play
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      // Effect
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },

      // Parallax
      parallax: true,

      // Navigation
      navigation: {
        nextEl: '.hero-next',
        prevEl: '.hero-prev',
      },

      // Pagination
      pagination: {
        el: '.hero-pagination',
        clickable: true,
        dynamicBullets: false,
      },

      // Keyboard
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      // A11y
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        paginationBulletMessage: 'Go to slide {{index}}',
      },

      // Events
      on: {
        slideChange: function () {
          // Reset hero content animations on slide change
          const activeSlide = this.slides[this.activeIndex];
          if (!activeSlide) return;

          const content = activeSlide.querySelector('.hero-content');
          if (!content) return;

          // Re-trigger fade animations
          content.querySelectorAll('.hero-label, .hero-title, .hero-tagline, .hero-actions').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'none';

            requestAnimationFrame(() => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                el.style.transitionDelay = `${i * 0.15}s`;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, 50);
            });
          });
        },

        init: function () {
          // Remove initial animation from first slide (already animated via CSS)
          // Pause autoplay if user prefers reduced motion
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.autoplay.stop();
          }
        },
      },
    });

    // Expose globally for debugging
    window.heroSwiper = heroSwiper;
  }

  tryInit();
}
