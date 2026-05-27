import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, RotateCcw, MapPin, Globe, ZoomIn } from 'lucide-react'
import ARScene     from '@/components/ar/ARScene'
import ScanningUI  from '@/components/ar/ScanningUI'
import ProfileCard from '@/components/ar/ProfileCard'
import CityRoster  from '@/components/ar/CityRoster'
import { useARStore } from '@/lib/store/arStore'
import { supabase } from '@/lib/supabase'
import { mockAlumni } from '@/data/mockAlumni'
import { getCityCoordinates } from '@/data/cityCoordinates'

/* ── Always recalculate nx/ny from city name ─────────────── */
function withFreshCoords(alumni) {
  return alumni.map((a) => {
    const coords = getCityCoordinates(a.city, a.country)
    return { ...a, nx: coords.nx, ny: coords.ny }
  })
}

/* ── Get unique cities from alumni list ──────────────────── */
function getCities(alumni) {
  const seen = new Set()
  const cities = []
  alumni.forEach((a) => {
    if (a.city && !seen.has(a.city)) {
      seen.add(a.city)
      cities.push({ city: a.city, country: a.country, count: alumni.filter(x => x.city === a.city).length })
    }
  })
  return cities.sort((a, b) => b.count - a.count)
}

/* ── City zoom chip button ───────────────────────────────── */
function CityChip({ city, count, isActive, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
        border: isActive
          ? '1.5px solid rgba(99,102,241,0.9)'
          : '1.5px solid rgba(255,255,255,0.12)',
        background: isActive
          ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.2))'
          : 'rgba(13,13,24,0.75)',
        backdropFilter: 'blur(12px)',
        color: isActive ? '#e0e7ff' : '#94a3b8',
        fontSize: '0.78rem', fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
      }}
    >
      {isActive ? <ZoomIn size={12} /> : <MapPin size={12} />}
      {city}
      <span style={{
        background: isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
        borderRadius: 999, padding: '1px 7px',
        fontSize: '0.7rem', fontWeight: 700,
        color: isActive ? '#c7d2fe' : '#64748b',
      }}>
        {count}
      </span>
    </motion.button>
  )
}

