import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { feature } from 'topojson-client'
import { Users, MapPin, Globe } from 'lucide-react'

const W = 800
const H = 500

/* Mercator lon/lat → SVG x/y — matches the nx/ny formula in cityCoordinates.js */
function toXY(lon, lat) {
  const x = (lon + 180) / 360 * W
  const φ = Math.min(Math.max(lat, -85.05), 85.05) * Math.PI / 180
  const y = (1 - Math.log(Math.tan(Math.PI / 4 + φ / 2)) / Math.PI) / 2 * H
  return [isFinite(x) ? x : 0, isFinite(y) ? y : 0]
}

function ringToPath(ring) {
  return ring.map(([lon, lat], i) => {
    const [x, y] = toXY(lon, lat)
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join('') + 'Z'
}

function featureToPath(feat) {
  const geom = feat?.geometry
  if (!geom) return ''
  if (geom.type === 'Polygon')
    return geom.coordinates.map(ringToPath).join('')
  if (geom.type === 'MultiPolygon')
    return geom.coordinates.map(poly => poly.map(ringToPath).join('')).join('')
  return ''
}

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
  const [countries, setCountries] = useState([])

  useEffect(() => {
    fetch('/ar-assets/world-110m.json')
      .then(r => r.json())
      .then(topo => {
        const obj = topo.objects[Object.keys(topo.objects)[0]]
        const { features } = feature(topo, obj)
        setCountries(features)
      })
      .catch(err => console.warn('[WorldMap] geo load failed:', err))
  }, [])

  const cityGroups = useMemo(() => buildCityGroups(alumni), [alumni])
  const stats = useMemo(() => ({
    total:     alumni.length,
    cities:    cityGroups.length,
    countries: new Set(alumni.map(a => a.country)).size,
  }), [alumni, cityGroups])

  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10,
        background: '#060d1f',
      }}
    >
      {/* subtle grid */}
      <div
        className="bg-grid"
        style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none', zIndex: 1 }}
      />

      {/* stats bar */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          position: 'absolute',
          top: 'max(68px, calc(env(safe-area-inset-top) + 60px))',
          left: 0, right: 0, zIndex: 5,
          display: 'flex', justifyContent: 'center',
          pointerEvents: 'none',
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

      {/* SVG world map — pure topojson + custom Mercator, no library */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ocean */}
        <rect width={W} height={H} fill="#060d1f" />

        {/* country fills */}
        {countries.map((feat, i) => {
          const d = featureToPath(feat)
          if (!d) return null
          return (
            <path
              key={i}
              d={d}
              fill="#0b1628"
              stroke="#1e3a5f"
              strokeWidth={0.4}
              fillRule="evenodd"
            />
          )
        })}

        {/* city markers — nx/ny maps directly to (nx*W, ny*H) */}
        {cityGroups.map((cg, i) => {
          if (!cg.nx || !cg.ny) return null
          if (Math.abs(cg.nx - 0.5) < 0.0001 && Math.abs(cg.ny - 0.5) < 0.0001) return null

          const x = cg.nx * W
          const y = cg.ny * H
          const color = dominantColor(cg.list)
          const r = 5 + Math.min(Math.log2(cg.list.length + 1) * 2.5, 9)
          const count = cg.list.length

          return (
            <motion.g
              key={cg.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.06, duration: 0.4 }}
              onClick={() => onCityClick({ city: cg.city, country: cg.country, alumni: cg.list })}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={r * 3}   fill={color} fillOpacity={0.05} />
              <circle cx={x} cy={y} r={r * 1.8} fill={color} fillOpacity={0.13} />
              <circle cx={x} cy={y} r={r}        fill={color} fillOpacity={0.92}
                stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
              <text
                x={x} y={y - r - 5}
                fontSize={7.5} fill="#94a3b8" textAnchor="middle"
                style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'system-ui, sans-serif' }}
              >
                {cg.city}
              </text>
              {count > 1 && (
                <text
                  x={x} y={y + r * 0.38}
                  fontSize={r * 0.78} fill="#fff" textAnchor="middle" fontWeight="800"
                  style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'system-ui, sans-serif' }}
                >
                  {count}
                </text>
              )}
            </motion.g>
          )
        })}
      </svg>

      {/* bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{
          position: 'absolute', zIndex: 5,
          bottom: 'max(28px, calc(env(safe-area-inset-bottom) + 20px))',
          left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
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
