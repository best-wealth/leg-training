import { ScrollView, Text, View, TouchableOpacity, Alert, Pressable, PressableStateCallbackType } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getSettings, saveSettings } from "@/lib/workout-utils";
import { useRouter } from "expo-router";
import { AppSettings } from "@/lib/types";
import { Platform } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({ defaultWeightUnit: 'kg' });

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleToggleUnit = async () => {
    if (Platform.OS !== "web") {
    }

    const newUnit: 'kg' | 'lb' = settings.defaultWeightUnit === 'kg' ? 'lb' : 'kg';
    const newSettings: AppSettings = { ...settings, defaultWeightUnit: newUnit };
    
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Profile</Text>
            <Text className="text-sm text-muted mt-1">App settings and preferences</Text>
          </View>



          {/* About Section */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">About</Text>

            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-base font-semibold text-foreground mb-2">
                Leg Training For Basketball
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                A comprehensive resistance training program designed for basketball players and volleyball players, 
                targeting leg and hip strength to improve vertical leap performance on the court.
              </Text>
              <Text className="text-sm text-muted leading-relaxed mt-3">
                This App should increase your vertical leap by at least 4 inches after reaching all the strength achievements to Master level.
              </Text>
              <Text className="text-xs text-muted mt-3">Version 1.0.0</Text>
            </View>
          </View>

          {/* Custom Exercises Link */}
          <Pressable
            onPress={() => router.push("/exercises/custom" as any)}
            style={({ pressed }: PressableStateCallbackType) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="bg-surface rounded-xl p-4 border border-border"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-base font-semibold text-foreground">
                  Custom Exercises
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Create and manage your own exercises
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
          </Pressable>

          {/* Info Card */}
          <View className="bg-primary rounded-xl p-4">
            <Text className="text-white text-sm leading-relaxed">
              💡 <Text className="font-semibold">Tip:</Text> Track your workouts consistently 
              to see your progress over time. Your personal records are automatically calculated 
              from your completed sessions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
