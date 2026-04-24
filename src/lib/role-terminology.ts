import type { UserRole } from '@/lib/types'
import type { Lang } from '@/lib/i18n/translations'
import { translations } from '@/lib/i18n/translations'

export interface RoleTerminology {
  nounPlural: string       // "Children" | "Enfants" | "Clients"
  nounSingular: string     // "Child" | "Enfant" | "Client"
  possessive: string       // "My Children" | "Mes enfants"
  addLabel: string         // "Add Child" | "Ajouter un enfant"
  emptyTitle: string
  emptyDescription: string
  statLabel: string
}

/**
 * Returns localized role-specific noun terminology.
 * Parents/teachers get the child-oriented vocabulary; clinicians/caregivers/others
 * get client-oriented vocabulary. Translations live in translations.ts under role.*
 */
export function getRoleTerminology(
  role: UserRole | string,
  lang: Lang = 'en',
): RoleTerminology {
  const t = translations[lang].role
  switch (role) {
    case 'clinician':
    case 'caregiver':
    case 'other':
      return t.clinician
    case 'teacher':
    case 'parent':
    default:
      return t.parent
  }
}
