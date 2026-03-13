/**
 * Represents a committed TacOp.
 */
export interface TacOpCommitment {
  commitment: string;
  salt: string;
  objective: string;
  isRevealed: boolean;
}

/**
 * Interface for the commitment flow.
 */
export interface TacOpManager {
  commit(objective: string): TacOpCommitment;
  reveal(commitment: TacOpCommitment, objective: string, salt: string): boolean;
}