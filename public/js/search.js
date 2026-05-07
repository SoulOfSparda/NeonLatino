/* ================================================
   NEONLATINO — Global Search
   Handles redirection to catalog.html for search results
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (!input) return;

  // Si estamos en la vista de búsqueda, restaurar el valor
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('q')) {
    input.value = urlParams.get('q');
  }

  function executeSearch() {
    const query = input.value.trim();
    if (query) {
      window.location.href = `catalog.html?q=${encodeURIComponent(query)}`;
    }
  }

  // Buscar con la tecla Enter
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // Hacer que el icono de la lupa sea cliqueable
  const searchIcon = document.querySelector('.navbar__search-icon');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', executeSearch);
  }
});
