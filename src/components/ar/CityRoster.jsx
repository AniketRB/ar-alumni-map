import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ChevronRight } from 'lucide-react'

const BRAND_COLORS = {
  Google: '#4285f4', Microsoft: '#00a4ef', Meta: '#0866ff', Apple: '#a8a9ad',
  Amazon: '#ff9900', Netflix: '#e50914', DeepMind: '#6366f1', Stripe: '#635bff',
  Uber: '#06b6d4', 'Goldman Sachs': '#22c55e', 'Agnikul Cosmos': '#f97316',
}

function MiniAvatar({ name, size = 48, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size, height: size, borderRadius: size * 0.25,
          objectFit: 'cover', flexShrink: 0,
        }}
      />
    )
  }
  const hue = name.charCodeAt(0) * 7 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},60%,42%), hsl(${hue + 60},60%,52%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 800, color: '#fff',
    }}>
      {name.charAt(0)}
    </div>
  )
}

export default function CityRoster({ rosterCity, onAlumniClick, onClose }) {
  return (
    <AnimatePresence>
      {rosterCity && (
        <>
          <motion.div
            key="roster-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 30,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            }}
          />

          <motion.div
            key="roster-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
              maxHeight: '72svh', background: '#0d0d18',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* drag handle */}
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* header */}
            <div style={{
              padding: '8px 20px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(34,211,238,0.15))',
                  border: '1px solid rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin size={14} color="#818cf8" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                    {rosterCity.city}
                  </h2>
                  {rosterCity.country && (
                    <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                      {rosterCity.country}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 999, flexShrink: 0,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  fontSize: '0.72rem', fontWeight: 700, color: '#818cf8',
                }}>
                  {rosterCity.alumni.length} alumni
                </span>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <X size={16} color="#94a3b8" />
              </button>
            </div>

            {/* list */}
            <div style={{
              overflowY: 'auto', flex: 1,
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            }}>
              {rosterCity.alumni.map((alum, i) => {
                const brandColor = BRAND_COLORS[alum.company] || '#6366f1'
                return (
                  <motion.button
                    key={alum.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onAlumniClick(alum)}
                    style={{
                      width: '100%', padding: '14px 20px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <MiniAvatar name={alum.full_name} avatarUrl={alum.avatar_url} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>
                        {alum.full_name}
                      </div>
                      <div style={{
                        fontSize: '0.78rem', color: '#94a3b8',
                        display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
                      }}>
                        <span>{alum.role}</span>
                        <span style={{ color: '#1e293b' }}>·</span>
                        <span style={{ color: brandColor, fontWeight: 600 }}>{alum.company}</span>
                      </div>
                    </div>

                    <ChevronRight size={16} color="#334155" style={{ flexShrink: 0 }} />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
