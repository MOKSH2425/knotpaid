import { Stack } from "expo-router";

import { runMigrations } from "@/database/migrations";

runMigrations();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />

      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
