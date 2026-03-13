import { createHash, randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure salt.
 * @param length The length of the salt in bytes.
 * @returns A hex-encoded string salt.
 */
export function generateSalt(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Creates a SHA-256 commitment for a given objective and salt.
 * @param objective The TacOp objective identifier or payload.
 * @param salt The cryptographic salt.
 * @returns A hex-encoded SHA-256 hash.
 */
export function createCommitment(objective: string, salt: string): string {
  return createHash('sha256')
    .update(objective + salt)
    .digest('hex');
}

/**
 * Verifies that a commitment matches the provided objective and salt.
 * @param commitment The original commitment hash.
 * @param objective The revealed objective.
 * @param salt The revealed salt.
 * @returns True if the commitment is valid.
 */
export function verifyCommitment(commitment: string, objective: string, salt: string): boolean {
  const check = createCommitment(objective, salt);
  return check === commitment;
}