import { useState, useEffect } from "react";
import { Alert, Pressable, View, StyleSheet } from "react-native"; // ✅ STEP 1

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";

import {
  createMember,
  getMembers,
  updateMember,
  deleteMember,
} from "../services/member.service"; // ✅ STEP 2

import { router, useLocalSearchParams } from "expo-router";

export default function MembersScreen() {
  const [members, setMembers] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [name, setName] = useState("");

  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  function loadMembers() {
    if (!groupId) return;
    setMembers(getMembers(groupId));
  }

  function addMember() {
    if (!name.trim()) return;
    if (!groupId) return;

    createMember(groupId, name);

    setName("");
    loadMembers();
  }

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <View style={styles.container}>
      <KPText style={styles.title}>Add Members</KPText>

      <KPInput
        placeholder="Enter member name"
        value={name}
        onChangeText={setName}
      />

      <View style={{ height: 16 }} />

      <KPButton title="Add Member" onPress={addMember} />

      <View style={{ height: 30 }} />

      {/* ✅ Updated Members List with Rename + Delete */}
      {members.map((member) => (
        <KPCard key={member.id} style={{ marginBottom: 12 }}>
          <KPText
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 15,
            }}
          >
            {member.name}
          </KPText>

          <KPButton
            title="Rename"
            onPress={() =>
              router.push({
                pathname: "/edit-member",
                params: {
                  memberId: member.id,
                  name: member.name,
                },
              })
            }
          />

          <View style={{ height: 10 }} />

          <KPButton
            title="Delete"
            onPress={() => {
              deleteMember(member.id);
              loadMembers();
            }}
          />
        </KPCard>
      ))}

      <View style={{ height: 30 }} />

      <KPButton
        title="Continue"
        onPress={() =>
          router.replace({
            pathname: "/group",
            params: { groupId },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
