/**
 * SMR EVEREST — Animated Counters
 * Triggers when counter section enters viewport
 * Easing: easeOutQuart for premium feel
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
});

function initCounters() {
  const counters = document.querySelectorAll('.counter-number[data-target]');
  if (!counters.length) return;

  let countersTriggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersTriggered) {
        countersTriggered = true;
        animateAllCounters(counters);
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.3,
  });

  // Observe the counters grid
  const countersGrid = document.querySelector('.counters-grid');
  if (countersGrid) {
    observer.observe(countersGrid);
  } else {
    // Observe individual counters
    counters.forEach(counter => observer.observe(counter));
  }
}

/**
 * Animate all counters simultaneously
 * @param {NodeListOf<Element>} counters
 */
function animateAllCounters(counters) {
  counters.forEach((counter, i) => {
    const target   = parseInt(counter.dataset.target, 10);
    const duration = 2000;           // ms
    const delay    = i * 120;        // stagger each counter by 120ms

    setTimeout(() => {
      animateCounter(counter, target, duration);
    }, delay);
  });
}

/**
 * Animate a single counter from 0 to target
 * @param {Element} el      - The counter element
 * @param {number}  target  - Target value
 * @param {number}  duration - Animation duration in ms
 */
function animateCounter(el, target, duration) {
  const startTime = performance.now();
  const startVal  = 0;

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutQuart(progress);
    const current  = Math.floor(startVal + (target - startVal) * eased);

    el.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = formatNumber(target);
    }
  }

  requestAnimationFrame(update);
}

/**
 * easeOutQuart — decelerates smoothly at end
 * @param {number} t - Progress [0, 1]
 * @returns {number}
 */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Format large numbers with commas (optional)
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num.toString();
}
