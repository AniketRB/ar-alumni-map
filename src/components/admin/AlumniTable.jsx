import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Edit2, Trash2, Eye, EyeOff, CheckCircle, Clock, XCircle, MapPin, ChevronUp, ChevronDown } from 'lucide-react'

const STATUS_CONFIG = {
  ACTIVE:   { icon: CheckCircle, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  label: 'Active'  },
  PENDING:  { icon: Clock,       color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Pending' },
  REJECTED: { icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Rejected'},
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      background: cfg.bg, fontSize: '0.75rem',
      fontWeight: 600, color: cfg.color,
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

export default function AlumniTable({ alumni, onEdit, onDelete, onApprove, onToggleVisibility }) {
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilter] = useState('ALL')
  const [sortKey, setSortKey]   = useState('batch_year')
  const [sortDir, setSortDir]   = useState('desc')

  const sort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = alumni
    .filter((a) => {
      const q = search.toLowerCase()
      const matchSearch = !q || [a.full_name, a.company, a.city, a.department, String(a.batch_year)]
        .some((v) => v?.toLowerCase().includes(q))
      const matchStatus = filterStatus === 'ALL' || a.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const va = a[sortKey] ?? '', vb = b[sortKey] ?? ''
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return null
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const thStyle = (k) => ({
    padding: '10px 16px', fontSize: '0.75rem', fontWeight: 700,
    color: sortKey === k ? '#6366f1' : '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap',
    userSelect: 'none', background: 'transparent', border: 'none',
    display: 'table-cell', verticalAlign: 'middle',
  })

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
            }}
          />
        </div>

        {['ALL','ACTIVE','PENDING','REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: '0.8rem',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filterStatus === s ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterStatus === s ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: filterStatus === s ? '#818cf8' : '#64748b',
            }}
          >
            {s === 'ALL' ? `All (${alumni.length})` : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { key: 'full_name', label: 'Alumni' },
                { key: 'batch_year', label: 'Batch' },
                { key: 'company', label: 'Company' },
                { key: 'city', label: 'Location' },
                { key: 'status', label: 'Status' },
              ].map(({ key, label }) => (
                <th key={key} style={thStyle(key)} onClick={() => sort(key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label} <SortIcon k={key} />
                  </span>
                </th>
              ))}
              <th style={{ ...thStyle('actions'), cursor: 'default' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
                  No alumni found
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name + avatar */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, hsl(${a.full_name.charCodeAt(0) * 7 % 360},65%,45%), hsl(${a.full_name.charCodeAt(0) * 7 % 360 + 60},65%,55%))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff',
                      }}>
                        {a.full_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{a.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.department}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#94a3b8' }}>{a.batch_year}</td>

                  <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#94a3b8' }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{a.company}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.role}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#94a3b8' }}>
                      <MapPin size={11} color="#6366f1" />
                      {a.city}, {a.country}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={a.status} />
                  </td>

                  {/* Action buttons */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {a.status === 'PENDING' && (
                        <button
                          onClick={() => onApprove(a.id)}
                          title="Approve"
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <CheckCircle size={13} color="#22d3ee" />
                        </button>
                      )}
                      <button
                        onClick={() => onToggleVisibility(a.id)}
                        title={a.visibility ? 'Hide' : 'Show'}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {a.visibility ? <Eye size={13} color="#94a3b8" /> : <EyeOff size={13} color="#475569" />}
                      </button>
                      <button
                        onClick={() => onEdit(a)}
                        title="Edit"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={13} color="#94a3b8" />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        title="Delete"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={13} color="#f87171" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#475569' }}>
        Showing {filtered.length} of {alumni.length} alumni
      </div>
    </div>
  )
}
