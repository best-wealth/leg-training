import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Alert, Pressable, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getSessionById } from "@/lib/workout-utils";
import { WorkoutSession } from "@/lib/types";
import { generateSessionShareMessage, shareNatively } from "@/lib/social-share";
import { PressableStateCallbackType } from "react-native";

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const loadedSession = await getSessionById(sessionId);
      setSession(loadedSession);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleShareSession = async () => {
    if (!session) return;
    try {
      const message = generateSessionShareMessage(session.sessionNumber, session.sessionNumber);
      await shareNatively({
        title: 'Share Workout',
        message: message,
      });
    } catch (error) {
      console.error('Error sharing session:', error);
      Alert.alert('Share Error', 'Failed to share session');
    }
  };

  const handleContinueWorkout = () => {
    if (Platform.OS !== "web") {
    }
    
    if (session && !session.completed) {
      router.push({
        pathname: "/workout/active" as any,
        params: { sessionId: session.sessionId },
      });
    }
  };

  if (loading || !session) {
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
          {/* Session Header */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground flex-1">
                Session #{session.sessionNumber}
              </Text>
              {session.completed && (
                <TouchableOpacity
                  onPress={handleShareSession}
                  className="p-2"
                >
                  <Text className="text-xl">📤</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted">Date</Text>
                <Text className="text-foreground font-semibold">{session.date}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-muted">Time</Text>
                <Text className="text-foreground font-semibold">{session.time}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-muted">Status</Text>
                <Text className={`font-semibold ${session.completed ? 'text-success' : 'text-warning'}`}>
                  {session.completed ? 'Completed' : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Workout Button - Only show if session is in progress */}
          {!session.completed && (
            <Pressable
              onPress={handleContinueWorkout}
              style={({ pressed }: PressableStateCallbackType) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary px-8 py-4 rounded-full w-full"
            >
              <Text className="text-white text-center font-bold text-lg">
                Continue Workout
              </Text>
            </Pressable>
          )}

          {/* Exercise List */}
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground mb-2">Exercises</Text>
            
            {session.exercises.map((exercise, index) => (
              <View
                key={`${exercise.exerciseId}-${index}`}
                className="bg-surface rounded-xl p-4 border border-border"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {exercise.exerciseName}
                  </Text>
                  {exercise.completed && (
                    <View className="bg-success px-2 py-1 rounded-full">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </View>

                {exercise.weightKg && (
                  <View className="mt-2 gap-1">
                    <Text className="text-sm text-muted">
                      Weight: <Text className="text-foreground font-semibold">{exercise.weightKg} kg</Text> 
                      {' '}({exercise.weightLb?.toFixed(2)} lb)
                    </Text>
                  </View>
                )}

                {exercise.boxJumpInches && (
                  <View className="mt-2">
                    <Text className="text-sm text-muted">
                      Box Height: <Text className="text-foreground font-semibold">{exercise.boxJumpInches} inches</Text>
                    </Text>
                  </View>
                )}

                {!exercise.completed && (
                  <Text className="text-xs text-muted mt-2">Not completed</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
