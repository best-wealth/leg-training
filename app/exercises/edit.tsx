import { ScrollView, Text, View, TextInput, Alert, Pressable, PressableStateCallbackType, Switch, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { getCustomExerciseById, updateCustomExercise } from "@/lib/custom-exercises";
import { CustomExercise } from "@/lib/types";
import { Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useColors } from "@/hooks/use-colors";

export default function EditExerciseScreen() {
  const router = useRouter();
  const colors = useColors();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  
  const [exercise, setExercise] = useState<CustomExercise | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomExercise['type']>("custom");
  const [instructions, setInstructions] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [requiresWeight, setRequiresWeight] = useState(false);
  const [requiresHeight, setRequiresHeight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    setLoading(true);
    try {
      const loaded = await getCustomExerciseById(exerciseId);
      if (loaded) {
        setExercise(loaded);
        setName(loaded.name);
        setType(loaded.type);
        setInstructions(loaded.instructions);
        setReps(loaded.reps?.toString() || "");
        setDuration(loaded.duration ? (loaded.duration / 60).toString() : "");
        setRequiresWeight(loaded.requiresWeight || false);
        setRequiresHeight(loaded.requiresHeight || false);
      }
    } catch (error) {
      console.error("Error loading exercise:", error);
      Alert.alert("Error", "Failed to load exercise");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter an exercise name");
      return;
    }

    if (!instructions.trim()) {
      Alert.alert("Validation Error", "Please enter exercise instructions");
      return;
    }

    if (Platform.OS !== "web") {
    }

    setSaving(true);
    try {
      const repsNum = reps ? parseInt(reps) : undefined;
      const durationNum = duration ? parseInt(duration) * 60 : undefined;

      await updateCustomExercise(exerciseId, {
        name: name.trim(),
        type,
        instructions: instructions.trim(),
        reps: repsNum,
        duration: durationNum,
        requiresWeight,
        requiresHeight,
      });

      if (Platform.OS !== "web") {
      }

      Alert.alert("Success", "Exercise updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating exercise:", error);
      Alert.alert("Error", "Failed to update exercise");
    } finally {
      setSaving(false);
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
          <View>
            <Text className="text-3xl font-bold text-foreground">Edit Exercise</Text>
            <Text className="text-sm text-muted mt-1">Update your custom exercise</Text>
          </View>

          {/* Exercise Name */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Exercise Name *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="e.g., Dumbbell Lunges"
              placeholderTextColor="#9BA1A6"
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>

          {/* Exercise Type */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Exercise Type</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <Picker
                selectedValue={type}
                onValueChange={setType}
                enabled={!saving}
                style={{
                  color: colors.foreground,
                  backgroundColor: 'transparent',
                }}
              >
                <Picker.Item label="Custom" value="custom" />
                <Picker.Item label="Warmup" value="warmup" />
                <Picker.Item label="Stretch" value="stretch" />
                <Picker.Item label="Strength" value="strength" />
                <Picker.Item label="Finisher" value="finisher" />
              </Picker>
            </View>
          </View>

          {/* Instructions */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Instructions *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="Describe how to perform this exercise"
              placeholderTextColor="#9BA1A6"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          {/* Reps */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Reps (Optional)</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="e.g., 10"
              placeholderTextColor="#9BA1A6"
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          {/* Duration */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Duration in Minutes (Optional)</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="e.g., 5"
              placeholderTextColor="#9BA1A6"
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          {/* Requires Weight Toggle */}
          <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">Requires Weight</Text>
              <Text className="text-sm text-muted mt-1">Track weight for this exercise</Text>
            </View>
            <Switch
              value={requiresWeight}
              onValueChange={setRequiresWeight}
              disabled={saving}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Requires Height Toggle */}
          <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">Requires Height</Text>
              <Text className="text-sm text-muted mt-1">Track height/distance for this exercise</Text>
            </View>
            <Switch
              value={requiresHeight}
              onValueChange={setRequiresHeight}
              disabled={saving}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Update Button */}
          <Pressable
            onPress={handleUpdate}
            disabled={saving}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed && !saving ? 0.97 : 1 }],
              opacity: pressed && !saving ? 0.9 : saving ? 0.6 : 1,
            })}
            className="bg-primary px-8 py-4 rounded-full w-full"
          >
            <Text className="text-white text-center font-bold text-lg">
              {saving ? "Updating..." : "Update Exercise"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
