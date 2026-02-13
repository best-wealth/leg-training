import { View, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

const exerciseImages: Record<string, any> = {
  'Jogging': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/3I5y5pBKvdhkubdA7vnSi0-img-1_1770987014000_na1fn_ZXhlcmNpc2Utam9nZ2luZw.png' },
  'Hamstring Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/3I5y5pBKvdhkubdA7vnSi0-img-2_1770987008000_na1fn_ZXhlcmNpc2UtaGFtc3RyaW5nLXN0cmV0Y2hlcw.png' },
  'Calf Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/3I5y5pBKvdhkubdA7vnSi0-img-3_1770987020000_na1fn_ZXhlcmNpc2UtY2FsZi1zdHJldGNoZXM.png' },
  'Quad Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/3I5y5pBKvdhkubdA7vnSi0-img-4_1770987013000_na1fn_ZXhlcmNpc2UtcXVhZC1zdHJldGNoZXM.png' },
  'Seated Leg Curls': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/3I5y5pBKvdhkubdA7vnSi0-img-5_1770987006000_na1fn_ZXhlcmNpc2Utc2VhdGVkLWxlZy1jdXJscw.png' },
  'Seated Leg Raises': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/JZvRi6T60ELQtu8y01g1aP-img-1_1770987075000_na1fn_ZXhlcmNpc2UtbGVnLXJhaXNlcw.png' },
  'Weighted Calf Raises': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/JZvRi6T60ELQtu8y01g1aP-img-2_1770987101000_na1fn_ZXhlcmNpc2UtY2FsZi1yYWlzZXM.png' },
  'Weighted Hip Thrusts': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/JZvRi6T60ELQtu8y01g1aP-img-3_1770987076000_na1fn_ZXhlcmNpc2Utd2VpZ2h0ZWQtaGlwLXRocnVzdHM.png' },
  'Volleyball Spike Box Jump': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/JZvRi6T60ELQtu8y01g1aP-img-4_1770987078000_na1fn_ZXhlcmNpc2UtYm94LWp1bXBz.png' },
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
