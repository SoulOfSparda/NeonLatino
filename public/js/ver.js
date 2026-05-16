/* ================================================
   NEONLATINO — Watch Logic
   Episode sidebar, prev/next, type fallback, real episode count
   ================================================ */

const WatchApp = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  let currentSeason = parseInt(urlParams.get('se')) || 1;
  let currentEpisode = parseInt(urlParams.get('ep')) || 1;
  let currentData = null;
  let validSeasons = [];

  // Cache: season -> { vimeusType, episodeCount }
  const seasonCache = new Map();

  const player = document.getElementById('video-player');
  const seasonSelect = document.getElementById('season-select');
  const episodeList = document.getElementById('episode-list');
  const sidebar = document.getElementById('episode-sidebar');
  const nav = document.getElementById('episode-nav');
  const btnPrev = document.getElementById('btn-prev-ep');
  const btnNext = document.getElementById('btn-next-ep');
  const epLabel = document.getElementById('ep-current-label');

  function getTypeFallbacks() {
    if (type === 'anime') return ['anime', 'serie'];
    if (type === 'series') return ['serie', 'anime'];
    return ['movie'];
  }

  // Find which Vimeus type works and how many episodes are available
  async function getSeasonInfo(seasonNum) {
    const cacheKey = `${id}_s${seasonNum}`;
    if (seasonCache.has(cacheKey)) return seasonCache.get(cacheKey);

    const tmdbSeason = validSeasons.find(s => s.season_number == seasonNum);
    const maxEp = tmdbSeason ? tmdbSeason.episode_count : 50;
    const fallbacks = getTypeFallbacks();

    for (const vType of fallbacks) {
      try {
        const res = await fetch(`/api/vimeus/episodes?type=${vType}&tmdb=${id}&se=${seasonNum}&max=${maxEp}`);
        const data = await res.json();
        if (data.available && data.count > 0) {
          const info = { vimeusType: vType, episodeCount: data.count };
          seasonCache.set(cacheKey, info);
          return info;
        }
      } catch (e) { /* continue */ }
    }

    // Nothing available
    const info = { vimeusType: fallbacks[0], episodeCount: 0 };
    seasonCache.set(cacheKey, info);
    return info;
  }

  async function updatePlayer() {
    const info = await getSeasonInfo(currentSeason);
    const VIEW_KEY = '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';
    const url = `https://vimeus.com/e/${info.vimeusType}?tmdb=${id}&view_key=${VIEW_KEY}&se=${currentSeason}&ep=${currentEpisode}`;
    if (player) player.src = url;

    // Save to history
    if (typeof WatchHistory !== 'undefined' && currentData) {
      WatchHistory.update({ id, type, title: currentData.title || currentData.name, poster: currentData.poster_path, season: currentSeason, episode: currentEpisode, totalEpisodes: info.episodeCount });
    }

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('se', currentSeason);
    newUrl.searchParams.set('ep', currentEpisode);
    history.replaceState(null, '', newUrl);

    updateUI();
  }

  function updateUI() {
    const info = seasonCache.get(`${id}_s${currentSeason}`);
    const epCount = info ? info.episodeCount : 0;

    if (epLabel) epLabel.textContent = `T${currentSeason} · Ep ${currentEpisode} de ${epCount}`;

    // Prev/next state
    const isFirstEp = currentEpisode === 1 && validSeasons[0]?.season_number == currentSeason;
    const lastSeason = validSeasons[validSeasons.length - 1];
    const isLastEp = currentEpisode >= epCount && lastSeason?.season_number == currentSeason;
    if (btnPrev) btnPrev.disabled = isFirstEp;
    if (btnNext) btnNext.disabled = isLastEp;

    // Highlight active
    episodeList.querySelectorAll('.episode-item').forEach(el => {
      el.classList.toggle('episode-item--active', parseInt(el.dataset.ep) === currentEpisode);
    });
    const active = episodeList.querySelector('.episode-item--active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  async function renderEpisodeList(seasonNum) {
    episodeList.innerHTML = '<div style="padding:1rem;color:var(--text-muted);font-size:0.8rem;">Verificando episodios...</div>';

    const info = await getSeasonInfo(seasonNum);

    if (info.episodeCount === 0) {
      episodeList.innerHTML = '<div style="padding:1rem;color:var(--neon-magenta);font-size:0.8rem;">No hay episodios disponibles para esta temporada.</div>';
      return;
    }

    episodeList.innerHTML = '';
    for (let i = 1; i <= info.episodeCount; i++) {
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

  async function goNext() {
    const info = seasonCache.get(`${id}_s${currentSeason}`);
    const epCount = info ? info.episodeCount : 0;

    if (currentEpisode < epCount) {
      currentEpisode++;
    } else {
      // Try next season
      const idx = validSeasons.findIndex(s => s.season_number == currentSeason);
      if (idx < validSeasons.length - 1) {
        currentSeason = validSeasons[idx + 1].season_number;
        currentEpisode = 1;
        seasonSelect.value = currentSeason;
        await renderEpisodeList(currentSeason);
      }
    }
    updatePlayer();
  }

  async function goPrev() {
    if (currentEpisode > 1) {
      currentEpisode--;
    } else {
      const idx = validSeasons.findIndex(s => s.season_number == currentSeason);
      if (idx > 0) {
        currentSeason = validSeasons[idx - 1].season_number;
        seasonSelect.value = currentSeason;
        await renderEpisodeList(currentSeason);
        const info = seasonCache.get(`${id}_s${currentSeason}`);
        currentEpisode = info ? info.episodeCount : 1;
      }
    }
    updatePlayer();
  }

  async function init() {
    if (!type || !id) {
      document.getElementById('media-title').textContent = 'Error: Faltan parámetros';
      return;
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'n' || e.key === 'N') {
        const idx = validSeasons.findIndex(s => s.season_number == currentSeason);
        if (idx < validSeasons.length - 1) {
          currentSeason = validSeasons[idx + 1].season_number;
          currentEpisode = 1;
          if (seasonSelect) seasonSelect.value = currentSeason;
          renderEpisodeList(currentSeason).then(() => updatePlayer());
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (player) { try { player.requestFullscreen(); } catch {} }
      } else if (e.key === 'Escape') {
        document.body.classList.remove('cinema-mode');
      }
    });

    // Cinema mode
    const cinemaBtn = document.getElementById('btn-cinema');
    const cinemaExit = document.getElementById('cinema-exit');
    const toggleCinema = () => document.body.classList.toggle('cinema-mode');
    if (cinemaBtn) cinemaBtn.addEventListener('click', toggleCinema);
    if (cinemaExit) cinemaExit.addEventListener('click', () => document.body.classList.remove('cinema-mode'));

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

        seasonSelect.addEventListener('change', async (e) => {
          currentSeason = parseInt(e.target.value);
          currentEpisode = 1;
          await renderEpisodeList(currentSeason);
          updatePlayer();
        });

        btnPrev.addEventListener('click', () => goPrev());
        btnNext.addEventListener('click', () => goNext());

        await renderEpisodeList(currentSeason);
        updatePlayer();
      } else {
        const url = NeonAPI.getEmbedURL(type, id);
        if (player) player.src = url;
        if (typeof WatchHistory !== 'undefined') {
          WatchHistory.update({ id, type, title, poster: currentData.poster_path });
        }
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
