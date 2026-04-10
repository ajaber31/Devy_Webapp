import { z } from 'zod'

// ─── Shared primitives ────────────────────────────────────────────────────────

const uuid = z.string().uuid()
const shortString = (max = 255) => z.string().min(1).max(max).trim()
const optionalShort = (max = 255) => z.string().max(max).trim().optional()

// Array of short strings — limits both item length and total count.
const labelArray = (itemMax = 200, maxItems = 50) =>
  z.array(z.string().max(itemMax).trim()).max(maxItems).optional()

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z.string().email('Invalid email address').max(255).toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
})

export const signUpSchema = z.object({
  name: shortString(100),
  email: z.string().email('Invalid email address').max(255).toLowerCase(),
  // Supabase enforces min length in Auth settings; we enforce a floor here too.
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  accountType: z.enum(
    ['parent', 'clinician_professional', 'caregiver', 'teacher', 'other'],
    'Invalid account type',
  ),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255).toLowerCase(),
})

export const updatePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)

// ─── Profile ──────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: shortString(100).optional(),
})

// ─── Children ─────────────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const createChildSchema = z.object({
  name: shortString(100),
  dateOfBirth: z
    .string()
    .regex(ISO_DATE, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  avatarColor: z.enum(['sage', 'dblue', 'sand']).optional(),
  contextLabels: labelArray(),
  supportNeeds: labelArray(),
  strengths: labelArray(),
  interests: labelArray(),
  routines: labelArray(),
  goals: labelArray(),
  notes: z.string().max(5_000).optional(),
})

export const updateChildSchema = createChildSchema.partial()

// ─── Conversations ────────────────────────────────────────────────────────────

export const createConversationSchema = z.object({
  title: optionalShort(100),
  childId: uuid.optional(),
  childName: optionalShort(100),
})

export const renameConversationSchema = z.object({
  id: uuid,
  title: shortString(100),
})

// ─── Chat (API route) ─────────────────────────────────────────────────────────

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4_000, 'Message too long — maximum 4,000 characters'),
  conversationId: uuid.nullable(),
  childId: uuid.optional(),
  // childName appears verbatim in the system prompt — constrain it tightly.
  childName: z
    .string()
    .max(100)
    .trim()
    // Reject strings that look like prompt injection payloads.
    .refine(
      v => !v || !/\[\[|\]\]|<\||\|\>|###|system:|user:|assistant:/i.test(v),
      'Invalid child name',
    )
    .optional(),
})

// ─── Documents ────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50 MB

export const createDocumentSchema = z.object({
  title: shortString(200),
  originalFilename: z
    .string()
    .min(1)
    .max(255)
    // Prevent path traversal characters in filenames.
    .refine(v => !/[/\\<>:"|?*\x00-\x1f]/.test(v), 'Invalid filename'),
  fileType: z.enum(['pdf', 'docx', 'txt']),
  storagePath: z.string().min(1).max(500),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_BYTES, `File must be ≤ 50 MB`),
  tags: z.array(z.string().max(50).trim()).max(20).optional(),
})

export const updateDocumentTagsSchema = z.object({
  id: uuid,
  tags: z.array(z.string().max(50).trim()).max(20),
})

// ─── Admin ────────────────────────────────────────────────────────────────────

export const VALID_ROLES = ['parent', 'caregiver', 'clinician', 'teacher', 'admin'] as const
export const VALID_STATUSES = ['active', 'suspended'] as const

export const updateUserRoleSchema = z.object({
  id: uuid,
  role: z.enum(VALID_ROLES),
})

export const updateUserStatusSchema = z.object({
  id: uuid,
  status: z.enum(VALID_STATUSES),
})
