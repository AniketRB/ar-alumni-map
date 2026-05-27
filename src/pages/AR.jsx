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

/* ── Futuristic detection overlay ───────────────────────────── */
function DetectionOverlay() {
  const [phase, setPhase] = useState(0)
  const phases = ['MAP DETECTED', 'AUTHENTICATING NETWORK', 'LOADING ALUMNI DATA', 'RENDERING MAP']

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 380)
    const t2 = setTimeout(() => setPhase(2), 850)
    const t3 = setTimeout(() => setPhase(3), 1250)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,5,8,0.92)',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} />

      {/* Horizontal scan line sweeping top → bottom */}
      <motion.div
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.5, ease: 'linear' }}
        style={{
          position: 'absolute', left: 0, right: 0, height: 2, zIndex: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.8) 30%, rgba(34,211,238,1) 50%, rgba(99,102,241,0.8) 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(99,102,241,0.4)',
        }}
      />

      {/* Center HUD */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

        {/* Globe + radar rings */}
        <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1px solid ${i === 0 ? '#6366f1' : '#22d3ee'}`,
              }}
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: 3.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.25), rgba(99,102,241,0.15))',
              border: '1.5px solid rgba(99,102,241,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(99,102,241,0.5), inset 0 0 20px rgba(34,211,238,0.1)',
            }}
          >
            <Globe size={38} color="#22d3ee" />
          </motion.div>
        </div>

        {/* Cycling status text */}
        <div style={{ height: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: phase === 0 ? '#22d3ee' : '#818cf8',
                margin: 0,
              }}
            >
              {phases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}
          />
        </div>

        {/* Corner brackets */}
        {[
          { top: -52, left: -52, borderTop: '2px solid #22d3ee', borderLeft: '2px solid #22d3ee' },
          { top: -52, right: -52, borderTop: '2px solid #22d3ee', borderRight: '2px solid #22d3ee' },
          { bottom: -52, left: -52, borderBottom: '2px solid #22d3ee', borderLeft: '2px solid #22d3ee' },
          { bottom: -52, right: -52, borderBottom: '2px solid #22d3ee', borderRight: '2px solid #22d3ee' },
        ].map((style, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
            style={{ position: 'absolute', width: 18, height: 18, ...style }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Main AR Page ────────────────────────────────────────────── */
export default function AR() {
  const navigate = useNavigate()
  const {
    isInitializing, isMapFound, trackingLost, error,
    activeAlumni, demoMode,
    setActiveAlumni, clearActiveAlumni, setDemoMode,
    reset, setError,
  } = useARStore()

  const [alumni, setAlumni]         = useState(() => withFreshCoords(mockAlumni))
  const [rosterCity, setRosterCity] = useState(null)
  const [mapRevealed, setMapRevealed] = useState(false)
  const [scanKey, setScanKey]       = useState(0)

  /* load alumni */
  useEffect(() => {
    supabase.from('alumni').select('*')
      .eq('status', 'ACTIVE').eq('visibility', true)
      .then(({ data }) => { if (data?.length > 0) setAlumni(withFreshCoords(data)) })
  }, [])

  useEffect(() => () => reset(), [reset])

  /* demo mode → skip overlay, go straight to world map */
  useEffect(() => {
    if (demoMode) setMapRevealed(true)
  }, [demoMode])

  /* real scan: show overlay for 1.6s then reveal map
     deps: [isMapFound, mapRevealed] — mapRevealed in deps so cleanup
     runs when demo mode sets it first, preventing double-trigger */
  useEffect(() => {
    if (!isMapFound || mapRevealed) return
    const t = setTimeout(() => setMapRevealed(true), 1600)
    return () => clearTimeout(t)
  }, [isMapFound, mapRevealed])

  const handleRescan = useCallback(() => {
    setMapRevealed(false)
    reset()
    setError(null)
    setScanKey(k => k + 1)
  }, [reset, setError])

  const handleDemo = useCallback(() => {
    setError(null)
    setDemoMode(true)
  }, [setDemoMode, setError])

  const handleZoneClick = useCallback((cityAlumni) => {
    if (!cityAlumni?.length) return
    setRosterCity({ city: cityAlumni[0].city, country: cityAlumni[0].country, alumni: cityAlumni })
  }, [])

  const handleCityClick = useCallback((cityData) => {
    setRosterCity(cityData)
  }, [])

  const handleRosterAlumni = useCallback((a) => {
    setRosterCity(null)
    setActiveAlumni(a)
  }, [setActiveAlumni])

  return (
    <div className="ar-root">

      {/* ── Scanning phase ─────────────────────────────────────── */}
      {!mapRevealed && (
        <>
          <ARScene key={scanKey} alumni={alumni} onZoneClick={handleZoneClick} />
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

      {/* ── Futuristic detection overlay ───────────────────────── */}
      <AnimatePresence>
        {isMapFound && !mapRevealed && <DetectionOverlay key="detect" />}
      </AnimatePresence>

      {/* ── World map (portal reveal) ───────────────────────────── */}
      <AnimatePresence>
        {mapRevealed && <WorldMap key="map" alumni={alumni} onCityClick={handleCityClick} />}
      </AnimatePresence>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.9), transparent)',
        pointerEvents: 'none',
      }}>
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          style={{
            pointerEvents: 'auto', width: 40, height: 40, borderRadius: 12,
            background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#f1f5f9" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
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
            }}>DEMO</span>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          onClick={handleRescan}
          title={mapRevealed ? 'Rescan map' : 'Retry'}
          style={{
            pointerEvents: 'auto', width: 40, height: 40, borderRadius: 12,
            background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          {mapRevealed
            ? <ScanLine size={16} color="#6366f1" />
            : <RotateCcw size={16} color="#94a3b8" />}
        </motion.button>
      </div>

      {/* ── Panels ─────────────────────────────────────────────── */}
      <CityRoster rosterCity={rosterCity} onAlumniClick={handleRosterAlumni} onClose={() => setRosterCity(null)} />
      <ProfileCard alumni={activeAlumni} onClose={clearActiveAlumni} />
    </div>
  )
}
