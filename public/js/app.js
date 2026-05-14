/* ================================================
   NEONLATINO — Main App
   Real data from TMDB and Vimeus APIs
   ================================================ */

const NeonApp = (() => {
  // TMDB image base
  const IMG = 'https://image.tmdb.org/t/p';

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

  /* --- Card HTML Generator --- */
  function createCard(item, typeOverride = null) {
    const posterPath = item.poster || item.poster_path; // Support Vimeus or TMDB format
    const posterURL = posterPath ? `${IMG}/w500${posterPath}` : '';
    const title = item.title || item.name || 'Sin título';
    let type = typeOverride || item.content_type || item.media_type || 'movie';
    if (type === 'tv') {
      const isAnime = item.genre_ids && item.genre_ids.includes(16) && item.origin_country && item.origin_country.includes('JP');
      type = isAnime ? 'anime' : 'series';
    }
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
          ${item.seasonCount > 1 ? `<span class="card__seasons">${item.seasonCount} temps</span>` : ''}
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
        window.location.href = `ver.html?type=${cType}&id=${id}`;
      });
    });

    if (typeof NeonFX !== 'undefined') {
      NeonFX.initScrollReveal();
    }
  }

  /* --- Hero Slider --- */
  let heroTimer = null;
  let currentSlide = 0;

  function initHeroSlider(items) {
    const slider = document.getElementById('hero-slider');
    const dotsContainer = document.getElementById('hero-dots');
    if (!slider || !items || items.length === 0) return;

    slider.innerHTML = '';
    dotsContainer.innerHTML = '';
    currentSlide = 0;

    items.forEach((item, index) => {
      const title = item.title || item.name || 'Sin título';
      const overview = item.overview || '';
      const backdropPath = item.backdrop_path || item.backdrop;
      const date = item.release_date || item.first_air_date || '';
      const year = date ? date.split('-')[0] : 'N/A';
      const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
      
      let type = item.media_type || item.content_type || 'movie';
      if (type === 'tv') {
        const isAnime = item.genre_ids && item.genre_ids.includes(16) && item.origin_country && item.origin_country.includes('JP');
        type = isAnime ? 'anime' : 'series';
      }

      const slide = document.createElement('div');
      slide.className = `hero__slide ${index === 0 ? 'hero__slide--active' : ''}`;
      slide.innerHTML = `
        <div class="hero__backdrop" style="background-image: url('${IMG}/original${backdropPath}')"></div>
        <div class="hero__content">
          <span class="hero__badge">🔥 TENDENCIA #${index + 1}</span>
          <h1 class="hero__title">${title.toUpperCase()}</h1>
          <div class="hero__meta">
            <span class="hero__meta-item">${year}</span>
            <span class="hero__meta-item hero__meta-item--rating">★ ${rating}</span>
            <span class="hero__meta-item">${type === 'anime' ? 'Anime' : type === 'series' ? 'Serie' : 'Película'}</span>
          </div>
          <p class="hero__synopsis">${overview.length > 250 ? overview.substring(0, 247) + '...' : overview}</p>
          <div class="hero__actions">
            <button class="btn btn--primary" onclick="window.location.href='ver.html?type=${type}&id=${item.id}'">▶ REPRODUCIR</button>
            <button class="btn btn--ghost" onclick="window.location.href='ver.html?type=${type}&id=${item.id}'">+ INFO</button>
          </div>
        </div>
      `;
      slider.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = `hero__dot ${index === 0 ? 'hero__dot--active' : ''}`;
      dot.onclick = () => goToSlide(index);
      dotsContainer.appendChild(dot);
    });

    startHeroTimer();

    function goToSlide(index) {
      clearInterval(heroTimer);
      const slides = slider.querySelectorAll('.hero__slide');
      const dots = dotsContainer.querySelectorAll('.hero__dot');
      if (!slides[index]) return;

      slides[currentSlide].classList.remove('hero__slide--active');
      dots[currentSlide].classList.remove('hero__dot--active');

      currentSlide = index;

      slides[currentSlide].classList.add('hero__slide--active');
      dots[currentSlide].classList.add('hero__dot--active');

      startHeroTimer();
    }

    function startHeroTimer() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(() => {
        let next = (currentSlide + 1) % items.length;
        goToSlide(next);
      }, 8000);
    }
  }

  /* --- Fetch and Render Data --- */
  async function loadData() {
    try {
      // 1. Trending (TMDB)
      const trends = await NeonAPI.getTMDBTrending();
      if (trends && trends.results && trends.results.length > 0) {
        initHeroSlider(trends.results.slice(0, 5));
        renderRow('trending-row', trends.results.slice(5, 20));
      }

      // Función auxiliar para obtener posters de TMDB limitando a 12 items
      async function hydrateWithTMDB(items, type) {
        const tmdbType = (type === 'series' || type === 'anime' || type === 'tv') ? 'tv' : 'movie';
        const limited = items.slice(0, 8);
        const promises = limited.map(async (item) => {
          const details = await NeonAPI.getTMDBDetails(tmdbType, item.tmdb_id);
          if (!details || details.error) return item;
          return { ...item, ...details }; // Mezclar datos de Vimeus con TMDB
        });
        return Promise.all(promises);
      }

      // 2. Movies (Vimeus)
      const moviesData = await NeonAPI.getListingMovies();
      if (moviesData && moviesData.data && moviesData.data.result) {
        const hydratedMovies = await hydrateWithTMDB(deduplicateByTmdbId(moviesData.data.result), 'movie');
        renderRow('movies-row', hydratedMovies, 'movie');
      }

      // 3. Series (Vimeus)
      const seriesData = await NeonAPI.getListingSeries();
      if (seriesData && seriesData.data && seriesData.data.result) {
        const hydratedSeries = await hydrateWithTMDB(deduplicateByTmdbId(seriesData.data.result), 'series');
        renderRow('series-row', hydratedSeries, 'series');
      }

      // 4. Animes (Vimeus)
      const animesData = await NeonAPI.getListingAnimes();
      if (animesData && animesData.data && animesData.data.result) {
        const hydratedAnime = await hydrateWithTMDB(deduplicateByTmdbId(animesData.data.result), 'anime');
        renderRow('anime-row', hydratedAnime, 'anime');
      }

    } catch (err) {
      console.error('[NeonLatino] Error loading data:', err);
    }
  }

  /* --- Initialize App --- */
  function init() {
    loadData();

    console.log('%c⚡ NEONLATINO', 'color: #00f0ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00f0ff;');
    console.log('%cBlade Runner Edition — Phase 2', 'color: #ff2d7b; font-size: 12px;');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', NeonApp.init);
