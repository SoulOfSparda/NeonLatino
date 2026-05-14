/* ================================================
   NEONLATINO — Global Search
   Desktop input + mobile overlay
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const mobileInput = document.getElementById('search-input-mobile');
  const toggleBtn = document.getElementById('search-toggle-btn');
  const overlay = document.getElementById('search-overlay');
  const closeBtn = document.getElementById('search-overlay-close');

  // Restore query if on search results page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('q')) {
    const q = urlParams.get('q');
    if (input) input.value = q;
    if (mobileInput) mobileInput.value = q;
  }

  function executeSearch(query) {
    const q = query.trim();
    if (q) window.location.href = `catalogo.html?q=${encodeURIComponent(q)}`;
  }

  // Desktop search
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(input.value);
    });
    const searchIcon = document.querySelector('.navbar__search-icon');
    if (searchIcon) {
      searchIcon.style.cursor = 'pointer';
      searchIcon.addEventListener('click', () => executeSearch(input.value));
    }
  }

  // Mobile overlay toggle
  if (toggleBtn && overlay) {
    toggleBtn.addEventListener('click', () => {
      overlay.classList.add('search-overlay--open');
      setTimeout(() => mobileInput && mobileInput.focus(), 100);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('search-overlay--open');
      });
    }

    if (mobileInput) {
      mobileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch(mobileInput.value);
      });
    }
  }
});
