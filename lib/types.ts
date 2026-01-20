/**
 * Data models for Basketball Leg & Hip Training app
 */

export type ExerciseType = 'warmup' | 'stretch' | 'strength' | 'finisher' | 'custom';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  reps?: number;
  duration?: number; // in seconds for timed exercises
  requiresWeight?: boolean;
  requiresHeight?: boolean; // for box jump
  instructions: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  weightKg?: number;
  weightLb?: number;
  boxJumpInches?: number;
  completed: boolean;
  completedAt?: string; // ISO timestamp
}

export interface WorkoutSession {
  sessionId: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  startedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  completed: boolean;
  exercises: ExerciseLog[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxWeightLb: number;
  achievedAt: string; // ISO timestamp
  sessionNumber: number;
}

export interface CustomExercise {
  id: string;
  name: string;
  type: ExerciseType;
  reps?: number;
  duration?: number;
  requiresWeight?: boolean;
  requiresHeight?: boolean;
  instructions: string;
  createdAt: string;
}

export interface AppSettings {
  defaultWeightUnit: 'kg' | 'lb';
}
