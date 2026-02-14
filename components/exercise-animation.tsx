import { View, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  isAnimating: boolean;
}

// Exercise images with proper URLs
const exerciseImages: Record<string, any> = {
  'Jogging': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-1_1771075315000_na1fn_am9nZ2luZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTFfMTc3MTA3NTMxNTAwMF9uYTFmbl9hbTluWjJsdVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ZCnjnKXPEkiHnx-42M6NxtphB9f~FouRtN26BxOoKJMrPoPF~kBEFJzrYfeX6lrgHUAPbDPIPiYW7ViyzU57~2WBCDhvd8v~p5~RENrX40EqHo~nuteOkUyDwkQcFQ4HieKbemCq9FsS9feJTIDViZpM5KFm14s8CKHPI8GhnvlIQpm5JY7VmDdf6J5dy10sMCT8VBPKUChYrV2IS-lN~XSa5brgKkYdECJhsWFnIWdLcYOdxIZ0fqlF4J4bT1OKHa1K~zDeblP8MXbmL6ZUeKmIgXSdnShlTGObtftrD~YXPEn1j~Nqt7V2yoLbKoKTJOWLkrVANpNIkGtCLiB14g__' },
  'Hamstring Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-2_1771075316000_na1fn_aGFtc3RyaW5nLXN0cmV0Y2hlcw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTJfMTc3MTA3NTMxNjAwMF9uYTFmbl9hR0Z0YzNSeWFXNW5MWE4wY21WMFkyaGxjdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=pQgoUU2at43gTolYai6ngqQDdMeyH~1R-fQW4xkR6q1O8dwnL~h02mhmRpQpIjQ1PuVfdx6MC34XlTC399qsx6GU-g3NZkY1I0vvgj41~dhWbE4Trti9n5pq~3CgRA1UYckEaOUL-lRCOhfe8tPIOHr-M2I-fSXXJmLvAjIB1EMSUyLFxlK4Tw1VEWEtzpG9LYtIq4dsRS573VVI73KQfz~k6obL6y09fqATmRdc9h6XlNRItKqJnyWBJm4f2yLc~bO-ga2zdfq9k-smLiR4-FqXpQ86doDfRD0PzlTR-uWAhMT1P~BiRqVYV-T85yfJwr2IYPe5cFUWbxmlhN0D6w__' },
  'Calf Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-3_1771075318000_na1fn_Y2FsZi1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTNfMTc3MTA3NTMxODAwMF9uYTFmbl9ZMkZzWmkxemRISmxkR05vWlhNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aLR7dD3wKFZtEuOxfdUIULcAAu1S4hoRngjuI84WGwg0elO5rso9kYBU6JE8u0ILbx5bgqGMdk1CpBX6lO5tmCYS7pkQw3qXeM2YesugtoHB9cywyH7ukQEVGx4QhSnYtXeoW1YF3KUB~o6gEWG9o5jWIbkEA39fL1PD5V0BKdY23ntYVn-8UUfcTvYYA2yEe3i8~EEDaUgCpWpBFx5sX3VBtE7Ae9ngi1tLuEA6FGR7xIZNWkZSy8iL72b9eTd3Dr0dNn6ZTk8gGOohOqBUtX2UsGV4R0WhLwQvlAvQ-9q~5HPNGNucroZ~X57xK-sYqBZrBoMxE-g30x3OfytUJA__' },
  'Quad Stretches': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/b7OSlPvC5RWiFyVAM8crGN-img-4_1771075327000_na1fn_cXVhZC1zdHJldGNoZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2I3T1NsUHZDNVJXaUZ5VkFNOGNyR04taW1nLTRfMTc3MTA3NTMyNzAwMF9uYTFmbl9jWFZoWkMxemRISmxkR05vWlhNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AvY1BQUTV3u6ZeBUw~cwsVVjPVxrHoHhJyKhpvsKSZoPk4mzpPUMiM4aJKD2sXAFtu3acGPoTnz3nkR4I1Df9NG6gFOnAe0fzC2OJeeT7Jie0mLzJ2YS3rpkOOH23YwOCmUCyrFjFyiJJn8Uf-ecNLswztdIB1Q6E1XVwiMAjUE8TWCt18c0HYmxM-CkPKkvd7XjMLTjdXltKi-14cL-uW6nEORd1606jgfKV-jsDHvg~Qj7kGhf8RAE-lsltOjyRMftNkHfgFMgV-2TfGVteUDcmU~Pj66YoL5Wxl1qAeZh8ODE9wC~e6JSfRdYXVJpTtFfnuAfQnWEu6CgDg5K-A__' },
  'Seated Leg Curls': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/etSXRZulvNdsxPpe.png' },
  'Seated Leg Raises': { uri: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305037201/FDnWLLisjzEKivLK.jpg' },
  'Weighted Calf Raises': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/exOQbdfKZknnw9suodkiei-img-2_1771075382000_na1fn_d2VpZ2h0ZWQtY2FsZi1yYWlzZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2V4T1FiZGZLWmtubnc5c3VvZGtpZWktaW1nLTJfMTc3MTA3NTM4MjAwMF9uYTFmbl9kMlZwWjJoMFpXUXRZMkZzWmkxeVlXbHlaWE0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=TAhu2ZCXspJo4OjKsyfaZWvw8XAbIK0o2fxPxm9ndNVNSPJAvtZSGgyKhCg-qXLnJ58VWr-Qp~PG4sfmeR1GEtyj1ezh2VILcyjwivR5OXY~fhvuqSrvTONHMj~Nj6VYe0ODAsk5N6kmIj7kRju6B~SeN6yXsnDgq8K4vMLZ7MT2Snw681R8YYLbmVMMmZPHLCFdOv0yNFfKAEcHywEdX3uizURHCh867Gjz~43AmKmt00~~lOb5a0fQLJ-AT2t6TEidfdnEfWeOJdGP23PyEvj9ShlqiIv6pY7RQqUsD8c0t7Lz3~Eek5sk64xFmmgX~PkKcECZ0~cB0-Y1KrYm5Q__' },
  'Weighted Hip Thrusts': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/exOQbdfKZknnw9suodkiei-img-3_1771075373000_na1fn_d2VpZ2h0ZWQtaGlwLXRocnVzdHM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2V4T1FiZGZLWmtubnc5c3VvZGtpZWktaW1nLTNfMTc3MTA3NTM3MzAwMF9uYTFmbl9kMlZwWjJoMFpXUXRhR2x3TFhSb2NuVnpkSE0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=YwlN60fIx7nb~Ka7IFor-sfKOSpX7mxv51sbCIcl-DNoOP2TLbZDKXY~boYjRMCbXv37UOuJVsW60k9~J4X-OsSEbmyYaL1H3BC~ORyjU53j36nqfdYBHf2BYyVKlG~bifax~gbx96krHInl4Nmmaw43I5bDqsqnfAtFWBI2U4IL7-pAehi6McKRfm4bvmGFPKzxXM9aMXUdsjm3oLasRA12CvuWCSNhltzSTldXdHCnF8K~htTXQN~-Y8nuZSlRSdBej3mHrI-ib7P5xCCweudSCkwCrMO14nXXT9ULkTgzzhxXff6EVMx14jnxhUQ8B9eJLZHYS7w1thf~285BMA__' },
  'Volleyball Spike Box Jump': { uri: 'https://private-us-east-1.manuscdn.com/sessionFile/xp2DOOXJACyrfw1UAnkN0S/sandbox/exOQbdfKZknnw9suodkiei-img-4_1771075384000_na1fn_Ym94LWp1bXA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveHAyRE9PWEpBQ3lyZncxVUFua04wUy9zYW5kYm94L2V4T1FiZGZLWmtubnc5c3VvZGtpZWktaW1nLTRfMTc3MTA3NTM4NDAwMF9uYTFmbl9ZbTk0TFdwMWJYQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=f9vQ~Y7pmg2n6m2FKSaJGhjcxKh0UFeWgaU5qpmnZtlRImVQOu9c5KCFLdgyfDjsp-uiVoG8VRkmhOIALNu6vDEGM~3jYLcrcg~5ZljkX1VH88Y9Dz3jlvrBNdQ3ztbbuXreht5TQNGkkzHkwqAKDp5HKRRx0bk0xhC30fv0yN0~7bpGm7p4cLlKr-r1tn91V0XBuVe1NHvVDCU-Lm0I9aCHc~w5~mjMljwtzUHnYPHoaIbgnstbiPzvnRhh6aNJkgbGemjPUPtJja5-xYLke0BVKwyixEzYRnJpe~nJJ--UC2JXIbIjXRXYGcLRcaLdClxsNd4Aukq-ynhlVwSe3g__' },
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
