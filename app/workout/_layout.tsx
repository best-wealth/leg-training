import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutLayout() {
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
        name="active"
        options={{
          title: "Active Workout",
          headerBackTitle: "Home",
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: "Workout Summary",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
