import { FlatList, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllSessions } from "@/lib/workout-utils";
import { WorkoutSession } from "@/lib/types";
import { Platform } from "react-native";

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSessions = async () => {
    setLoading(true);
    try {
      const allSessions = await getAllSessions();
      // Deduplicate sessions: for each session number, keep only the latest completed version
      // If no completed version exists, keep the in-progress version
      const sessionMap = new Map<number, WorkoutSession>();
      
      for (const session of allSessions) {
        const existing = sessionMap.get(session.sessionNumber);
        
        if (!existing) {
          // First time seeing this session number
          sessionMap.set(session.sessionNumber, session);
        } else {
          // We've seen this session number before
          if (session.completed && !existing.completed) {
            // Replace in-progress with completed
            sessionMap.set(session.sessionNumber, session);
          } else if (session.completed && existing.completed) {
            // Both completed - keep the one with the latest completion time
            const existingTime = new Date(existing.completedAt || 0).getTime();
            const newTime = new Date(session.completedAt || 0).getTime();
            if (newTime > existingTime) {
              sessionMap.set(session.sessionNumber, session);
            }
          }
          // If existing is completed and new is in-progress, keep existing
          // If both are in-progress, keep the first one
        }
      }
      
      const uniqueSessions = Array.from(sessionMap.values());
      setSessions(uniqueSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionPress = (session: WorkoutSession) => {
    if (Platform.OS !== "web") {
    }
    router.push({
      pathname: "/session/detail" as any,
      params: { sessionId: session.sessionId },
    });
  };

  const handleClearHistory = async () => {
    if (Platform.OS !== "web") {
    }
    
    // Show confirmation
    const { clearAllSessions } = await import("@/lib/workout-utils");
    setClearing(true);
    try {
      await clearAllSessions();
      setSessions([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setClearing(false);
    }
  };

  const renderSession = ({ item }: { item: WorkoutSession }) => {
    const completedCount = item.exercises.filter(e => e.completed).length;
    const totalCount = item.exercises.length;
    const isComplete = item.completed;

    return (
      <TouchableOpacity
        onPress={() => handleSessionPress(item)}
        style={{ opacity: 1 }}
        activeOpacity={0.7}
        className="bg-surface rounded-xl p-4 mb-3 border border-border"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-lg font-bold text-foreground">
              Session #{item.sessionNumber}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {item.date} at {item.time}
            </Text>
          </View>
          {isComplete && (
            <View className="bg-success px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">✓ Complete</Text>
            </View>
          )}
          {!isComplete && (
            <View className="bg-warning px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">In Progress</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm text-muted">
            {completedCount} / {totalCount} exercises
          </Text>
          <Text className="text-sm text-primary font-semibold">View Details →</Text>
        </View>
      </TouchableOpacity>
    );
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
      <View className="flex-1">
        <View className="mb-4 flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">History</Text>
            <Text className="text-sm text-muted mt-1">
              {sessions.length} total session{sessions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {sessions.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              disabled={clearing}
              className="bg-error px-4 py-2 rounded-lg ml-2"
            >
              <Text className="text-white text-sm font-semibold">
                {clearing ? 'Clearing...' : 'Clear'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {sessions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-muted text-center">
              No workout sessions yet.{'\n'}Start your first workout!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.sessionId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
