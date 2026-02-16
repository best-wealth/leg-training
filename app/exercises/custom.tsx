import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert, Pressable, PressableStateCallbackType } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllCustomExercises, deleteCustomExercise } from "@/lib/custom-exercises";
import { CustomExercise } from "@/lib/types";
import { Platform } from "react-native";

export default function CustomExercisesScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [])
  );

  const loadExercises = async () => {
    setLoading(true);
    try {
      const customExercises = await getAllCustomExercises();
      setExercises(customExercises);
    } catch (error) {
      console.error('Error loading custom exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    if (Platform.OS !== "web") {
    }
    router.push("/exercises/create" as any);
  };

  const handleEditExercise = (exercise: CustomExercise) => {
    if (Platform.OS !== "web") {
    }
    router.push({
      pathname: "/exercises/edit" as any,
      params: { exerciseId: exercise.id },
    });
  };

  const handleDeleteExercise = (exercise: CustomExercise) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteCustomExercise(exercise.id);
              if (Platform.OS !== "web") {
              }
              loadExercises();
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert("Error", "Failed to delete exercise");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderExercise = ({ item }: { item: CustomExercise }) => {
    const typeColors: Record<string, string> = {
      warmup: "bg-blue-100 text-blue-800",
      stretch: "bg-purple-100 text-purple-800",
      strength: "bg-orange-100 text-orange-800",
      finisher: "bg-red-100 text-red-800",
      custom: "bg-green-100 text-green-800",
    };

    return (
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              {item.name}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {item.instructions}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-3 flex-wrap">
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold capitalize">
              {item.type}
            </Text>
          </View>
          {item.reps && (
            <View className="bg-surface border border-border px-3 py-1 rounded-full">
              <Text className="text-foreground text-xs font-semibold">
                {item.reps} reps
              </Text>
            </View>
          )}
          {item.duration && (
            <View className="bg-surface border border-border px-3 py-1 rounded-full">
              <Text className="text-foreground text-xs font-semibold">
                {Math.floor(item.duration / 60)}m
              </Text>
            </View>
          )}
          {item.requiresWeight && (
            <View className="bg-surface border border-border px-3 py-1 rounded-full">
              <Text className="text-foreground text-xs font-semibold">
                Weight
              </Text>
            </View>
          )}
          {item.requiresHeight && (
            <View className="bg-surface border border-border px-3 py-1 rounded-full">
              <Text className="text-foreground text-xs font-semibold">
                Height
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => handleEditExercise(item)}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="flex-1 bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-sm">
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleDeleteExercise(item)}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="flex-1 bg-error px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-sm">
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
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
        <View className="mb-4">
          <Text className="text-3xl font-bold text-foreground">Custom Exercises</Text>
          <Text className="text-sm text-muted mt-1">
            {exercises.length} custom exercise{exercises.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {exercises.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-muted text-center mb-6">
              No custom exercises yet.{'\n'}Create your first one!
            </Text>
            <Pressable
              onPress={handleAddExercise}
              style={({ pressed }: PressableStateCallbackType) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary px-8 py-4 rounded-full"
            >
              <Text className="text-white text-center font-bold">
                Add Custom Exercise
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList
              data={exercises}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            <Pressable
              onPress={handleAddExercise}
              style={({ pressed }: PressableStateCallbackType) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary px-8 py-4 rounded-full w-full"
            >
              <Text className="text-white text-center font-bold">
                + Add Custom Exercise
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
