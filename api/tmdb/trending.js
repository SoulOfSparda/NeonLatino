export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'TMDB_API_KEY no configurada' });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=es-MX`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
