
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { getSessionById, createNewSession, saveSession, getAllSessions } from "@/lib/workout-utils";
import { WorkoutSession, ExerciseLog } from "@/lib/types";
import { getExerciseById } from "@/lib/combined-exercises";
import { checkAndUnlockBadges } from "@/lib/badge-tracker";
import { BADGES } from "@/lib/badges";
import { checkForNewPRs, PRNotification } from "@/lib/pr-tracker";
import { Platform, ScrollView, Text, View, ActivityIndicator, Pressable, PressableStateCallbackType } from "react-native";

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

  useEffect(() => {
    loadSessionAndExercises();
  }, [sessionId]);

  useEffect(() => {
    if (session && !showingBadges && !showingPRs) {
      handleDone();
    }
  }, [session]);

  const loadSessionAndExercises = async () => {
    setLoading(true);
    try {
      const loadedSession = await getSessionById(sessionId);
      if (!loadedSession) {
        throw new Error('Session not found');
      }
      console.log('📊 Loaded session:', { sessionId: loadedSession.sessionId, completed: loadedSession.completed, exerciseCount: loadedSession.exercises.length });
      setSession(loadedSession);

      // Settings loading removed to fix String to Boolean cast error

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
      // All PRs shown, now check badges
      setShowingPRs(false);
      handleBadgesAfterPRs();
    }
  };

  const handleContinueAfterPRs = async () => {
    // After all PRs shown, check for badges
    setShowingPRs(false);
    handleBadgesAfterPRs();
  };

  const handleBadgesAfterPRs = async () => {
    try {
      const allSessions = await getAllSessions();
      console.log('🏆 handleBadgesAfterPRs - checking badges');
      const unlockedBadges = await checkAndUnlockBadges(allSessions, session!);
      console.log('🏆 handleBadgesAfterPRs - unlocked:', unlockedBadges);
      if (unlockedBadges.length > 0) {
        setNewBadges(unlockedBadges);
        setShowingBadges(true);
        if (Platform.OS !== "web") {
        }
        setTimeout(() => {
          navigateToHomepage();
        }, 3000);
      } else {
        console.log('ℹ️ No badges unlocked, navigating to home');
        navigateToHomepage();
      }
    } catch (error) {
      console.error('❌ Error checking badges:', error);
      navigateToHomepage();
    }
  };

  const navigateToHomepage = () => {
    console.log('🏠 Navigating to homepage');
    router.push("/" as any);
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

  // Show PR notification
  if (showingPRs && newPRs.length > 0) {
    const currentPR = newPRs[currentPRIndex];
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-6xl">🏅</Text>
            <Text className="text-3xl font-bold text-foreground text-center">New Personal Record!</Text>
            
            <View className="bg-surface rounded-xl p-6 border border-primary w-full gap-4">
              <Text className="text-xl font-bold text-foreground text-center">
                {currentPR.exerciseName}
              </Text>
              
              <View className="items-center gap-2">
                <Text className="text-5xl font-bold text-primary">
                  {currentPR.newValue.toFixed(1)}
                </Text>
                <Text className="text-lg text-muted">{currentPR.unit}</Text>
              </View>

              {currentPR.previousValue > 0 && (
                <View className="bg-background rounded-lg p-4 gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Previous PR</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {currentPR.previousValue.toFixed(1)} {currentPR.unit}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Improvement</Text>
                    <Text className="text-sm font-semibold text-success">
                      +{currentPR.improvementAbsolute.toFixed(1)} {currentPR.unit} ({currentPR.improvementPercentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="flex-row gap-2 w-full">
              <Pressable
                onPress={() => handleSharePR(newPRs[currentPRIndex])}
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

            <Text className="text-xs text-muted text-center">
              {currentPRIndex + 1} of {newPRs.length} PRs
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show badge notification
  if (showingBadges && newBadges.length > 0) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center gap-6">
            <Text className="text-6xl">🏆</Text>
            <Text className="text-3xl font-bold text-foreground text-center">New Badges Unlocked!</Text>
            
            <View className="gap-4 w-full">
              {newBadges.map((badgeId) => {
                const badge = BADGES[badgeId as keyof typeof BADGES];
                return (
                  <View key={badgeId} className="bg-surface rounded-xl p-4 border border-primary items-center gap-2">
                    <Text className="text-5xl">{badge.icon}</Text>
                    <Text className="text-lg font-bold text-foreground text-center">{badge.name}</Text>
                    <Text className="text-sm text-muted text-center">{badge.description}</Text>
                  </View>
                );
              })}
            </View>

            <Text className="text-sm text-muted text-center mt-4">
              Redirecting in 3 seconds...
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          <View className="items-center gap-2">
            <Text className="text-5xl">🎉</Text>
            <Text className="text-3xl font-bold text-foreground">Workout Complete!</Text>
            <Text className="text-lg text-muted">Session #{session.sessionNumber}</Text>
          </View>

          <View className="bg-primary rounded-2xl p-6 items-center gap-2">
            <Text className="text-white text-sm">Total Exercises Completed</Text>
            <Text className="text-5xl font-bold text-white">{session.exercises.length}</Text>
          </View>

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

          <View className="gap-3 mt-4">
            <Pressable
              onPress={handleDone}
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
