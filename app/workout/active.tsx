import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert, Pressable, PressableStateCallbackType } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { getSessionById, saveSession, kgToLb, lbToKg } from "@/lib/workout-utils";
import { WorkoutSession, ExerciseLog } from "@/lib/types";
import { getExerciseById as getDefaultExerciseById } from "@/lib/exercises";
import { getExerciseById } from "@/lib/combined-exercises";
import { ExerciseAnimation } from "@/components/exercise-animation";
import * as Haptics from "expo-haptics";
import { Platform, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [weightKg, setWeightKg] = useState<string>("");
  const [weightLb, setWeightLb] = useState<string>("");
  const [boxJumpInches, setBoxJumpInches] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exerciseData, setExerciseData] = useState<Awaited<ReturnType<typeof getExerciseById>> | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  useEffect(() => {
    if (!session || session.exercises.length === 0) return;

    const currentExerciseLog = session.exercises[currentExerciseIndex];
    const loadExerciseData = async () => {
      setExerciseLoading(true);
      try {
        const data = await getExerciseById(currentExerciseLog.exerciseId);
        setExerciseData(data || null);
      } catch (error) {
        console.error('Error loading exercise data:', error);
      } finally {
        setExerciseLoading(false);
      }
    };
    loadExerciseData();
  }, [currentExerciseIndex, session?.exercises.length]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const loadedSession = await getSessionById(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
        
        // Find first incomplete exercise
        const firstIncomplete = loadedSession.exercises.findIndex(e => !e.completed);
        if (firstIncomplete >= 0) {
          setCurrentExerciseIndex(firstIncomplete);
          loadExerciseData(loadedSession.exercises[firstIncomplete]);
        } else {
          setCurrentExerciseIndex(loadedSession.exercises.length - 1);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseData = (exerciseLog: ExerciseLog) => {
    setWeightKg(exerciseLog.weightKg?.toString() || "");
    setWeightLb(exerciseLog.weightLb?.toString() || "");
    setBoxJumpInches(exerciseLog.boxJumpInches?.toString() || "");
    setTimer(0);
    setTimerRunning(false);
  };

  const handleProgressBarPress = (e: GestureResponderEvent) => {
    if (!session) return;
    const locationX = e.nativeEvent.locationX;
    const progressBarWidth = 300;
    const percentage = locationX / progressBarWidth;
    const newIndex = Math.floor(percentage * session.exercises.length);
    const clampedIndex = Math.max(0, Math.min(newIndex, session.exercises.length - 1));
    setCurrentExerciseIndex(clampedIndex);
    loadExerciseData(session.exercises[clampedIndex]);
  };

  const handleWeightKgChange = (value: string) => {
    setWeightKg(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeightLb(kgToLb(numValue).toString());
    } else {
      setWeightLb("");
    }
  };

  const handleWeightLbChange = (value: string) => {
    setWeightLb(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeightKg(lbToKg(numValue).toString());
    } else {
      setWeightKg("");
    }
  };

  const handleMarkComplete = async () => {
    if (!session) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const currentExercise = session.exercises[currentExerciseIndex];
    const exerciseDataLoaded = await getExerciseById(currentExercise.exerciseId);

    // Validate inputs
    if (exerciseDataLoaded?.requiresWeight) {
      const kg = parseFloat(weightKg);
      if (isNaN(kg) || kg < 0) {
        Alert.alert("Invalid Weight", "Please enter a valid weight.");
        return;
      }
    }

    if (exerciseDataLoaded?.requiresHeight) {
      const inches = parseFloat(boxJumpInches);
      if (isNaN(inches) || inches < 0) {
        Alert.alert("Invalid Height", "Please enter a valid box height in inches.");
        return;
      }
    }

    // Update exercise log
    const updatedExercises = [...session.exercises];
    updatedExercises[currentExerciseIndex] = {
      ...currentExercise,
      completed: true,
      completedAt: new Date().toISOString(),
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      weightLb: weightLb ? parseFloat(weightLb) : undefined,
      boxJumpInches: boxJumpInches ? parseFloat(boxJumpInches) : undefined,
    };

    const updatedSession: WorkoutSession = {
      ...session,
      exercises: updatedExercises,
    };

    // Check if all exercises are complete
    const allComplete = updatedExercises.every(e => e.completed);
    if (allComplete) {
      updatedSession.completed = true;
      updatedSession.completedAt = new Date().toISOString();
    }

    await saveSession(updatedSession);
    setSession(updatedSession);

    if (allComplete) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Navigate to summary screen
      router.push({
        pathname: "/workout/summary" as any,
        params: { sessionId: updatedSession.sessionId },
      });
    } else {
      // Move to next exercise
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      loadExerciseData(updatedExercises[nextIndex]);
    }
  };

  const handleStartTimer = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimerRunning(!timerRunning);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !session) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  if (exerciseLoading || !exerciseData) {
    return (
      <ScreenContainer className="items-center justify-center">
        {exerciseLoading ? (
          <ActivityIndicator size="large" color="#FF6B35" />
        ) : (
          <Text className="text-foreground">Exercise not found</Text>
        )}
      </ScreenContainer>
    );
  }

  const currentExerciseLog = session.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / session.exercises.length) * 100;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Progress Bar */}
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">
                Exercise {currentExerciseIndex + 1} of {session.exercises.length}
              </Text>
              <Text className="text-sm text-muted">
                Session #{session.sessionNumber}
              </Text>
            </View>
            <Pressable
              onPress={(e) => handleProgressBarPress(e)}
              className="h-3 bg-surface rounded-full overflow-hidden"
            >
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </Pressable>
            <Text className="text-xs text-muted text-center mt-1">Tap to navigate exercises</Text>
          </View>

          {/* Exercise Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="items-center gap-2 mb-4">
              <Text className="text-2xl font-bold text-foreground text-center">
                {exerciseData.name}
              </Text>
              {exerciseData.reps && (
                <Text className="text-lg text-primary font-semibold">
                  {exerciseData.reps} reps
                </Text>
              )}
            </View>

            {/* Exercise Animation */}
            <ExerciseAnimation exerciseType={exerciseData.name} isAnimating={true} />

            <Text className="text-base text-muted leading-relaxed text-center mb-6">
              {exerciseData.instructions}
            </Text>

            {/* Timer for timed exercises */}
            {exerciseData.duration && (
              <View className="items-center gap-4">
                <Text className="text-5xl font-bold text-foreground">
                  {formatTime(timer)}
                </Text>
                <Text className="text-sm text-muted">
                  Target: {formatTime(exerciseData.duration)}
                </Text>
                <Pressable
                  onPress={handleStartTimer}
                  style={({ pressed }: PressableStateCallbackType) => ({
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  })}
                  className="bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">
                    {timerRunning ? 'Pause' : 'Start Timer'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Weight Input */}
            {exerciseData.requiresWeight && (
              <View className="gap-4">
                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted">Weight (kg)</Text>
                    <Text className="text-xs text-primary">Editable</Text>
                  </View>
                  <TextInput
                    className="bg-background border border-primary rounded-xl px-4 py-3 text-foreground text-lg"
                    value={weightKg}
                    onChangeText={handleWeightKgChange}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#9BA1A6"
                  />
                </View>

                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted">Weight (lb)</Text>
                    <Text className="text-xs text-primary">Editable</Text>
                  </View>
                  <TextInput
                    className="bg-background border border-primary rounded-xl px-4 py-3 text-foreground text-lg"
                    value={weightLb}
                    onChangeText={handleWeightLbChange}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#9BA1A6"
                  />
                </View>
              </View>
            )}

            {/* Box Jump Height Input */}
            {exerciseData.requiresHeight && (
              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Box Height (inches)</Text>
                  <Text className="text-xs text-primary">Editable</Text>
                </View>
                <TextInput
                  className="bg-background border border-primary rounded-xl px-4 py-3 text-foreground text-lg"
                  value={boxJumpInches}
                  onChangeText={setBoxJumpInches}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9BA1A6"
                />
              </View>
            )}
          </View>

          {/* Mark Complete Button */}
          <View className="items-center">
            <Pressable
              onPress={handleMarkComplete}
              style={({ pressed }: PressableStateCallbackType) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-success px-8 py-4 rounded-full w-full max-w-xs"
            >
              <Text className="text-white text-center font-bold text-lg">
                Mark Complete ✓
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
