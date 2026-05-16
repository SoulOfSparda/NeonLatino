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

  // Filter state from URL
  const filterGenre = urlParams.get('genre') || '';
  const filterSort = urlParams.get('sort') || 'popularity.desc';
  const filterYear = urlParams.get('year') || '';
  const useDiscover = !!(filterGenre || filterYear || urlParams.has('sort'));

  const GENRES_MOVIE = {28:'Acción',12:'Aventura',16:'Animación',35:'Comedia',80:'Crimen',99:'Documental',18:'Drama',10751:'Familia',14:'Fantasía',36:'Historia',27:'Terror',10402:'Música',9648:'Misterio',10749:'Romance',878:'Ciencia ficción',10770:'Película de TV',53:'Suspenso',10752:'Bélica',37:'Western'};
  const GENRES_TV = {10759:'Acción y Aventura',16:'Animación',35:'Comedia',80:'Crimen',99:'Documental',18:'Drama',10751:'Familia',10762:'Kids',9648:'Misterio',10763:'Noticias',10764:'Reality',10765:'Sci-Fi & Fantasía',10766:'Telenovela',10767:'Talk',10768:'Guerra y Política',37:'Western'};

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

  function deduplicateByTmdbId(items) {
    const map = new Map();
    items.forEach(item => {
      const key = item.tmdb_id || item.id;
      if (map.has(key)) {
        map.get(key).seasonCount++;
      } else {
        map.set(key, { ...item, seasonCount: 1 });
      }
    });
    return Array.from(map.values());
  }

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
          ${item.seasonCount > 1 ? `<span class="card__seasons">${item.seasonCount} temps</span>` : ''}
        </div>
        <div class="card__accent"></div>
        <div class="card__info">
          <h3 class="card__title">${title}</h3>
          <span class="card__year">${metaText}</span>
        </div>
      </div>`;
  }

  function lazyHydrateCards(gridEl, items, type) {
    const tmdbType = (type === 'series' || type === 'anime') ? 'tv' : 'movie';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const card = entry.target;
        const id = card.dataset.id;
        const item = items.find(i => String(i.tmdb_id || i.id) === id);
        if (!item || card.dataset.hydrated) return;
        card.dataset.hydrated = '1';
        NeonAPI.getTMDBDetails(tmdbType, id).then(details => {
          if (!details || details.error) return;
          const poster = details.poster_path;
          if (poster) {
            const img = card.querySelector('.card__poster img');
            const grad = card.querySelector('.card__poster-gradient');
            if (img) { img.src = `https://image.tmdb.org/t/p/w500${poster}`; img.style.display = ''; }
            else {
              const newImg = document.createElement('img');
              newImg.src = `https://image.tmdb.org/t/p/w500${poster}`;
              newImg.alt = details.name || details.title || '';
              newImg.loading = 'lazy';
              card.querySelector('.card__poster').prepend(newImg);
            }
            if (grad) grad.style.display = 'none';
          }
          if (details.vote_average) {
            let badge = card.querySelector('.card__rating');
            if (!badge) {
              badge = document.createElement('span');
              badge.className = 'card__rating';
              card.querySelector('.card__poster').appendChild(badge);
            }
            badge.textContent = `★ ${details.vote_average.toFixed(1)}`;
          }
        });
      });
    }, { rootMargin: '200px' });
    gridEl.querySelectorAll('.card').forEach(card => observer.observe(card));
  }

  async function loadCatalog() {
    const titleEl = document.getElementById('catalog-title');
    const gridEl = document.getElementById('catalog-grid');
    const pageInfo = document.getElementById('page-info');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const filtersEl = document.getElementById('catalog-filters');

    // Init filters UI (only for non-search pages)
    if (!searchQuery && filtersEl) {
      filtersEl.style.display = '';
      const genreSelect = document.getElementById('filter-genre');
      const sortSelect = document.getElementById('filter-sort');
      const yearInput = document.getElementById('filter-year');
      const genres = (currentType === 'movies') ? GENRES_MOVIE : GENRES_TV;
      genreSelect.innerHTML = '<option value="">Todos los géneros</option>' + Object.entries(genres).map(([id, name]) => `<option value="${id}"${id === filterGenre ? ' selected' : ''}>${name}</option>`).join('');
      sortSelect.value = filterSort;
      yearInput.value = filterYear;

      document.getElementById('filter-apply').addEventListener('click', () => {
        const p = new URLSearchParams({ type: currentType });
        if (genreSelect.value) p.set('genre', genreSelect.value);
        if (sortSelect.value !== 'popularity.desc') p.set('sort', sortSelect.value);
        if (yearInput.value) p.set('year', yearInput.value);
        window.location.href = `catalogo.html?${p}`;
      });
    }

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
            let type = 'movie';
            if (item.media_type === 'tv') {
              const isAnime = item.genre_ids && item.genre_ids.includes(16) && item.origin_country && item.origin_country.includes('JP');
              type = isAnime ? 'anime' : 'series';
            }
            return createCard(item, type);
          }).join('');

          gridEl.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
              const id = card.dataset.id;
              const cType = card.dataset.type;
              window.location.href = `detalle.html?type=${cType}&id=${id}`;
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

        if (useDiscover) {
          // Use TMDB discover with filters
          const tmdbType = (currentType === 'series' || currentType === 'anime') ? 'tv' : 'movie';
          const params = { type: tmdbType, page: currentPage, sort: filterSort };
          if (filterGenre) params.genre = filterGenre;
          if (filterYear) params.year = filterYear;
          if (currentType === 'anime') params.type = 'anime';
          dataResponse = await NeonAPI.discoverTMDB(params);

          if (dataResponse?.results?.length) {
            totalPages = Math.min(dataResponse.total_pages || 1, 500);
            const items = dataResponse.results;
            const cardType = currentType === 'movies' ? 'movie' : currentType;
            gridEl.innerHTML = items.map(item => createCard(item, cardType)).join('');
            gridEl.querySelectorAll('.card').forEach(card => {
              card.addEventListener('click', () => {
                window.location.href = `detalle.html?type=${card.dataset.type}&id=${card.dataset.id}`;
              });
            });
            if (typeof NeonFX !== 'undefined') NeonFX.initScrollReveal();
          } else {
            gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">No hay resultados para estos filtros.</div>';
            totalPages = 1;
          }
        } else {
        if (currentType === 'series') {
          dataResponse = await NeonAPI.getListingSeries(currentPage);
        } else if (currentType === 'anime') {
          dataResponse = await NeonAPI.getListingAnimes(currentPage);
        } else {
          dataResponse = await NeonAPI.getListingMovies(currentPage);
        }

        if (dataResponse && dataResponse.data && dataResponse.data.result) {
          totalPages = dataResponse.data.pages || 1;
          const items = deduplicateByTmdbId(dataResponse.data.result);
          
          gridEl.innerHTML = items.map(item => createCard(item, cTypeMap[currentType])).join('');

          gridEl.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
              const id = card.dataset.id;
              const cType = card.dataset.type;
              window.location.href = `detalle.html?type=${cType}&id=${id}`;
            });
          });

          lazyHydrateCards(gridEl, items, currentType);
          if (typeof NeonFX !== 'undefined') NeonFX.initScrollReveal();

        } else {
          gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">No hay resultados.</div>';
          totalPages = 1;
        }
        } // close useDiscover else
      }

      // Update Pagination UI
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
      btnPrev.disabled = currentPage <= 1;
      btnNext.disabled = currentPage >= totalPages;

      // Handle Pagination Clicks
      const buildPageUrl = (pg) => {
        const p = new URLSearchParams({ type: currentType, page: pg });
        if (searchQuery) { p.delete('type'); p.set('q', searchQuery); }
        if (filterGenre) p.set('genre', filterGenre);
        if (filterSort !== 'popularity.desc') p.set('sort', filterSort);
        if (filterYear) p.set('year', filterYear);
        return `catalogo.html?${p}`;
      };

      btnPrev.onclick = () => { if (currentPage > 1) window.location.href = buildPageUrl(currentPage - 1); };
      btnNext.onclick = () => { if (currentPage < totalPages) window.location.href = buildPageUrl(currentPage + 1); };

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
