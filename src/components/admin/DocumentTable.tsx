import { MoreHorizontal } from 'lucide-react'
import { mockDocuments } from '@/lib/mock-data/documents'
import { StatusBadge } from './StatusBadge'
import { formatDateFull, formatFileSize } from '@/lib/utils'

const typeIcon = (type: string) => {
  if (type === 'pdf')  return <span className="text-danger font-bold text-[0.6rem]">PDF</span>
  if (type === 'docx') return <span className="text-dblue-500 font-bold text-[0.6rem]">DOC</span>
  return <span className="text-ink-tertiary font-bold text-[0.6rem]">TXT</span>
}

export function DocumentTable() {
  return (
    <div className="bg-white rounded-card-lg shadow-card border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-[1.05rem] font-semibold text-ink">
          Knowledge base documents
          <span className="ml-2 px-2 py-0.5 bg-raised rounded-full text-body-xs text-ink-secondary font-normal">
            {mockDocuments.length} files
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['Document', 'Size', 'Status', 'Uploaded by', 'Date', 'Tags', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-body-xs font-semibold text-ink-secondary uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockDocuments.map((doc) => (
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
                      <p className="text-body-sm font-medium text-ink truncate max-w-[220px]">{doc.name}</p>
                      {doc.chunkCount && (
                        <p className="text-body-xs text-ink-tertiary">{doc.chunkCount} chunks indexed</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Size */}
                <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                  {formatFileSize(doc.sizeKb)}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge type="document" status={doc.status} />
                </td>

                {/* Uploaded by */}
                <td className="px-4 py-3.5 text-body-sm text-ink-secondary whitespace-nowrap">
                  {doc.uploadedBy}
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
                <td className="px-4 py-3.5">
                  <button
                    className="p-1.5 rounded text-ink-tertiary hover:text-ink hover:bg-raised focus-ring opacity-0 group-hover:opacity-100"
                    style={{ transitionProperty: 'color, background-color, opacity', transitionDuration: '150ms' }}
                    aria-label="More actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
