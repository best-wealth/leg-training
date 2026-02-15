import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

// Exercise images with proper URLs
const exerciseImages: Record<string, any> = {
  'Jogging': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/WHLqGqWFJCuDzluf.png' },
  'Hamstring Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-2_1771075316000_na1fn_aGFtc3RyaW5nLXN0cmV0Y2hlcw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTJfMTc3MTA3NTMxNjAwMF9uYTFmbl9hR0Z0YzNSeWFXNW5MWE4wY21WMFkyaGxjdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=pQgoUU2at43gTolYai6ngqQDdMeyH~1R-fQW4xkR6q1O8dwnL~h02mhmRpQpIjQ1PuVfdx6MC34XlTC399qsx6GU-g3NZkY1I0vvgj41~dhWbE4Trti9n5pq~3CgRA1UYckEaOUL-lRCOhfe8tPIOHr-M2I-fSXXJmLvAjIB1EMSUyLFxlK4Tw1VEWEtzpG9LYtIq4dsRS573VVI73KQfz~k6obL6y09fqATmRdc9h6XlNRItKqJnyWBJm4f2yLc~bO-ga2zdfq9k-smLiR4-FqXpQ86doDfRD0PzlTR-uWAhMT1P~BiRqVYV-T85yfJwr2IYPe5cFUWbxmlhN0D6w__' },
  'Calf Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-3_1771075318000_na1fn_Y2FsZi1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTNfMTc3MTA3NTMxODAwMF9uYTFmbl9ZMkZzWmkxemRISmxkR05vWlhNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aLR7dD3wKFZtEuOxfdUIULcAAu1S4hoRngjuI84WGwg0elO5rso9kYBU6JE8u0ILbx5bgqGMdk1CpBX6lO5tmCYS7pkQw3qXeM2YesugtoHB9cywyH7ukQEVGx4QhSnYtXeoW1YF3KUB~o6gEWG9o5jWIbkEA39fL1PD5V0BKdY23ntYVn-8UUfcTvYYA2yEe3i8~EEDaUgCpWpBFx5sX3VBtE7Ae9ngi1tLuEA6FGR7xIZNWkZSy8iL72b9eTd3Dr0dNn6ZTk8gGOohOqBUtX2UsGV4R0WhLwQvlAvQ-9q~5HPNGNucroZ~X57xK-sYqBZrBoMxE-g30x3OfytUJA__' },
  'Quad Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-4_1771075327000_na1fn_cXVhZC1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTRfMTc3MTA3NTMyNzAwMF9uYTFmbl9jWFZoWkMxemRISmxkR05vWlhNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AvY1BQUTV3u6ZeBUw~cwsVVjPVxrHoHhJyKhpvsKSZoPk4mzpPUMiM4aJKD2sXAFtu3acGPoTnz3nkR4I1Df9NG6gFOnAe0fzC2OJeeT7Jie0mLzJ2YS3rpkOOH23YwOCmUCyrFjFyiJJn8Uf-ecNLswztdIB1Q6E1XVwiMAjUE8TWCt18c0HYmxM-CkPKkvd7XjMLTjdXltKi-14cL-uW6nEORd1606jgfKV-jsDHvg~Qj7kGhf8RAE-lsltOjyRMftNkHfgFMgV-2TfGVteUDcmU~Pj66YoL5Wxl1qAeZh8ODE9wC~e6JSfRdYXVJpTtFfnuAfQnWEu6CgDg5K-A__' },
  'Seated Leg Curls': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
  'Seated Leg Raises': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/VYJHTJEPZvFisfXj.png' },
  'Weighted Calf Raises': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/FBELKZYRwJhZaReC.png' },
  'Weighted Hip Thrusts': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/VYJHTJEPZvFisfXj.png' },
  'Volleyball Spike Box Jump': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/xhSeOxfJpDupIEpB.png' },
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
