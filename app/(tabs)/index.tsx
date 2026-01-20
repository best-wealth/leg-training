import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Pressable, PressableStateCallbackType } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getActiveSession,
  getNextSessionNumber,
  createNewSession,
  saveSession,
  getCompletedSessionsCount,
  getLastWorkoutDate,
} from "@/lib/workout-utils";
import { WorkoutSession } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [nextSessionNumber, setNextSessionNumber] = useState<number>(1);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [active, nextNum, count, lastDate] = await Promise.all([
        getActiveSession(),
        getNextSessionNumber(),
        getCompletedSessionsCount(),
        getLastWorkoutDate(),
      ]);
      
      setActiveSession(active);
      setNextSessionNumber(nextNum);
      setCompletedCount(count);
      setLastWorkoutDate(lastDate);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleStartWorkout = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const newSession = createNewSession(nextSessionNumber);
      await saveSession(newSession);
      router.push({
        pathname: "/workout/active" as any,
        params: { sessionId: newSession.sessionId },
      });
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const handleContinueWorkout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeSession) {
      router.push({
        pathname: "/workout/active" as any,
        params: { sessionId: activeSession.sessionId },
      });
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 pt-4">
            <Text className="text-4xl font-bold text-foreground">🏀</Text>
            <Text className="text-3xl font-bold text-foreground">Hoop Legs</Text>
            <Text className="text-base text-muted text-center">
              Basketball Leg & Hip Training
            </Text>
          </View>

          {/* Session Info Card */}
          <View className="w-full bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {activeSession ? 'Active Session' : 'Next Session'}
            </Text>
            
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Session Number</Text>
                <Text className="text-foreground font-semibold">
                  #{activeSession ? activeSession.sessionNumber : nextSessionNumber}
                </Text>
              </View>
              
              {activeSession && (
                <>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Started</Text>
                    <Text className="text-foreground font-semibold">
                      {activeSession.time}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Progress</Text>
                    <Text className="text-foreground font-semibold">
                      {activeSession.exercises.filter(e => e.completed).length} / {activeSession.exercises.length}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{completedCount}</Text>
              <Text className="text-sm text-muted mt-1">Total Sessions</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground">
                {lastWorkoutDate ? lastWorkoutDate.slice(5) : '--'}
              </Text>
              <Text className="text-sm text-muted mt-1">Last Workout</Text>
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            onPress={activeSession ? handleContinueWorkout : handleStartWorkout}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="bg-primary px-8 py-4 rounded-full w-full mt-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              {activeSession ? 'Continue Workout' : 'Start Workout'}
            </Text>
          </Pressable>

          {/* Instructions */}
          <View className="bg-surface rounded-xl p-4 border border-border mt-2">
            <Text className="text-sm text-muted leading-relaxed">
              Complete the full training sequence: warm-up, stretches, strength exercises, and box jumps. 
              Track your weights and progress over time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
