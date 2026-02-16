import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, AppSettings, PersonalRecord, ExerciseLog } from './types';
import { EXERCISES } from './exercises';
import { Platform } from 'react-native';

/**
 * Safe wrapper for AsyncStorage to handle native platform errors
 */
const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      // Add small delay on native to ensure module is ready
      return await new Promise<string | null>((resolve) => {
        setTimeout(() => AsyncStorage.getItem(key).then(resolve).catch(() => resolve(null)), 100);
      });
    } catch (error) {
      console.warn(`AsyncStorage.getItem error for ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.setItem(key, value);
      }
      // Add small delay on native to ensure module is ready
      return await new Promise<void>((resolve) => {
        setTimeout(() => AsyncStorage.setItem(key, value).then(() => resolve()).catch(() => resolve()), 100);
      });
    } catch (error) {
      console.warn(`AsyncStorage.setItem error for ${key}:`, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.removeItem(key);
      }
      // Add small delay on native to ensure module is ready
      return await new Promise<void>((resolve) => {
        setTimeout(() => AsyncStorage.removeItem(key).then(() => resolve()).catch(() => resolve()), 100);
      });
    } catch (error) {
      console.warn(`AsyncStorage.removeItem error for ${key}:`, error);
    }
  },
};

/**
 * Sanitize exercise log to ensure all boolean fields are properly typed
 */
function sanitizeExerciseLog(log: any): ExerciseLog {
  return {
    exerciseId: String(log.exerciseId || ''),
    exerciseName: String(log.exerciseName || ''),
    weightKg: log.weightKg ? parseFloat(log.weightKg) : undefined,
    weightLb: log.weightLb ? parseFloat(log.weightLb) : undefined,
    boxJumpInches: log.boxJumpInches ? parseFloat(log.boxJumpInches) : undefined,
    completed: Boolean(log.completed === true || log.completed === 'true'),
    completedAt: log.completedAt ? String(log.completedAt) : undefined,
  };
}

/**
 * Sanitize workout session to ensure all boolean fields are properly typed
 */
function sanitizeWorkoutSession(session: any): WorkoutSession {
  return {
    sessionId: String(session.sessionId || ''),
    sessionNumber: parseInt(session.sessionNumber, 10) || 0,
    date: String(session.date || ''),
    time: String(session.time || ''),
    startedAt: String(session.startedAt || ''),
    completedAt: session.completedAt ? String(session.completedAt) : undefined,
    completed: Boolean(session.completed === true || session.completed === 'true'),
    exercises: Array.isArray(session.exercises) 
      ? session.exercises.map(sanitizeExerciseLog)
      : [],
  };
}

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
  try {
    const data = await safeAsyncStorage.getItem(SESSIONS_KEY);
    if (!data || typeof data !== 'string') return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(sanitizeWorkoutSession) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  try {
    const sessions = await getAllSessions();
    const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    // Sort by session number descending
    sessions.sort((a, b) => b.sessionNumber - a.sessionNumber);
    
    await safeAsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

export async function getSessionById(sessionId: string): Promise<WorkoutSession | null> {
  const sessions = await getAllSessions();
  const session = sessions.find(s => s.sessionId === sessionId);
  return session ? sanitizeWorkoutSession(session) : null;
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

export async function clearAllSessions(): Promise<void> {
  try {
    await safeAsyncStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error('Error clearing sessions:', error);
    throw error;
  }
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
  try {
    const data = await safeAsyncStorage.getItem(SETTINGS_KEY);
    return data && typeof data === 'string' ? JSON.parse(data) : { defaultWeightUnit: 'kg' };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { defaultWeightUnit: 'kg' };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await safeAsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Personal records management
 */
export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  try {
    const data = await safeAsyncStorage.getItem('@basketball_training_prs');
    return data && typeof data === 'string' ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading personal records:', error);
    return [];
  }
}

export async function savePersonalRecord(pr: PersonalRecord): Promise<void> {
  try {
    const prs = await getPersonalRecords();
    const existingIndex = prs.findIndex(p => p.exerciseId === pr.exerciseId);
    
    if (existingIndex >= 0) {
      prs[existingIndex] = pr;
    } else {
      prs.push(pr);
    }
    
    await safeAsyncStorage.setItem('@basketball_training_prs', JSON.stringify(prs));
  } catch (error) {
    console.error('Error saving personal record:', error);
    throw error;
  }
}

/**
 * Calculate personal records from all sessions
 */
export async function calculatePersonalRecords(): Promise<PersonalRecord[]> {
  const sessions = await getAllSessions();
  const completedSessions = sessions.filter(s => s.completed);
  
  const prMap = new Map<string, PersonalRecord>();
  
  for (const session of completedSessions) {
    for (const exerciseLog of session.exercises) {
      if (!exerciseLog.completed || !exerciseLog.weightKg) continue;
      
      const key = exerciseLog.exerciseId;
      const existing = prMap.get(key);
      
      if (!existing || (exerciseLog.weightKg && exerciseLog.weightKg > (existing.maxWeightKg || 0))) {
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
