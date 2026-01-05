import { describe, it, expect } from 'vitest';

describe('Order State Transition', () => {
  it('should allow transition from CREATED to ANALYSIS', () => {
    const validTransition = (currentState: string, nextState: string): boolean => {
      const validStates = {
        CREATED: ['ANALYSIS'],
        ANALYSIS: ['COMPLETED'],
        COMPLETED: [],
      };
      return validStates[currentState as keyof typeof validStates]?.includes(nextState) ?? false;
    };

    expect(validTransition('CREATED', 'ANALYSIS')).toBe(true);
  });

  it('should block invalid transitions', () => {
    const validTransition = (currentState: string, nextState: string): boolean => {
      const validStates = {
        CREATED: ['ANALYSIS'],
        ANALYSIS: ['COMPLETED'],
        COMPLETED: [],
      };
      return validStates[currentState as keyof typeof validStates]?.includes(nextState) ?? false;
    };

    expect(validTransition('CREATED', 'COMPLETED')).toBe(false);
    expect(validTransition('ANALYSIS', 'CREATED')).toBe(false);
  });
});
