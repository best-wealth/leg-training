import { ScrollView, Text, View, ActivityIndicator, Pressable, PressableStateCallbackType, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { getSessionById, createNewSession, saveSession, getAllSessions } from "@/lib/workout-utils";
import { WorkoutSession, ExerciseLog } from "@/lib/types";
import { getExerciseById } from "@/lib/combined-exercises";
import { checkAndUnlockBadges } from "@/lib/badge-tracker";
import { BADGES } from "@/lib/badges";
import { checkForNewPRs, PRNotification } from "@/lib/pr-tracker";

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
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showingBadges, setShowingBadges] = useState(false);
  const [newPRs, setNewPRs] = useState<PRNotification[]>([]);
  const [showingPRs, setShowingPRs] = useState(false);
  const [currentPRIndex, setCurrentPRIndex] = useState(0);
  const [showingSummary, setShowingSummary] = useState(true);

  useEffect(() => {
    loadSessionAndExercises();
  }, [sessionId]);

  useEffect(() => {
    if (session && !showingBadges && !showingPRs && !showingSummary) {
      handleDone();
    }
  }, [session, showingBadges, showingPRs, showingSummary]);

  const loadSessionAndExercises = async () => {
    setLoading(true);
    try {
      const loadedSession = await getSessionById(sessionId);
      if (!loadedSession) {
        throw new Error('Session not found');
      }
      console.log('📊 Loaded session:', { sessionId: loadedSession.sessionId, completed: loadedSession.completed, exerciseCount: loadedSession.exercises.length });
      setSession(loadedSession);

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

  const handleSharePR = async (pr: PRNotification) => {
    try {
      const { generatePRShareMessage, generateBoxJumpShareMessage, shareNatively } = await import('@/lib/social-share');
      let message = '';
      if (pr.unit === 'in') {
        message = generateBoxJumpShareMessage(pr.newValue, pr.improvementPercentage);
      } else {
        const unit = pr.unit as 'kg' | 'lb';
        message = generatePRShareMessage(pr.exerciseName, pr.newValue, unit, pr.improvementPercentage);
      }
      
      await shareNatively({
        title: 'Share Personal Record',
        message: message,
      });
    } catch (error) {
      console.error('Error sharing PR:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const navigateToNextSession = async () => {
    try {
      const nextSessionNumber = session!.sessionNumber + 1;
      const newSession = createNewSession(nextSessionNumber);
      await saveSession(newSession);
      router.push({
        pathname: "/workout/active" as any,
        params: { sessionId: newSession.sessionId },
      });
    } catch (error) {
      console.error('Error navigating to next session:', error);
    }
  };

  const handleDone = async () => {
    if (!session) {
      console.log('❌ handleDone: session is null');
      return;
    }

    if (Platform.OS !== "web") {
    }

    try {
      const allSessions = await getAllSessions();
      console.log('✅ handleDone called');
      console.log('📊 handleDone - allSessions:', allSessions.length);
      console.log('📊 handleDone - current session completed:', session.completed);
      console.log('📊 handleDone - current session exercises:', session.exercises.length);
      
      // Check for new PRs
      const prs = checkForNewPRs(allSessions, session, defaultWeightUnit as 'kg' | 'lb');
      if (prs.length > 0) {
        setNewPRs(prs);
        setShowingPRs(true);
        setShowingSummary(false);
        setCurrentPRIndex(0);
        if (Platform.OS !== "web") {
        }
        return;
      }

      // Check for new badges
      console.log('🏆 Calling checkAndUnlockBadges...');
      const unlockedBadges = await checkAndUnlockBadges(allSessions, session);
      console.log('🏆 Badges unlocked:', unlockedBadges);
      if (unlockedBadges.length > 0) {
        setNewBadges(unlockedBadges);
        setShowingBadges(true);
        setShowingSummary(false);
        if (Platform.OS !== "web") {
        }
        setTimeout(() => {
          navigateToHomepage();
        }, 3000);
      } else {
        navigateToHomepage();
      }
    } catch (error) {
      console.error('❌ Error checking PRs and badges:', error);
      navigateToNextSession();
    }
  };

  const handleNextPR = async () => {
    if (currentPRIndex < newPRs.length - 1) {
      setCurrentPRIndex(currentPRIndex + 1);
    } else {
      handleContinueAfterPRs();
    }
  };

  const handleContinueAfterPRs = async () => {
    // After all PRs shown, check for badges
    setShowingPRs(false);
    setShowingSummary(false);
    handleBadgesAfterPRs();
  };

  const handleBadgesAfterPRs = async () => {
    try {
      const allSessions = await getAllSessions();
      const unlockedBadges = await checkAndUnlockBadges(allSessions, session!);
      if (unlockedBadges.length > 0) {
        setNewBadges(unlockedBadges);
        setShowingBadges(true);
        setTimeout(() => {
          navigateToHomepage();
        }, 3000);
      } else {
        navigateToHomepage();
      }
    } catch (error) {
      console.error('Error checking badges:', error);
      navigateToHomepage();
    }
  };

  const navigateToHomepage = () => {
    console.log('🏠 Navigating to homepage');
    router.push("/" as any);
  };

  if (loading || !session) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  // Show PRs screen if viewing PRs
  if (showingPRs && newPRs.length > 0) {
    const currentPR = newPRs[currentPRIndex];
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-6xl">🏅</Text>
            <Text className="text-3xl font-bold text-foreground text-center">New Personal Record!</Text>
            
            <View className="bg-surface rounded-xl p-6 border border-primary items-center gap-3 w-full">
              <Text className="text-lg font-semibold text-foreground text-center">{currentPR.exerciseName}</Text>
              <Text className="text-5xl font-bold text-primary">
                {currentPR.newValue.toFixed(1)} {currentPR.unit}
              </Text>
              <Text className="text-sm text-success font-semibold">
                +{currentPR.improvementPercentage.toFixed(1)}% improvement
              </Text>
            </View>

            <View className="flex-row gap-2 w-full">
              <Pressable
                onPress={() => handleSharePR(currentPR)}
                style={({ pressed }: PressableStateCallbackType) => ({
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                })}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-white text-center font-bold">📤 Share</Text>
              </Pressable>
              {currentPRIndex < newPRs.length - 1 ? (
                <Pressable
                  onPress={handleNextPR}
                  style={({ pressed }: PressableStateCallbackType) => ({
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  })}
                  className="flex-1 bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white text-center font-bold">Next PR</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleContinueAfterPRs}
                  style={({ pressed }: PressableStateCallbackType) => ({
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  })}
                  className="flex-1 bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white text-center font-bold">Continue</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show badges screen if unlocked
  if (showingBadges && newBadges.length > 0 && !showingSummary) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-6xl">🏆</Text>
            <Text className="text-3xl font-bold text-foreground text-center">New Badge Unlocked!</Text>
            
            {newBadges.map((badgeId) => {
              const badge = BADGES[badgeId as keyof typeof BADGES];
              return badge ? (
                <View key={badgeId} className="bg-surface rounded-xl p-6 border border-primary items-center gap-3 w-full">
                  <Text className="text-5xl">{badge.icon}</Text>
                  <Text className="text-lg font-semibold text-foreground text-center">{badge.name}</Text>
                  <Text className="text-sm text-muted text-center">{badge.description}</Text>
                </View>
              ) : null;
            })}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show summary screen (default)
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          <View className="items-center gap-2">
            <Text className="text-5xl">🎉</Text>
            <Text className="text-3xl font-bold text-foreground">Workout Complete!</Text>
            <Text className="text-lg text-muted">Session #{session.sessionNumber}</Text>
          </View>

          {/* Summary Stats */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted">Duration</Text>
              <Text className="text-foreground font-semibold">~45 min</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Exercises Completed</Text>
              <Text className="text-foreground font-semibold">{session.exercises.filter(e => e.completed).length}/{session.exercises.length}</Text>
            </View>
          </View>

          {/* Weight Exercises Summary */}
          {weightExercises.length > 0 && (
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground">Weight Exercises</Text>
              {weightExercises.map((exercise, index) => (
                <View key={index} className="bg-surface rounded-lg p-3 border border-border">
                  <Text className="text-foreground font-semibold">{exercise.name}</Text>
                  {exercise.weightKg && (
                    <Text className="text-sm text-muted mt-1">
                      {exercise.weightKg} kg ({exercise.weightLb?.toFixed(1)} lb)
                    </Text>
                  )}
                  {exercise.boxJumpInches && (
                    <Text className="text-sm text-muted mt-1">
                      {exercise.boxJumpInches} inches
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View className="gap-3 mt-4">
            <Pressable
              onPress={() => {
                setShowingSummary(false);
                handleDone();
              }}
              style={({ pressed }: PressableStateCallbackType) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary px-8 py-4 rounded-full w-full"
            >
              <Text className="text-white text-center font-bold text-lg">
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
