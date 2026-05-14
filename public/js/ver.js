/* ================================================
   NEONLATINO — Watch Logic
   Episode sidebar, prev/next navigation, type fallback
   ================================================ */

const WatchApp = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  let currentSeason = parseInt(urlParams.get('se')) || 1;
  let currentEpisode = parseInt(urlParams.get('ep')) || 1;
  let currentData = null;
  let validSeasons = [];

  // Track which Vimeus type works for each season
  const seasonTypeCache = new Map();

  const player = document.getElementById('video-player');
  const seasonSelect = document.getElementById('season-select');
  const episodeList = document.getElementById('episode-list');
  const sidebar = document.getElementById('episode-sidebar');
  const nav = document.getElementById('episode-nav');
  const btnPrev = document.getElementById('btn-prev-ep');
  const btnNext = document.getElementById('btn-next-ep');
  const epLabel = document.getElementById('ep-current-label');

  // Vimeus type fallback order based on content type
  function getTypeFallbacks() {
    if (type === 'anime') return ['anime', 'serie'];
    if (type === 'series') return ['serie', 'anime'];
    return ['movie'];
  }

  async function findWorkingType(season, episode) {
    const cacheKey = `${id}_${season}`;
    if (seasonTypeCache.has(cacheKey)) return seasonTypeCache.get(cacheKey);

    const fallbacks = getTypeFallbacks();

    for (const vType of fallbacks) {
      try {
        const res = await fetch(`/api/vimeus/check?type=${vType}&tmdb=${id}&se=${season}&ep=${episode}`);
        const data = await res.json();
        if (data.available) {
          seasonTypeCache.set(cacheKey, vType);
          return vType;
        }
      } catch (e) { /* continue */ }
    }
    // Default to first fallback if none work
    seasonTypeCache.set(cacheKey, fallbacks[0]);
    return fallbacks[0];
  }

  async function updatePlayer() {
    const tmdbType = (type === 'series' || type === 'anime' || type === 'tv') ? 'tv' : 'movie';

    if (tmdbType === 'tv') {
      const workingType = await findWorkingType(currentSeason, currentEpisode);
      const VIEW_KEY = '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';
      const url = `https://vimeus.com/e/${workingType}?tmdb=${id}&view_key=${VIEW_KEY}&se=${currentSeason}&ep=${currentEpisode}`;
      if (player) player.src = url;
    } else {
      const url = NeonAPI.getEmbedURL(type, id);
      if (player) player.src = url;
    }

    // Update URL without reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('se', currentSeason);
    newUrl.searchParams.set('ep', currentEpisode);
    history.replaceState(null, '', newUrl);

    updateUI();
  }

  function getEpisodeCount(seasonNum) {
    const s = validSeasons.find(s => s.season_number == seasonNum);
    return s ? s.episode_count : 0;
  }

  function updateUI() {
    if (epLabel) epLabel.textContent = `T${currentSeason} · Ep ${currentEpisode} de ${getEpisodeCount(currentSeason)}`;

    const isFirstEp = currentEpisode === 1 && validSeasons[0]?.season_number == currentSeason;
    const lastSeason = validSeasons[validSeasons.length - 1];
    const isLastEp = currentEpisode >= getEpisodeCount(currentSeason) && lastSeason?.season_number == currentSeason;
    if (btnPrev) btnPrev.disabled = isFirstEp;
    if (btnNext) btnNext.disabled = isLastEp;

    episodeList.querySelectorAll('.episode-item').forEach(el => {
      el.classList.toggle('episode-item--active', parseInt(el.dataset.ep) === currentEpisode);
    });

    const active = episodeList.querySelector('.episode-item--active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function renderEpisodeList(seasonNum) {
    const count = getEpisodeCount(seasonNum);
    episodeList.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const el = document.createElement('div');
      el.className = `episode-item${i === currentEpisode ? ' episode-item--active' : ''}`;
      el.dataset.ep = i;
      el.innerHTML = `<span class="episode-item__number">${i}</span><span class="episode-item__title">Episodio ${i}</span>`;
      el.addEventListener('click', () => {
        currentEpisode = i;
        updatePlayer();
      });
      episodeList.appendChild(el);
    }
  }

  function goNext() {
    const epCount = getEpisodeCount(currentSeason);
    if (currentEpisode < epCount) {
      currentEpisode++;
    } else {
      const idx = validSeasons.findIndex(s => s.season_number == currentSeason);
      if (idx < validSeasons.length - 1) {
        currentSeason = validSeasons[idx + 1].season_number;
        currentEpisode = 1;
        seasonSelect.value = currentSeason;
        renderEpisodeList(currentSeason);
      }
    }
    updatePlayer();
  }

  function goPrev() {
    if (currentEpisode > 1) {
      currentEpisode--;
    } else {
      const idx = validSeasons.findIndex(s => s.season_number == currentSeason);
      if (idx > 0) {
        currentSeason = validSeasons[idx - 1].season_number;
        currentEpisode = getEpisodeCount(currentSeason);
        seasonSelect.value = currentSeason;
        renderEpisodeList(currentSeason);
      }
    }
    updatePlayer();
  }

  async function init() {
    if (!type || !id) {
      document.getElementById('media-title').textContent = 'Error: Faltan parámetros';
      return;
    }

    try {
      const tmdbType = (type === 'series' || type === 'anime' || type === 'tv') ? 'tv' : 'movie';
      currentData = await NeonAPI.getTMDBDetails(tmdbType, id);
      if (!currentData) throw new Error('No se pudo obtener información');

      // Metadata
      const title = currentData.title || currentData.name || 'Sin título';
      const date = currentData.release_date || currentData.first_air_date || '';
      const year = date ? date.split('-')[0] : 'N/A';
      const rating = currentData.vote_average ? currentData.vote_average.toFixed(1) : 'N/A';
      const genres = currentData.genres ? currentData.genres.map(g => g.name).join(', ') : '';

      document.getElementById('media-title').textContent = title;
      document.getElementById('media-year').textContent = year;
      document.getElementById('media-rating').textContent = `★ ${rating}`;
      document.getElementById('media-genres').textContent = genres;
      document.getElementById('media-synopsis').textContent = currentData.overview || 'No hay sinopsis disponible.';
      document.title = `${title} — NeonLatino`;

      if (tmdbType === 'tv' && currentData.seasons) {
        validSeasons = currentData.seasons.filter(s => s.season_number > 0);
        sidebar.classList.add('active');
        nav.classList.add('active');

        seasonSelect.innerHTML = validSeasons.map(s =>
          `<option value="${s.season_number}">${s.name || 'Temporada ' + s.season_number}</option>`
        ).join('');

        if (!validSeasons.find(s => s.season_number == currentSeason)) {
          currentSeason = validSeasons[0]?.season_number || 1;
        }
        seasonSelect.value = currentSeason;

        seasonSelect.addEventListener('change', (e) => {
          currentSeason = parseInt(e.target.value);
          currentEpisode = 1;
          renderEpisodeList(currentSeason);
          updatePlayer();
        });

        btnPrev.addEventListener('click', goPrev);
        btnNext.addEventListener('click', goNext);

        renderEpisodeList(currentSeason);
        updatePlayer();
      } else {
        const url = NeonAPI.getEmbedURL(type, id);
        if (player) player.src = url;
      }
    } catch (err) {
      console.error('[NeonLatino] Watch Error:', err);
      document.getElementById('media-title').textContent = 'Error al cargar';
      document.getElementById('media-synopsis').textContent = err.message;
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', WatchApp.init);
