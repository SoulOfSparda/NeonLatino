/* ================================================
   NEONLATINO — Watch Logic
   Handles TMDB metadata, Vimeus embeds, and seasons
   ================================================ */

const WatchApp = (() => {
  let currentData = null;
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type'); // 'movie', 'series', 'anime', 'tv'
  const id = urlParams.get('id');

  const player = document.getElementById('video-player');
  const placeholder = document.getElementById('player-placeholder');
  const playerBackdrop = document.getElementById('player-backdrop');
  const seasonSelect = document.getElementById('season-select');
  const episodeSelect = document.getElementById('episode-select');
  const selectorContainer = document.getElementById('season-episode-selector');

  let pendingEmbed = null;

  function updateMetadata(data) {
    const title = data.title || data.name || 'Sin título';
    const date = data.release_date || data.first_air_date || '';
    const year = date ? date.split('-')[0] : 'N/A';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
    const genres = data.genres ? data.genres.map(g => g.name).join(', ') : '';
    const overview = data.overview || 'No hay sinopsis disponible.';

    const backdrop = data.backdrop_path || data.backdrop;
    if (backdrop && playerBackdrop) {
      playerBackdrop.src = `https://image.tmdb.org/t/p/original${backdrop}`;
    }

    document.getElementById('media-title').textContent = title;
    document.getElementById('media-year').textContent = year;
    document.getElementById('media-rating').textContent = `★ ${rating}`;
    document.getElementById('media-genres').textContent = genres;
    document.getElementById('media-synopsis').textContent = overview;
    
    document.title = `${title} — NeonLatino`;
  }

  function updatePlayer(season = null, episode = null) {
    let embedType = type;
    if (type === 'tv') embedType = 'series';
    
    const embedUrl = NeonAPI.getEmbedURL(embedType, id, season, episode);
    console.log('[NeonLatino] Embed prepared:', embedUrl);
    
    // Store as pending, will load on interaction
    pendingEmbed = embedUrl;
    
    // Show placeholder if we were already playing something else
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.style.opacity = '1';
    }
    if (player) {
      player.classList.remove('loaded');
      player.src = ''; 
    }
  }

  function startPlayback() {
    if (!pendingEmbed || !player) return;
    
    player.src = pendingEmbed;
    player.onload = () => {
      player.classList.add('loaded');
      if (placeholder) {
        placeholder.style.opacity = '0';
        setTimeout(() => { placeholder.style.display = 'none'; }, 400);
      }
    };
  }

  function populateEpisodes(seasonNumber) {
    const season = currentData.seasons.find(s => s.season_number == seasonNumber);
    if (!season) return;
    
    // We don't have episode details unless we fetch them specifically, 
    // but we know the episode_count from the season object.
    const epCount = season.episode_count;
    episodeSelect.innerHTML = '';
    
    for (let i = 1; i <= epCount; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Episodio ${i}`;
      episodeSelect.appendChild(option);
    }
    
    // Default to episode 1
    episodeSelect.value = 1;
    updatePlayer(seasonNumber, 1);
  }

  async function loadMedia() {
    if (!type || !id) {
      document.getElementById('media-title').textContent = 'Error: Faltan parámetros';
      return;
    }

    try {
      const tmdbType = (type === 'series' || type === 'anime' || type === 'tv') ? 'tv' : 'movie';
      currentData = await NeonAPI.getTMDBDetails(tmdbType, id);
      
      if (!currentData) {
        throw new Error('No se pudo obtener información de TMDB');
      }

      updateMetadata(currentData);

      if (tmdbType === 'tv') {
        selectorContainer.style.display = 'flex';
        
        // Populate seasons (filter out specials usually season 0)
        const validSeasons = currentData.seasons.filter(s => s.season_number > 0);
        seasonSelect.innerHTML = '';
        validSeasons.forEach(s => {
          const option = document.createElement('option');
          option.value = s.season_number;
          option.textContent = s.name || `Temporada ${s.season_number}`;
          seasonSelect.appendChild(option);
        });

        // Event listeners for select changes
        seasonSelect.addEventListener('change', (e) => {
          populateEpisodes(e.target.value);
        });

        episodeSelect.addEventListener('change', (e) => {
          updatePlayer(seasonSelect.value, e.target.value);
        });

        // Initialize with first season and episode
        if (validSeasons.length > 0) {
          seasonSelect.value = validSeasons[0].season_number;
          populateEpisodes(validSeasons[0].season_number);
        } else {
          // No seasons found fallback
          updatePlayer(1, 1);
        }
      } else {
        // It's a movie
        updatePlayer();
      }

      // Add click to placeholder
      if (placeholder) {
        placeholder.addEventListener('click', startPlayback);
      }

    } catch (err) {
      console.error('[NeonLatino] Watch Error:', err);
      document.getElementById('media-title').textContent = 'Error al cargar';
      document.getElementById('media-synopsis').textContent = err.message;
    }
  }

  return { init: loadMedia };
})();

document.addEventListener('DOMContentLoaded', WatchApp.init);
