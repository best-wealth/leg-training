import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

// Exercise images with proper URLs
const exerciseImages: Record<string, any> = {
  'Jogging': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/FBELKZYRwJhZaReC.png' },
  'Hamstring Stretches': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
  'Calf Stretches': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/FBELKZYRwJhZaReC.png' },
  'Quad Stretches': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/VYJHTJEPZvFisfXj.png' },
  'Seated Leg Curls': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
  'Seated Leg Raises': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/VYJHTJEPZvFisfXj.png' },
  'Weighted Calf Raises': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/FBELKZYRwJhZaReC.png' },
  'Weighted Hip Thrusts': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
  'Volleyball Spike Box Jump': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
};

export function ExerciseAnimation({ exerciseType, isAnimating }: ExerciseAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Keep images static - no animations
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
  }, [isAnimating, scaleAnim, opacityAnim]);

  const image = exerciseImages[exerciseType];

  if (!image) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderImage} />
      </View>
    );
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
      {!imageError ? (
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.placeholderImage} />
      )}
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
    width: '100%',
    height: 250,
    maxWidth: 300,
  },
  placeholderImage: {
    width: 300,
    height: 250,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});
