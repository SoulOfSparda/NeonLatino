export default async function handler(req, res) {
  const { type = 'movie', page = 1, genre, sort = 'popularity.desc', year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) return res.status(500).json({ error: true, message: 'TMDB_API_KEY no configurada' });

  const tmdbType = (type === 'tv' || type === 'series' || type === 'anime') ? 'tv' : 'movie';
  let url = `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&language=es-MX&page=${page}&sort_by=${sort}`;
  if (genre) url += `&with_genres=${genre}`;
  if (year) url += tmdbType === 'movie' ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`;
  if (type === 'anime') url += '&with_genres=16&with_origin_country=JP';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
