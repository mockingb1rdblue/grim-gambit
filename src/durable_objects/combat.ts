export interface CombatRoll {
  type: 'hit' | 'wound' | 'save';
  value: number;
  threshold: number;
  isSuccess: boolean;
}

export interface WeaponProfile {
  id: string;
  name: string;
  keywords: string[];
  saveModifier: number;
}

export interface CombatState {
  attackerId: string;
  defenderId: string;
  weapon: WeaponProfile;
  rolls: CombatRoll[];
  isComplete: boolean;
}

export class CombatHandler {
  private state: CombatState;

  constructor(initialState: CombatState) {
    this.state = initialState;
  }

  public processHit(roll: number, threshold: number): void {
    const isSuccess = roll >= threshold;
    this.state.rolls.push({ type: 'hit', value: roll, threshold, isSuccess });
  }

  public processWound(roll: number, threshold: number): void {
    const isSuccess = roll >= threshold;
    this.state.rolls.push({ type: 'wound', value: roll, threshold, isSuccess });
  }

  public processSave(roll: number, baseSave: number): void {
    const modifier = this.state.weapon.keywords.includes('Piercing') 
      ? this.state.weapon.saveModifier 
      : 0;
    
    const effectiveThreshold = baseSave - modifier;
    const isSuccess = roll >= effectiveThreshold;
    
    this.state.rolls.push({ 
      type: 'save', 
      value: roll, 
      threshold: effectiveThreshold, 
      isSuccess 
    });
  }

  public markComplete(): void {
    this.state.isComplete = true;
  }

  public getState(): CombatState {
    return { ...this.state };
  }
}