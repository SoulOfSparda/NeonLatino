export default async function handler(req, res) {
  const { q, page = 1 } = req.query;
  const apiKey = process.env.TMDB_API_KEY;
  const viewKey = process.env.VIMEUS_VIEW_KEY || '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';

  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'TMDB_API_KEY no configurada' });
  }

  if (!q) {
    return res.status(400).json({ error: true, message: 'Falta el parámetro de búsqueda (q)' });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=es-MX&query=${encodeURIComponent(q)}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filtrar resultados validando si existen en Vimeus
    if (data.results && data.results.length > 0) {
      const existPromises = data.results.map(async (item) => {
        if (item.media_type === 'person') return null;
        
        const typeMap = { movie: 'movie', tv: 'serie' };
        const type = typeMap[item.media_type] || 'movie';
        
        try {
          const vimeusUrl = `https://vimeus.com/e/${type}?tmdb=${item.id}&view_key=${viewKey}`;
          const vimeusRes = await fetch(vimeusUrl, { method: 'HEAD' });
          if (vimeusRes.status === 200) {
            return item;
          }
        } catch (e) {
          // Ignorar errores de red
        }
        return null;
      });
      
      const resultsWithNulls = await Promise.all(existPromises);
      data.results = resultsWithNulls.filter(Boolean);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
