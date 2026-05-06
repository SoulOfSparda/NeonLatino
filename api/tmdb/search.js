export default async function handler(req, res) {
  const { q } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'TMDB_API_KEY no configurada' });
  }

  if (!q) {
    return res.status(400).json({ error: true, message: 'Falta el parámetro de búsqueda (q)' });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=es-MX&query=${encodeURIComponent(q)}&page=1`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
