import { Exercise } from './types';
import { EXERCISES } from './exercises';
import { getAllCustomExercises } from './custom-exercises';

/**
 * Get all exercises (default + custom)
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const customExercises = await getAllCustomExercises();
  const allExercises: Exercise[] = [
    ...EXERCISES,
    ...customExercises,
  ];
  return allExercises;
}

/**
 * Get exercise by ID from both default and custom exercises
 */
export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const allExercises = await getAllExercises();
  return allExercises.find(ex => ex.id === id);
}

/**
 * Get exercises by type from both default and custom
 */
export async function getExercisesByType(type: string): Promise<Exercise[]> {
  const allExercises = await getAllExercises();
  return allExercises.filter(ex => ex.type === type);
}
