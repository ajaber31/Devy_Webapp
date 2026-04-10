'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MoreHorizontal, Trash2, RefreshCw, Tag, X, Plus, Check } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { formatDateFull, formatFileSize } from '@/lib/utils'
import { getDocuments, deleteDocument, reprocessDocument, updateDocumentTags } from '@/lib/actions/documents'
import type { Document, DocumentStatus } from '@/lib/types'

const IN_PROGRESS: DocumentStatus[] = ['uploaded', 'parsing', 'chunking', 'embedding']

const typeIcon = (type: string) => {
  if (type === 'pdf')  return <span className="text-danger font-bold text-[0.6rem]">PDF</span>
  if (type === 'docx') return <span className="text-dblue-500 font-bold text-[0.6rem]">DOC</span>
  return <span className="text-ink-tertiary font-bold text-[0.6rem]">TXT</span>
}

interface DocumentTableProps {
  /** Increment this to force a full re-fetch from the parent. */
  refreshKey?: number
}

export function DocumentTable({ refreshKey }: DocumentTableProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tag editing state
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [pendingTags, setPendingTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [savingTags, setSavingTags] = useState(false)

  const refresh = useCallback(async () => {
    const docs = await getDocuments()
    setDocuments(docs)
    setLoading(false)
    return docs
  }, [])

  // Start / stop polling based on whether any document is in-progress
  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(async () => {
      const docs = await refresh()
      const hasInProgress = docs.some(d => IN_PROGRESS.includes(d.status))
      if (!hasInProgress && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 3000)
  }, [refresh])

  useEffect(() => {
    refresh().then(docs => {
      if (docs.some(d => IN_PROGRESS.includes(d.status))) {
        startPolling()
      }
    })
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [refresh, startPolling, refreshKey])

  // Kick off polling whenever a new in-progress doc appears
  useEffect(() => {
    if (documents.some(d => IN_PROGRESS.includes(d.status))) {
      startPolling()
    }
  }, [documents, startPolling])

  async function handleDelete(id: string) {
    setOpenMenuId(null)
    setDocuments(prev => prev.filter(d => d.id !== id))
    await deleteDocument(id)
  }

  async function handleReprocess(id: string) {
    setOpenMenuId(null)
    // Optimistically show as queued
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'uploaded' as DocumentStatus } : d))
    await reprocessDocument(id)
    // Trigger the processing pipeline
    fetch(`/api/documents/${id}/process`, { method: 'POST' }).catch(console.error)
    startPolling()
  }

  function openTagEditor(doc: Document) {
    setOpenMenuId(null)
    setEditingTagsId(doc.id)
    setPendingTags([...doc.tags])
    setTagInput('')
  }

  function cancelTagEdit() {
    setEditingTagsId(null)
    setPendingTags([])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setPendingTags(prev => prev.filter(t => t !== tag))
  }

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !pendingTags.includes(trimmed)) {
      setPendingTags(prev => [...prev, trimmed])
    }
  }

  function handleTagInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
  }

  async function saveTagEdit() {
    if (!editingTagsId) return
    setSavingTags(true)
    const result = await updateDocumentTags(editingTagsId, pendingTags)
    setSavingTags(false)
    if (!result.error) {
      setDocuments(prev =>
        prev.map(d => d.id === editingTagsId ? { ...d, tags: pendingTags } : d)
      )
      cancelTagEdit()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-8 text-center text-ink-tertiary text-body-sm">
        Loading documents…
      </div>
    )
  }

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">
          Knowledge base documents
          <span className="ml-2 px-2 py-0.5 bg-raised rounded-full text-body-xs text-ink-secondary font-normal">
            {documents.length} file{documents.length !== 1 ? 's' : ''}
          </span>
        </h3>
      </div>

      {documents.length === 0 ? (
        <div className="px-5 py-12 text-center text-ink-tertiary text-body-sm">
          No documents uploaded yet. Add your first document above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                {['Document', 'Size', 'Status', 'Date', 'Tags', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-body-xs font-semibold text-ink-secondary uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <>
                  <tr
                    key={doc.id}
                    className="border-b border-border/50 last:border-0 hover:bg-surface/70 group"
                    style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                  >
                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-raised border border-border/50 flex items-center justify-center flex-shrink-0">
                          {typeIcon(doc.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium text-ink truncate max-w-[220px]">{doc.title}</p>
                          {doc.chunkCount > 0 && (
                            <p className="text-body-xs text-ink-tertiary">{doc.chunkCount} chunks indexed</p>
                          )}
                          {doc.errorMessage && (
                            <p className="text-body-xs text-danger truncate max-w-[220px]" title={doc.errorMessage}>
                              {doc.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                      {formatFileSize(Math.round(doc.fileSizeBytes / 1024))}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge type="document" status={doc.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                      {formatDateFull(doc.uploadedAt)}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-raised rounded text-body-xs text-ink-secondary">{tag}</span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 text-body-xs text-ink-tertiary">+{doc.tags.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                        className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring opacity-0 group-hover:opacity-100"
                        style={{ transitionProperty: 'color, background-color, opacity', transitionDuration: '150ms' }}
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openMenuId === doc.id && (
                        <div className="absolute right-4 top-full mt-1 bg-white rounded-card shadow-floating border border-border py-1 z-20 min-w-[150px]">
                          <button
                            onClick={() => openTagEditor(doc)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                            style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                          >
                            <Tag size={13} />
                            Edit tags
                          </button>
                          <button
                            onClick={() => handleReprocess(doc.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ink-secondary hover:bg-raised hover:text-ink"
                            style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                          >
                            <RefreshCw size={13} />
                            Reprocess
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-danger hover:bg-raised"
                            style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Inline tag editor — shown below the row when editing */}
                  {editingTagsId === doc.id && (
                    <tr key={`${doc.id}-tag-editor`} className="border-b border-border/50 bg-sage-50/60">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="flex flex-col gap-3">
                          <p className="text-body-xs font-semibold text-ink-secondary uppercase tracking-wider">
                            Edit tags for <span className="normal-case font-medium text-ink">{doc.title}</span>
                          </p>

                          {/* Current tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            {pendingTags.map(tag => (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-xs font-medium border ${
                                  tag === 'peer-reviewed'
                                    ? 'bg-sage-100 text-sage-700 border-sage-300'
                                    : 'bg-raised text-ink-secondary border-border'
                                }`}
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="text-current opacity-60 hover:opacity-100 rounded-full focus-ring"
                                  aria-label={`Remove ${tag}`}
                                >
                                  <X size={11} strokeWidth={2.5} />
                                </button>
                              </span>
                            ))}

                            {/* peer-reviewed quick-add */}
                            {!pendingTags.includes('peer-reviewed') && (
                              <button
                                type="button"
                                onClick={() => addTag('peer-reviewed')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-xs font-medium border border-sage-300 text-sage-600 hover:bg-sage-100 focus-ring"
                                style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}
                              >
                                <Plus size={11} strokeWidth={2.5} />
                                peer-reviewed
                              </button>
                            )}
                          </div>

                          {/* Text input for custom tags */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyDown={handleTagInputKey}
                              placeholder="Type a tag and press Enter…"
                              className="flex-1 max-w-xs px-3 py-1.5 bg-white border border-border rounded-card text-body-xs text-ink placeholder:text-ink-tertiary shadow-input focus:outline-none focus:border-sage-400 focus:shadow-input-focus"
                              style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '150ms' }}
                            />
                            <button
                              type="button"
                              onClick={() => { addTag(tagInput); setTagInput('') }}
                              disabled={!tagInput.trim()}
                              className="p-1.5 rounded bg-raised text-ink-secondary hover:text-ink focus-ring disabled:opacity-40"
                              aria-label="Add tag"
                            >
                              <Plus size={14} strokeWidth={2} />
                            </button>
                          </div>

                          {/* Save / Cancel */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={saveTagEdit}
                              disabled={savingTags}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-body-xs font-medium rounded-pill shadow-button hover:bg-sage-600 active:scale-95 focus-ring disabled:opacity-60"
                              style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
                            >
                              <Check size={12} strokeWidth={2.5} />
                              {savingTags ? 'Saving…' : 'Save tags'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelTagEdit}
                              className="px-3 py-1.5 text-body-xs font-medium text-ink-secondary hover:text-ink rounded-pill hover:bg-raised focus-ring"
                              style={{ transitionProperty: 'background-color, color', transitionDuration: '150ms' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
