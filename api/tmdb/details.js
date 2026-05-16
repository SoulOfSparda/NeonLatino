export default async function handler(req, res) {
  const { type = 'movie', id } = req.query; // type can be 'movie' or 'tv'
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'TMDB_API_KEY no configurada' });
  }

  if (!id) {
    return res.status(400).json({ error: true, message: 'Falta el ID' });
  }

  try {
    const tmdbType = (type === 'series' || type === 'anime' || type === 'tv') ? 'tv' : 'movie';
    const response = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${id}?api_key=${apiKey}&language=es-MX&append_to_response=videos,credits,similar`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
