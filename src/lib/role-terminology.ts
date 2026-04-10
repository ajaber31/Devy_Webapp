import type { UserRole } from '@/lib/types'

export interface RoleTerminology {
  nounPlural: string       // "Children" | "Clients"
  nounSingular: string     // "Child" | "Client"
  possessive: string       // "My Children" | "My Clients"
  addLabel: string         // "Add Child" | "Add Client"
  emptyTitle: string       // "No children yet" | "No clients yet"
  emptyDescription: string
  statLabel: string        // "Child Profiles" | "Client Profiles"
}

const PARENT_TERMS: RoleTerminology = {
  nounPlural: 'Children',
  nounSingular: 'Child',
  possessive: 'My Children',
  addLabel: 'Add Child',
  emptyTitle: 'No children yet',
  emptyDescription: 'Add a child profile to start organising your conversations and getting personalised support.',
  statLabel: 'Child Profiles',
}

const CLINICIAN_TERMS: RoleTerminology = {
  nounPlural: 'Clients',
  nounSingular: 'Client',
  possessive: 'My Clients',
  addLabel: 'Add Client',
  emptyTitle: 'No clients yet',
  emptyDescription: 'Add a client profile to start organising your conversations and getting personalised support.',
  statLabel: 'Client Profiles',
}

export function getRoleTerminology(role: UserRole | string): RoleTerminology {
  switch (role) {
    case 'clinician':
    case 'caregiver':
    case 'other':
      return CLINICIAN_TERMS
    case 'teacher':
    case 'parent':
    default:
      return PARENT_TERMS
  }
}
