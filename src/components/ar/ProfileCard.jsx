import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, GraduationCap, Award, ExternalLink } from 'lucide-react'

function LinkedinIcon({ size = 16, color = '#0a66c2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

/* ── Avatar with initials ─────────────────────────────────── */
function Avatar({ name, company, size = 72 }) {
  const hue = name.charCodeAt(0) * 7 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: `linear-gradient(135deg, hsl(${hue},65%,45%), hsl(${hue + 60},65%,55%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0,
      boxShadow: `0 8px 24px hsla(${hue},65%,45%,0.4)`,
    }}>
      {name.charAt(0)}
    </div>
  )
}

/* ── Company badge ────────────────────────────────────────── */
function CompanyBadge({ company }) {
  const BRAND_COLORS = {
    Google: '#4285f4', Microsoft: '#00a4ef', Meta: '#0866ff', Apple: '#a8a9ad',
    Amazon: '#ff9900', Netflix: '#e50914', DeepMind: '#6366f1', Stripe: '#635bff',
    Uber: '#000', Grab: '#00b14f',
  }
  const color = BRAND_COLORS[company] || '#6366f1'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem',
      fontWeight: 700, letterSpacing: '0.02em',
      background: `${color}20`, border: `1px solid ${color}40`, color,
    }}>
      <Briefcase size={10} />
      {company}
    </span>
  )
}

/* ── Career timeline ──────────────────────────────────────── */
function CareerTimeline({ path }) {
  if (!path?.length) return null
  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
        Career Journey
      </h4>
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        {/* vertical line */}
        <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 1, background: 'rgba(99,102,241,0.2)' }} />

        {path.map((step, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: i < path.length - 1 ? 16 : 0 }}>
            {/* dot */}
            <div style={{
              position: 'absolute', left: -18, top: 4,
              width: 9, height: 9, borderRadius: '50%',
              background: i === path.length - 1 ? '#6366f1' : '#334155',
              border: `2px solid ${i === path.length - 1 ? '#818cf8' : '#1e293b'}`,
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{step.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#6366f1', marginTop: 1 }}>{step.company}</div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#475569', flexShrink: 0, marginTop: 2 }}>{step.year}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Achievement tags ─────────────────────────────────────── */
function Achievements({ list }) {
  if (!list?.length) return null
  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
        Achievements
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {list.map((a, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: '0.75rem', color: '#fbbf24', fontWeight: 500,
          }}>
            <Award size={10} />
            {a}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Main Profile Card ────────────────────────────────────── */
export default function ProfileCard({ alumni, onClose }) {
  return (
    <AnimatePresence>
      {alumni && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 30,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* card */}
          <motion.div
            key="card"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 40, maxHeight: '85vh',
              background: '#0d0d18',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* drag handle */}
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* scrollable body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 24px 40px' }}>

              {/* header: avatar + name + close */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                <Avatar name={alumni.full_name} company={alumni.company} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
                    {alumni.full_name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 3 }}>
                    {alumni.role}
                  </p>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <CompanyBadge company={alumni.company} />
                    <span style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <GraduationCap size={11} />
                      Batch {alumni.batch_year} · {alumni.department}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <X size={16} color="#94a3b8" />
                </button>
              </div>

              {/* divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

              {/* location */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <MapPin size={14} color="#6366f1" />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {alumni.city}, {alumni.country}
                </span>
              </div>

              {/* bio */}
              {alumni.bio && (
                <p style={{
                  fontSize: '0.875rem', color: '#94a3b8',
                  lineHeight: 1.7, marginBottom: 0,
                }}>
                  {alumni.bio}
                </p>
              )}

              {/* career timeline */}
              <CareerTimeline path={alumni.career_path} />

              {/* achievements */}
              <Achievements list={alumni.achievements} />

              {/* LinkedIn */}
              {alumni.linkedin_url && (
                <a
                  href={alumni.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ marginTop: 24, width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 14, gap: 8 }}
                >
                  <LinkedinIcon size={16} color="#0a66c2" />
                  <span>View LinkedIn Profile</span>
                  <ExternalLink size={13} color="#475569" />
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
