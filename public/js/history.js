/* ================================================
   NEONLATINO — Watch History (LocalStorage)
   ================================================ */
const WatchHistory = (() => {
  const KEY = 'neonlatino_history';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 20)));
  }

  // Update or add an entry
  function update({ id, type, title, poster, season, episode, totalEpisodes }) {
    const items = getAll().filter(i => i.id !== id);
    items.unshift({ id, type, title, poster, season: season || null, episode: episode || null, totalEpisodes: totalEpisodes || null, ts: Date.now() });
    save(items);
  }

  function remove(id) {
    save(getAll().filter(i => i.id !== id));
  }

  return { getAll, update, remove };
})();
