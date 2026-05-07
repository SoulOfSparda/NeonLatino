/* ================================================
   NEONLATINO — Animations
   Digital rain, scanlines, scroll reveals
   ================================================ */

const NeonFX = (() => {
  /* --- Digital Rain (Canvas) --- */
  function initRain() {
    const canvas = document.getElementById('rain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);

    function draw() {
      ctx.fillStyle = 'rgba(6, 6, 12, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Gradient color: cyan at head, dimmer behind
        const alpha = Math.random() * 0.4 + 0.1;
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  let observer = null;
  /* --- Scroll Reveal (IntersectionObserver) --- */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.reveal--observed)');
    if (!reveals.length) return;

    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            // Also reveal children for stagger
            entry.target.querySelectorAll('.card, .reveal-child').forEach(child => {
              child.classList.add('reveal--visible');
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    }

    reveals.forEach(el => {
      el.classList.add('reveal--observed');
      observer.observe(el);
    });
  }

  /* --- Navbar scroll effect --- */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* --- Mobile menu toggle --- */
  function initMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('nav-links');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('navbar__nav--open');
    });
  }

  /* --- Sliders --- */
  function initSliders() {
    const wrappers = document.querySelectorAll('.slider-wrapper');
    wrappers.forEach(wrapper => {
      const btnLeft = wrapper.querySelector('.slider-btn--left');
      const btnRight = wrapper.querySelector('.slider-btn--right');
      const row = wrapper.querySelector('.scroll-row');

      if (!btnLeft || !btnRight || !row) return;

      const scrollAmount = window.innerWidth > 768 ? window.innerWidth * 0.6 : window.innerWidth * 0.8;

      btnLeft.addEventListener('click', () => {
        row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      btnRight.addEventListener('click', () => {
        row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    });
  }

  /* --- Initialize all effects --- */
  function init() {
    initRain();
    initScrollReveal();
    initNavbarScroll();
    initMobileMenu();
    initSliders();
  }

  return { init, initScrollReveal };
})();

document.addEventListener('DOMContentLoaded', NeonFX.init);
