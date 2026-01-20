import { WorkoutSession, ExerciseLog } from './types';

export interface PersonalRecord {
  exerciseName: string;
  exerciseId: string;
  weightKg?: number;
  weightLb?: number;
  boxJumpInches?: number;
  sessionNumber: number;
  date: string; // ISO timestamp
}

export interface PRNotification {
  exerciseName: string;
  newValue: number;
  unit: 'kg' | 'lb' | 'in';
  previousValue: number;
  improvementPercentage: number;
  improvementAbsolute: number;
}

/**
 * Get all personal records from sessions
 */
export function getAllPersonalRecords(sessions: WorkoutSession[]): Map<string, PersonalRecord> {
  const prMap = new Map<string, PersonalRecord>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!exercise.completed) continue;

      const key = `${exercise.exerciseId}`;
      const current = prMap.get(key);

      // Check weight-based exercises
      if (exercise.weightKg) {
        if (!current || !current.weightKg || exercise.weightKg > current.weightKg) {
          prMap.set(key, {
            exerciseName: exercise.exerciseName,
            exerciseId: exercise.exerciseId,
            weightKg: exercise.weightKg,
            weightLb: exercise.weightLb,
            sessionNumber: session.sessionNumber,
            date: exercise.completedAt || session.startedAt,
          });
        }
      }

      // Check box jump height
      if (exercise.boxJumpInches) {
        if (!current || !current.boxJumpInches || exercise.boxJumpInches > current.boxJumpInches) {
          prMap.set(key, {
            exerciseName: exercise.exerciseName,
            exerciseId: exercise.exerciseId,
            boxJumpInches: exercise.boxJumpInches,
            sessionNumber: session.sessionNumber,
            date: exercise.completedAt || session.startedAt,
          });
        }
      }
    }
  }

  return prMap;
}

/**
 * Check for new PRs in current session
 */
export function checkForNewPRs(
  allSessions: WorkoutSession[],
  currentSession: WorkoutSession,
  defaultUnit: 'kg' | 'lb' = 'kg'
): PRNotification[] {
  const previousSessions = allSessions.filter(s => s.sessionNumber < currentSession.sessionNumber);
  const previousPRs = getAllPersonalRecords(previousSessions);
  const notifications: PRNotification[] = [];

  for (const exercise of currentSession.exercises) {
    if (!exercise.completed) continue;

    const prKey = `${exercise.exerciseId}`;
    const previousPR = previousPRs.get(prKey);

    // Check weight-based PRs
    if (exercise.weightKg) {
      const newValue = defaultUnit === 'kg' ? exercise.weightKg : (exercise.weightLb || 0);
      const unit = defaultUnit === 'kg' ? 'kg' : 'lb';

      if (!previousPR || !previousPR.weightKg) {
        // First time recording this exercise
        notifications.push({
          exerciseName: exercise.exerciseName,
          newValue,
          unit,
          previousValue: 0,
          improvementPercentage: 100,
          improvementAbsolute: newValue,
        });
      } else {
        const previousValue = defaultUnit === 'kg' ? previousPR.weightKg : (previousPR.weightLb || 0);
        if (newValue > previousValue) {
          const improvement = newValue - previousValue;
          const improvementPercentage = (improvement / previousValue) * 100;
          notifications.push({
            exerciseName: exercise.exerciseName,
            newValue,
            unit,
            previousValue,
            improvementPercentage,
            improvementAbsolute: improvement,
          });
        }
      }
    }

    // Check box jump PRs
    if (exercise.boxJumpInches) {
      if (!previousPR || !previousPR.boxJumpInches) {
        // First time recording box jump
        notifications.push({
          exerciseName: exercise.exerciseName,
          newValue: exercise.boxJumpInches,
          unit: 'in',
          previousValue: 0,
          improvementPercentage: 100,
          improvementAbsolute: exercise.boxJumpInches,
        });
      } else if (exercise.boxJumpInches > previousPR.boxJumpInches) {
        const improvement = exercise.boxJumpInches - previousPR.boxJumpInches;
        const improvementPercentage = (improvement / previousPR.boxJumpInches) * 100;
        notifications.push({
          exerciseName: exercise.exerciseName,
          newValue: exercise.boxJumpInches,
          unit: 'in',
          previousValue: previousPR.boxJumpInches,
          improvementPercentage,
          improvementAbsolute: improvement,
        });
      }
    }
  }

  return notifications;
}

/**
 * Get the personal record for a specific exercise
 */
export function getExercisePR(
  exerciseId: string,
  sessions: WorkoutSession[]
): PersonalRecord | undefined {
  const prs = getAllPersonalRecords(sessions);
  return prs.get(exerciseId);
}
