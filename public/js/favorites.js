/* ================================================
   NEONLATINO — Favorites (LocalStorage)
   ================================================ */
const Favorites = (() => {
  const KEY = 'neonlatino_favs';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function isFav(id) { return getAll().some(i => i.id === id); }

  function toggle({ id, type, title, poster }) {
    let items = getAll();
    if (items.some(i => i.id === id)) {
      items = items.filter(i => i.id !== id);
    } else {
      items.unshift({ id, type, title, poster, ts: Date.now() });
    }
    save(items);
    return isFav(id);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(getAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'neonlatino-favoritos.json';
    a.click();
  }

  function importJSON(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) { save(data); resolve(true); }
          else resolve(false);
        } catch { resolve(false); }
      };
      reader.readAsText(file);
    });
  }

  return { getAll, isFav, toggle, exportJSON, importJSON };
})();
