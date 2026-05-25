import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Globe, Building2, Clock, TrendingUp,
  Plus, Upload, Map, ArrowLeft, MapPin,
  Eye, CheckCircle, XCircle, BarChart2,
} from 'lucide-react'
import AlumniTable      from '@/components/admin/AlumniTable'
import AddAlumniModal   from '@/components/admin/AddAlumniModal'
import { supabase } from '@/lib/supabase'

import { useUIStore }   from '@/lib/store/uiStore'

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass"
      style={{ padding: '22px 20px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: '0.75rem', color: color, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle, ${color}10, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </motion.div>
  )
}

/* ── Toast ──────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null
  const colors = { success: '#22d3ee', error: '#f87171', warning: '#fbbf24' }
  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 100,
        padding: '12px 20px', borderRadius: 12,
        background: '#0d0d18', border: `1px solid ${colors[toast.type] || colors.success}40`,
        color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {toast.message}
    </motion.div>
  )
}

/* ── Quick action button ─────────────────────────────────────── */
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass"
      style={{
        padding: '16px', border: `1px solid ${color}20`,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        background: `${color}08`,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={color} />
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{label}</span>
    </motion.button>
  )
}

/* ── Main Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate       = useNavigate()
  const { showToast, toast } = useUIStore()
  const [alumni, setAlumni] = useState([])
  const [modalOpen, setModal] = useState(false)
  const [editTarget, setEdit] = useState(null)
  const [activeTab, setTab]  = useState('alumni')

  useEffect(() => {
    supabase.from('alumni').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAlumni(data) })
  }, [])

  const stats = {
    total:    alumni.length,
    active:   alumni.filter((a) => a.status === 'ACTIVE').length,
    pending:  alumni.filter((a) => a.status === 'PENDING').length,
    countries: [...new Set(alumni.map((a) => a.country))].length,
    companies: [...new Set(alumni.map((a) => a.company))].length,
  }

  const handleSave = async (data) => {
  const { id, ...rest } = data
  if (editTarget) {
    await supabase.from('alumni').update(rest).eq('id', id)
  } else {
    await supabase.from('alumni').insert(rest)
  }
  // refresh list from Supabase
  const { data: fresh } = await supabase.from('alumni').select('*').order('created_at', { ascending: false })
  if (fresh) setAlumni(fresh)
  showToast(editTarget ? 'Alumni updated' : 'Alumni added')
  setEdit(null)
}

  const handleEdit  = (a) => { setEdit(a); setModal(true) }
  const handleClose = () => { setModal(false); setEdit(null) }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this alumni?')) return
    setAlumni((prev) => prev.filter((a) => a.id !== id))
    showToast('Alumni deleted', 'error')
  }

  const handleApprove = (id) => {
    setAlumni((prev) => prev.map((a) => a.id === id ? { ...a, status: 'ACTIVE' } : a))
    showToast('Alumni approved and visible in AR')
  }

  const handleToggleVisibility = (id) => {
    setAlumni((prev) => prev.map((a) => a.id === id ? { ...a, visibility: !a.visibility } : a))
    showToast('Visibility updated')
  }

  const TABS = [
    { id: 'alumni',    label: 'Alumni',    icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top header ──────────────────────────────────── */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(13,13,24,0.8)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} color="#94a3b8" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>Admin Dashboard</div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>AR Alumni Map</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/ar')}
            className="btn btn-ghost"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <Map size={14} /> Preview AR
          </button>
          <button
            onClick={() => { setEdit(null); setModal(true) }}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={15} /> Add Alumni
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>

        {/* ── Stats row ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard icon={Users}     label="Total Alumni"  value={stats.total}    color="#6366f1" delay={0}    />
          <StatCard icon={CheckCircle} label="Active"      value={stats.active}   color="#22d3ee" sub={`${Math.round(stats.active/stats.total*100)}% of total`} delay={0.06} />
          <StatCard icon={Clock}     label="Pending"       value={stats.pending}  color="#fbbf24" sub="Awaiting review" delay={0.12} />
          <StatCard icon={Globe}     label="Countries"     value={stats.countries} color="#a78bfa" delay={0.18} />
          <StatCard icon={Building2} label="Companies"     value={stats.companies} color="#34d399" delay={0.24} />
        </div>

        {/* ── Quick actions ────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
          <QuickAction icon={Plus}   label="Add Single Alumni"    color="#6366f1" onClick={() => { setEdit(null); setModal(true) }} />
          <QuickAction icon={Upload} label="Bulk CSV Import"      color="#22d3ee" onClick={() => showToast('CSV import coming in Phase 2')} />
          <QuickAction icon={Map}    label="Open AR Preview"      color="#a78bfa" onClick={() => navigate('/ar')} />
          <QuickAction icon={Eye}    label="Pending Approvals"    color="#fbbf24" onClick={() => {}} />
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: '0.875rem', fontWeight: 600,
                background: activeTab === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${activeTab === t.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                color: activeTab === t.id ? '#818cf8' : '#64748b',
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Alumni Table ────────────────────────── */}
        {activeTab === 'alumni' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlumniTable
              alumni={alumni}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onToggleVisibility={handleToggleVisibility}
            />
          </motion.div>
        )}

        {/* ── Tab: Analytics ───────────────────────────── */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

              {/* By country */}
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 18, color: '#f1f5f9' }}>Top Countries</h3>
                {Object.entries(
                  alumni.reduce((acc, a) => { acc[a.country || 'Unknown'] = (acc[a.country || 'Unknown'] || 0) + 1; return acc }, {})
                ).sort((a,b) => b[1]-a[1]).slice(0,6).map(([country, count]) => (
                  <div key={country} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{country}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / alumni.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* By company */}
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 18, color: '#f1f5f9' }}>Top Companies</h3>
                {Object.entries(
                  alumni.reduce((acc, a) => { acc[a.company || 'Unknown'] = (acc[a.company || 'Unknown'] || 0) + 1; return acc }, {})
                ).sort((a,b) => b[1]-a[1]).slice(0,6).map(([company, count]) => (
                  <div key={company} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{company}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / alumni.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #22d3ee, #a78bfa)', borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* By batch */}
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 18, color: '#f1f5f9' }}>By Batch Year</h3>
                {Object.entries(
                  alumni.reduce((acc, a) => { acc[a.batch_year] = (acc[a.batch_year] || 0) + 1; return acc }, {})
                ).sort((a,b) => b[0]-a[0]).slice(0,8).map(([year, count]) => (
                  <div key={year} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Batch {year}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / alumni.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #a78bfa, #f472b6)', borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddAlumniModal
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        editingAlumni={editTarget}
      />

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  )
}
