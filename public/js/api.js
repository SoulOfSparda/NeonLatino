/* ================================================
   NEONLATINO — API Client
   Fetch wrapper for Vimeus & TMDB proxies
   ================================================ */

const NeonAPI = (() => {
  const cache = new Map();
  const CACHE_TTL = 15 * 60 * 1000; // 15 min

  async function fetchJSON(url) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache.set(url, { data, time: Date.now() });
      return data;
    } catch (err) {
      console.error(`[NeonAPI] Error fetching ${url}:`, err);
      return null;
    }
  }

  return {
    getListingMovies: (page = 1) => fetchJSON(`/api/listing/movies?page=${page}`),
    getListingSeries: (page = 1) => fetchJSON(`/api/listing/series?page=${page}`),
    getListingAnimes: (page = 1) => fetchJSON(`/api/listing/animes?page=${page}`),
    getTMDBTrending: () => fetchJSON('/api/tmdb/trending'),
    getTMDBDetails: (type, id) => fetchJSON(`/api/tmdb/details?type=${type}&id=${id}`),
    searchTMDB: (query, page = 1) => fetchJSON(`/api/tmdb/search?q=${encodeURIComponent(query)}&page=${page}`),
    discoverTMDB: (params) => fetchJSON(`/api/tmdb/discover?${new URLSearchParams(params)}`),

    // Vimeus embed URL builder (view_key is public)
    getEmbedURL(type, tmdbId, season, episode) {
      const VIEW_KEY = '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';
      const typeMap = { movie: 'movie', series: 'serie', anime: 'anime' };
      let url = `https://vimeus.com/e/${typeMap[type] || type}?tmdb=${tmdbId}&view_key=${VIEW_KEY}`;
      if (season) url += `&se=${season}`;
      if (episode) url += `&ep=${episode}`;
      return url;
    }
  };
})();
