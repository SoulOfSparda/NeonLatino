export default async function handler(req, res) {
  const { type, tmdb, se, ep } = req.query;
  const viewKey = process.env.VIMEUS_VIEW_KEY || '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';

  if (!type || !tmdb || !se || !ep) {
    return res.status(400).json({ available: false });
  }

  try {
    const url = `https://vimeus.com/e/${type}?tmdb=${tmdb}&view_key=${viewKey}&se=${se}&ep=${ep}`;
    const response = await fetch(url, { method: 'HEAD' });
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.status(200).json({ available: response.ok });
  } catch (error) {
    res.status(200).json({ available: false });
  }
}
