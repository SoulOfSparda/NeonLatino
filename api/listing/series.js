export default async function handler(req, res) {
  const { page = 1 } = req.query;
  const apiKey = process.env.VIMEUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'VIMEUS_API_KEY no configurada' });
  }

  try {
    const response = await fetch(`https://vimeus.com/api/listing/series?page=${page}`, {
      headers: { 'X-API-Key': apiKey }
    });
    
    if (!response.ok) {
      throw new Error(`Vimeus API Error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}
