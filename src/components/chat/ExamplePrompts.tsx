import { Sparkles } from 'lucide-react'
import { EXAMPLE_PROMPTS, CHILD_EXAMPLE_PROMPTS } from '@/lib/constants'

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void
  childName?: string
}

export function ExamplePrompts({ onSelect, childName }: ExamplePromptsProps) {
  const prompts = childName ? CHILD_EXAMPLE_PROMPTS(childName) : EXAMPLE_PROMPTS

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mb-5">
        <Sparkles size={22} className="text-sage-600" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-display-sm font-semibold text-ink text-center mb-2 tracking-tight">
        {childName ? `Asking about ${childName}` : 'How can I help today?'}
      </h2>
      <p className="text-body-sm text-ink-secondary text-center max-w-md mb-8 leading-relaxed">
        {childName
          ? `Every answer comes from Devy's approved knowledge base and cites its source.`
          : `Ask a question about a child's needs, routines, support strategies, or development. Every answer cites its source.`}
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
