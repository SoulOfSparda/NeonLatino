/* ================================================
   NEONLATINO — Detail Page Logic
   ================================================ */
const DetailApp = (() => {
  const IMG = 'https://image.tmdb.org/t/p';
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');

  async function init() {
    if (!type || !id) return;
    const tmdbType = (type === 'series' || type === 'anime') ? 'tv' : 'movie';
    const data = await NeonAPI.getTMDBDetails(tmdbType, id);
    if (!data || data.error) {
      document.getElementById('detail-title').textContent = 'No encontrado';
      return;
    }

    const title = data.title || data.name || '';
    document.title = `${title} — NeonLatino`;

    // Backdrop
    if (data.backdrop_path) {
      const img = document.createElement('img');
      img.className = 'detail-backdrop__img';
      img.src = `${IMG}/original${data.backdrop_path}`;
      img.alt = '';
      document.getElementById('detail-backdrop').prepend(img);
    }

    // Poster
    const posterEl = document.getElementById('detail-poster');
    if (data.poster_path) {
      posterEl.innerHTML = `<img src="${IMG}/w500${data.poster_path}" alt="${title}">`;
    }

    // Title & meta
    document.getElementById('detail-title').textContent = title;
    const year = (data.release_date || data.first_air_date || '').split('-')[0];
    const runtime = data.runtime ? `${data.runtime} min` : data.number_of_seasons ? `${data.number_of_seasons} temporadas` : '';
    document.getElementById('detail-rating').textContent = `★ ${data.vote_average?.toFixed(1) || 'N/A'} · ${year} · ${runtime}`;

    // Genres
    const tagsEl = document.getElementById('detail-tags');
    if (data.genres) tagsEl.innerHTML = data.genres.map(g => `<span>${g.name}</span>`).join('');

    // Synopsis
    document.getElementById('detail-synopsis').textContent = data.overview || 'Sin sinopsis disponible.';

    // Actions
    const actionsEl = document.getElementById('detail-actions');
    const watchUrl = `ver.html?type=${type}&id=${id}`;
    const isFav = typeof Favorites !== 'undefined' && Favorites.isFav(id);
    actionsEl.innerHTML = `<a href="${watchUrl}" class="btn btn--primary">▶ REPRODUCIR</a><button class="btn btn--ghost" id="btn-fav">${isFav ? '★' : '☆'} FAVORITO</button>`;
    document.getElementById('btn-fav').addEventListener('click', (e) => {
      const now = Favorites.toggle({ id, type, title, poster: data.poster_path });
      e.target.textContent = now ? '★ FAVORITO' : '☆ FAVORITO';
    });

    // Trailer
    if (data.videos?.results?.length) {
      const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || data.videos.results[0];
      if (trailer) {
        document.getElementById('trailer-section').style.display = '';
        document.getElementById('trailer-wrapper').innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen loading="lazy"></iframe>`;
      }
    }

    // Cast
    if (data.credits?.cast?.length) {
      document.getElementById('cast-section').style.display = '';
      document.getElementById('cast-grid').innerHTML = data.credits.cast.slice(0, 12).map(p => `
        <div class="cast-card">
          <img src="${p.profile_path ? IMG + '/w185' + p.profile_path : 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>'}" alt="${p.name}" loading="lazy">
          <div class="cast-card__name">${p.name}</div>
          <div class="cast-card__char">${p.character || ''}</div>
        </div>
      `).join('');
    }

    // Seasons (TV only)
    if (data.seasons?.length) {
      const valid = data.seasons.filter(s => s.season_number > 0);
      if (valid.length) {
        document.getElementById('seasons-section').style.display = '';
        document.getElementById('seasons-list').innerHTML = valid.map(s => `
          <a href="${watchUrl}&se=${s.season_number}&ep=1" class="season-item">
            <div class="season-item__name">${s.name || 'Temporada ' + s.season_number}</div>
            <div class="season-item__info">${s.episode_count} episodios${s.air_date ? ' · ' + s.air_date.split('-')[0] : ''}</div>
          </a>
        `).join('');
      }
    }

    // Similar
    if (data.similar?.results?.length) {
      document.getElementById('similar-section').style.display = '';
      document.getElementById('similar-row').innerHTML = data.similar.results.slice(0, 10).map(item => {
        const t = item.title || item.name || '';
        const poster = item.poster_path ? `${IMG}/w300${item.poster_path}` : '';
        return `
          <div class="card" onclick="location.href='detalle.html?type=${type}&id=${item.id}'" style="cursor:pointer">
            <div class="card__poster">
              ${poster ? `<img src="${poster}" alt="${t}" loading="lazy">` : ''}
              <div class="card__poster-gradient" style="${poster ? 'display:none' : 'display:flex'}">${t}</div>
            </div>
            <div class="card__accent"></div>
            <div class="card__info"><h3 class="card__title">${t}</h3></div>
          </div>`;
      }).join('');
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', DetailApp.init);
