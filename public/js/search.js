/* ================================================
   NEONLATINO — Global Search with Autocomplete
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const mobileInput = document.getElementById('search-input-mobile');
  const toggleBtn = document.getElementById('search-toggle-btn');
  const overlay = document.getElementById('search-overlay');
  const closeBtn = document.getElementById('search-overlay-close');
  const IMG = 'https://image.tmdb.org/t/p';

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('q')) {
    const q = urlParams.get('q');
    if (input) input.value = q;
    if (mobileInput) mobileInput.value = q;
  }

  function createDropdown(parent) {
    const dd = document.createElement('div');
    dd.className = 'search-dropdown';
    parent.style.position = 'relative';
    parent.appendChild(dd);
    return dd;
  }

  function renderResults(dropdown, results) {
    if (!results || !results.length) {
      dropdown.innerHTML = '<div class="search-dropdown__empty">Sin resultados</div>';
      dropdown.classList.add('search-dropdown--open');
      return;
    }
    dropdown.innerHTML = results.slice(0, 6).map(item => {
      const title = item.title || item.name || '';
      const poster = item.poster_path ? `${IMG}/w92${item.poster_path}` : '';
      const year = (item.release_date || item.first_air_date || '').split('-')[0];
      let type = item.media_type === 'tv' ? 'series' : 'movie';
      if (item.media_type === 'tv' && item.genre_ids?.includes(16) && item.origin_country?.includes('JP')) type = 'anime';
      const label = type === 'movie' ? 'Película' : type === 'anime' ? 'Anime' : 'Serie';
      return `<a href="detalle.html?type=${type}&id=${item.id}" class="search-dropdown__item">
        <div class="search-dropdown__poster">${poster ? `<img src="${poster}" alt="">` : ''}</div>
        <div class="search-dropdown__info">
          <span class="search-dropdown__title">${title}</span>
          <span class="search-dropdown__meta">${label} · ${year}</span>
        </div>
      </a>`;
    }).join('');
    dropdown.classList.add('search-dropdown--open');
  }

  function setupAutocomplete(inputEl, dropdownParent) {
    if (!inputEl) return;
    const dropdown = createDropdown(dropdownParent);
    let timer = null;

    inputEl.addEventListener('input', () => {
      clearTimeout(timer);
      const q = inputEl.value.trim();
      if (q.length < 2) { dropdown.classList.remove('search-dropdown--open'); return; }
      timer = setTimeout(async () => {
        const data = await NeonAPI.searchTMDB(q);
        if (data?.results) renderResults(dropdown, data.results);
      }, 300);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = inputEl.value.trim();
        if (q) window.location.href = `catalogo.html?q=${encodeURIComponent(q)}`;
      }
    });

    document.addEventListener('click', (e) => {
      if (!dropdownParent.contains(e.target)) dropdown.classList.remove('search-dropdown--open');
    });
  }

  // Desktop
  if (input) setupAutocomplete(input, input.closest('.navbar__search'));

  // Mobile
  if (mobileInput) setupAutocomplete(mobileInput, mobileInput.parentElement);

  // Mobile overlay toggle
  if (toggleBtn && overlay) {
    toggleBtn.addEventListener('click', () => {
      overlay.classList.add('search-overlay--open');
      setTimeout(() => mobileInput?.focus(), 100);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('search-overlay--open'));
  }
});