/* ── City selector bar ───────────────────────────────────── */
function CitySelector({ cities, focusedCity, onSelectCity, onWorldView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'absolute',
        bottom: 'max(80px, calc(env(safe-area-inset-bottom) + 70px))',
        left: 0, right: 0,
        zIndex: 25, padding: '0 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}
    >
      {/* label */}
      <div style={{
        fontSize: '0.7rem', color: '#64748b', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Zoom into city
      </div>

      {/* scrollable chip row */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', maxWidth: '100%',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {/* World view reset chip */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onWorldView}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
            border: !focusedCity
              ? '1.5px solid rgba(34,211,238,0.9)'
              : '1.5px solid rgba(255,255,255,0.12)',
            background: !focusedCity
              ? 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(99,102,241,0.2))'
              : 'rgba(13,13,24,0.75)',
            backdropFilter: 'blur(12px)',
            color: !focusedCity ? '#67e8f9' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600,
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: !focusedCity ? '0 0 16px rgba(34,211,238,0.3)' : 'none',
          }}
        >
          <Globe size={12} />
          World
        </motion.button>

        {cities.map(({ city, country, count }) => (
          <div key={city} style={{ flexShrink: 0 }}>
            <CityChip
              city={city}
              count={count}
              isActive={focusedCity === city}
              onClick={() => onSelectCity(city)}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── City zoom banner ────────────────────────────────────── */
function CityBanner({ city, alumniInCity, onClose }) {
  return (
    <motion.div
      key={city}
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        position: 'absolute',
        top: 'max(130px, calc(env(safe-area-inset-top) + 120px))',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 25, pointerEvents: 'auto',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.15))',
        border: '1.5px solid rgba(99,102,241,0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16, padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ZoomIn size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e0e7ff' }}>
            {city} View
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {alumniInCity} alumni · tap a pin to explore
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main AR Page ────────────────────────────────────────── */
export default function AR() {
  const navigate  = useNavigate()
  const {
    isInitializing, isMapFound, trackingLost, error,
    activeAlumni, demoMode,
    focusedCity, cityZoomMode,
    setActiveAlumni, clearActiveAlumni, setDemoMode,
    reset, setError, setFocusedCity,
  } = useARStore()

  const [alumni, setAlumni]         = useState(() => withFreshCoords(mockAlumni))
  const [rosterCity, setRosterCity] = useState(null)

  useEffect(() => {
    supabase
      .from('alumni')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('visibility', true)
      .then(({ data }) => {
        if (data && data.length > 0) setAlumni(withFreshCoords(data))
      })
  }, [])

  useEffect(() => () => reset(), [reset])

  // Auto-zoom: if all/most alumni are in one city, zoom in automatically after map is found
  useEffect(() => {
    if (!isMapFound || cityZoomMode) return
    const cities = getCities(alumni)
    if (cities.length === 1) {
      // all alumni in one city — auto zoom after a short delay
      const timer = setTimeout(() => setFocusedCity(cities[0].city), 1800)
      return () => clearTimeout(timer)
    }
    // if dominant city has >70% of alumni, auto zoom
    const total = alumni.length
    if (cities.length > 0 && cities[0].count / total > 0.7 && cities[0].count >= 2) {
      const timer = setTimeout(() => setFocusedCity(cities[0].city), 1800)
      return () => clearTimeout(timer)
    }
  }, [isMapFound, alumni, cityZoomMode, setFocusedCity])

  const cities = useMemo(() => getCities(alumni), [alumni])

  const handleZoneClick = useCallback((cityAlumni) => {
    if (!cityAlumni?.length) return
    setRosterCity({ city: cityAlumni[0].city, country: cityAlumni[0].country, alumni: cityAlumni })
  }, [])

  const handleRosterAlumni = useCallback((a) => {
    setRosterCity(null)
    setActiveAlumni(a)
  }, [setActiveAlumni])
  const handleRetry       = useCallback(() => { reset(); window.location.reload() }, [reset])
  const handleDemo        = useCallback(() => { setError(null); setDemoMode(true) }, [setDemoMode, setError])
  const handleSelectCity  = useCallback((city) => setFocusedCity(city), [setFocusedCity])
  const handleWorldView   = useCallback(() => setFocusedCity(null), [setFocusedCity])

  const alumniInFocused = focusedCity
    ? alumni.filter(a => a.city === focusedCity).length
    : 0

  return (
    <div className="ar-root">

      {/* AR canvas */}
      <ARScene alumni={alumni} onZoneClick={handleZoneClick} />

      {/* Scanning overlays */}
      <ScanningUI
        isInitializing={isInitializing}
        isMapFound={isMapFound}
        trackingLost={trackingLost}
        error={error}
        onRetry={handleRetry}
        onDemo={handleDemo}
      />

      {/* Top navbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 20, padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.85), transparent)',
        pointerEvents: 'none',
      }}>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(13,13,24,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#f1f5f9" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#6366f1,#22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={14} color="#fff" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>AR Alumni Map</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleRetry}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(13,13,24,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} color="#94a3b8" />
        </motion.button>
      </div>

      {/* HUD — alumni count + demo badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 8,
        }}
      >
        <div style={{
          padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6,
          borderRadius: 999, background: 'rgba(13,13,24,0.75)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}>
          <Users size={11} color="#6366f1" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            {alumni.length} Alumni
          </span>
        </div>
        {demoMode && (
          <div style={{
            padding: '5px 12px', borderRadius: 999,
            background: 'rgba(13,13,24,0.75)',
            border: '1px solid rgba(251,191,36,0.35)',
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>DEMO</span>
          </div>
        )}
      </motion.div>

      {/* City zoom banner — shown when zoomed in */}
      <AnimatePresence>
        {isMapFound && cityZoomMode && focusedCity && (
          <CityBanner
            city={focusedCity}
            alumniInCity={alumniInFocused}
            onClose={handleWorldView}
          />
        )}
      </AnimatePresence>

      {/* City selector — shown after map found */}
      <AnimatePresence>
        {isMapFound && cities.length > 0 && !activeAlumni && (
          <CitySelector
            cities={cities}
            focusedCity={focusedCity}
            onSelectCity={handleSelectCity}
            onWorldView={handleWorldView}
          />
        )}
      </AnimatePresence>

      {/* Bottom tip — only in world view */}
      <AnimatePresence>
        {isMapFound && !cityZoomMode && !activeAlumni && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: 'max(28px, env(safe-area-inset-bottom))',
              left: '50%', transform: 'translateX(-50%)',
              zIndex: 20, pointerEvents: 'none',
            }}
          >
            <div style={{
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(13,13,24,0.7)',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: '0.77rem', color: '#64748b' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>{alumni.length} alumni</span>
                {' '}pinned · tap any marker
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CityRoster
        rosterCity={rosterCity}
        onAlumniClick={handleRosterAlumni}
        onClose={() => setRosterCity(null)}
      />

      <ProfileCard alumni={activeAlumni} onClose={clearActiveAlumni} />
    </div>
  )
}