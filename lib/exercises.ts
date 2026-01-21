import { Exercise } from './types';

/**
 * Complete exercise sequence for basketball leg & hip training
 * Total: 19 exercises (some repeated)
 */
export const EXERCISES: Exercise[] = [
  // Warm-up
  {
    id: 'jogging',
    name: '20 Minutes Jogging',
    type: 'warmup',
    duration: 1200, // 20 minutes in seconds
    instructions: 'Light jogging to warm up your muscles. Maintain a steady, comfortable pace.',
  },
  
  // Initial Stretches
  {
    id: 'hamstring-stretch-1',
    name: 'Hamstring Stretches',
    type: 'stretch',
    duration: 180, // 3 minutes
    instructions: 'Stretch your hamstrings gently. Hold each stretch for 30 seconds.',
  },
  {
    id: 'calf-stretch-1',
    name: 'Calf Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your calves. Hold each stretch for 30 seconds.',
  },
  {
    id: 'quad-stretch-1',
    name: 'Quad Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your quadriceps. Hold each stretch for 30 seconds.',
  },
  
  // Strength Round 1
  {
    id: 'seated-leg-curls-1',
    name: 'Seated Leg Curls',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of seated leg curls. Focus on controlled movement and full range of motion.',
  },
  {
    id: 'seated-leg-raises-1',
    name: 'Seated Leg Raises',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of seated leg raises. Keep your core engaged throughout the movement.',
  },
  {
    id: 'weighted-calf-raises-1',
    name: 'Weighted Calf Raises',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of weighted calf raises. Rise up on your toes and lower slowly.',
  },
  {
    id: 'weighted-hip-thrusts-1',
    name: 'Weighted Hip Thrusts',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of weighted hip thrusts. Drive through your heels and squeeze glutes at the top.',
  },
  
  // Stretch Round 1
  {
    id: 'hamstring-stretch-2',
    name: 'Hamstring Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your hamstrings gently. Hold each stretch for 30 seconds.',
  },
  {
    id: 'calf-stretch-2',
    name: 'Calf Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your calves. Hold each stretch for 30 seconds.',
  },
  {
    id: 'quad-stretch-2',
    name: 'Quad Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your quadriceps. Hold each stretch for 30 seconds.',
  },
  
  // Strength Round 2
  {
    id: 'seated-leg-curls-2',
    name: 'Seated Leg Curls',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of seated leg curls. Focus on controlled movement and full range of motion.',
  },
  {
    id: 'seated-leg-raises-2',
    name: 'Seated Leg Raises',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of seated leg raises. Keep your core engaged throughout the movement.',
  },
  {
    id: 'weighted-calf-raises-2',
    name: 'Weighted Calf Raises',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of weighted calf raises. Rise up on your toes and lower slowly.',
  },
  {
    id: 'weighted-hip-thrusts-2',
    name: 'Weighted Hip Thrusts',
    type: 'strength',
    reps: 7,
    requiresWeight: true,
    instructions: 'Perform 7 reps of weighted hip thrusts. Drive through your heels and squeeze glutes at the top.',
  },
  
  // Stretch Round 2
  {
    id: 'hamstring-stretch-3',
    name: 'Hamstring Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your hamstrings gently. Hold each stretch for 30 seconds.',
  },
  {
    id: 'calf-stretch-3',
    name: 'Calf Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your calves. Hold each stretch for 30 seconds.',
  },
  {
    id: 'quad-stretch-3',
    name: 'Quad Stretches',
    type: 'stretch',
    duration: 180,
    instructions: 'Stretch your quadriceps. Hold each stretch for 30 seconds.',
  },
  
  // Finisher
  {
    id: 'box-jump',
    name: 'Volleyball Spike Jump onto Box',
    type: 'finisher',
    reps: 7,
    requiresHeight: true,
    instructions: 'Perform 7 explosive jumps onto the box. Land softly and step down between reps. Record your box height in inches.',
  },
];

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id);
}

/**
 * Get all strength exercises (for stats tracking)
 */
export function getStrengthExercises(): Exercise[] {
  return EXERCISES.filter(ex => ex.requiresWeight);
}

/**
 * Get unique strength exercise names (for PR tracking)
 */
export function getUniqueStrengthExercises(): Exercise[] {
  const seen = new Set<string>();
  return EXERCISES.filter(ex => {
    if (ex.requiresWeight && !seen.has(ex.name)) {
      seen.add(ex.name);
      return true;
    }
    return false;
  });
}
