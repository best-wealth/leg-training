import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function ExercisesLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="custom"
        options={{
          title: "Custom Exercises",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Exercise",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Exercise",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
