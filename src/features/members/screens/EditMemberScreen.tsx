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

import { memberNameExists, updateMember } from "../services/member.service";

export default function EditMemberScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dialog = useDialog();
  const guard = useSubmitGuard();
  const topInset = useTopInset();

  const { memberId, name, groupId } = useLocalSearchParams<{
    memberId: string;
    name: string;
    groupId: string;
  }>();

  const [value, setValue] = useState(name ?? "");

  const save = guard(async () => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      await dialog.alert({
        title: "Member name required",
        message: "Please enter a valid member name.",
      });
      return;
    }

    if (groupId && memberNameExists(groupId, trimmedName, memberId)) {
      await dialog.alert({
        title: "Name already in this group",
        message: `Someone named "${trimmedName}" is already in this group. Try adding a last initial or nickname to tell them apart.`,
      });
      return;
    }

    updateMember(memberId, trimmedName);

    if (groupId) {
      router.replace({
        pathname: "/members",
        params: { groupId },
      });
    } else {
      router.back();
    }
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
          <KPText style={styles.title}>Edit Member</KPText>
          <KPText style={styles.subtitle}>
            Change the name and save to update this group member.
          </KPText>

          <View style={{ height: 24 }} />

          <KPInput
            value={value}
            onChangeText={setValue}
            placeholder="Member name"
          />

          <View style={{ height: 24 }} />

          <KPButton title="Save" onPress={save} />
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
    },
    card: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
