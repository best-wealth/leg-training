import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, AppSettings, PersonalRecord, ExerciseLog } from './types';
import { EXERCISES } from './exercises';

// Storage keys
const SESSIONS_KEY = '@basketball_training_sessions';
const SETTINGS_KEY = '@basketball_training_settings';

/**
 * Weight conversion utilities
 */
export const KG_TO_LB = 2.20462;
export const LB_TO_KG = 1 / KG_TO_LB;

export function kgToLb(kg: number): number {
  return Math.round(kg * KG_TO_LB * 100) / 100;
}

export function lbToKg(lb: number): number {
  return Math.round(lb * LB_TO_KG * 100) / 100;
}

/**
 * Session management
 */
export async function getAllSessions(): Promise<WorkoutSession[]> {
  return [];
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  // Session saving disabled
}

export async function getSessionById(sessionId: string): Promise<WorkoutSession | null> {
  const sessions = await getAllSessions();
  const found = sessions.find(s => s.sessionId === sessionId);
  if (found) return found;
  
  // Return a default session when storage is disabled
  return createNewSession(1);
}

export async function getActiveSession(): Promise<WorkoutSession | null> {
  const sessions = await getAllSessions();
  return sessions.find(s => !s.completed) || null;
}

export async function getNextSessionNumber(): Promise<number> {
  const sessions = await getAllSessions();
  if (sessions.length === 0) return 1;
  return Math.max(...sessions.map(s => s.sessionNumber)) + 1;
}

/**
 * Create a new workout session
 */
export function createNewSession(sessionNumber: number): WorkoutSession {
  const now = new Date();
  const sessionId = `session_${now.getTime()}`;
  
  return {
    sessionId,
    sessionNumber,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
    startedAt: now.toISOString(),
    completed: false,
    exercises: EXERCISES.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      completed: false,
    })),
  };
}

/**
 * Settings management
 */
export async function getSettings(): Promise<AppSettings> {
  return { defaultWeightUnit: 'kg' };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  // Settings saving disabled
}

/**
 * Personal Records (PR) calculation
 */
export async function calculatePersonalRecords(): Promise<PersonalRecord[]> {
  const sessions = await getAllSessions();
  const completedSessions = sessions.filter(s => s.completed);
  
  const prMap = new Map<string, PersonalRecord>();
  
  for (const session of completedSessions) {
    for (const exerciseLog of session.exercises) {
      if (!exerciseLog.weightKg || !exerciseLog.completed) continue;
      
      const key = exerciseLog.exerciseName;
      const existing = prMap.get(key);
      
      if (!existing || exerciseLog.weightKg > existing.maxWeightKg) {
        prMap.set(key, {
          exerciseId: exerciseLog.exerciseId,
          exerciseName: exerciseLog.exerciseName,
          maxWeightKg: exerciseLog.weightKg,
          maxWeightLb: exerciseLog.weightLb || kgToLb(exerciseLog.weightKg),
          achievedAt: exerciseLog.completedAt || session.completedAt || session.startedAt,
          sessionNumber: session.sessionNumber,
        });
      }
    }
  }
  
  return Array.from(prMap.values());
}

/**
 * Get weight progression for a specific exercise
 */
export async function getExerciseProgression(exerciseName: string): Promise<{
  sessionNumber: number;
  date: string;
  maxWeightKg: number;
  maxWeightLb: number;
}[]> {
  const sessions = await getAllSessions();
  const completedSessions = sessions.filter(s => s.completed);
  
  const progression = completedSessions
    .map(session => {
      const exerciseLogs = session.exercises.filter(
        ex => ex.exerciseName === exerciseName && ex.completed && ex.weightKg
      );
      
      if (exerciseLogs.length === 0) return null;
      
      // Get max weight from this session (in case exercise appears multiple times)
      const maxLog = exerciseLogs.reduce((max, log) => 
        (log.weightKg || 0) > (max.weightKg || 0) ? log : max
      );
      
      return {
        sessionNumber: session.sessionNumber,
        date: session.date,
        maxWeightKg: maxLog.weightKg || 0,
        maxWeightLb: maxLog.weightLb || kgToLb(maxLog.weightKg || 0),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);
  
  return progression;
}

/**
 * Get box jump progression
 */
export async function getBoxJumpProgression(): Promise<{
  sessionNumber: number;
  date: string;
  maxHeightInches: number;
}[]> {
  const sessions = await getAllSessions();
  const completedSessions = sessions.filter(s => s.completed);
  
  const progression = completedSessions
    .map(session => {
      const boxJumpLog = session.exercises.find(
        ex => ex.exerciseId === 'box-jump' && ex.completed && ex.boxJumpInches
      );
      
      if (!boxJumpLog || !boxJumpLog.boxJumpInches) return null;
      
      return {
        sessionNumber: session.sessionNumber,
        date: session.date,
        maxHeightInches: boxJumpLog.boxJumpInches,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);
  
  return progression;
}

/**
 * Get total completed sessions count
 */
export async function getCompletedSessionsCount(): Promise<number> {
  const sessions = await getAllSessions();
  return sessions.filter(s => s.completed).length;
}

/**
 * Get last workout date
 */
export async function getLastWorkoutDate(): Promise<string | null> {
  const sessions = await getAllSessions();
  const completed = sessions.filter(s => s.completed);
  if (completed.length === 0) return null;
  
  completed.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return completed[0].date;
}
