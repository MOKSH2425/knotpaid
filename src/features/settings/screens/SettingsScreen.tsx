import { useEffect, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { Spacing, useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";
import { useTopInset } from "@/hooks/useTopInset";
import {
  getThemeMode,
  setThemeMode,
} from "@/features/settings/services/settings.service";
import type { ThemeMode } from "@/theme/colors";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const topInset = useTopInset();
  const [themeMode, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(getThemeMode());
  }, []);

  function toggleTheme(value: boolean) {
    haptics.selection();
    const nextMode: ThemeMode = value ? "light" : "dark";
    setTheme(nextMode);
    setThemeMode(nextMode);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: Spacing.lg,
        paddingTop: topInset,
      }}
    >
      <KPText
        style={{
          fontSize: 30,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        Settings
      </KPText>
      <KPText
        style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}
      >
        Personalize the app and review how your data is handled.
      </KPText>

      <View style={{ height: 20 }} />

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <KPText
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Theme
            </KPText>
            <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
              Switch between light and dark appearance.
            </KPText>
          </View>

          <Switch
            value={themeMode === "light"}
            onValueChange={toggleTheme}
            thumbColor={colors.white}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </KPCard>

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <KPText
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          About
        </KPText>
        <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
          KnotPaid helps you split shared expenses with friends, family, and
          groups.
        </KPText>
      </KPCard>

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <KPText
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Privacy
        </KPText>
        <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
          Your groups, members, and expenses are stored locally on this device.
        </KPText>
      </KPCard>

      <View style={{ height: 24 }} />
      <KPButton title="Back to Dashboard" onPress={() => router.replace("/")} />
    </ScrollView>
  );
}
