/* ================================================
   NEONLATINO — Main App
   Real data from TMDB and Vimeus APIs
   ================================================ */

const NeonApp = (() => {
  // TMDB image base
  const IMG = 'https://image.tmdb.org/t/p';

  /* --- Card HTML Generator --- */
  function createCard(item, typeOverride = null) {
    const posterPath = item.poster || item.poster_path; // Support Vimeus or TMDB format
    const posterURL = posterPath ? `${IMG}/w500${posterPath}` : '';
    const title = item.title || item.name || 'Sin título';
    const type = typeOverride || item.content_type || item.media_type || 'movie';
    const hue = type === 'movie' ? 190 : type === 'series' ? 300 : type === 'anime' ? 40 : 190;
    
    // Extracción de datos para TMDB o Vimeus
    const rating = item.vote_average ? item.vote_average.toFixed(1) : (item.rating || 'N/A');
    const date = item.release_date || item.first_air_date || '';
    const year = date ? date.split('-')[0] : (item.year || '');
    const genre = item.genre || ''; // Vimeus doesn't provide genre in list natively
    
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

  /* --- Render rows --- */
  function renderRow(containerId, items, type = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No hay contenido disponible.</p>';
      return;
    }

    container.innerHTML = items.map(item => createCard(item, type)).join('');

    // Add click handlers
    container.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const cType = card.dataset.type;
        console.log(`[NeonLatino] Play: ${cType} #${id}`);
        alert(`🎬 Reproducir: ${card.querySelector('.card__title').textContent}\n\n(Player disponible en Fase 3)`);
      });
    });
  }

  /* --- Update Hero --- */
  function updateHero(featured) {
    if (!featured) return;
    
    const heroTitle = document.getElementById('hero-title');
    const heroSynopsis = document.getElementById('hero-synopsis');
    const heroBadge = document.getElementById('hero-badge');
    const heroBackdrop = document.getElementById('hero-backdrop');
    
    const title = featured.title || featured.name;
    const overview = featured.overview || '';
    const backdropPath = featured.backdrop_path || featured.backdrop;

    if (heroTitle) heroTitle.textContent = title.toUpperCase();
    if (heroBadge) heroBadge.textContent = `🔥 TENDENCIA #1`;
    if (heroSynopsis) heroSynopsis.textContent = overview.length > 200 ? overview.substring(0, 197) + '...' : overview;
    
    if (heroBackdrop && backdropPath) {
      heroBackdrop.style.backgroundImage = `url('${IMG}/original${backdropPath}')`;
    }
  }

  /* --- Search handler --- */
  function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const query = input.value.trim();
        if (!query) {
          // Restaurar trends si se limpia la búsqueda
          const trends = await NeonAPI.getTMDBTrending();
          if (trends && trends.results) {
             renderRow('trending-row', trends.results.slice(0, 10));
          }
          return;
        }
        
        // Mostrar skeleton loading
        const container = document.getElementById('trending-row');
        if (container) container.innerHTML = '<div style="padding: 2rem; color: var(--neon-cyan);">Buscando...</div>';

        const searchResults = await NeonAPI.searchTMDB(query);
        if (searchResults && searchResults.results) {
           renderRow('trending-row', searchResults.results.filter(r => r.media_type !== 'person'));
        } else {
           renderRow('trending-row', []);
        }
      }, 500);
    });
  }

  /* --- Fetch and Render Data --- */
  async function loadData() {
    try {
      // 1. Trending (TMDB)
      const trends = await NeonAPI.getTMDBTrending();
      if (trends && trends.results && trends.results.length > 0) {
        updateHero(trends.results[0]);
        // Quitar el primer elemento (hero) y mostrar el resto
        renderRow('trending-row', trends.results.slice(1, 15));
      }

      // 2. Movies (Vimeus)
      const moviesData = await NeonAPI.getListingMovies();
      if (moviesData && moviesData.data && moviesData.data.movies) {
        renderRow('movies-row', moviesData.data.movies, 'movie');
      }

      // 3. Series (Vimeus)
      const seriesData = await NeonAPI.getListingSeries();
      if (seriesData && seriesData.data && seriesData.data.series) {
        renderRow('series-row', seriesData.data.series, 'series');
      }

      // 4. Animes (Vimeus)
      const animesData = await NeonAPI.getListingAnimes();
      if (animesData && animesData.data && animesData.data.animes) {
        renderRow('anime-row', animesData.data.animes, 'anime');
      }

    } catch (err) {
      console.error('[NeonLatino] Error loading data:', err);
    }
  }

  /* --- Initialize App --- */
  function init() {
    loadData();
    initSearch();

    console.log('%c⚡ NEONLATINO', 'color: #00f0ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00f0ff;');
    console.log('%cBlade Runner Edition — Phase 2', 'color: #ff2d7b; font-size: 12px;');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', NeonApp.init);
