'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AddChildModal } from '@/components/children/AddChildModal'

interface AddChildButtonProps {
  label?: string
  modalTitle?: string
}

export function AddChildButton({ label = 'Add Child', modalTitle }: AddChildButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] flex-shrink-0 focus-ring"
        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
      >
        <Plus size={15} strokeWidth={2.5} />
        {label}
      </button>

      {open && (
        <AddChildModal
          onClose={() => setOpen(false)}
          onSaved={() => router.refresh()}
          title={modalTitle}
        />
      )}
    </>
  )
}
