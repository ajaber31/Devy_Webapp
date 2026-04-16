'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { EXAMPLE_PROMPTS, CHILD_EXAMPLE_PROMPTS } from '@/lib/constants'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void
  childName?: string
}

const pickRandom = (pool: string[], n: number) =>
  [...pool].sort(() => Math.random() - 0.5).slice(0, n)

export function ExamplePrompts({ onSelect, childName }: ExamplePromptsProps) {
  const { t } = useLanguage()
  const tc = t.chatUi

  const [prompts] = useState(() => {
    const pool = childName ? CHILD_EXAMPLE_PROMPTS(childName) : EXAMPLE_PROMPTS
    return pickRandom(pool, 4)
  })

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mb-5">
        <Sparkles size={22} className="text-sage-600" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-display-sm font-semibold text-ink text-center mb-2 tracking-tight">
        {childName ? `${tc.askingAbout} ${childName}` : tc.helpToday}
      </h2>
      <p className="text-body-sm text-ink-secondary text-center max-w-md mb-8 leading-relaxed">
        {childName ? tc.sourceNoteChild : tc.sourceNoteGeneral}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left px-4 py-3.5 bg-white border border-border rounded-card shadow-card hover:shadow-card-hover hover:border-sage-300 hover:bg-sage-50 group focus-ring"
            style={{ transitionProperty: 'border-color, background-color, box-shadow', transitionDuration: '200ms' }}
          >
            <p className="text-body-sm text-ink group-hover:text-sage-800 transition-colors duration-150 leading-snug">
              {prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
