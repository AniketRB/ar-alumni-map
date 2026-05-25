import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, RotateCcw, MapPin } from 'lucide-react'
import ARScene     from '@/components/ar/ARScene'
import ScanningUI  from '@/components/ar/ScanningUI'
import ProfileCard from '@/components/ar/ProfileCard'
import { useARStore } from '@/lib/store/arStore'
import { supabase } from '@/lib/supabase'
import { mockAlumni } from '@/data/mockAlumni'

/* ── Heads-up info strip ──────────────────────────────────── */
function HUD({ alumniCount, isMapFound, demoMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, pointerEvents: 'none', display: 'flex', gap: 10,
      }}
    >
      <div className="glass" style={{
        padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 7,
        borderRadius: 999,
      }}>
        <Users size={12} color="#94a3b8" />
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
          {alumniCount} Alumni
        </span>
      </div>

      {demoMode && (
        <div className="glass" style={{
          padding: '6px 14px', borderRadius: 999,
          border: '1px solid rgba(251,191,36,0.3)',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>DEMO MODE</span>
        </div>
      )}
    </motion.div>
  )
}

/* ── Main AR Page ─────────────────────────────────────────── */
export default function AR() {
  const navigate  = useNavigate()
  const {
    isInitializing, isMapFound, trackingLost, error,
    activeAlumni, demoMode,
    setActiveAlumni, clearActiveAlumni, setDemoMode, reset, setError,
  } = useARStore()

  // start with mock data so camera opens immediately — replaced with real data if Supabase has alumni
  const [alumni, setAlumni] = useState(mockAlumni)

  useEffect(() => {
    supabase
      .from('alumni')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('visibility', true)
      .then(({ data }) => { if (data && data.length > 0) setAlumni(data) })
  }, [])

  // clean up AR state when leaving
  useEffect(() => () => reset(), [reset])

  const handleMarkerClick = useCallback((alum) => {
    setActiveAlumni(alum)
  }, [setActiveAlumni])

  const handleRetry = useCallback(() => {
    reset()
    window.location.reload()
  }, [reset])

  const handleDemo = useCallback(() => {
    setError(null)
    setDemoMode(true)
  }, [setDemoMode, setError])

  return (
    <div style={{
      position: 'fixed', inset: 0, width: '100vw', height: '100dvh',
      background: '#000', overflow: 'hidden',
    }}>

      {/* ── AR canvas — always mounts so camera starts immediately ── */}
      <ARScene
        alumni={alumni}
        onMarkerClick={handleMarkerClick}
      />

      {/* ── Scanning UI overlays ──────────────────────── */}
      <ScanningUI
        isInitializing={isInitializing}
        isMapFound={isMapFound}
        trackingLost={trackingLost}
        error={error}
        onRetry={handleRetry}
        onDemo={handleDemo}
      />

      {/* ── Top navbar bar ────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 20, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.8), transparent)',
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} color="#94a3b8" />
        </motion.button>
      </div>

      {/* ── HUD info strip ────────────────────────────── */}
      <HUD alumniCount={alumni.length} isMapFound={isMapFound} demoMode={demoMode} />

      {/* ── Alumni count badge (bottom left, when tracking) ── */}
      <AnimatePresence>
        {isMapFound && !activeAlumni && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
              zIndex: 20, pointerEvents: 'none', textAlign: 'center',
            }}
          >
            <div className="glass" style={{
              padding: '10px 20px', borderRadius: 999,
              border: '1px solid rgba(99,102,241,0.25)',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>{alumni.length} alumni</span>
                {' '}are pinned on this map — tap any marker
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile card slide-up ─────────────────────── */}
      <ProfileCard alumni={activeAlumni} onClose={clearActiveAlumni} />
    </div>
  )
}
