import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomExercise } from './types';

const CUSTOM_EXERCISES_KEY = '@basketball_training_custom_exercises';

/**
 * Get all custom exercises
 */
export async function getAllCustomExercises(): Promise<CustomExercise[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
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
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
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
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
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
    await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
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
