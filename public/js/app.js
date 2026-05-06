/* ================================================
   NEONLATINO — Main App
   Mock data + dynamic rendering
   ================================================ */

const NeonApp = (() => {
  // TMDB image base (public CDN, no API key needed for images)
  const IMG = 'https://image.tmdb.org/t/p';

  /* --- Mock Data (Phase 1) --- */
  /* These use real TMDB poster paths for visual fidelity.
     In Phase 2, this data comes from the API. */
  const MOCK = {
    trending: [
      { id: 335984, title: 'Blade Runner 2049', year: 2017, rating: 8.0, type: 'movie', poster: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', backdrop: '/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg', genre: 'Sci-Fi' },
      { id: 603, title: 'The Matrix', year: 1999, rating: 8.7, type: 'movie', poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genre: 'Acción' },
      { id: 155, title: 'The Dark Knight', year: 2008, rating: 9.0, type: 'movie', poster: '/qJ2tW6WMUDux911ma1cBSKnOj8O.jpg', genre: 'Acción' },
      { id: 299536, title: 'Avengers: Infinity War', year: 2018, rating: 8.3, type: 'movie', poster: '/7WsyChQLEftFiDhRkzUCRhbMmgu.jpg', genre: 'Acción' },
      { id: 680, title: 'Pulp Fiction', year: 1994, rating: 8.9, type: 'movie', poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genre: 'Crimen' },
      { id: 550, title: 'Fight Club', year: 1999, rating: 8.8, type: 'movie', poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genre: 'Drama' },
      { id: 238, title: 'El Padrino', year: 1972, rating: 9.2, type: 'movie', poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', genre: 'Crimen' },
      { id: 27205, title: 'Inception', year: 2010, rating: 8.4, type: 'movie', poster: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', genre: 'Sci-Fi' },
      { id: 569094, title: 'Spider-Man: Across the Spider-Verse', year: 2023, rating: 8.4, type: 'movie', poster: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', genre: 'Animación' },
      { id: 346698, title: 'Barbie', year: 2023, rating: 7.0, type: 'movie', poster: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', genre: 'Comedia' },
    ],
    movies: [
      { id: 693134, title: 'Dune: Parte Dos', year: 2024, rating: 8.2, type: 'movie', poster: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', genre: 'Sci-Fi' },
      { id: 872585, title: 'Oppenheimer', year: 2023, rating: 8.5, type: 'movie', poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', genre: 'Drama' },
      { id: 533535, title: 'Deadpool & Wolverine', year: 2024, rating: 7.7, type: 'movie', poster: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', genre: 'Acción' },
      { id: 1022789, title: 'Inside Out 2', year: 2024, rating: 7.6, type: 'movie', poster: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', genre: 'Animación' },
      { id: 786892, title: 'Furiosa', year: 2024, rating: 7.6, type: 'movie', poster: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', genre: 'Acción' },
      { id: 438631, title: 'Dune', year: 2021, rating: 7.8, type: 'movie', poster: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', genre: 'Sci-Fi' },
      { id: 76341, title: 'Mad Max: Fury Road', year: 2015, rating: 8.1, type: 'movie', poster: '/8tZYtuWezp8JbcsvHYO0O46tFBO.jpg', genre: 'Acción' },
      { id: 157336, title: 'Interstellar', year: 2014, rating: 8.7, type: 'movie', poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genre: 'Sci-Fi' },
      { id: 120, title: 'El Señor de los Anillos: La Comunidad del Anillo', year: 2001, rating: 8.8, type: 'movie', poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genre: 'Fantasía' },
      { id: 278, title: 'Cadena Perpetua', year: 1994, rating: 9.3, type: 'movie', poster: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', genre: 'Drama' },
    ],
    series: [
      { id: 1396, title: 'Breaking Bad', year: 2008, rating: 9.5, type: 'series', poster: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', genre: 'Drama' },
      { id: 1399, title: 'Game of Thrones', year: 2011, rating: 8.4, type: 'series', poster: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', genre: 'Fantasía' },
      { id: 66732, title: 'Stranger Things', year: 2016, rating: 8.6, type: 'series', poster: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', genre: 'Sci-Fi' },
      { id: 71912, title: 'The Witcher', year: 2019, rating: 8.0, type: 'series', poster: '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', genre: 'Fantasía' },
      { id: 84958, title: 'Loki', year: 2021, rating: 8.2, type: 'series', poster: '/voHUmluYmKyleFkTu3lOXQG702u.jpg', genre: 'Sci-Fi' },
      { id: 94997, title: 'House of the Dragon', year: 2022, rating: 8.4, type: 'series', poster: '/z2yahl2uefxDCl0nogcRBstwruJ.jpg', genre: 'Fantasía' },
      { id: 60625, title: 'Rick and Morty', year: 2013, rating: 8.7, type: 'series', poster: '/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg', genre: 'Animación' },
      { id: 93405, title: 'Squid Game', year: 2021, rating: 7.8, type: 'series', poster: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', genre: 'Thriller' },
      { id: 100088, title: 'The Last of Us', year: 2023, rating: 8.8, type: 'series', poster: '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', genre: 'Drama' },
      { id: 95557, title: 'Invincible', year: 2021, rating: 8.7, type: 'series', poster: '/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg', genre: 'Animación' },
    ],
    anime: [
      { id: 1429, title: 'Attack on Titan', year: 2013, rating: 8.7, type: 'anime', poster: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg', genre: 'Acción' },
      { id: 85937, title: 'Demon Slayer', year: 2019, rating: 8.6, type: 'anime', poster: '/xUfRZu2mi8jmepN0Dt6Yn7FEIIo.jpg', genre: 'Acción' },
      { id: 37854, title: 'One Piece', year: 1999, rating: 8.7, type: 'anime', poster: '/fcXdJlbSdUEeMSJFsXKsznGwwok.jpg', genre: 'Aventura' },
      { id: 114410, title: 'Jujutsu Kaisen', year: 2020, rating: 8.6, type: 'anime', poster: '/hFWP5HkbVEe40hrXgtCeQxoccHE.jpg', genre: 'Acción' },
      { id: 31911, title: 'Death Note', year: 2006, rating: 8.6, type: 'anime', poster: '/g8rElSyJVkXNJkJnmJJePKIYvIN.jpg', genre: 'Thriller' },
      { id: 46260, title: 'Naruto Shippūden', year: 2007, rating: 8.6, type: 'anime', poster: '/zAYRe2bJxpWTVrwwmBc00VFkAf4.jpg', genre: 'Acción' },
      { id: 62104, title: 'My Hero Academia', year: 2016, rating: 8.1, type: 'anime', poster: '/ivOLM47yJt90P19RH1NvJrAJz9F.jpg', genre: 'Acción' },
      { id: 60735, title: 'The Flash Anime', year: 2014, rating: 7.8, type: 'anime', poster: '/wHa6KOJAoNTFLFtp7wguUJKSR2q.jpg', genre: 'Sci-Fi' },
      { id: 635, title: 'Dragon Ball Z', year: 1989, rating: 8.3, type: 'anime', poster: '/6VKOfMqaHwkgSMrBCHpVIFHPjfm.jpg', genre: 'Acción' },
      { id: 94664, title: 'Spy x Family', year: 2022, rating: 8.6, type: 'anime', poster: '/3r4LYFnRKJMFNkFVGC3un3bhmPJ.jpg', genre: 'Comedia' },
    ]
  };

  /* --- Card HTML Generator --- */
  function createCard(item) {
    const posterURL = `${IMG}/w500${item.poster}`;
    const hue = item.type === 'movie' ? 190 : item.type === 'series' ? 300 : 40;

    return `
      <div class="card reveal" data-id="${item.id}" data-type="${item.type}">
        <div class="card__poster">
          <img src="${posterURL}" alt="${item.title}" loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="card__poster-gradient" style="display:none; background: linear-gradient(135deg, hsla(${hue}, 80%, 20%, 0.8), var(--bg-void));">
            ${item.title}
          </div>
          <span class="card__rating">★ ${item.rating}</span>
        </div>
        <div class="card__accent"></div>
        <div class="card__info">
          <h3 class="card__title">${item.title}</h3>
          <span class="card__year">${item.year} · ${item.genre}</span>
        </div>
      </div>`;
  }

  /* --- Render rows --- */
  function renderRow(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(createCard).join('');

    // Add click handlers
    container.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        // In Phase 2: navigate to watch.html?type={type}&id={id}
        console.log(`[NeonLatino] Play: ${type} #${id}`);
        alert(`🎬 Reproducir: ${card.querySelector('.card__title').textContent}\n\n(Player disponible en Fase 3)`);
      });
    });
  }

  /* --- Update Hero with random trending item --- */
  function updateHero() {
    const featured = MOCK.trending[Math.floor(Math.random() * 3)]; // Top 3
    const heroTitle = document.getElementById('hero-title');
    const heroSynopsis = document.getElementById('hero-synopsis');
    const heroBadge = document.getElementById('hero-badge');
    const heroBackdrop = document.getElementById('hero-backdrop');

    if (heroTitle) heroTitle.textContent = featured.title.toUpperCase();
    if (heroBadge) heroBadge.textContent = `🔥 TENDENCIA #1`;
  }

  /* --- Search handler --- */
  function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
          renderRow('trending-row', MOCK.trending);
          return;
        }
        const all = [...MOCK.trending, ...MOCK.movies, ...MOCK.series, ...MOCK.anime];
        const unique = [...new Map(all.map(i => [i.id, i])).values()];
        const results = unique.filter(i => i.title.toLowerCase().includes(query));
        renderRow('trending-row', results.length ? results : MOCK.trending);
      }, 300);
    });
  }

  /* --- Initialize App --- */
  function init() {
    renderRow('trending-row', MOCK.trending);
    renderRow('movies-row', MOCK.movies);
    renderRow('series-row', MOCK.series);
    renderRow('anime-row', MOCK.anime);
    initSearch();

    console.log('%c⚡ NEONLATINO', 'color: #00f0ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00f0ff;');
    console.log('%cBlade Runner Edition — Phase 1', 'color: #ff2d7b; font-size: 12px;');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', NeonApp.init);
