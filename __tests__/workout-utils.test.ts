import { describe, it, expect, beforeEach } from 'vitest';
import { kgToLb, lbToKg, createNewSession } from '@/lib/workout-utils';
import { EXERCISES } from '@/lib/exercises';

describe('Weight Conversion', () => {
  it('should convert kg to lb correctly', () => {
    expect(kgToLb(50)).toBeCloseTo(110.23, 2);
    expect(kgToLb(100)).toBeCloseTo(220.46, 2);
    expect(kgToLb(0)).toBe(0);
  });

  it('should convert lb to kg correctly', () => {
    expect(lbToKg(110.23)).toBeCloseTo(50, 2);
    expect(lbToKg(220.46)).toBeCloseTo(100, 2);
    expect(lbToKg(0)).toBe(0);
  });

  it('should be reversible', () => {
    const originalKg = 75;
    const lb = kgToLb(originalKg);
    const backToKg = lbToKg(lb);
    expect(backToKg).toBeCloseTo(originalKg, 1);
  });
});

describe('Session Creation', () => {
  it('should create a new session with correct structure', () => {
    const sessionNumber = 1;
    const session = createNewSession(sessionNumber);

    expect(session.sessionNumber).toBe(sessionNumber);
    expect(session.completed).toBe(false);
    expect(session.sessionId).toContain('session_');
    expect(session.exercises).toHaveLength(EXERCISES.length);
  });

  it('should initialize all exercises as incomplete', () => {
    const session = createNewSession(1);
    
    session.exercises.forEach(exercise => {
      expect(exercise.completed).toBe(false);
      expect(exercise.exerciseId).toBeDefined();
      expect(exercise.exerciseName).toBeDefined();
    });
  });

  it('should include all exercise types', () => {
    const session = createNewSession(1);
    const exerciseNames = session.exercises.map(e => e.exerciseName);

    // Check for key exercises
    expect(exerciseNames).toContain('20 Minutes Jogging');
    expect(exerciseNames).toContain('Seated Leg Curls');
    expect(exerciseNames).toContain('Weighted Hip Thrusts');
    expect(exerciseNames).toContain('Volleyball Spike Jump onto Box');
  });
});

describe('Exercise Data', () => {
  it('should have 19 exercises in total', () => {
    expect(EXERCISES).toHaveLength(19);
  });

  it('should have correct exercise types', () => {
    const warmupCount = EXERCISES.filter(e => e.type === 'warmup').length;
    const stretchCount = EXERCISES.filter(e => e.type === 'stretch').length;
    const strengthCount = EXERCISES.filter(e => e.type === 'strength').length;
    const finisherCount = EXERCISES.filter(e => e.type === 'finisher').length;

    expect(warmupCount).toBe(1); // Jogging
    expect(stretchCount).toBe(9); // 3 stretches x 3 rounds
    expect(strengthCount).toBe(8); // 4 exercises x 2 rounds
    expect(finisherCount).toBe(1); // Box jump
  });

  it('should have strength exercises requiring weight', () => {
    const strengthExercises = EXERCISES.filter(e => e.requiresWeight);
    expect(strengthExercises.length).toBeGreaterThan(0);
    
    strengthExercises.forEach(exercise => {
      expect(exercise.reps).toBe(7);
    });
  });

  it('should have box jump requiring height', () => {
    const boxJump = EXERCISES.find(e => e.requiresHeight);
    expect(boxJump).toBeDefined();
    expect(boxJump?.name).toBe('Volleyball Spike Jump onto Box');
    expect(boxJump?.reps).toBe(7);
  });
});
