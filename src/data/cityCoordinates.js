/**
 * Pre-mapped city → normalized coordinates (nx, ny) on a standard world map.
 * These correspond to the Natural Earth / Robinson projection world map.
 * nx: 0 = left edge, 1 = right edge
 * ny: 0 = top edge,  1 = bottom edge
 */
export const cityCoordinates = {
  // North America
  'New York':        { nx: 0.215, ny: 0.295 },
  'Los Angeles':     { nx: 0.118, ny: 0.335 },
  'Chicago':         { nx: 0.192, ny: 0.285 },
  'Toronto':         { nx: 0.207, ny: 0.270 },
  'Vancouver':       { nx: 0.122, ny: 0.245 },
  'San Francisco':   { nx: 0.108, ny: 0.315 },
  'Boston':          { nx: 0.228, ny: 0.285 },
  'Seattle':         { nx: 0.118, ny: 0.258 },
  'Austin':          { nx: 0.170, ny: 0.355 },
  'Miami':           { nx: 0.200, ny: 0.370 },

  // Europe
  'London':          { nx: 0.460, ny: 0.225 },
  'Paris':           { nx: 0.475, ny: 0.235 },
  'Berlin':          { nx: 0.495, ny: 0.222 },
  'Amsterdam':       { nx: 0.478, ny: 0.218 },
  'Dublin':          { nx: 0.445, ny: 0.220 },
  'Zurich':          { nx: 0.487, ny: 0.235 },
  'Stockholm':       { nx: 0.502, ny: 0.200 },
  'Barcelona':       { nx: 0.470, ny: 0.248 },
  'Rome':            { nx: 0.495, ny: 0.255 },
  'Vienna':          { nx: 0.500, ny: 0.228 },

  // Asia Pacific
  'Mumbai':          { nx: 0.652, ny: 0.415 },
  'Delhi':           { nx: 0.662, ny: 0.370 },
  'Bangalore':       { nx: 0.658, ny: 0.440 },
  'Hyderabad':       { nx: 0.660, ny: 0.428 },
  'Chennai':         { nx: 0.663, ny: 0.447 },
  'Pune':            { nx: 0.655, ny: 0.422 },
  'Kolkata':         { nx: 0.678, ny: 0.390 },
  'Ahmedabad':       { nx: 0.647, ny: 0.400 },
  'Singapore':       { nx: 0.745, ny: 0.500 },
  'Tokyo':           { nx: 0.816, ny: 0.310 },
  'Shanghai':        { nx: 0.790, ny: 0.330 },
  'Beijing':         { nx: 0.785, ny: 0.300 },
  'Seoul':           { nx: 0.808, ny: 0.305 },
  'Sydney':          { nx: 0.828, ny: 0.680 },
  'Melbourne':       { nx: 0.820, ny: 0.700 },
  'Bangkok':         { nx: 0.738, ny: 0.455 },
  'Kuala Lumpur':    { nx: 0.740, ny: 0.490 },
  'Jakarta':         { nx: 0.748, ny: 0.525 },

  // Middle East
  'Dubai':           { nx: 0.607, ny: 0.385 },
  'Abu Dhabi':       { nx: 0.603, ny: 0.388 },
  'Riyadh':          { nx: 0.593, ny: 0.393 },
  'Tel Aviv':        { nx: 0.558, ny: 0.348 },

  // Africa
  'Nairobi':         { nx: 0.561, ny: 0.510 },
  'Lagos':           { nx: 0.467, ny: 0.480 },
  'Cairo':           { nx: 0.552, ny: 0.355 },
  'Cape Town':       { nx: 0.527, ny: 0.665 },
  'Johannesburg':    { nx: 0.543, ny: 0.640 },

  // South America
  'São Paulo':       { nx: 0.278, ny: 0.590 },
  'Buenos Aires':    { nx: 0.264, ny: 0.655 },

  // Default fallback
  'Other':           { nx: 0.5,   ny: 0.5   },
}

export function getCityCoordinates(city, country) {
  if (cityCoordinates[city])    return cityCoordinates[city]
  if (cityCoordinates[country]) return cityCoordinates[country]
  return cityCoordinates['Other']
}
