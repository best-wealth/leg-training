import { ScrollView, Text, View, Pressable, PressableStateCallbackType, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { getSessionById, createNewSession, saveSession } from "@/lib/workout-utils";
import { WorkoutSession, ExerciseLog } from "@/lib/types";
import { getExerciseById } from "@/lib/combined-exercises";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface ExerciseWithWeight {
  name: string;
  weightKg?: number;
  weightLb?: number;
  boxJumpInches?: number;
}

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightExercises, setWeightExercises] = useState<ExerciseWithWeight[]>([]);
  const [defaultWeightUnit, setDefaultWeightUnit] = useState<'kg' | 'lb'>('kg');

  useEffect(() => {
    loadSessionAndExercises();
  }, [sessionId]);

  const loadSessionAndExercises = async () => {
    setLoading(true);
    try {
      // Load session
      const loadedSession = await getSessionById(sessionId);
      if (!loadedSession) {
        throw new Error('Session not found');
      }
      setSession(loadedSession);

      // Get weight unit preference
      try {
        const settingsJson = await (await import('@react-native-async-storage/async-storage')).default.getItem('@basketball_training_settings');
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          setDefaultWeightUnit(settings.defaultWeightUnit || 'kg');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }

      // Extract weight exercises
      const exercises: ExerciseWithWeight[] = [];
      for (const exerciseLog of loadedSession.exercises) {
        const exerciseData = await getExerciseById(exerciseLog.exerciseId);
        if (exerciseData && (exerciseLog.weightKg || exerciseLog.weightLb || exerciseLog.boxJumpInches)) {
          exercises.push({
            name: exerciseData.name,
            weightKg: exerciseLog.weightKg,
            weightLb: exerciseLog.weightLb,
            boxJumpInches: exerciseLog.boxJumpInches,
          });
        }
      }
      setWeightExercises(exercises);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    if (!session) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // Create next session
      const nextSessionNumber = session.sessionNumber + 1;
      const newSession = createNewSession(nextSessionNumber);
      await saveSession(newSession);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Navigate to home
      router.push("/" as any);
    } catch (error) {
      console.error('Error creating next session:', error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  if (!session) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Session not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-5xl">🎉</Text>
            <Text className="text-3xl font-bold text-foreground">Workout Complete!</Text>
            <Text className="text-lg text-muted">Session #{session.sessionNumber}</Text>
          </View>

          {/* Summary Info */}
          <View className="bg-primary rounded-2xl p-6 items-center gap-2">
            <Text className="text-white text-sm">Total Exercises Completed</Text>
            <Text className="text-5xl font-bold text-white">{session.exercises.length}</Text>
          </View>

          {/* Weight Exercises Summary */}
          {weightExercises.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">Weight Exercises</Text>
              
              {weightExercises.map((exercise, index) => (
                <View key={index} className="bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    {exercise.name}
                  </Text>
                  
                  <View className="gap-1">
                    {exercise.boxJumpInches !== undefined && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-muted">Box Jump Height</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {exercise.boxJumpInches.toFixed(1)} in
                        </Text>
                      </View>
                    )}
                    
                    {(exercise.weightKg !== undefined || exercise.weightLb !== undefined) && (
                      <>
                        {defaultWeightUnit === 'kg' && exercise.weightKg !== undefined && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-muted">Weight</Text>
                            <Text className="text-sm font-semibold text-foreground">
                              {exercise.weightKg.toFixed(1)} kg
                            </Text>
                          </View>
                        )}
                        {defaultWeightUnit === 'lb' && exercise.weightLb !== undefined && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-muted">Weight</Text>
                            <Text className="text-sm font-semibold text-foreground">
                              {exercise.weightLb.toFixed(1)} lb
                            </Text>
                          </View>
                        )}
                        {defaultWeightUnit === 'kg' && exercise.weightLb !== undefined && !exercise.weightKg && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-muted">Weight</Text>
                            <Text className="text-sm font-semibold text-foreground">
                              {exercise.weightLb.toFixed(1)} lb
                            </Text>
                          </View>
                        )}
                        {defaultWeightUnit === 'lb' && exercise.weightKg !== undefined && !exercise.weightLb && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-muted">Weight</Text>
                            <Text className="text-sm font-semibold text-foreground">
                              {exercise.weightKg.toFixed(1)} kg
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Stats */}
          <View className="gap-2">
            <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between">
              <Text className="text-sm text-muted">Session Date</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(session.startedAt).toLocaleDateString()}
              </Text>
            </View>
            <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between">
              <Text className="text-sm text-muted">Session Time</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* Done Button */}
          <Pressable
            onPress={handleDone}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="bg-success px-8 py-4 rounded-full w-full mt-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              Done - Start Next Session
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
