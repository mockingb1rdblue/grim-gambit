import { determineOptimalAction, CombatState } from './strategy';

describe('determineOptimalAction', () => {
  it('should prioritize block when health is critical', () => {
    const state: CombatState = {
      health: 15,
      enemyHealth: 50,
      stamina: 20,
      enemyLastAction: 'idle',
    };
    expect(determineOptimalAction(state)).toBe('block');
  });

  it('should strike when enemy is low on health', () => {
    const state: CombatState = {
      health: 80,
      enemyHealth: 10,
      stamina: 20,
      enemyLastAction: 'idle',
    };
    expect(determineOptimalAction(state)).toBe('strike');
  });

  it('should block when the enemy just struck', () => {
    const state: CombatState = {
      health: 50,
      enemyHealth: 50,
      stamina: 20,
      enemyLastAction: 'strike',
    };
    expect(determineOptimalAction(state)).toBe('block');
  });
});