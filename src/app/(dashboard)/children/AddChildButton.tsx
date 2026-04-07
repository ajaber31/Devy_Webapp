'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddChildModal } from '@/components/children/AddChildModal'

export function AddChildButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] flex-shrink-0 focus-ring"
        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
      >
        <Plus size={15} strokeWidth={2.5} />
        Add Child
      </button>

      {open && <AddChildModal onClose={() => setOpen(false)} />}
    </>
  )
}
