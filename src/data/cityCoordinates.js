/**
 * Pre-mapped city → normalized coordinates (nx, ny) on a standard world map.
 * Based on Equirectangular projection (Natural Earth / standard flat map).
 * nx: 0 = left edge (180°W), 1 = right edge (180°E)
 * ny: 0 = top edge  (90°N),  1 = bottom edge (90°S)
 *
 * Formula: nx = (lon + 180) / 360,  ny = (90 - lat) / 180
 */

function latLonToNormalized(lat, lon) {
  return {
    nx: (lon + 180) / 360,
    ny: (90 - lat)  / 180,
  }
}

export const cityCoordinates = {
  // ── India (precise lat/lon) ────────────────────────────────
  'Mumbai':          latLonToNormalized(19.076,  72.878),
  'Delhi':           latLonToNormalized(28.614,  77.209),
  'New Delhi':       latLonToNormalized(28.614,  77.209),
  'Bangalore':       latLonToNormalized(12.972,  77.594),
  'Bengaluru':       latLonToNormalized(12.972,  77.594),
  'Hyderabad':       latLonToNormalized(17.385,  78.487),
  'Chennai':         latLonToNormalized(13.083,  80.270),
  'Pune':            latLonToNormalized(18.520,  73.856),
  'Kolkata':         latLonToNormalized(22.573,  88.364),
  'Ahmedabad':       latLonToNormalized(23.022,  72.571),
  'Jaipur':          latLonToNormalized(26.913,  75.787),
  'Surat':           latLonToNormalized(21.170,  72.831),
  'Lucknow':         latLonToNormalized(26.847,  80.947),
  'Kanpur':          latLonToNormalized(26.449,  80.331),
  'Nagpur':          latLonToNormalized(21.146,  79.089),
  'Indore':          latLonToNormalized(22.719,  75.857),
  'Bhopal':          latLonToNormalized(23.259,  77.413),
  'Patna':           latLonToNormalized(25.594,  85.138),
  'Vadodara':        latLonToNormalized(22.307,  73.181),
  'Coimbatore':      latLonToNormalized(11.017,  76.966),
  'Visakhapatnam':   latLonToNormalized(17.686,  83.218),
  'Kochi':           latLonToNormalized(9.939,   76.270),
  'Chandigarh':      latLonToNormalized(30.740,  76.779),
  'Mysuru':          latLonToNormalized(12.296,  76.639),
  'Noida':           latLonToNormalized(28.535,  77.391),
  'Gurgaon':         latLonToNormalized(28.459,  77.026),
  'Gurugram':        latLonToNormalized(28.459,  77.026),

  // ── North America ──────────────────────────────────────────
  'New York':        latLonToNormalized(40.713,  -74.006),
  'Los Angeles':     latLonToNormalized(34.052, -118.244),
  'Chicago':         latLonToNormalized(41.878,  -87.630),
  'Toronto':         latLonToNormalized(43.651,  -79.347),
  'Vancouver':       latLonToNormalized(49.246, -123.116),
  'San Francisco':   latLonToNormalized(37.774, -122.419),
  'Boston':          latLonToNormalized(42.360,  -71.059),
  'Seattle':         latLonToNormalized(47.606, -122.332),
  'Austin':          latLonToNormalized(30.267,  -97.743),
  'Miami':           latLonToNormalized(25.762,  -80.192),
  'Washington':      latLonToNormalized(38.907,  -77.037),
  'Atlanta':         latLonToNormalized(33.749,  -84.388),
  'Denver':          latLonToNormalized(39.739, -104.984),
  'Mexico City':     latLonToNormalized(19.433,  -99.133),

  // ── Europe ─────────────────────────────────────────────────
  'London':          latLonToNormalized(51.507,   -0.128),
  'Paris':           latLonToNormalized(48.857,    2.351),
  'Berlin':          latLonToNormalized(52.520,   13.405),
  'Amsterdam':       latLonToNormalized(52.370,    4.895),
  'Dublin':          latLonToNormalized(53.349,   -6.260),
  'Zurich':          latLonToNormalized(47.378,    8.540),
  'Stockholm':       latLonToNormalized(59.329,   18.069),
  'Barcelona':       latLonToNormalized(41.385,    2.173),
  'Rome':            latLonToNormalized(41.902,   12.496),
  'Vienna':          latLonToNormalized(48.209,   16.373),
  'Munich':          latLonToNormalized(48.137,   11.576),
  'Warsaw':          latLonToNormalized(52.229,   21.012),
  'Prague':          latLonToNormalized(50.075,   14.438),
  'Helsinki':        latLonToNormalized(60.169,   24.939),
  'Oslo':            latLonToNormalized(59.913,   10.752),
  'Copenhagen':      latLonToNormalized(55.676,   12.568),
  'Brussels':        latLonToNormalized(50.851,    4.352),
  'Lisbon':          latLonToNormalized(38.717,   -9.143),
  'Madrid':          latLonToNormalized(40.417,   -3.703),

  // ── Asia Pacific ───────────────────────────────────────────
  'Singapore':       latLonToNormalized(1.352,   103.820),
  'Tokyo':           latLonToNormalized(35.690,  139.692),
  'Shanghai':        latLonToNormalized(31.228,  121.474),
  'Beijing':         latLonToNormalized(39.905,  116.391),
  'Seoul':           latLonToNormalized(37.566,  126.978),
  'Sydney':          latLonToNormalized(-33.869, 151.209),
  'Melbourne':       latLonToNormalized(-37.814, 144.963),
  'Bangkok':         latLonToNormalized(13.756,  100.502),
  'Kuala Lumpur':    latLonToNormalized(3.140,   101.687),
  'Jakarta':         latLonToNormalized(-6.208,  106.846),
  'Ho Chi Minh':     latLonToNormalized(10.823,  106.630),
  'Manila':          latLonToNormalized(14.599,  120.984),
  'Taipei':          latLonToNormalized(25.048,  121.514),
  'Hong Kong':       latLonToNormalized(22.319,  114.170),
  'Shenzhen':        latLonToNormalized(22.543,  114.058),
  'Osaka':           latLonToNormalized(34.694,  135.502),

  // ── Middle East ────────────────────────────────────────────
  'Dubai':           latLonToNormalized(25.205,   55.270),
  'Abu Dhabi':       latLonToNormalized(24.453,   54.377),
  'Riyadh':          latLonToNormalized(24.688,   46.722),
  'Tel Aviv':        latLonToNormalized(32.085,   34.782),
  'Istanbul':        latLonToNormalized(41.015,   28.979),
  'Doha':            latLonToNormalized(25.286,   51.533),

  // ── Africa ─────────────────────────────────────────────────
  'Nairobi':         latLonToNormalized(-1.286,   36.817),
  'Lagos':           latLonToNormalized(6.455,     3.384),
  'Cairo':           latLonToNormalized(30.033,   31.233),
  'Cape Town':       latLonToNormalized(-33.926,  18.424),
  'Johannesburg':    latLonToNormalized(-26.195,  28.034),
  'Accra':           latLonToNormalized(5.556,    -0.197),

  // ── South America ──────────────────────────────────────────
  'São Paulo':       latLonToNormalized(-23.549, -46.633),
  'Buenos Aires':    latLonToNormalized(-34.603, -58.382),
  'Bogotá':          latLonToNormalized(4.711,   -74.073),
  'Lima':            latLonToNormalized(-12.046, -77.043),
  'Santiago':        latLonToNormalized(-33.459, -70.648),

  // ── Default ────────────────────────────────────────────────
  'Other':           { nx: 0.5, ny: 0.5 },
}

export function getCityCoordinates(city, country) {
  if (city    && cityCoordinates[city])    return cityCoordinates[city]
  if (country && cityCoordinates[country]) return cityCoordinates[country]
  return cityCoordinates['Other']
}