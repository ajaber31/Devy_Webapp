'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Plus, ChevronDown, CheckCircle2, Search, Shield, FileWarning, Loader2 } from 'lucide-react'
import { createIncident, updateIncident } from '@/lib/actions/incidents'
import type { Incident } from '@/lib/actions/incidents'

const SEVERITY_CONFIG = {
  low:      { label: 'Low',      bg: 'bg-sage-100',   text: 'text-sage-700',   dot: 'bg-sage-400' },
  medium:   { label: 'Medium',   bg: 'bg-sand-100',   text: 'text-sand-700',   dot: 'bg-sand-400' },
  high:     { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
}

const STATUS_CONFIG = {
  open:               { label: 'Open',                    icon: AlertTriangle, color: 'text-red-600' },
  investigating:      { label: 'Investigating',           icon: Search,        color: 'text-sand-600' },
  resolved:           { label: 'Resolved',                icon: CheckCircle2,  color: 'text-sage-600' },
  reported_to_opc:    { label: 'Reported to OPC',         icon: Shield,        color: 'text-dblue-600' },
  reported_to_ipc:    { label: 'Reported to IPC (PHIPA)', icon: Shield,        color: 'text-dblue-600' },
}

const DATA_TYPE_OPTIONS = [
  'names', 'email_addresses', 'dates_of_birth', 'child_profiles',
  'health_context', 'chat_history', 'account_credentials', 'ip_addresses', 'other',
]

interface IncidentsPageContentProps {
  initialIncidents: Incident[]
}

export function IncidentsPageContent({ initialIncidents }: IncidentsPageContentProps) {
  const [incidents, setIncidents] = useState(initialIncidents)
  const [showNewForm, setShowNewForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    severity: 'medium' as Incident['severity'],
    title: '',
    description: '',
    affected_users_count: '' as string,
    data_types_affected: [] as string[],
  })

  function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    startTransition(async () => {
      const result = await createIncident({
        severity: newIncident.severity,
        title: newIncident.title,
        description: newIncident.description,
        affected_users_count: newIncident.affected_users_count ? parseInt(newIncident.affected_users_count) : null,
        data_types_affected: newIncident.data_types_affected,
      })
      if (result.error) { setFormError(result.error); return }
      setShowNewForm(false)
      setNewIncident({ severity: 'medium', title: '', description: '', affected_users_count: '', data_types_affected: [] })
      // Reload page data via server — simple approach
      window.location.reload()
    })
  }

  function handleStatusChange(id: string, status: Incident['status']) {
    startTransition(async () => {
      const extra: Record<string, unknown> = { id, status }
      if (status === 'reported_to_opc' || status === 'reported_to_ipc') {
        extra.reported_to_authority_at = new Date().toISOString()
      }
      await updateIncident(extra as Parameters<typeof updateIncident>[0])
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, status, ...(extra.reported_to_authority_at ? { reported_to_authority_at: extra.reported_to_authority_at as string } : {}) } : i))
    })
  }

  const openCount = incidents.filter(i => i.status === 'open').length
  const criticalCount = incidents.filter(i => i.severity === 'critical').length

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg font-bold text-ink">Incident Log</h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            Track security incidents and data breaches. Required for PIPEDA (OPC) and PHIPA (IPC) breach notification obligations.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-body-sm font-semibold hover:bg-red-700 focus-ring shadow-button flex-shrink-0"
        >
          <Plus size={16} strokeWidth={2} />
          Report Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total incidents', value: incidents.length, color: 'text-ink' },
          { label: 'Open / active', value: openCount, color: openCount > 0 ? 'text-red-600' : 'text-sage-600' },
          { label: 'Critical severity', value: criticalCount, color: criticalCount > 0 ? 'text-red-600' : 'text-ink-tertiary' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border shadow-card p-4">
            <p className={`font-display text-display-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-body-xs text-ink-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* PHIPA notice */}
      <div className="flex items-start gap-3 bg-dblue-50 border border-dblue-200 rounded-2xl p-4">
        <Shield size={16} className="text-dblue-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-body-xs text-dblue-700 space-y-1">
          <p className="font-semibold">Regulatory reporting obligations</p>
          <p><strong>PIPEDA:</strong> Breaches presenting a &quot;real risk of significant harm&quot; must be reported to the Office of the Privacy Commissioner (OPC) and affected individuals. Use status &quot;Reported to OPC.&quot;</p>
          <p><strong>PHIPA (Ontario):</strong> Health privacy breaches must be reported to the Information and Privacy Commissioner of Ontario (IPC) if they meet the threshold. Use status &quot;Reported to IPC.&quot;</p>
        </div>
      </div>

      {/* New incident form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-red-50">
            <FileWarning size={16} className="text-red-500" strokeWidth={2} />
            <h3 className="font-display font-semibold text-ink">Report New Incident</h3>
          </div>
          <form onSubmit={handleSubmitNew} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-ink-secondary">Severity</label>
                <select
                  value={newIncident.severity}
                  onChange={e => setNewIncident(p => ({ ...p, severity: e.target.value as Incident['severity'] }))}
                  className="w-full px-3 py-2 border border-border rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-ink-secondary">Estimated affected users</label>
                <input
                  type="number"
                  min={0}
                  value={newIncident.affected_users_count}
                  onChange={e => setNewIncident(p => ({ ...p, affected_users_count: e.target.value }))}
                  placeholder="Unknown"
                  className="w-full px-3 py-2 border border-border rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-ink-secondary">Incident title <span className="text-red-500">*</span></label>
              <input
                required
                value={newIncident.title}
                onChange={e => setNewIncident(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Unauthorized access to user data"
                className="w-full px-3 py-2 border border-border rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-ink-secondary">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={newIncident.description}
                onChange={e => setNewIncident(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe what happened, when it was discovered, and what data may be affected..."
                className="w-full px-3 py-2 border border-border rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-body-xs font-semibold text-ink-secondary">Data types potentially affected</label>
              <div className="flex flex-wrap gap-2">
                {DATA_TYPE_OPTIONS.map(opt => {
                  const selected = newIncident.data_types_affected.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setNewIncident(p => ({
                        ...p,
                        data_types_affected: selected
                          ? p.data_types_affected.filter(t => t !== opt)
                          : [...p.data_types_affected, opt],
                      }))}
                      className={`px-3 py-1 rounded-full text-body-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-surface border-border text-ink-secondary hover:border-red-200'
                      }`}
                    >
                      {opt.replace(/_/g, ' ')}
                    </button>
                  )
                })}
              </div>
            </div>

            {formError && <p className="text-body-xs text-red-600">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-body-sm font-medium text-ink-secondary hover:bg-surface focus-ring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-body-sm font-semibold hover:bg-red-700 focus-ring disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} strokeWidth={2} />}
                {isPending ? 'Reporting…' : 'Report Incident'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incident list */}
      <div className="space-y-3">
        {incidents.length === 0 && (
          <div className="text-center py-16 text-body-sm text-ink-tertiary">
            <CheckCircle2 size={32} className="text-sage-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-medium text-ink-secondary">No incidents recorded</p>
            <p className="text-body-xs mt-1">Use &quot;Report Incident&quot; to log a security event.</p>
          </div>
        )}
        {incidents.map((incident) => {
          const sev = SEVERITY_CONFIG[incident.severity]
          const stat = STATUS_CONFIG[incident.status]
          const StatIcon = stat.icon
          const isExpanded = expandedId === incident.id

          return (
            <div
              key={incident.id}
              className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"
            >
              {/* Summary row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface/50 transition-colors"
              >
                {/* Severity dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate">{incident.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-body-xs ${sev.text}`}>{sev.label}</span>
                    <span className="text-ink-tertiary text-body-xs">·</span>
                    <span className="text-body-xs text-ink-tertiary">
                      {new Date(incident.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-1.5 flex-shrink-0 ${stat.color}`}>
                  <StatIcon size={13} strokeWidth={2} />
                  <span className="text-body-xs font-medium hidden sm:block">{stat.label}</span>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-ink-tertiary flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  strokeWidth={1.75}
                />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border space-y-4 pt-4">
                  <p className="text-body-sm text-ink-secondary leading-relaxed">{incident.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-body-xs">
                    <div>
                      <p className="text-ink-tertiary font-medium mb-1">Affected users</p>
                      <p className="text-ink">{incident.affected_users_count ?? 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-ink-tertiary font-medium mb-1">Reported to authority</p>
                      <p className="text-ink">
                        {incident.reported_to_authority_at
                          ? new Date(incident.reported_to_authority_at).toLocaleDateString('en-CA')
                          : 'Not yet reported'}
                      </p>
                    </div>
                  </div>

                  {incident.data_types_affected?.length > 0 && (
                    <div>
                      <p className="text-body-xs text-ink-tertiary font-medium mb-2">Data types affected</p>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.data_types_affected.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-red-50 border border-red-200 rounded-full text-[0.65rem] text-red-700 font-medium">
                            {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {incident.resolution && (
                    <div className="bg-sage-50 border border-sage-200 rounded-xl p-3">
                      <p className="text-body-xs text-sage-700 font-semibold mb-1">Resolution</p>
                      <p className="text-body-xs text-sage-700">{incident.resolution}</p>
                    </div>
                  )}

                  {/* Status change */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <p className="text-body-xs text-ink-tertiary font-medium flex-shrink-0">Update status:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(STATUS_CONFIG) as Incident['status'][]).map(s => (
                        <button
                          key={s}
                          disabled={incident.status === s || isPending}
                          onClick={() => handleStatusChange(incident.id, s)}
                          className={`px-3 py-1 rounded-full text-[0.65rem] font-semibold border transition-colors ${
                            incident.status === s
                              ? 'bg-ink text-white border-ink'
                              : 'border-border text-ink-secondary hover:border-dblue-300 hover:text-dblue-600'
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
