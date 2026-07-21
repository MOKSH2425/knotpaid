import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";
import { useDialog } from "@/providers/DialogProvider";
import { useRefresh } from "@/hooks/useRefresh";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { useTopInset } from "@/hooks/useTopInset";
import KPEmptyState from "@/components/common/KPEmptyState";

import {
  createMember,
  getMembers,
  memberHasExpenses,
  memberNameExists,
  deleteMember,
} from "../services/member.service";

export default function MembersScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dialog = useDialog();
  const topInset = useTopInset();

  const [members, setMembers] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [name, setName] = useState("");

  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const loadMembers = useCallback(() => {
    if (!groupId) return;
    setMembers(getMembers(groupId));
  }, [groupId]);

  const { refreshing, onRefresh } = useRefresh(loadMembers);
  const guard = useSubmitGuard();

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [loadMembers]),
  );

  const addMember = guard(async () => {
    if (!name.trim()) {
      await dialog.alert({
        title: "Member name required",
        message: "Please enter a name before adding.",
      });
      return;
    }

    if (!groupId) return;

    if (memberNameExists(groupId, name)) {
      await dialog.alert({
        title: "Name already in this group",
        message: `Someone named "${name.trim()}" is already in this group. Try adding a last initial or nickname to tell them apart.`,
      });
      return;
    }

    createMember(groupId, name);
    setName("");
    loadMembers();
  });

  async function confirmDelete(memberId: string, memberName: string) {
    if (memberHasExpenses(memberId)) {
      await dialog.alert({
        title: "Cannot delete member",
        message: `${memberName} has expenses or shares and cannot be removed yet.`,
      });
      return;
    }

    const confirmed = await dialog.confirm({
      title: "Delete member",
      message: `Remove ${memberName} from this group?`,
      confirmText: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    deleteMember(memberId);
    loadMembers();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: topInset }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <KPCard style={styles.heroCard}>
          <KPText style={styles.title}>Add Members</KPText>
          <KPText style={styles.subtitle}>
            Add each person who should share the expenses for this group.
          </KPText>
        </KPCard>

        <View style={{ height: 20 }} />

        <KPInput
          placeholder="Enter member name"
          value={name}
          onChangeText={setName}
        />

        <View style={{ height: 16 }} />

        <KPButton title="Add Member" onPress={addMember} />

        <View style={{ height: 24 }} />

        {members.length === 0 ? (
          <KPEmptyState
            icon="👥"
            title="No Members Yet"
            message="Add the first person above to get this group started."
            buttonText="Add First Member"
            onPress={addMember}
          />
        ) : (
          members.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInDown.delay(index * 60).springify().damping(16)}
            >
              <KPCard style={styles.memberCard}>
                <KPText style={styles.memberName}>{member.name}</KPText>

                <View style={styles.actionRow}>
                  <View style={styles.actionButtonWrap}>
                    <KPButton
                      title="Rename"
                      onPress={() =>
                        router.push({
                          pathname: "/edit-member",
                          params: {
                            memberId: member.id,
                            name: member.name,
                            groupId,
                          },
                        })
                      }
                      textColor={colors.text}
                      style={styles.secondaryButton}
                    />
                  </View>
                  <View style={styles.actionButtonWrap}>
                    <KPButton
                      title="Delete"
                      onPress={() => confirmDelete(member.id, member.name)}
                      textColor={colors.white}
                      style={styles.dangerButton}
                    />
                  </View>
                </View>
              </KPCard>
            </Animated.View>
          ))
        )}

        <View style={{ height: 24 }} />

        <KPButton
          title="Continue"
          onPress={() =>
            router.replace({
              pathname: "/group",
              params: { groupId },
            })
          }
        />
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
    heroCard: {
      paddingVertical: 18,
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
    memberCard: {
      paddingVertical: 18,
      marginBottom: 12,
    },
    memberName: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 18,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    actionButtonWrap: {
      flex: 1,
    },
    secondaryButton: {
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dangerButton: {
      backgroundColor: colors.danger,
    },
  });
}
