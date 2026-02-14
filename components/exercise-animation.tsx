import { View, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

// Placeholder images - replace with real exercise images
const exerciseImages: Record<string, any> = {
  'Jogging': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/bBcg7TmuzNbaDHyIV8vBKg-img-1_1771051281000_na1fn_am9nZ2luZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Hamstring Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/bBcg7TmuzNbaDHyIV8vBKg-img-2_1771051278000_na1fn_aGFtc3RyaW5nLXN0cmV0Y2hlcw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Calf Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/bBcg7TmuzNbaDHyIV8vBKg-img-3_1771051279000_na1fn_Y2FsZi1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Quad Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/bBcg7TmuzNbaDHyIV8vBKg-img-4_1771051279000_na1fn_cXVhZC1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Seated Leg Curls': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/bBcg7TmuzNbaDHyIV8vBKg-img-5_1771051277000_na1fn_c2VhdGVkLWxlZy1jdXJscw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Seated Leg Raises': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/ObJEga2vplQHE1vc75eq0a-img-1_1771051339000_na1fn_c2VhdGVkLWxlZy1yYWlzZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Weighted Calf Raises': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/ObJEga2vplQHE1vc75eq0a-img-2_1771051333000_na1fn_d2VpZ2h0ZWQtY2FsZi1yYWlzZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Weighted Hip Thrusts': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/ObJEga2vplQHE1vc75eq0a-img-3_1771051325000_na1fn_d2VpZ2h0ZWQtaGlwLXRocnVzdHM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
  'Volleyball Spike Box Jump': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/ObJEga2vplQHE1vc75eq0a-img-4_1771051335000_na1fn_Ym94LWp1bXA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80' },
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
    width: '100%',
    height: 250,
    maxWidth: 300,
  },
});
