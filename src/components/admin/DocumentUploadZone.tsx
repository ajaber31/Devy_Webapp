'use client'

import { useState } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { createDocumentRecord } from '@/lib/actions/documents'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ALLOWED_EXTS = ['pdf', 'docx', 'txt']
const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

function getFileExt(filename: string): 'pdf' | 'docx' | 'txt' | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  if (ext === 'txt') return 'txt'
  return null
}

interface UploadItem {
  file: File
  id: string
  uploading: boolean
  error?: string
}

interface DocumentUploadZoneProps {
  onSuccess?: () => void
}

export function DocumentUploadZone({ onSuccess }: DocumentUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const newItems: UploadItem[] = []

    Array.from(files).forEach(f => {
      const ext = getFileExt(f.name)
      if (!ext) return // silently skip unsupported types
      if (f.size > MAX_BYTES) return // silently skip oversized files
      newItems.push({ file: f, id: crypto.randomUUID(), uploading: false })
    })

    setQueue(prev => [...prev, ...newItems])
  }

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const handleUpload = async () => {
    if (queue.length === 0 || uploading) return
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      return
    }

    const processedIds: string[] = []

    for (const item of queue) {
      const ext = getFileExt(item.file.name)
      if (!ext) continue

      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, uploading: true, error: undefined } : i))

      const storagePath = `${user.id}/${item.id}.${ext}`

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(storagePath, item.file, { upsert: false })

      if (storageError) {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, error: storageError.message } : i))
        continue
      }

      // Create document record
      const title = item.file.name.replace(/\.\w+$/, '')
      const { data: doc, error: recordError } = await createDocumentRecord({
        title,
        originalFilename: item.file.name,
        fileType: ext,
        storagePath,
        fileSizeBytes: item.file.size,
      })

      if (recordError || !doc) {
        // Clean up the storage file if record creation failed
        await supabase.storage.from('documents').remove([storagePath])
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, error: recordError ?? 'Record creation failed' } : i))
        continue
      }

      processedIds.push(doc.id)
      setQueue(prev => prev.filter(i => i.id !== item.id))

      // Fire-and-forget: trigger the processing pipeline
      fetch(`/api/documents/${doc.id}/process`, { method: 'POST' }).catch(console.error)
    }

    setUploading(false)
    if (processedIds.length > 0) {
      onSuccess?.()
    }
  }

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6 mb-6">
      <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Upload documents</h3>
      <p className="text-body-sm text-ink-secondary mb-5">
        Add PDFs, Word documents, or text files to the knowledge base.
        Allowed types: {ALLOWED_EXTS.join(', ')} — up to 25 MB each.
      </p>

      {/* Drop zone */}
      <label
        className={cn(
          'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-card-lg py-10 cursor-pointer',
          dragging
            ? 'border-sage-400 bg-sage-50'
            : 'border-border bg-surface hover:border-sage-300 hover:bg-sage-50/50'
        )}
        style={{ transitionProperty: 'border-color, background-color', transitionDuration: '200ms' }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', dragging ? 'bg-sage-100 text-sage-600' : 'bg-raised text-ink-tertiary')}
          style={{ transitionProperty: 'background-color, color', transitionDuration: '200ms' }}>
          <Upload size={20} strokeWidth={1.75} />
        </div>
        <div className="text-center">
          <p className="text-body-sm font-medium text-ink mb-0.5">
            {dragging ? 'Drop to upload' : 'Drag files here or click to browse'}
          </p>
          <p className="text-body-xs text-ink-tertiary">PDF, DOCX, TXT up to 25MB each</p>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          className="sr-only"
          onChange={e => addFiles(e.target.files)}
          disabled={uploading}
        />
        <span className="px-4 py-2 bg-white border border-border rounded-pill text-body-sm font-medium text-ink hover:bg-raised shadow-card"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}>
          Browse files
        </span>
      </label>

      {/* Queued files */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-body-xs font-medium text-ink-secondary">
            {queue.length} file{queue.length > 1 ? 's' : ''} ready to upload
          </p>
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-card border border-border/50">
              <div className="w-7 h-7 rounded bg-sage-100 flex items-center justify-center flex-shrink-0">
                {item.uploading
                  ? <Loader2 size={13} className="text-sage-600 animate-spin" />
                  : <FileText size={13} className="text-sage-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-medium text-ink truncate">{item.file.name}</p>
                <p className="text-body-xs text-ink-tertiary">
                  {formatFileSize(Math.round(item.file.size / 1024))}
                  {item.error && <span className="ml-2 text-danger">{item.error}</span>}
                  {item.uploading && <span className="ml-2 text-ink-tertiary">Uploading…</span>}
                </p>
              </div>
              {!item.uploading && (
                <button
                  onClick={() => removeFromQueue(item.id)}
                  className="p-1 rounded text-ink-tertiary hover:text-danger hover:bg-raised focus-ring"
                  style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
                  aria-label="Remove file"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}
          >
            {uploading && <Loader2 size={14} className="animate-spin" />}
            {uploading ? 'Uploading…' : `Upload ${queue.length} file${queue.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
