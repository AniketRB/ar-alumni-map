import { cityCoordinates } from '@/data/cityCoordinates'

function mercator(lat, lon) {
  const nx   = (lon + 180) / 360
  const latR = lat * Math.PI / 180
  const ny   = (1 - Math.log(Math.tan(Math.PI / 4 + latR / 2)) / Math.PI) / 2
  return { nx, ny }
}

export async function geocodeCity(city, country) {
  if (city    && cityCoordinates[city])    return cityCoordinates[city]
  if (country && cityCoordinates[country]) return cityCoordinates[country]

  const cacheKey = `geocode:${city}:${country}`
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {}

  try {
    const q   = [city, country].filter(Boolean).join(', ')
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ARAlumniMap/1.0 (synoralabs@gmail.com)' },
    })
    const data = await res.json()
    if (data.length) {
      const coords = mercator(parseFloat(data[0].lat), parseFloat(data[0].lon))
      try { localStorage.setItem(cacheKey, JSON.stringify(coords)) } catch {}
      return coords
    }
  } catch (e) {
    console.warn('[geocoding] Nominatim failed:', e)
  }

  return cityCoordinates['Other']
}
