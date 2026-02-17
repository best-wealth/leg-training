/**
 * Achievement badges system for basketball training app
 */

export type BadgeId = 
  | 'first_session'
  | 'five_sessions'
  | 'ten_sessions'
  | 'twenty_five_sessions'
  | 'fifty_sessions'
  | 'hundred_sessions'
  | 'leg_curl_50kg'
  | 'leg_curl_75kg'
  | 'leg_curl_100kg'
  | 'leg_raise_50kg'
  | 'leg_raise_75kg'
  | 'leg_raise_100kg'
  | 'calf_raise_75kg'
  | 'calf_raise_100kg'
  | 'calf_raise_150kg'
  | 'hip_thrust_100kg'
  | 'hip_thrust_150kg'
  | 'hip_thrust_200kg'
  | 'box_jump_30in'
  | 'box_jump_40in'
  | 'box_jump_50in';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'strength' | 'plyometric';
  unlockedAt?: string; // ISO timestamp
}

export interface BadgeProgress {
  badgeId: BadgeId;
  current: number;
  target: number;
  percentage: number;
}

export const BADGES: Record<BadgeId, Omit<Badge, 'unlockedAt'>> = {
  // Session milestones
  first_session: {
    id: 'first_session',
    name: 'First Step',
    description: 'Complete your first training session',
    icon: '🏀',
    category: 'sessions',
  },
  five_sessions: {
    id: 'five_sessions',
    name: 'Getting Started',
    description: 'Complete 5 training sessions',
    icon: '💪',
    category: 'sessions',
  },
  ten_sessions: {
    id: 'ten_sessions',
    name: 'Dedicated',
    description: 'Complete 10 training sessions',
    icon: '🔥',
    category: 'sessions',
  },
  twenty_five_sessions: {
    id: 'twenty_five_sessions',
    name: 'Committed',
    description: 'Complete 25 training sessions',
    icon: '⭐',
    category: 'sessions',
  },
  fifty_sessions: {
    id: 'fifty_sessions',
    name: 'Unstoppable',
    description: 'Complete 50 training sessions',
    icon: '🚀',
    category: 'sessions',
  },
  hundred_sessions: {
    id: 'hundred_sessions',
    name: 'Legend',
    description: 'Complete 100 training sessions',
    icon: '👑',
    category: 'sessions',
  },

  // Leg curl strength milestones
  leg_curl_50kg: {
    id: 'leg_curl_50kg',
    name: 'Leg Curl Starter',
    description: 'Lift 40kg on seated leg curls',
    icon: '🦵',
    category: 'strength',
  },
  leg_curl_75kg: {
    id: 'leg_curl_75kg',
    name: 'Leg Curl Intermediate',
    description: 'Lift 60kg on seated leg curls',
    icon: '🦵',
    category: 'strength',
  },
  leg_curl_100kg: {
    id: 'leg_curl_100kg',
    name: 'Leg Curl Master',
    description: 'Lift 80kg on seated leg curls',
    icon: '🦵',
    category: 'strength',
  },

  // Leg raise strength milestones
  leg_raise_50kg: {
    id: 'leg_raise_50kg',
    name: 'Leg Raise Starter',
    description: 'Lift 40kg on seated leg raises',
    icon: '🦵',
    category: 'strength',
  },
  leg_raise_75kg: {
    id: 'leg_raise_75kg',
    name: 'Leg Raise Intermediate',
    description: 'Lift 60kg on seated leg raises',
    icon: '🦵',
    category: 'strength',
  },
  leg_raise_100kg: {
    id: 'leg_raise_100kg',
    name: 'Leg Raise Master',
    description: 'Lift 80kg on seated leg raises',
    icon: '🦵',
    category: 'strength',
  },

  // Calf raise strength milestones
  calf_raise_75kg: {
    id: 'calf_raise_75kg',
    name: 'Calf Raise Starter',
    description: 'Lift 25kg on weighted calf raises',
    icon: '🐄',
    category: 'strength',
  },
  calf_raise_100kg: {
    id: 'calf_raise_100kg',
    name: 'Calf Raise Intermediate',
    description: 'Lift 50kg on weighted calf raises',
    icon: '🐄',
    category: 'strength',
  },
  calf_raise_150kg: {
    id: 'calf_raise_150kg',
    name: 'Calf Raise Master',
    description: 'Lift 75kg on weighted calf raises',
    icon: '🐄',
    category: 'strength',
  },

  // Hip thrust strength milestones
  hip_thrust_100kg: {
    id: 'hip_thrust_100kg',
    name: 'Hip Thrust Starter',
    description: 'Lift 30kg on weighted hip thrusts',
    icon: '🍑',
    category: 'strength',
  },
  hip_thrust_150kg: {
    id: 'hip_thrust_150kg',
    name: 'Hip Thrust Intermediate',
    description: 'Lift 50kg on weighted hip thrusts',
    icon: '🍑',
    category: 'strength',
  },
  hip_thrust_200kg: {
    id: 'hip_thrust_200kg',
    name: 'Hip Thrust Master',
    description: 'Lift 75kg on weighted hip thrusts',
    icon: '🍑',
    category: 'strength',
  },

  // Box jump plyometric milestones
  box_jump_30in: {
    id: 'box_jump_30in',
    name: 'Box Jump Starter',
    description: 'Jump 30 inches onto the box',
    icon: '📦',
    category: 'plyometric',
  },
  box_jump_40in: {
    id: 'box_jump_40in',
    name: 'Box Jump Intermediate',
    description: 'Jump 40 inches onto the box',
    icon: '📦',
    category: 'plyometric',
  },
  box_jump_50in: {
    id: 'box_jump_50in',
    name: 'Box Jump Master',
    description: 'Jump 50 inches onto the box',
    icon: '📦',
    category: 'plyometric',
  },


};

export function getBadgeById(id: BadgeId): Badge | undefined {
  const badgeData = BADGES[id];
  return badgeData ? { ...badgeData, unlockedAt: undefined } : undefined;
}

export function getAllBadges(): Badge[] {
  return Object.values(BADGES).map(badge => ({ ...badge, unlockedAt: undefined }));
}
