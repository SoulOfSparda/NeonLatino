export default async function handler(req, res) {
  const { type, tmdb, se, max = 50 } = req.query;
  const viewKey = process.env.VIMEUS_VIEW_KEY || '588MgMuO7k2yVVKabV204NlK3TTaBcAtLVuHJSDLe5o';

  if (!type || !tmdb || !se) {
    return res.status(400).json({ available: false, count: 0 });
  }

  const maxEp = Math.min(parseInt(max), 200);

  // Binary search for last available episode
  let lo = 0, hi = maxEp;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const url = `https://vimeus.com/e/${type}?tmdb=${tmdb}&view_key=${viewKey}&se=${se}&ep=${mid}`;
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    } catch (e) {
      hi = mid - 1;
    }
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  res.status(200).json({ available: lo > 0, count: lo, type });
}
