/** Definitions for VP State Machine events and signals. */

export interface ScoringEvent {
  type: "ADD_VP";
  primary: number;
  secondary: number;
}

export interface PhaseEvent {
  type: "PHASE_CHANGE";
  phase: "setup" | "turning_point_1" | "turning_point_2" | "turning_point_3" | "turning_point_4" | "game_end";
}

export type MachineEvent = ScoringEvent | PhaseEvent;

/** Type guard for PhaseEvent. */
export function isPhaseEvent(event: MachineEvent): event is PhaseEvent {
  return event.type === "PHASE_CHANGE";
}