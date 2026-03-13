import { crypto } from "crypto";

/** 
 * Interface for a cryptographic commitment.
 */
export interface Commitment {
  hash: string;
  salt: string;
}

/**
 * Generates a commitment for a secret value.
 * Used to lock in a choice without revealing it.
 */
export async function createCommitment(secret: string): Promise<Commitment> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await hashSecret(secret, salt);
  return { hash, salt };
}

/**
 * Verifies that a revealed secret matches the original commitment.
 */
export async function verifyCommitment(
  secret: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const hash = await hashSecret(secret, salt);
  return hash === expectedHash;
}

/**
 * Internal helper to hash the secret with a salt using SHA-256.
 */
async function hashSecret(secret: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(secret + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}