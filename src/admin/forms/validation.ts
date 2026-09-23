import { z } from 'zod'
import type { FieldErrors } from '@/admin/forms/types'

/** Reusable zod pieces. Empty optional inputs become null in the database. */

export const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(500, `${label} is too long`)

export const optionalText = z
  .string()
  .trim()
  .max(500, 'This is too long')
  .transform((value) => value || null)

export const longText = z.string().trim().max(10000, 'This is too long')

export const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/\S+\.\S+$/i.test(value), {
    message: 'Enter a full link starting with https://',
  })
  .transform((value) => value || null)

export const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === '' || z.email().safeParse(value).success, {
    message: 'Enter a valid email address',
  })
  .transform((value) => value || null)

export const requiredDate = (label: string) => z.string().min(1, `${label} is required`)

export const optionalDate = z.string().transform((value) => value || null)

export const imagePath = z.string().nullable()

export const tagList = z.array(z.string().trim().min(1)).max(30, 'Use at most 30 tags')

/** Adds an error on `endField` when it is before `startField`. */
export function endAfterStart(startField: string, endField: string, message: string) {
  return (values: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const start = values[startField]
    const end = values[endField]
    if (typeof start === 'string' && typeof end === 'string' && start && end && end < start) {
      ctx.addIssue({ code: 'custom', path: [endField], message })
    }
  }
}

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}
