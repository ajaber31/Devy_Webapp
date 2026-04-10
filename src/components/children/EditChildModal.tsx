'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { updateChild } from '@/lib/actions/children'
import { cn } from '@/lib/utils'
import type { Child } from '@/lib/types'

const AVATAR_COLORS = [
  { value: 'sage' as const, label: 'Green', bg: 'bg-sage-200', ring: 'ring-sage-400' },
  { value: 'dblue' as const, label: 'Blue', bg: 'bg-dblue-200', ring: 'ring-dblue-400' },
  { value: 'sand' as const, label: 'Sand', bg: 'bg-sand-200', ring: 'ring-sand-400' },
]

interface EditChildModalProps {
  child: Child
  onClose: () => void
  onSave: (updated: Child) => void
  /** Role-aware label e.g. "child" | "client" */
  nounSingular?: string
}

// Reusable tag-input field used for every array field
function ArrayField({
  id,
  label,
  hint,
  items,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
  chipClass = 'bg-sage-50 text-sage-700 border-sage-200',
}: {
  id: string
  label: string
  hint?: string
  items: string[]
  inputValue: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onRemove: (item: string) => void
  placeholder: string
  chipClass?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-body-sm font-medium text-ink mb-0.5">
        {label} <span className="text-body-xs text-ink-tertiary font-normal">(optional)</span>
      </label>
      {hint && <p className="text-body-xs text-ink-tertiary mb-2">{hint}</p>}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd() } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
          style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
        />
        <button
          type="button"
          onClick={onAdd}
          className="p-2 rounded-card bg-sage-100 text-sage-700 hover:bg-sage-200 focus-ring"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
          aria-label={`Add ${label}`}
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {items.map(item => (
            <span key={item} className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-pill text-body-xs font-medium ${chipClass}`}>
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="opacity-60 hover:opacity-100 ml-0.5"
                aria-label={`Remove ${item}`}
              >
                <Trash2 size={10} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function useArrayField(initial: string[]) {
  const [items, setItems] = useState<string[]>(initial)
  const [input, setInput] = useState('')
  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !items.includes(trimmed)) setItems(prev => [...prev, trimmed])
    setInput('')
  }
  const remove = (item: string) => setItems(prev => prev.filter(i => i !== item))
  return { items, input, setInput, add, remove }
}

export function EditChildModal({ child, onClose, onSave, nounSingular = 'child' }: EditChildModalProps) {
  const [name, setName] = useState(child.name)
  const [dateOfBirth, setDateOfBirth] = useState(child.dateOfBirth ?? '')
  const [avatarColor, setAvatarColor] = useState<'sage' | 'dblue' | 'sand'>(child.avatarColor)
  const [notes, setNotes] = useState(child.notes)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const labels     = useArrayField(child.contextLabels)
  const support    = useArrayField(child.supportNeeds)
  const strengths  = useArrayField(child.strengths)
  const interests  = useArrayField(child.interests)
  const goals      = useArrayField(child.goals)
  const routines   = useArrayField(child.routines)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError(`${nounSingular.charAt(0).toUpperCase() + nounSingular.slice(1)}'s name is required.`)
      return
    }
    setIsPending(true)
    const result = await updateChild(child.id, {
      name: name.trim(),
      dateOfBirth: dateOfBirth || undefined,
      avatarColor,
      contextLabels: labels.items,
      supportNeeds: support.items,
      strengths: strengths.items,
      interests: interests.items,
      goals: goals.items,
      routines: routines.items,
      notes: notes.trim(),
    })
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      onSave({
        ...child,
        name: name.trim(),
        dateOfBirth: dateOfBirth || null,
        avatarColor,
        contextLabels: labels.items,
        supportNeeds: support.items,
        strengths: strengths.items,
        interests: interests.items,
        goals: goals.items,
        routines: routines.items,
        notes: notes.trim(),
      })
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
        <div className="bg-white rounded-card-lg shadow-floating border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
            <h2 className="font-display text-display-sm font-semibold text-ink">Edit profile</h2>
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

            {/* ── Basic info ──────────────────────────────────── */}
            <div>
              <label htmlFor="edit-child-name" className="block text-body-sm font-medium text-ink mb-1.5">
                First name <span className="text-danger">*</span>
              </label>
              <input
                id="edit-child-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Emma"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <label htmlFor="edit-child-dob" className="block text-body-sm font-medium text-ink mb-1.5">
                Date of birth <span className="text-body-xs text-ink-tertiary font-normal">(optional)</span>
              </label>
              <input
                id="edit-child-dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            <div>
              <p className="text-body-sm font-medium text-ink mb-2">Avatar colour</p>
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

            {/* ── Context / profile detail fields ─────────────── */}
            <div className="pt-1 border-t border-border/60">
              <p className="text-body-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-4">Profile Details</p>

              <div className="space-y-5">
                <ArrayField
                  id="edit-labels"
                  label="Context labels"
                  hint="Freeform tags you choose — not medical records."
                  items={labels.items}
                  inputValue={labels.input}
                  onInputChange={labels.setInput}
                  onAdd={labels.add}
                  onRemove={labels.remove}
                  placeholder="e.g. ADHD, sensory processing"
                  chipClass="bg-sage-50 text-sage-700 border border-sage-200"
                />

                <ArrayField
                  id="edit-support"
                  label="Support needs"
                  items={support.items}
                  inputValue={support.input}
                  onInputChange={support.setInput}
                  onAdd={support.add}
                  onRemove={support.remove}
                  placeholder="e.g. Transitions, social cues"
                  chipClass="bg-sage-50 text-sage-700 border border-sage-200"
                />

                <ArrayField
                  id="edit-strengths"
                  label="Strengths"
                  items={strengths.items}
                  inputValue={strengths.input}
                  onInputChange={strengths.setInput}
                  onAdd={strengths.add}
                  onRemove={strengths.remove}
                  placeholder="e.g. Creative, strong memory"
                  chipClass="bg-dblue-50 text-dblue-700 border border-dblue-200"
                />

                <ArrayField
                  id="edit-interests"
                  label="Interests"
                  items={interests.items}
                  inputValue={interests.input}
                  onInputChange={interests.setInput}
                  onAdd={interests.add}
                  onRemove={interests.remove}
                  placeholder="e.g. Dinosaurs, trains, drawing"
                  chipClass="bg-dblue-50 text-dblue-700 border border-dblue-200"
                />

                <ArrayField
                  id="edit-goals"
                  label="Goals & focus areas"
                  items={goals.items}
                  inputValue={goals.input}
                  onInputChange={goals.setInput}
                  onAdd={goals.add}
                  onRemove={goals.remove}
                  placeholder="e.g. Improve peer interaction"
                  chipClass="bg-sand-100 text-sand-600 border border-sand-200"
                />

                <ArrayField
                  id="edit-routines"
                  label="Routines"
                  items={routines.items}
                  inputValue={routines.input}
                  onInputChange={routines.setInput}
                  onAdd={routines.add}
                  onRemove={routines.remove}
                  placeholder="e.g. Morning visual schedule"
                  chipClass="bg-sand-100 text-sand-600 border border-sand-200"
                />
              </div>
            </div>

            {/* ── Notes ───────────────────────────────────────── */}
            <div className="pt-1 border-t border-border/60">
              <label htmlFor="edit-child-notes" className="block text-body-sm font-medium text-ink mb-1.5">
                Notes <span className="text-body-xs text-ink-tertiary font-normal">(optional)</span>
              </label>
              <textarea
                id="edit-child-notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any context that helps you get better support..."
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-card text-body-sm text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:shadow-input-focus focus:border-sage-400 resize-none"
                style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
              />
            </div>

            {/* ── Actions ─────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-body-sm font-medium text-ink-secondary hover:text-ink hover:bg-raised rounded-card focus-ring"
                style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 active:scale-[0.98] focus-ring disabled:opacity-60"
                style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
              >
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
