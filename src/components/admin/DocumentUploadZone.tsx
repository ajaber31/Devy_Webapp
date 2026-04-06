'use client'

import { useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface QueuedFile {
  name: string
  size: number
  type: string
}

export function DocumentUploadZone() {
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<QueuedFile[]>([])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles: QueuedFile[] = Array.from(files).map(f => ({
      name: f.name,
      size: Math.round(f.size / 1024),
      type: f.name.split('.').pop()?.toLowerCase() ?? 'file',
    }))
    setQueue(prev => [...prev, ...newFiles])
  }

  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 p-6 mb-6">
      <h3 className="font-display text-display-sm font-semibold text-ink mb-1">Upload documents</h3>
      <p className="text-body-sm text-ink-secondary mb-5">Add PDFs, Word documents, or text files to the knowledge base.</p>

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
        />
        <span className="px-4 py-2 bg-white border border-border rounded-pill text-body-sm font-medium text-ink hover:bg-raised shadow-card"
          style={{ transitionProperty: 'background-color', transitionDuration: '150ms' }}>
          Browse files
        </span>
      </label>

      {/* Queued files */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-body-xs font-medium text-ink-secondary">{queue.length} file{queue.length > 1 ? 's' : ''} ready to upload</p>
          {queue.map((file, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-card border border-border/50">
              <div className="w-7 h-7 rounded bg-sage-100 flex items-center justify-center flex-shrink-0">
                <FileText size={13} className="text-sage-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-medium text-ink truncate">{file.name}</p>
                <p className="text-body-xs text-ink-tertiary">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setQueue(prev => prev.filter((_, j) => j !== i))}
                className="p-1 rounded text-ink-tertiary hover:text-danger hover:bg-raised focus-ring"
                style={{ transitionProperty: 'color, background-color', transitionDuration: '150ms' }}
                aria-label="Remove file"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <button className="w-full py-2.5 bg-sage-500 text-white font-medium text-body-sm rounded-pill shadow-button hover:bg-sage-600 hover:shadow-button-hover active:scale-[0.99] focus-ring"
            style={{ transitionProperty: 'background-color, box-shadow, transform', transitionDuration: '150ms' }}>
            Upload {queue.length} file{queue.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}
