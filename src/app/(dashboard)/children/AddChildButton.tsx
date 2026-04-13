'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AddChildModal } from '@/components/children/AddChildModal'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import type { PlanId } from '@/lib/types'

interface AddChildButtonProps {
  label?: string
  modalTitle?: string
  planLimitReached?: boolean
  currentPlanId?: PlanId
}

export function AddChildButton({
  label = 'Add Child',
  modalTitle,
  planLimitReached = false,
  currentPlanId = 'free',
}: AddChildButtonProps) {
  const [openAdd, setOpenAdd] = useState(false)
  const [openUpgrade, setOpenUpgrade] = useState(false)
  const router = useRouter()

  function handleClick() {
    if (planLimitReached) {
      setOpenUpgrade(true)
    } else {
      setOpenAdd(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 text-white font-semibold text-body-sm rounded-card shadow-button hover:bg-sage-600 active:scale-[0.98] flex-shrink-0 focus-ring"
        style={{ transitionProperty: 'background-color, transform', transitionDuration: '150ms' }}
      >
        <Plus size={15} strokeWidth={2.5} />
        {label}
      </button>

      {openAdd && (
        <AddChildModal
          onClose={() => setOpenAdd(false)}
          onSaved={() => router.refresh()}
          title={modalTitle}
        />
      )}

      <UpgradeModal
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        reason="child_limit"
        currentPlanId={currentPlanId}
      />
    </>
  )
}
