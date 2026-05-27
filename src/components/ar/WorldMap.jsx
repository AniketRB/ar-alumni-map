import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker, Graticule } from 'react-simple-maps'
import { Users, MapPin, Globe } from 'lucide-react'

// Served locally — no CDN dependency
const GEO_URL = '/ar-assets/world-110m.json'

const BRAND = {
  Google: '#4285f4', Microsoft: '#00a4ef', Meta: '#0866ff',
  Apple: '#aaaaaa', Amazon: '#ff9900', Netflix: '#e50914',
  DeepMind: '#6366f1', Stripe: '#635bff', Uber: '#06b6d4',
  'Goldman Sachs': '#22c55e', 'Agnikul Cosmos': '#f97316',
  default: '#8b5cf6',
}

function dominantColor(list) {
  const counts = {}
  list.forEach(a => { counts[a.company] = (counts[a.company] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  return BRAND[top] ?? BRAND.default
}

function nxnyToLonLat(nx, ny) {
  const lon = nx * 360 - 180
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * ny))) * 180 / Math.PI
  return [lon, lat]
}

function buildCityGroups(alumni) {
  const map = {}
  alumni.forEach(a => {
    const key = `${a.city}__${a.country}`
    if (!map[key]) map[key] = { key, city: a.city, country: a.country, nx: a.nx, ny: a.ny, list: [] }
    map[key].list.push(a)
  })
  return Object.values(map)
}

function StatPill({ icon: Icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px' }}>
      <Icon size={12} color={color} />
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>{value}</span>
      <span style={{ fontSize: '0.72rem', color: '#475569' }}>{label}</span>
    </div>
  )
}

export default function WorldMap({ alumni, onCityClick }) {
  const cityGroups = useMemo(() => buildCityGroups(alumni), [alumni])
  const stats = useMemo(() => ({
    total:     alumni.length,
    cities:    cityGroups.length,
    countries: new Set(alumni.map(a => a.country)).size,
  }), [alumni, cityGroups])

  return (
    /* Outer wrapper: portal clip-path reveal */
    <motion.div
      key="world-map"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10,
        background: 'radial-gradient(ellipse 120% 80% at 50% 35%, #060d1f 0%, #050508 100%)',
      }}
    >
      {/* subtle grid */}
      <div
        className="bg-grid"
        style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}
      />

      {/* stats bar — fades in after the portal opens */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          position: 'absolute',
          top: 'max(68px, calc(env(safe-area-inset-top) + 60px))',
          left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          zIndex: 5, pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          background: 'rgba(5,5,8,0.88)',
          border: '1px solid rgba(99,102,241,0.22)',
          borderRadius: 999, backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}>
          <StatPill icon={Users}  value={stats.total}     label="Alumni"    color="#6366f1" />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
          <StatPill icon={MapPin} value={stats.cities}    label="Cities"    color="#22d3ee" />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
          <StatPill icon={Globe}  value={stats.countries} label="Countries" color="#a78bfa" />
        </div>
      </motion.div>

      {/* world map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [15, 25] }}
        width={800}
        height={500}
        style={{ width: '100%', height: '100%' }}
      >
        <Graticule stroke="rgba(99,102,241,0.05)" strokeWidth={0.5} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0b1628"
                stroke="#1a2744"
                strokeWidth={0.4}
                style={{
                  default: { outline: 'none' },
                  hover:   { fill: '#0e1f38', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {cityGroups.map((cg, i) => {
          if (!cg.nx || !cg.ny) return null
          if (Math.abs(cg.nx - 0.5) < 0.0001 && Math.abs(cg.ny - 0.5) < 0.0001) return null

          const [lon, lat] = nxnyToLonLat(cg.nx, cg.ny)
          const color = dominantColor(cg.list)
          const r = 5 + Math.min(Math.log2(cg.list.length + 1) * 2.5, 9)
          const count = cg.list.length

          return (
            <Marker key={cg.key} coordinates={[lon, lat]}>
              {/* Use opacity-only animation on SVG g — scale on SVG needs explicit
                  transformOrigin and behaves differently across browsers */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.06, duration: 0.4 }}
                onClick={() => onCityClick({ city: cg.city, country: cg.country, alumni: cg.list })}
                style={{ cursor: 'pointer' }}
              >
                <circle r={r * 3.0} fill={color} fillOpacity={0.04} />
                <circle r={r * 1.8} fill={color} fillOpacity={0.13} />
                <circle
                  r={r} fill={color} fillOpacity={0.92}
                  stroke="rgba(255,255,255,0.3)" strokeWidth={0.8}
                />
                <text
                  y={-r - 5} fontSize={7.5} fill="#94a3b8"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'system-ui, sans-serif' }}
                >
                  {cg.city}
                </text>
                {count > 1 && (
                  <text
                    y={r * 0.38} fontSize={r * 0.78} fill="#fff"
                    textAnchor="middle" fontWeight="800"
                    style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {count}
                  </text>
                )}
              </motion.g>
            </Marker>
          )
        })}
      </ComposableMap>

      {/* bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{
          position: 'absolute',
          bottom: 'max(28px, calc(env(safe-area-inset-bottom) + 20px))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, pointerEvents: 'none', whiteSpace: 'nowrap',
        }}
      >
        <div style={{
          padding: '8px 20px', borderRadius: 999,
          background: 'rgba(5,5,8,0.78)',
          border: '1px solid rgba(99,102,241,0.18)',
          backdropFilter: 'blur(10px)',
          fontSize: '0.77rem', color: '#475569',
        }}>
          Tap any city to explore alumni
        </div>
      </motion.div>
    </motion.div>
  )
}
