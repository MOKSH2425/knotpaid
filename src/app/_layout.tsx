import { Stack } from "expo-router";

import { runMigrations } from "@/database/migrations";
import { initializeSettings } from "@/features/settings/services/settings.service";
import { ThemeProvider } from "@/theme";
import { DialogProvider } from "@/providers/DialogProvider";

runMigrations();
initializeSettings();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DialogProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" options={{ headerShown: false }} />

          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </DialogProvider>
    </ThemeProvider>
  );
}
