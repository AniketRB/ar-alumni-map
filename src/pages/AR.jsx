import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, RotateCcw, ScanLine, Globe } from 'lucide-react'
import ARScene     from '@/components/ar/ARScene'
import ScanningUI  from '@/components/ar/ScanningUI'
import ProfileCard from '@/components/ar/ProfileCard'
import CityRoster  from '@/components/ar/CityRoster'
import WorldMap    from '@/components/ar/WorldMap'
import { useARStore } from '@/lib/store/arStore'
import { supabase } from '@/lib/supabase'
import { mockAlumni } from '@/data/mockAlumni'
import { getCityCoordinates } from '@/data/cityCoordinates'

function withFreshCoords(alumni) {
  return alumni.map((a) => {
    const coords = getCityCoordinates(a.city, a.country)
    return { ...a, nx: coords.nx, ny: coords.ny }
  })
}

/* ── Detection overlay shown between scan and map reveal ──── */
function DetectionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,5,8,0.7)', backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.1))',
          border: '1.5px solid rgba(99,102,241,0.55)',
          borderRadius: 24, padding: '32px 44px',
          textAlign: 'center', backdropFilter: 'blur(20px)',
          boxShadow: '0 0 80px rgba(99,102,241,0.22)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}
        >
          <Globe size={48} color="#6366f1" />
        </motion.div>
        <div style={{ color: '#e0e7ff', fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>
          Map Detected!
        </div>
        <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 18 }}>
          Rendering alumni network…
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[0, 0.18, 0.36].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.6, 1], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.9, repeat: Infinity, delay }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Main AR Page ────────────────────────────────────────── */
export default function AR() {
  const navigate = useNavigate()
  const {
    isInitializing, isMapFound, trackingLost, error,
    activeAlumni, demoMode,
    setActiveAlumni, clearActiveAlumni, setDemoMode,
    reset, setError,
  } = useARStore()

  const [alumni, setAlumni]           = useState(() => withFreshCoords(mockAlumni))
  const [rosterCity, setRosterCity]   = useState(null)
  const [mapDetected, setMapDetected] = useState(false)
  const [mapRevealed, setMapRevealed] = useState(false)
  const [scanKey, setScanKey]         = useState(0)

  /* load alumni */
  useEffect(() => {
    supabase
      .from('alumni').select('*')
      .eq('status', 'ACTIVE').eq('visibility', true)
      .then(({ data }) => { if (data?.length > 0) setAlumni(withFreshCoords(data)) })
  }, [])

  useEffect(() => () => reset(), [reset])

  /* demo mode → skip straight to world map */
  useEffect(() => {
    if (demoMode) { setMapDetected(true); setMapRevealed(true) }
  }, [demoMode])

  /* real scan: detected → brief overlay → reveal */
  useEffect(() => {
    if (isMapFound && !mapDetected) {
      setMapDetected(true)
      const t = setTimeout(() => setMapRevealed(true), 1600)
      return () => clearTimeout(t)
    }
  }, [isMapFound, mapDetected])

  const handleRescan = useCallback(() => {
    setMapDetected(false)
    setMapRevealed(false)
    reset()
    setError(null)
    setScanKey(k => k + 1)
  }, [reset, setError])

  const handleDemo = useCallback(() => {
    setError(null)
    setDemoMode(true)
  }, [setDemoMode, setError])

  const handleCityClick = useCallback((cityData) => {
    setRosterCity(cityData)
  }, [])

  const handleRosterAlumni = useCallback((a) => {
    setRosterCity(null)
    setActiveAlumni(a)
  }, [setActiveAlumni])

  return (
    <div className="ar-root">

      {/* ── Scanning phase (hidden once map revealed) ──────── */}
      {!mapRevealed && (
        <>
          <ARScene key={scanKey} alumni={alumni} onZoneClick={() => {}} />
          <ScanningUI
            isInitializing={isInitializing}
            isMapFound={isMapFound}
            trackingLost={trackingLost}
            error={error}
            onRetry={handleRescan}
            onDemo={handleDemo}
          />
        </>
      )}

      {/* ── Detection overlay (between scan + reveal) ──────── */}
      <AnimatePresence>
        {mapDetected && !mapRevealed && <DetectionOverlay />}
      </AnimatePresence>

      {/* ── World map (shown after detection) ──────────────── */}
      <AnimatePresence>
        {mapRevealed && (
          <WorldMap alumni={alumni} onCityClick={handleCityClick} />
        )}
      </AnimatePresence>

      {/* ── Navbar (always on top) ─────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 60, padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.9), transparent)',
        pointerEvents: 'none',
      }}>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(255,255,255,0.1)',
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
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={14} color="#fff" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>
            {mapRevealed ? 'Alumni Network' : 'AR Alumni Map'}
          </span>
          {demoMode && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, color: '#fbbf24',
              padding: '2px 7px', borderRadius: 999,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
            }}>
              DEMO
            </span>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={mapRevealed ? handleRescan : handleRescan}
          title={mapRevealed ? 'Rescan map' : 'Retry'}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          {mapRevealed
            ? <ScanLine size={16} color="#6366f1" />
            : <RotateCcw size={16} color="#94a3b8" />
          }
        </motion.button>
      </div>

      {/* ── City roster + profile card ──────────────────────── */}
      <CityRoster
        rosterCity={rosterCity}
        onAlumniClick={handleRosterAlumni}
        onClose={() => setRosterCity(null)}
      />

      <ProfileCard alumni={activeAlumni} onClose={clearActiveAlumni} />
    </div>
  )
}
