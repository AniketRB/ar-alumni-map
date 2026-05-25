import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

/* ── Corner bracket SVG ───────────────────────────────────── */
function CornerBracket({ position }) {
  const styles = {
    'top-left':     { top: 0,    left: 0,    transform: 'none' },
    'top-right':    { top: 0,    right: 0,   transform: 'scaleX(-1)' },
    'bottom-left':  { bottom: 0, left: 0,    transform: 'scaleY(-1)' },
    'bottom-right': { bottom: 0, right: 0,   transform: 'scale(-1,-1)' },
  }
  return (
    <div style={{ position: 'absolute', width: 28, height: 28, ...styles[position] }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 L2 2 L14 2" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ── Scan area overlay ────────────────────────────────────── */
function ScanArea() {
  return (
    <div style={{
      position: 'relative', width: 'min(280px, 80vw)', height: 'min(160px, 45vw)',
    }}>
      {/* dimmed border frame */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8,
      }} />

      {/* animated corners */}
      {['top-left','top-right','bottom-left','bottom-right'].map((pos) => (
        <motion.div
          key={pos}
          style={{ position: 'absolute', width: 28, height: 28,
            ...pos.includes('top')    ? { top: -1 }    : { bottom: -1 },
            ...pos.includes('left')   ? { left: -1 }   : { right: -1 },
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: pos === 'top-right' ? 0.4 : pos === 'bottom-left' ? 0.8 : pos === 'bottom-right' ? 1.2 : 0 }}
        >
          <CornerBracket position={pos} />
        </motion.div>
      ))}

      {/* scan line */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 8 }}>
        <motion.div
          style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #6366f1, #22d3ee, #6366f1, transparent)',
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* ── Tracking found pulse ─────────────────────────────────── */
function TrackingPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
    >
      <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', borderRadius: '50%',
              border: '2px solid rgba(34,211,238,0.4)',
              width: 64, height: 64,
            }}
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
          />
        ))}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(34,211,238,0.6)',
        }}>
          <MapPin size={18} color="#fff" />
        </div>
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#22d3ee', letterSpacing: '0.05em' }}>
        MAP DETECTED
      </span>
    </motion.div>
  )
}

/* ── Main Scanning UI ─────────────────────────────────────── */
export default function ScanningUI({ isInitializing, isMapFound, trackingLost, error, onRetry, onDemo }) {
  return (
    <AnimatePresence>
      {!isMapFound && !error && (
        <motion.div
          key="scanning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,5,8,0.5)',
            backdropFilter: 'blur(2px)',
            gap: 28,
            pointerEvents: trackingLost ? 'none' : 'auto',
          }}
        >
          {/* top label */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: '0.75rem', color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              fontWeight: 600,
            }}
          >
            {isInitializing ? 'Loading AR Engine...' : 'Scan the Alumni Map'}
          </motion.div>

          {/* scan area or loading spinner */}
          {isInitializing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={40} color="#6366f1" />
            </motion.div>
          ) : (
            <ScanArea />
          )}

          {/* instruction text */}
          {!isInitializing && (
            <div style={{ textAlign: 'center', maxWidth: 260 }}>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>
                Hold map in view
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Keep the map flat and well-lit. Hold your phone 40–60 cm away.
              </p>
            </div>
          )}

          {/* demo mode button */}
          {!isInitializing && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              onClick={onDemo}
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '8px 18px' }}
            >
              Try Demo Mode (no map needed)
            </motion.button>
          )}
        </motion.div>
      )}

      {/* tracking found banner */}
      {isMapFound && (
        <motion.div
          key="found"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, pointerEvents: 'none',
          }}
        >
          <div className="glass-bright" style={{
            padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
            borderColor: 'rgba(34,211,238,0.3)',
          }}>
            <motion.div
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#22d3ee' }}>
              Map Locked · Tap pins to explore
            </span>
          </div>
        </motion.div>
      )}

      {/* tracking lost overlay */}
      {trackingLost && isMapFound && (
        <motion.div
          key="lost"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,5,8,0.65)',
          }}
        >
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ marginBottom: 8 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <AlertTriangle size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
              </motion.div>
            </div>
            <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>Tracking lost</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Point camera back at the map</p>
          </div>
        </motion.div>
      )}

      {/* error state */}
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,5,8,0.9)', gap: 20, padding: 32,
          }}
        >
          <AlertTriangle size={40} color="#f87171" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 8 }}>
              {error.includes('permission') ? 'Camera Permission Denied' : 'AR Failed to Start'}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 280 }}>
              {error.includes('permission')
                ? 'Please allow camera access in your browser settings and reload the page.'
                : error}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={onRetry} style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
              <RefreshCw size={16} /> Retry
            </button>
            <button className="btn btn-ghost" onClick={onDemo} style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
              Demo Mode
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
