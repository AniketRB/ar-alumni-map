import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { MapPin, Users, Globe, Zap, Camera, ChevronRight, Star, ArrowRight } from 'lucide-react'
import { mockAlumni } from '@/data/mockAlumni'

/* ── Animated particle canvas background ─────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let frame, particles = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    const makeParticle = () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.5 + 0.3,
      dx:   (Math.random() - 0.5) * 0.3,
      dy:   (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
    })

    resize()
    particles = Array.from({ length: 120 }, makeParticle)
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x
          const dy   = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.6
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`
        ctx.fill()
      })

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

/* ── Animated counter ─────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref               = useRef(null)
  const inView            = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start     = 0
    const step    = Math.ceil(target / 60)
    const timer   = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── Alumni avatar card (floating) ───────────────────────── */
function FloatingCard({ alumni, delay, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{ delay, duration: 0.5, y: { duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
      className="glass-bright"
      style={{ padding: '10px 14px', flexShrink: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, hsl(${index * 60},70%,50%), hsl(${index * 60 + 60},70%,60%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {alumni.full_name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>{alumni.full_name}</div>
          <div style={{ fontSize: 10, color: '#6366f1' }}>{alumni.company}</div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Feature card ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass"
      style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={22} color={color} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>{desc}</p>

      {/* corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </motion.div>
  )
}

/* ── Stat box ─────────────────────────────────────────────── */
function StatBox({ value, suffix, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1 }} className="gradient-text">
        <Counter target={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </motion.div>
  )
}

/* ── Main Landing Page ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()

  const features = [
    { icon: Camera,  color: '#6366f1', title: 'Instant Map Scanning',   desc: 'Point your phone camera at any printed map and watch alumni come alive in seconds.' },
    { icon: MapPin,  color: '#22d3ee', title: 'Spatial AR Pins',        desc: 'Each alumnus appears precisely anchored to their location on the map in 3D space.' },
    { icon: Users,   color: '#a78bfa', title: 'Rich Profiles',          desc: 'Tap any pin to explore career journeys, achievements, and social connections.' },
    { icon: Globe,   color: '#34d399', title: 'Global Network',         desc: 'Visualize your college\'s reach across countries, companies, and industries.' },
    { icon: Zap,     color: '#fb923c', title: '60 FPS Performance',     desc: 'Engineered for mobile — smooth, responsive, and lightweight on any device.' },
    { icon: Star,    color: '#f472b6', title: 'Zero App Install',       desc: 'Pure web experience. Works in Chrome and Safari. No download required.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100svh', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(60px, 10vw, 100px) 20px 48px',
      }} className="bg-grid">

        <ParticleCanvas />

        {/* radial glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 24, zIndex: 1 }}
        >
          <div className="glass" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            border: '1px solid rgba(99,102,241,0.3)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
              Augmented Reality Alumni Experience
            </span>
          </div>
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 900, textAlign: 'center', lineHeight: 1.08,
            letterSpacing: '-0.03em', zIndex: 1, maxWidth: 900,
          }}
        >
          Your Alumni,{' '}
          <span className="gradient-text">Mapped in</span>
          <br />
          Augmented Reality
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8',
            textAlign: 'center', maxWidth: 580, marginTop: 20,
            lineHeight: 1.7, zIndex: 1,
          }}
        >
          Scan a physical map and watch your college&apos;s network come alive.
          Discover alumni at{' '}
          <span style={{ color: '#6366f1', fontWeight: 600 }}>Google, Microsoft, DeepMind</span>
          {' '}and beyond — all in real space.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ar')}
            style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}
          >
            <Camera size={18} />
            Launch AR Experience
            <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/admin')}
            style={{ padding: '14px 24px', fontSize: '0.95rem', borderRadius: 14 }}
          >
            Admin Dashboard
          </button>
        </motion.div>

        {/* floating alumni cards */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          maxWidth: 680, marginTop: 44, zIndex: 1, padding: '0 16px',
        }}>
          {mockAlumni.slice(0, 4).map((a, i) => (
            <FloatingCard key={a.id} alumni={a} delay={0.6 + i * 0.15} index={i} />
          ))}
        </div>

        {/* scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 30, background: 'linear-gradient(to bottom, #475569, transparent)' }} />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>
            <StatBox value={1200} suffix="+"  label="Alumni on Map"    delay={0}    />
            <StatBox value={48}   suffix="+"  label="Countries"        delay={0.1}  />
            <StatBox value={320}  suffix="+"  label="Companies"        delay={0.2}  />
            <StatBox value={25}   suffix="+"  label="Batch Years"      delay={0.3}  />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              How it <span className="gradient-text">works</span>
            </h2>
            <p style={{ color: '#64748b', marginTop: 12, fontSize: '1rem' }}>Three steps. Zero downloads.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { n: '01', title: 'Open the website',   desc: 'Visit on any modern mobile browser. No app download or account required.' },
              { n: '02', title: 'Scan the map',        desc: 'Point your camera at the printed campus or world map. The system locks in seconds.' },
              { n: '03', title: 'Explore alumni',      desc: 'Tap glowing pins to discover alumni careers, journeys, and connections.' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass"
                style={{ padding: 28, position: 'relative' }}
              >
                <div style={{
                  fontSize: '3rem', fontWeight: 900, lineHeight: 1,
                  color: 'rgba(99,102,241,0.15)', marginBottom: 16,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</p>

                {i < 2 && (
                  <ChevronRight
                    size={18}
                    color="rgba(99,102,241,0.4)"
                    style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Built for <span className="gradient-text">performance</span>
            </h2>
            <p style={{ color: '#64748b', marginTop: 12 }}>Every detail engineered for mobile AR.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Alumni preview strip ─────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Discover our <span className="gradient-text-gold">Alumni</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {mockAlumni.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass"
                style={{ padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                whileHover={{ scale: 1.02 }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${i * 45},70%,45%), hsl(${i * 45 + 60},70%,55%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#fff',
                  }}>
                    {a.full_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>{a.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: 2 }}>{a.role}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{a.company} · {a.city}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>Batch {a.batch_year}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass"
            style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden', borderColor: 'rgba(99,102,241,0.3)' }}
          >
            {/* bg glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Ready to experience{' '}
                <span className="gradient-text">the future</span>?
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>
                Grab a printed map, open this on your phone, and step into AR.
                Your college's global network — visible, interactive, spatial.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/ar')}
                style={{ padding: '15px 36px', fontSize: '1.05rem', borderRadius: 14 }}
              >
                <Camera size={20} />
                Start Scanning Now
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AR Alumni Map</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
          Built with MindAR · Three.js · React
        </span>
      </footer>
    </div>
  )
}
