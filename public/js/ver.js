/* ================================================
   NEONLATINO — Watch Logic
   Episode sidebar, prev/next navigation, TMDB metadata
   ================================================ */

const WatchApp = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  let currentSeason = parseInt(urlParams.get('se')) || 1;
  let currentEpisode = parseInt(urlParams.get('ep')) || 1;
  let currentData = null;
  let validSeasons = [];

  const player = document.getElementById('video-player');
  const seasonSelect = document.getElementById('season-select');
  const episodeList = document.getElementById('episode-list');
  const sidebar = document.getElementById('episode-sidebar');
  const nav = document.getElementById('episode-nav');
  const btnPrev = document.getElementById('btn-prev-ep');
  const btnNext = document.getElementById('btn-next-ep');
  const epLabel = document.getElementById('ep-current-label');

  function updatePlayer() {
    let embedType = type;
    if (type === 'tv') embedType = 'series';
    const url = NeonAPI.getEmbedURL(embedType, id, currentSeason, currentEpisode);
    if (player) player.src = url;

    // Update URL without reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('se', currentSeason);
    newUrl.searchParams.set('ep', currentEpisode);
    history.replaceState(null, '', newUrl);

    updateUI();
  }

  function updatePlayerMovie() {
    const url = NeonAPI.getEmbedURL(type, id);
    if (player) player.src = url;
  }

  function getEpisodeCount(seasonNum) {
    const s = validSeasons.find(s => s.season_number == seasonNum);
    return s ? s.episode_count : 0;
  }

  function updateUI() {
    // Update nav label
    if (epLabel) epLabel.textContent = `T${currentSeason} · Ep ${currentEpisode} de ${getEpisodeCount(currentSeason)}`;

    // Update prev/next buttons
    const isFirstEp = currentEpisode === 1 && validSeasons[0]?.season_number == currentSeason;
    const lastSeason = validSeasons[validSeasons.length - 1];
    const isLastEp = currentEpisode >= getEpisodeCount(currentSeason) && lastSeason?.season_number == currentSeason;
    if (btnPrev) btnPrev.disabled = isFirstEp;
    if (btnNext) btnNext.disabled = isLastEp;

    // Highlight active episode in list
    episodeList.querySelectorAll('.episode-item').forEach(el => {
      el.classList.toggle('episode-item--active', parseInt(el.dataset.ep) === currentEpisode);
    });

    // Auto-scroll to active
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
      // Next season
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
      // Previous season, last episode
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
        // Show sidebar and nav
        validSeasons = currentData.seasons.filter(s => s.season_number > 0);
        sidebar.classList.add('active');
        nav.classList.add('active');

        // Populate season select
        seasonSelect.innerHTML = validSeasons.map(s =>
          `<option value="${s.season_number}">${s.name || 'Temporada ' + s.season_number}</option>`
        ).join('');

        // Set initial season from URL or default
        if (!validSeasons.find(s => s.season_number == currentSeason)) {
          currentSeason = validSeasons[0]?.season_number || 1;
        }
        seasonSelect.value = currentSeason;

        // Events
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
        updatePlayerMovie();
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
