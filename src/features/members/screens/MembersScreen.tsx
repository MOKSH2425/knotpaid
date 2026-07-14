import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";

import {
  createMember,
  getMembers,
  memberHasExpenses,
  deleteMember,
} from "../services/member.service";

export default function MembersScreen() {
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

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [loadMembers]),
  );

  function addMember() {
    if (!name.trim()) {
      Alert.alert("Member name required", "Please enter a name before adding.");
      return;
    }

    if (!groupId) return;

    createMember(groupId, name);
    setName("");
    loadMembers();
  }

  function confirmDelete(memberId: string, memberName: string) {
    if (memberHasExpenses(memberId)) {
      Alert.alert(
        "Cannot delete member",
        `${memberName} has expenses or shares and cannot be removed yet.`,
      );
      return;
    }

    Alert.alert("Delete member", `Remove ${memberName} from this group?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMember(memberId);
          loadMembers();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
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
          <KPCard style={styles.emptyCard}>
            <KPText style={styles.emptyText}>No members added yet.</KPText>
          </KPCard>
        ) : (
          members.map((member) => (
            <KPCard key={member.id} style={styles.memberCard}>
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
                    style={styles.secondaryButton}
                  />
                </View>
                <View style={styles.actionButtonWrap}>
                  <KPButton
                    title="Delete"
                    onPress={() => confirmDelete(member.id, member.name)}
                    style={styles.dangerButton}
                  />
                </View>
              </View>
            </KPCard>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.white,
  },
  subtitle: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
});
