import { createHash } from 'crypto'

/**
 * Creates an anonymous hash from user email to maintain privacy
 * while preventing duplicate votes
 */
export function createAnonymousUserId(email: string): string {
  // Use simple concatenation to match Firestore rules (for now)
  // In production, this should use proper hashing
  const salt = process.env.NEXT_PUBLIC_HASH_SALT || 'class-voting-salt-2024'
  return email + salt
}

/**
 * Validates if email belongs to the allowed domain
 */
export function isValidDomain(email: string): boolean {
  const allowedDomain = 'bitf22m0--.pucit.edu.pk'
  return email.endsWith(`@${allowedDomain}`)
}

/**
 * Checks if user is admin based on email
 */
export function isAdmin(email: string): boolean {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
  return email === adminEmail
}
