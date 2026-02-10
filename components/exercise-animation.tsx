import { View, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

const exerciseImages: Record<string, any> = {
  'Jogging': require('@/assets/images/exercise-jogging.png'),
  'Hamstring Stretches': require('@/assets/images/exercise-hamstring-stretch.png'),
  'Calf Stretches': require('@/assets/images/exercise-calf-stretch.png'),
  'Quad Stretches': require('@/assets/images/exercise-quad-stretch.png'),
  'Seated Leg Curls': require('@/assets/images/exercise-leg-curl.png'),
  'Seated Leg Raises': require('@/assets/images/exercise-leg-raise.png'),
  'Weighted Calf Raises': require('@/assets/images/exercise-calf-raise.png'),
  'Weighted Hip Thrusts': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/XaPEybhJQvGlVaAi.png' },
  'Volleyball Spike Box Jump': require('@/assets/images/exercise-box-jump.png'),
};

export function ExerciseAnimation({ exerciseType, isAnimating }: ExerciseAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimating) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [isAnimating, scaleAnim, opacityAnim]);

  const image = exerciseImages[exerciseType];

  if (!image) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Image
        source={image}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    marginVertical: 16,
  },
  image: {
    width: 200,
    height: 200,
  },
});
