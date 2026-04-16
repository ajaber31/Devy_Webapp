'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createChild } from '@/lib/actions/children'
import { useLanguage } from '@/components/shared/LanguageProvider'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  { value: 'sage' as const, label: 'Green', bg: 'bg-sage-200', ring: 'ring-sage-400' },
  { value: 'dblue' as const, label: 'Blue', bg: 'bg-dblue-200', ring: 'ring-dblue-400' },
  { value: 'sand' as const, label: 'Sand', bg: 'bg-sand-200', ring: 'ring-sand-400' },
]

interface AddChildModalProps {
  onClose: () => void
  onSaved?: () => void
  title?: string
}

export function AddChildModal({ onClose, onSaved, title }: AddChildModalProps) {
  const { t } = useLanguage()
  const tm = t.children.modal
  const resolvedTitle = title ?? tm.addTitle
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [avatarColor, setAvatarColor] = useState<'sage' | 'dblue' | 'sand'>('sage')
  const [labelInput, setLabelInput] = useState('')
  const [contextLabels, setContextLabels] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const addLabel = () => {
    const trimmed = labelInput.trim()
    if (trimmed && !contextLabels.includes(trimmed)) {
      setContextLabels(prev => [...prev, trimmed])
    }
    setLabelInput('')
  }

  const removeLabel = (label: string) => {
    setContextLabels(prev => prev.filter(l => l !== label))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError(tm.nameRequired)
      return
    }
    setIsPending(true)
    const result = await createChild({
      name: name.trim(),
      dateOfBirth: dateOfBirth || undefined,
      avatarColor,
      contextLabels,
      notes: notes.trim(),
    })
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      onSaved?.()
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-display-sm font-semibold text-ink">{resolvedTitle}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-raised focus-ring"
              style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {error && (
              <div className="px-4 py-3 bg-danger/5 border border-danger/20 rounded-card">
                <p className="text-body-xs text-danger">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="child-name" className="block text-body-sm font-medium text-ink mb-1.5">
                {tm.firstName} <span className="text-danger">*</span>
              </label>
              <input
                id="child-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={tm.firstNamePlaceholder}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Date of birth */}
            <div>
              <label htmlFor="child-dob" className="block text-body-sm font-medium text-ink mb-1.5">
                {tm.dob} <span className="text-body-xs text-ink-tertiary font-normal">{tm.dobOptional}</span>
              </label>
              <input
                id="child-dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Avatar color */}
            <div>
              <p className="text-body-sm font-medium text-ink mb-2">{tm.avatarColour}</p>
              <div className="flex gap-3">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    className={cn(
                      'w-9 h-9 rounded-full focus-ring',
                      c.bg,
                      avatarColor === c.value ? `ring-2 ring-offset-2 ${c.ring}` : 'opacity-60 hover:opacity-100'
                    )}
                    style={{ transitionProperty: 'opacity, box-shadow', transitionDuration: '150ms' }}
                    aria-label={c.label}
                    aria-pressed={avatarColor === c.value}
                  />
                ))}
              </div>
            </div>

            {/* Context labels */}
            <div>
              <label className="block text-body-sm font-medium text-ink mb-1">
                {tm.contextLabels} <span className="text-body-xs text-ink-tertiary font-normal">{tm.contextLabelsOptional}</span>
              </label>
              <p className="text-body-xs text-ink-tertiary mb-2">{tm.contextLabelsHelp}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel() } }}
                  placeholder={tm.contextLabelsPlaceholder}
                  className="flex-1 px-4 py-2 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                  style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="p-2 rounded-card bg-sage-100 text-sage-700 hover:bg-sage-200 focus-ring"
                  style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                  aria-label="Add label"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>
              </div>
              {contextLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {contextLabels.map(label => (
                    <span key={label} className="flex items-center gap-1 px-2.5 py-0.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-pill text-body-xs font-medium">
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="text-sage-400 hover:text-sage-700 ml-0.5"
                        aria-label={`Remove ${label}`}
                      >
                        <Trash2 size={10} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="child-notes" className="block text-body-sm font-medium text-ink mb-1.5">
                {tm.notes} <span className="text-body-xs text-ink-tertiary font-normal">{tm.dobOptional}</span>
              </label>
              <textarea
                id="child-notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={tm.notesPlaceholder}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400 resize-none"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-body-sm font-medium text-ink-secondary hover:text-ink hover:bg-raised rounded-card focus-ring"
                style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring disabled:opacity-60"
                style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
              >
                {isPending ? tm.saving : tm.addButton}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
