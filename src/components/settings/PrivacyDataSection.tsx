'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, Download, Trash2, AlertTriangle,
  CheckCircle2, Clock, ExternalLink, Loader2,
} from 'lucide-react'
import { requestDataExport, deleteAccount } from '@/lib/actions/privacy'
import { CURRENT_CONSENT_VERSION } from '@/lib/types'
import type { Profile } from '@/lib/types'

const EVENT_LABELS: Record<string, string> = {
  consent_accepted:        'Privacy policy accepted',
  consent_version_bump:    'Policy re-consent required',
  data_export_requested:   'Data export requested',
  data_deletion_requested: 'Data deletion requested',
  account_deleted:         'Account deleted',
}

interface AuditEntry {
  id: string
  event_type: string
  event_data: Record<string, unknown>
  created_at: string
}

interface PrivacyDataSectionProps {
  profile: Profile
  auditLog: AuditEntry[]
}

export function PrivacyDataSection({ profile, auditLog }: PrivacyDataSectionProps) {
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isPendingExport, startExport] = useTransition()
  const [isPendingDelete, startDelete] = useTransition()
  const [exportError, setExportError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  const consentOk = profile.consentVersion === CURRENT_CONSENT_VERSION && !!profile.consentAcceptedAt
  const consentDate = profile.consentAcceptedAt
    ? new Date(profile.consentAcceptedAt).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  function handleExport() {
    setExportError(null)
    startExport(async () => {
      const result = await requestDataExport()
      if (result.error) {
        setExportError(result.error)
        return
      }
      if (result.data) {
        const blob = new Blob([result.data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `devy-data-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (deleteConfirm !== 'DELETE') return
    setDeleteError(null)
    startDelete(async () => {
      const result = await deleteAccount()
      if (result?.error) setDeleteError(result.error)
      // On success, deleteAccount() calls redirect() server-side
    })
  }

  return (
    <div className="space-y-8">

      {/* Consent status */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-sage-500" strokeWidth={2} />
          <h3 className="font-display text-[1.05rem] font-semibold text-ink">Consent & Privacy Policy</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${consentOk ? 'bg-sage-50 border-sage-200' : 'bg-sand-50 border-sand-200'}`}>
            {consentOk
              ? <CheckCircle2 size={16} className="text-sage-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
              : <AlertTriangle size={16} className="text-sand-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            }
            <div>
              <p className={`text-body-sm font-semibold ${consentOk ? 'text-sage-700' : 'text-sand-700'}`}>
                {consentOk ? 'Current policy accepted' : 'Consent required'}
              </p>
              <p className="text-body-xs text-ink-tertiary mt-0.5">
                {consentOk
                  ? `You accepted version ${profile.consentVersion} on ${consentDate}.`
                  : 'You have not accepted the current privacy policy.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-xs text-ink-tertiary">
            <span>Current policy version: <span className="font-mono text-ink-secondary">{CURRENT_CONSENT_VERSION}</span></span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-dblue-600 hover:text-dblue-700 font-medium focus-ring rounded px-1"
            >
              View policy <ExternalLink size={11} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>

      {/* Data rights */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display text-[1.05rem] font-semibold text-ink">Your Data Rights</h3>
          <p className="text-body-xs text-ink-tertiary mt-0.5">PIPEDA grants you the right to access, export, and delete your personal information.</p>
        </div>
        <div className="divide-y divide-border">

          {/* Export */}
          <div className="px-6 py-5 flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-dblue-50 flex items-center justify-center flex-shrink-0">
                <Download size={16} className="text-dblue-500" strokeWidth={2} />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-ink">Export my data</p>
                <p className="text-body-xs text-ink-tertiary mt-0.5 max-w-sm">
                  Download a JSON file containing your profile, child profiles, conversations, and messages.
                </p>
                {exportError && <p className="text-body-xs text-red-600 mt-1">{exportError}</p>}
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={isPendingExport}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-dblue-50 text-dblue-700 hover:bg-dblue-100 rounded-xl text-body-xs font-semibold focus-ring transition-colors disabled:opacity-50"
            >
              {isPendingExport ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} strokeWidth={2} />}
              {isPendingExport ? 'Preparing…' : 'Export'}
            </button>
          </div>

          {/* Delete */}
          <div className="px-6 py-5 flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" strokeWidth={2} />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-ink">Delete my account</p>
                <p className="text-body-xs text-ink-tertiary mt-0.5 max-w-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-body-xs font-semibold focus-ring transition-colors"
            >
              <Trash2 size={13} strokeWidth={2} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-display text-[1.05rem] font-semibold text-ink">Privacy Activity Log</h3>
            <p className="text-body-xs text-ink-tertiary mt-0.5">Immutable record of privacy-related actions on your account.</p>
          </div>
          <Clock size={15} className="text-ink-tertiary" strokeWidth={1.75} />
        </div>
        <div className="divide-y divide-border/60">
          {auditLog.length === 0 ? (
            <div className="px-6 py-8 text-center text-body-xs text-ink-tertiary">No privacy events recorded yet.</div>
          ) : (
            auditLog.map((entry) => (
              <div key={entry.id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-xs font-medium text-ink truncate">
                    {EVENT_LABELS[entry.event_type] ?? entry.event_type}
                  </p>
                  {entry.event_data?.consent_version != null && (
                    <p className="text-[0.65rem] text-ink-tertiary">
                      Policy version: <span className="font-mono">{String(entry.event_data.consent_version)}</span>
                    </p>
                  )}
                </div>
                <time className="text-[0.65rem] text-ink-tertiary flex-shrink-0 font-mono">
                  {new Date(entry.created_at).toLocaleDateString('en-CA', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </time>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-floating border border-border w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">Delete your account?</h3>
                <p className="text-body-xs text-ink-tertiary mt-0.5">This permanently removes all your data.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-body-xs text-red-700 space-y-1">
              <p className="font-semibold">This will permanently delete:</p>
              <ul className="list-disc list-outside pl-4 space-y-0.5">
                <li>Your profile and account credentials</li>
                <li>All child/client profiles</li>
                <li>All conversations and messages</li>
              </ul>
              <p className="mt-2 font-medium">Your privacy audit log will be retained (anonymized) for legal compliance.</p>
            </div>

            <div className="space-y-2">
              <label className="text-body-xs font-medium text-ink">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-xl border border-border text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300"
                autoComplete="off"
              />
            </div>

            {deleteError && <p className="text-body-xs text-red-600">{deleteError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }}
                className="flex-1 py-2.5 rounded-xl border border-border text-body-sm font-medium text-ink-secondary hover:bg-surface focus-ring transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== 'DELETE' || isPendingDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-body-sm font-semibold hover:bg-red-700 focus-ring transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPendingDelete ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={2} />}
                {isPendingDelete ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
