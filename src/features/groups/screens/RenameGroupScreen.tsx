import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";
import { useDialog } from "@/providers/DialogProvider";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { useTopInset } from "@/hooks/useTopInset";
import { updateGroup } from "../services/group.service";

export default function RenameGroupScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dialog = useDialog();
  const guard = useSubmitGuard();
  const topInset = useTopInset();

  const { groupId, name } = useLocalSearchParams<{
    groupId: string;
    name: string;
  }>();

  const [value, setValue] = useState(name ?? "");

  const save = guard(async () => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      await dialog.alert({
        title: "Group name required",
        message: "Please enter a valid group name.",
      });
      return;
    }

    updateGroup(groupId, trimmedName);

    router.replace({
      pathname: "/group",
      params: { groupId },
    });
  });

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: topInset }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <KPCard style={styles.card}>
          <KPText style={styles.title}>Rename Group</KPText>
          <KPText style={styles.subtitle}>
            Update the name so everyone can recognize the group instantly.
          </KPText>

          <View style={{ height: 24 }} />

          <KPInput
            placeholder="Group Name"
            value={value}
            onChangeText={setValue}
          />

          <View style={{ height: 24 }} />

          <KPButton title="Save Changes" onPress={save} />
        </KPCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      padding: Spacing.lg,
      justifyContent: "center",
    },
    card: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
