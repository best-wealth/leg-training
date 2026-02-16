import AsyncStorage from '@react-native-async-storage/async-storage';
import { BadgeId, BADGES } from './badges';
import { WorkoutSession } from './types';
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
};

const BADGES_KEY = '@basketball_training_badges';

export interface UnlockedBadge {
  id: BadgeId;
  unlockedAt: string; // ISO timestamp
}

/**
 * Get all unlocked badges
 */
export async function getUnlockedBadges(): Promise<UnlockedBadge[]> {
  try {
    const data = await safeAsyncStorage.getItem(BADGES_KEY);
    return data && typeof data === 'string' ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading badges:', error);
    return [];
  }
}

/**
 * Check if a badge is unlocked
 */
export async function isBadgeUnlocked(badgeId: BadgeId): Promise<boolean> {
  const badges = await getUnlockedBadges();
  return badges.some(b => b.id === badgeId);
}

/**
 * Unlock a badge
 */
export async function unlockBadge(badgeId: BadgeId): Promise<boolean> {
  const badges = await getUnlockedBadges();
  
  // Check if already unlocked
  if (badges.some(b => b.id === badgeId)) {
    return false; // Already unlocked
  }

  badges.push({
    id: badgeId,
    unlockedAt: new Date().toISOString(),
  });

  try {
    await safeAsyncStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch (error) {
    console.error('Error saving badges:', error);
    throw error;
  }

  return true; // Newly unlocked
}

/**
 * Check and unlock badges based on session completion
 */
export async function checkAndUnlockBadges(
  sessions: WorkoutSession[],
  currentSession: WorkoutSession
): Promise<BadgeId[]> {
  const newlyUnlocked: BadgeId[] = [];

  // Session count badges
  const sessionCount = sessions.length;

  if (sessionCount === 1 && !(await isBadgeUnlocked('first_session'))) {
    if (await unlockBadge('first_session')) {
      newlyUnlocked.push('first_session');
    }
  }

  if (sessionCount === 5 && !(await isBadgeUnlocked('five_sessions'))) {
    if (await unlockBadge('five_sessions')) {
      newlyUnlocked.push('five_sessions');
    }
  }

  if (sessionCount === 10 && !(await isBadgeUnlocked('ten_sessions'))) {
    if (await unlockBadge('ten_sessions')) {
      newlyUnlocked.push('ten_sessions');
    }
  }

  if (sessionCount === 25 && !(await isBadgeUnlocked('twenty_five_sessions'))) {
    if (await unlockBadge('twenty_five_sessions')) {
      newlyUnlocked.push('twenty_five_sessions');
    }
  }

  if (sessionCount === 50 && !(await isBadgeUnlocked('fifty_sessions'))) {
    if (await unlockBadge('fifty_sessions')) {
      newlyUnlocked.push('fifty_sessions');
    }
  }

  if (sessionCount === 100 && !(await isBadgeUnlocked('hundred_sessions'))) {
    if (await unlockBadge('hundred_sessions')) {
      newlyUnlocked.push('hundred_sessions');
    }
  }

  // Strength badges - check max weights in current session
  for (const exercise of currentSession.exercises) {
    if (exercise.weightKg) {
      // Leg curl badges
      if (exercise.exerciseName.includes('Leg Curl')) {
        if (exercise.weightKg >= 100 && !(await isBadgeUnlocked('leg_curl_100kg'))) {
          if (await unlockBadge('leg_curl_100kg')) {
            newlyUnlocked.push('leg_curl_100kg');
          }
        } else if (exercise.weightKg >= 75 && !(await isBadgeUnlocked('leg_curl_75kg'))) {
          if (await unlockBadge('leg_curl_75kg')) {
            newlyUnlocked.push('leg_curl_75kg');
          }
        } else if (exercise.weightKg >= 50 && !(await isBadgeUnlocked('leg_curl_50kg'))) {
          if (await unlockBadge('leg_curl_50kg')) {
            newlyUnlocked.push('leg_curl_50kg');
          }
        }
      }

      // Leg raise badges
      if (exercise.exerciseName.includes('Leg Raise')) {
        if (exercise.weightKg >= 100 && !(await isBadgeUnlocked('leg_raise_100kg'))) {
          if (await unlockBadge('leg_raise_100kg')) {
            newlyUnlocked.push('leg_raise_100kg');
          }
        } else if (exercise.weightKg >= 75 && !(await isBadgeUnlocked('leg_raise_75kg'))) {
          if (await unlockBadge('leg_raise_75kg')) {
            newlyUnlocked.push('leg_raise_75kg');
          }
        } else if (exercise.weightKg >= 50 && !(await isBadgeUnlocked('leg_raise_50kg'))) {
          if (await unlockBadge('leg_raise_50kg')) {
            newlyUnlocked.push('leg_raise_50kg');
          }
        }
      }

      // Calf raise badges
      if (exercise.exerciseName.includes('Calf Raise')) {
        if (exercise.weightKg >= 150 && !(await isBadgeUnlocked('calf_raise_150kg'))) {
          if (await unlockBadge('calf_raise_150kg')) {
            newlyUnlocked.push('calf_raise_150kg');
          }
        } else if (exercise.weightKg >= 100 && !(await isBadgeUnlocked('calf_raise_100kg'))) {
          if (await unlockBadge('calf_raise_100kg')) {
            newlyUnlocked.push('calf_raise_100kg');
          }
        } else if (exercise.weightKg >= 75 && !(await isBadgeUnlocked('calf_raise_75kg'))) {
          if (await unlockBadge('calf_raise_75kg')) {
            newlyUnlocked.push('calf_raise_75kg');
          }
        }
      }

      // Hip thrust badges
      if (exercise.exerciseName.includes('Hip Thrust')) {
        if (exercise.weightKg >= 200 && !(await isBadgeUnlocked('hip_thrust_200kg'))) {
          if (await unlockBadge('hip_thrust_200kg')) {
            newlyUnlocked.push('hip_thrust_200kg');
          }
        } else if (exercise.weightKg >= 150 && !(await isBadgeUnlocked('hip_thrust_150kg'))) {
          if (await unlockBadge('hip_thrust_150kg')) {
            newlyUnlocked.push('hip_thrust_150kg');
          }
        } else if (exercise.weightKg >= 100 && !(await isBadgeUnlocked('hip_thrust_100kg'))) {
          if (await unlockBadge('hip_thrust_100kg')) {
            newlyUnlocked.push('hip_thrust_100kg');
          }
        }
      }
    }

    // Box jump badges
    if (exercise.boxJumpInches) {
      if (exercise.boxJumpInches >= 50 && !(await isBadgeUnlocked('box_jump_50in'))) {
        if (await unlockBadge('box_jump_50in')) {
          newlyUnlocked.push('box_jump_50in');
        }
      } else if (exercise.boxJumpInches >= 40 && !(await isBadgeUnlocked('box_jump_40in'))) {
        if (await unlockBadge('box_jump_40in')) {
          newlyUnlocked.push('box_jump_40in');
        }
      } else if (exercise.boxJumpInches >= 30 && !(await isBadgeUnlocked('box_jump_30in'))) {
        if (await unlockBadge('box_jump_30in')) {
          newlyUnlocked.push('box_jump_30in');
        }
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Get badge progress towards next unlock
 */
export async function getBadgeProgress(badgeId: BadgeId, sessions: WorkoutSession[]) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  let current = 0;
  let target = 0;

  switch (badgeId) {
    case 'first_session':
      target = 1;
      current = sessions.length > 0 ? 1 : 0;
      break;
    case 'five_sessions':
      target = 5;
      current = Math.min(sessions.length, 5);
      break;
    case 'ten_sessions':
      target = 10;
      current = Math.min(sessions.length, 10);
      break;
    case 'twenty_five_sessions':
      target = 25;
      current = Math.min(sessions.length, 25);
      break;
    case 'fifty_sessions':
      target = 50;
      current = Math.min(sessions.length, 50);
      break;
    case 'hundred_sessions':
      target = 100;
      current = Math.min(sessions.length, 100);
      break;
    default:
      return null;
  }

  return {
    badgeId,
    current,
    target,
    percentage: (current / target) * 100,
  };
}
