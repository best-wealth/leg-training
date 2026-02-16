import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomExercise } from './types';
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

const CUSTOM_EXERCISES_KEY = '@basketball_training_custom_exercises';

/**
 * Get all custom exercises
 */
export async function getAllCustomExercises(): Promise<CustomExercise[]> {
  try {
    const data = await safeAsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
    return data && typeof data === 'string' ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading custom exercises:', error);
    return [];
  }
}

/**
 * Get custom exercise by ID
 */
export async function getCustomExerciseById(id: string): Promise<CustomExercise | null> {
  const exercises = await getAllCustomExercises();
  return exercises.find(ex => ex.id === id) || null;
}

/**
 * Create a new custom exercise
 */
export async function createCustomExercise(
  name: string,
  type: CustomExercise['type'],
  instructions: string,
  options?: {
    reps?: number;
    duration?: number;
    requiresWeight?: boolean;
    requiresHeight?: boolean;
  }
): Promise<CustomExercise> {
  const exercise: CustomExercise = {
    id: `custom_${Date.now()}`,
    name,
    type,
    instructions,
    createdAt: new Date().toISOString(),
    ...options,
  };
  const exercises = await getAllCustomExercises();
  exercises.push(exercise);
  
  try {
    await safeAsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error('Error saving custom exercise:', error);
    throw error;
  }
  return exercise;
}

/**
 * Update an existing custom exercise
 */
export async function updateCustomExercise(
  id: string,
  updates: Partial<Omit<CustomExercise, 'id' | 'createdAt'>>
): Promise<CustomExercise | null> {
  const exercises = await getAllCustomExercises();
  const index = exercises.findIndex(ex => ex.id === id);

  if (index === -1) {
    console.error('Custom exercise not found:', id);
    return null;
  }

  const updated = { ...exercises[index], ...updates };
  exercises[index] = updated;

  try {
    await safeAsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error('Error updating custom exercise:', error);
    throw error;
  }

  return updated;
}

/**
 * Delete a custom exercise
 */
export async function deleteCustomExercise(id: string): Promise<boolean> {
  const exercises = await getAllCustomExercises();
  const filtered = exercises.filter(ex => ex.id !== id);

  if (filtered.length === exercises.length) {
    console.warn('Custom exercise not found:', id);
    return false;
  }

  try {
    await safeAsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom exercise:', error);
    throw error;
  }
}

/**
 * Get custom exercises by type
 */
export async function getCustomExercisesByType(type: CustomExercise['type']): Promise<CustomExercise[]> {
  const exercises = await getAllCustomExercises();
  return exercises.filter(ex => ex.type === type);
}

/**
 * Generate a unique ID for custom exercise
 */
export function generateCustomExerciseId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
