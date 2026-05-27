/**
 * City coordinates using Web Mercator projection.
 *
 * The .mind file is compiled from a standard web/Mercator map image
 * (Google Maps, Natural Earth tiles etc.) so we MUST use Mercator math.
 *
 * Mercator formulas:
 *   nx = (lon + 180) / 360
 *   ny = (1 - ln(tan(π/4 + lat·π/360)) / π) / 2
 *
 * ny is clamped to [0,1] using ±85.051° (standard Web Mercator limit).
 */

function mercator(lat, lon) {
  const nx    = (lon + 180) / 360
  const latR  = lat * Math.PI / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latR / 2))
  // Mercator maps span ±85.051° → mercN range ≈ ±π
  const ny    = (1 - mercN / Math.PI) / 2
  return { nx, ny }
}

export const cityCoordinates = {
  // ── India ─────────────────────────────────────────────────
  'Pune':            mercator(18.520,  73.856),
  'Mumbai':          mercator(19.076,  72.878),
  'Delhi':           mercator(28.614,  77.209),
  'New Delhi':       mercator(28.614,  77.209),
  'Bangalore':       mercator(12.972,  77.594),
  'Bengaluru':       mercator(12.972,  77.594),
  'Hyderabad':       mercator(17.385,  78.487),
  'Chennai':         mercator(13.083,  80.270),
  'Kolkata':         mercator(22.573,  88.364),
  'Ahmedabad':       mercator(23.022,  72.571),
  'Jaipur':          mercator(26.913,  75.787),
  'Surat':           mercator(21.170,  72.831),
  'Lucknow':         mercator(26.847,  80.947),
  'Kanpur':          mercator(26.449,  80.331),
  'Nagpur':          mercator(21.146,  79.089),
  'Indore':          mercator(22.719,  75.857),
  'Bhopal':          mercator(23.259,  77.413),
  'Patna':           mercator(25.594,  85.138),
  'Vadodara':        mercator(22.307,  73.181),
  'Coimbatore':      mercator(11.017,  76.966),
  'Visakhapatnam':   mercator(17.686,  83.218),
  'Kochi':           mercator( 9.939,  76.270),
  'Chandigarh':      mercator(30.740,  76.779),
  'Mysuru':          mercator(12.296,  76.639),
  'Noida':           mercator(28.535,  77.391),
  'Gurgaon':         mercator(28.459,  77.026),
  'Gurugram':        mercator(28.459,  77.026),

  // ── North America ──────────────────────────────────────────
  'New York':        mercator(40.713,  -74.006),
  'Los Angeles':     mercator(34.052, -118.244),
  'Chicago':         mercator(41.878,  -87.630),
  'Toronto':         mercator(43.651,  -79.347),
  'Vancouver':       mercator(49.246, -123.116),
  'San Francisco':   mercator(37.774, -122.419),
  'Boston':          mercator(42.360,  -71.059),
  'Seattle':         mercator(47.606, -122.332),
  'Austin':          mercator(30.267,  -97.743),
  'Miami':           mercator(25.762,  -80.192),
  'Washington':      mercator(38.907,  -77.037),
  'Atlanta':         mercator(33.749,  -84.388),
  'Denver':          mercator(39.739, -104.984),
  'Mexico City':     mercator(19.433,  -99.133),

  // ── Europe ─────────────────────────────────────────────────
  'London':          mercator(51.507,   -0.128),
  'Paris':           mercator(48.857,    2.351),
  'Berlin':          mercator(52.520,   13.405),
  'Amsterdam':       mercator(52.370,    4.895),
  'Dublin':          mercator(53.349,   -6.260),
  'Zurich':          mercator(47.378,    8.540),
  'Stockholm':       mercator(59.329,   18.069),
  'Barcelona':       mercator(41.385,    2.173),
  'Rome':            mercator(41.902,   12.496),
  'Vienna':          mercator(48.209,   16.373),
  'Munich':          mercator(48.137,   11.576),
  'Warsaw':          mercator(52.229,   21.012),
  'Prague':          mercator(50.075,   14.438),
  'Helsinki':        mercator(60.169,   24.939),
  'Oslo':            mercator(59.913,   10.752),
  'Copenhagen':      mercator(55.676,   12.568),
  'Brussels':        mercator(50.851,    4.352),
  'Lisbon':          mercator(38.717,   -9.143),
  'Madrid':          mercator(40.417,   -3.703),

  // ── Asia Pacific ───────────────────────────────────────────
  'Singapore':       mercator( 1.352,  103.820),
  'Tokyo':           mercator(35.690,  139.692),
  'Shanghai':        mercator(31.228,  121.474),
  'Beijing':         mercator(39.905,  116.391),
  'Seoul':           mercator(37.566,  126.978),
  'Sydney':          mercator(-33.869, 151.209),
  'Melbourne':       mercator(-37.814, 144.963),
  'Bangkok':         mercator(13.756,  100.502),
  'Kuala Lumpur':    mercator( 3.140,  101.687),
  'Jakarta':         mercator(-6.208,  106.846),
  'Ho Chi Minh':     mercator(10.823,  106.630),
  'Manila':          mercator(14.599,  120.984),
  'Taipei':          mercator(25.048,  121.514),
  'Hong Kong':       mercator(22.319,  114.170),
  'Shenzhen':        mercator(22.543,  114.058),
  'Osaka':           mercator(34.694,  135.502),

  // ── Middle East ────────────────────────────────────────────
  'Dubai':           mercator(25.205,   55.270),
  'Abu Dhabi':       mercator(24.453,   54.377),
  'Riyadh':          mercator(24.688,   46.722),
  'Tel Aviv':        mercator(32.085,   34.782),
  'Istanbul':        mercator(41.015,   28.979),
  'Doha':            mercator(25.286,   51.533),

  // ── Africa ─────────────────────────────────────────────────
  'Nairobi':         mercator(-1.286,   36.817),
  'Lagos':           mercator( 6.455,    3.384),
  'Cairo':           mercator(30.033,   31.233),
  'Cape Town':       mercator(-33.926,  18.424),
  'Johannesburg':    mercator(-26.195,  28.034),
  'Accra':           mercator( 5.556,   -0.197),

  // ── South America ──────────────────────────────────────────
  'São Paulo':       mercator(-23.549, -46.633),
  'Buenos Aires':    mercator(-34.603, -58.382),
  'Bogotá':          mercator( 4.711,  -74.073),
  'Lima':            mercator(-12.046, -77.043),
  'Santiago':        mercator(-33.459, -70.648),

  'Other': { nx: 0.5, ny: 0.5 },
}

export function getCityCoordinates(city, country) {
  if (city    && cityCoordinates[city])    return cityCoordinates[city]
  if (country && cityCoordinates[country]) return cityCoordinates[country]
  return cityCoordinates['Other']
}