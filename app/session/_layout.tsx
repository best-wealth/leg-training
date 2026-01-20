import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function SessionLayout() {
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
        name="detail"
        options={{
          title: "Session Details",
          headerBackTitle: "History",
        }}
      />
    </Stack>
  );
}
