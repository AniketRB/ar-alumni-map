import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Briefcase, MapPin, Link, Camera, Loader } from 'lucide-react'
import { cityCoordinates } from '@/data/cityCoordinates'
import { geocodeCity } from '@/lib/geocoding'
import { supabase } from '@/lib/supabase'

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'MBA', 'Data Science', 'Electrical Engineering', 'Other']

const currentYear = new Date().getFullYear()
const BATCH_YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i)

const EMPTY = {
  full_name: '', batch_year: currentYear - 4, department: '',
  role: '', company: '', city: '', country: '',
  linkedin_url: '', bio: '', status: 'PENDING', visibility: true, avatar_url: '',
}

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
  transition: 'border-color 0.15s',
}

export default function AddAlumniModal({ open, onClose, onSave, editingAlumni }) {
  const [form, setForm]             = useState(editingAlumni ?? EMPTY)
  const [errors, setErrors]         = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setPreview] = useState(null)
  const [saving, setSaving]         = useState(false)
  const fileInputRef                = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(editingAlumni ?? EMPTY)
      setErrors({})
      setAvatarFile(null)
      setPreview(editingAlumni?.avatar_url || null)
      setSaving(false)
    }
  }, [open, editingAlumni])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Required'
    if (!form.company.trim())   e.company   = 'Required'
    if (!form.role.trim())      e.role      = 'Required'
    if (!form.city.trim())      e.city      = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!validate() || saving) return
    setSaving(true)

    try {
      // 1. Upload avatar if a new file was chosen
      let avatar_url = form.avatar_url || ''
      if (avatarFile) {
        const ext  = avatarFile.name.split('.').pop().toLowerCase()
        const path = `${Date.now()}_${form.full_name.replace(/\s+/g, '_').substring(0, 40)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatar_url = urlData.publicUrl
        }
      }

      // 2. Geocode city (hardcoded table → Nominatim fallback)
      const coords = await geocodeCity(form.city, form.country)

      onSave({ ...form, ...coords, avatar_url, id: editingAlumni?.id ?? String(Date.now()) })
      onClose()
      setForm(EMPTY)
      setErrors({})
    } finally {
      setSaving(false)
    }
  }

  const inp = (k) => ({
    value: form[k] ?? '',
    onChange: (e) => set(k, e.target.value),
    style: { ...inputStyle, ...(errors[k] ? { borderColor: 'rgba(248,113,113,0.5)' } : {}) },
    onFocus: (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)' },
    onBlur:  (e) => { e.target.style.borderColor = errors[k] ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)' },
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', padding: '16px',
          }}>
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              pointerEvents: 'auto',
              width: 'min(580px, 95vw)',
              background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', maxHeight: '90vh',
            }}
          >
            {/* header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>
                  {editingAlumni ? 'Edit Alumni' : 'Add Alumni'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Coordinates auto-geocoded from city
                </p>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#94a3b8" />
              </button>
            </div>

            {/* scrollable form */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <div style={{ display: 'grid', gap: 18 }}>

                {/* ── Profile photo ────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 72, height: 72, borderRadius: 18, cursor: 'pointer',
                      background: avatarPreview ? 'transparent' : 'rgba(99,102,241,0.08)',
                      border: `2px ${avatarPreview ? 'solid rgba(99,102,241,0.4)' : 'dashed rgba(99,102,241,0.3)'}`,
                      overflow: 'hidden', flexShrink: 0, padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Camera size={24} color="rgba(99,102,241,0.6)" />
                    }
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-ghost"
                      style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                    >
                      {avatarPreview ? 'Change Photo' : 'Add Photo'}
                    </button>
                    <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: 5 }}>
                      JPG / PNG · max 5 MB
                    </p>
                  </div>
                </div>

                {/* ── Personal ──────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={14} color="#6366f1" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personal</span>
                </div>

                <Field label="Full Name" required>
                  <input placeholder="e.g. Priya Sharma" {...inp('full_name')} />
                  {errors.full_name && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4, display: 'block' }}>{errors.full_name}</span>}
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Batch Year">
                    <select {...inp('batch_year')} onChange={(e) => set('batch_year', Number(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {BATCH_YEARS.map((y) => <option key={y} value={y} style={{ background: '#0d0d18' }}>{y}</option>)}
                    </select>
                  </Field>
                  <Field label="Department">
                    <select {...inp('department')} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="" style={{ background: '#0d0d18' }}>Select...</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d} style={{ background: '#0d0d18' }}>{d}</option>)}
                    </select>
                  </Field>
                </div>

                {/* ── Career ────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Briefcase size={14} color="#22d3ee" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career</span>
                </div>

                <Field label="Current Role" required>
                  <input placeholder="e.g. Senior Software Engineer" {...inp('role')} />
                  {errors.role && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4, display: 'block' }}>{errors.role}</span>}
                </Field>
                <Field label="Company" required>
                  <input placeholder="e.g. Google" {...inp('company')} />
                  {errors.company && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4, display: 'block' }}>{errors.company}</span>}
                </Field>

                {/* ── Location ──────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <MapPin size={14} color="#a78bfa" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="City" required>
                    <input list="city-list" placeholder="e.g. Mumbai" {...inp('city')} />
                    <datalist id="city-list">
                      {Object.keys(cityCoordinates).map((c) => <option key={c} value={c} />)}
                    </datalist>
                    {errors.city && <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4, display: 'block' }}>{errors.city}</span>}
                  </Field>
                  <Field label="Country">
                    <input placeholder="e.g. India" {...inp('country')} />
                  </Field>
                </div>

                {/* city not in table → Nominatim will geocode */}
                {form.city && !cityCoordinates[form.city] && (
                  <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)',
                    fontSize: '0.75rem', color: '#67e8f9',
                  }}>
                    Unknown city — coordinates will be auto-looked up via Nominatim on save.
                  </div>
                )}

                {/* ── Bio & Links ───────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Link size={14} color="#34d399" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio & Links</span>
                </div>

                <Field label="Short Bio">
                  <textarea
                    placeholder="Brief professional bio..."
                    rows={3}
                    value={form.bio ?? ''}
                    onChange={(e) => set('bio', e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </Field>

                <Field label="LinkedIn URL">
                  <input placeholder="https://linkedin.com/in/..." {...inp('linkedin_url')} />
                </Field>

                {/* ── Status ────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Status">
                    <select {...inp('status')} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['PENDING','ACTIVE','REJECTED'].map((s) => <option key={s} value={s} style={{ background: '#0d0d18' }}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Visible in AR">
                    <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          type="button"
                          onClick={() => set('visibility', v)}
                          style={{
                            flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                            border: `1px solid ${form.visibility === v ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            background: form.visibility === v ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                            color: form.visibility === v ? '#818cf8' : '#64748b',
                            fontSize: '0.82rem', fontWeight: 600,
                          }}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

              </div>
            </div>

            {/* footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
            }}>
              <button onClick={onClose} disabled={saving} className="btn btn-ghost" style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px', minWidth: 120 }}>
                {saving
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : <><Save size={15} /> {editingAlumni ? 'Save Changes' : 'Add Alumni'}</>
                }
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
