/* ================================================
   NEONLATINO — Catalog Logic
   Handles listing pages with pagination
   ================================================ */

const CatalogApp = (() => {
  const IMG = 'https://image.tmdb.org/t/p';
  const urlParams = new URLSearchParams(window.location.search);
  const currentType = urlParams.get('type') || 'movies';
  const searchQuery = urlParams.get('q');
  let currentPage = parseInt(urlParams.get('page')) || 1;
  let totalPages = 1;

  const typeNames = {
    'movies': 'Películas',
    'series': 'Series',
    'anime': 'Anime'
  };

  const cTypeMap = {
    'movies': 'movie',
    'series': 'series',
    'anime': 'anime'
  };

  function updateActiveNav() {
    document.querySelectorAll('.navbar__link').forEach(link => link.classList.remove('navbar__link--active'));
    if (!searchQuery) {
      const activeLink = document.getElementById(`nav-${currentType}`);
      if (activeLink) activeLink.classList.add('navbar__link--active');
    }
  }

  function createCard(item, typeOverride = null) {
    const posterPath = item.poster || item.poster_path;
    const posterURL = posterPath ? `${IMG}/w500${posterPath}` : '';
    const title = item.title || item.name || 'Sin título';
    const type = typeOverride || item.content_type || item.media_type || 'movie';
    const hue = type === 'movie' ? 190 : type === 'series' ? 300 : type === 'anime' ? 40 : 190;
    
    const rating = item.vote_average ? item.vote_average.toFixed(1) : (item.rating || 'N/A');
    const date = item.release_date || item.first_air_date || '';
    const year = date ? date.split('-')[0] : (item.year || '');
    const genre = item.genre || '';
    
    const metaText = [year, genre].filter(Boolean).join(' · ');

    return `
      <div class="card reveal" data-id="${item.tmdb_id || item.id}" data-type="${type}">
        <div class="card__poster">
          ${posterPath ? `<img src="${posterURL}" alt="${title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
          <div class="card__poster-gradient" style="${posterPath ? 'display:none;' : 'display:flex;'} background: linear-gradient(135deg, hsla(${hue}, 80%, 20%, 0.8), var(--bg-void));">
            ${title}
          </div>
          ${rating !== 'N/A' ? `<span class="card__rating">★ ${rating}</span>` : ''}
        </div>
        <div class="card__accent"></div>
        <div class="card__info">
          <h3 class="card__title">${title}</h3>
          <span class="card__year">${metaText}</span>
        </div>
      </div>`;
  }

  async function hydrateWithTMDB(items, type) {
    const tmdbType = (type === 'series' || type === 'anime') ? 'tv' : 'movie';
    const promises = items.map(async (item) => {
      const details = await NeonAPI.getTMDBDetails(tmdbType, item.tmdb_id);
      if (!details || details.error) return item;
      return { ...item, ...details };
    });
    return Promise.all(promises);
  }

  async function loadCatalog() {
    const titleEl = document.getElementById('catalog-title');
    const gridEl = document.getElementById('catalog-grid');
    const pageInfo = document.getElementById('page-info');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (titleEl) {
      if (searchQuery) {
        titleEl.textContent = `RESULTADOS PARA: "${searchQuery}"`;
        titleEl.style.color = 'var(--neon-cyan)';
      } else {
        titleEl.textContent = typeNames[currentType] || 'Catálogo';
        titleEl.style.color = currentType === 'series' ? 'var(--neon-purple)' : currentType === 'anime' ? 'var(--neon-amber)' : 'var(--neon-cyan)';
      }
    }

    gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--neon-cyan); padding: 4rem;">Cargando interfaz neural...</div>';

    try {
      if (searchQuery) {
        // --- LÓGICA DE BÚSQUEDA ---
        const dataResponse = await NeonAPI.searchTMDB(searchQuery, currentPage);
        if (dataResponse && dataResponse.results && dataResponse.results.length > 0) {
          totalPages = dataResponse.total_pages || 1;
          const items = dataResponse.results;
          
          gridEl.innerHTML = items.map(item => {
            const typeMap = { movie: 'movie', tv: 'series' };
            const type = typeMap[item.media_type] || 'movie';
            return createCard(item, type);
          }).join('');

          gridEl.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
              const id = card.dataset.id;
              const cType = card.dataset.type;
              window.location.href = `watch.html?type=${cType}&id=${id}`;
            });
          });

          if (typeof NeonFX !== 'undefined') NeonFX.initScrollReveal();

        } else {
          gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">No hay resultados disponibles en los servidores de Vimeus.</div>';
          totalPages = 1;
        }
      } else {
        // --- LÓGICA DE CATÁLOGO NORMAL ---
        let dataResponse;
        if (currentType === 'series') {
          dataResponse = await NeonAPI.getListingSeries(currentPage);
        } else if (currentType === 'anime') {
          dataResponse = await NeonAPI.getListingAnimes(currentPage);
        } else {
          dataResponse = await NeonAPI.getListingMovies(currentPage);
        }

        if (dataResponse && dataResponse.data && dataResponse.data.result) {
          totalPages = dataResponse.data.pages || 1;
          const items = dataResponse.data.result;
          
          const hydratedItems = await hydrateWithTMDB(items, currentType);
          
          gridEl.innerHTML = hydratedItems.map(item => createCard(item, cTypeMap[currentType])).join('');

          gridEl.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
              const id = card.dataset.id;
              const cType = card.dataset.type;
              window.location.href = `watch.html?type=${cType}&id=${id}`;
            });
          });

          if (typeof NeonFX !== 'undefined') NeonFX.initScrollReveal();

        } else {
          gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">No hay resultados.</div>';
          totalPages = 1;
        }
      }

      // Update Pagination UI
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
      btnPrev.disabled = currentPage <= 1;
      btnNext.disabled = currentPage >= totalPages;

      // Handle Pagination Clicks
      btnPrev.onclick = () => {
        if (currentPage > 1) {
          const params = searchQuery ? `q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}` : `type=${currentType}&page=${currentPage - 1}`;
          window.location.href = `catalog.html?${params}`;
        }
      };

      btnNext.onclick = () => {
        if (currentPage < totalPages) {
          const params = searchQuery ? `q=${encodeURIComponent(searchQuery)}&page=${currentPage + 1}` : `type=${currentType}&page=${currentPage + 1}`;
          window.location.href = `catalog.html?${params}`;
        }
      };

    } catch (err) {
      console.error('[NeonLatino] Catalog Error:', err);
      gridEl.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--neon-magenta); padding: 4rem;">Error del sistema: ${err.message}</div>`;
    }
  }

  return { 
    init: () => {
      updateActiveNav();
      loadCatalog();
    }
  };
})();

document.addEventListener('DOMContentLoaded', CatalogApp.init);
