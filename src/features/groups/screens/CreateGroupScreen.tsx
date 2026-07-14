import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";
import { createGroup, GroupType } from "../services/group.service";
import { router } from "expo-router";

const GROUP_TYPES: Array<{
  key: GroupType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "trip", label: "Trip", icon: "airplane" },
  { key: "home", label: "Home", icon: "home" },
  { key: "couple", label: "Couple", icon: "heart" },
  { key: "other", label: "Other", icon: "layers" },
];

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("other");

  const selectedType = GROUP_TYPES.find((item) => item.key === groupType);

  function handleCreate() {
    const trimmedName = groupName.trim();

    if (!trimmedName) {
      Alert.alert("Group name required", "Please enter a name for your group.");
      return;
    }

    createGroup(trimmedName, groupType);
    router.replace("/");
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
        <KPCard style={styles.formCard}>
          <KPText style={styles.title}>Create New Group</KPText>
          <KPText style={styles.subtitle}>
            Add a friendly name and choose the type of group you are splitting
            with.
          </KPText>

          <View style={{ height: 24 }} />

          <KPInput
            placeholder="Trip to Goa"
            value={groupName}
            onChangeText={setGroupName}
          />

          <View style={{ height: 24 }} />

          <KPText style={styles.sectionTitle}>Group type</KPText>

          <View style={styles.typeRow}>
            {GROUP_TYPES.map((item) => (
              <View key={item.key} style={styles.typeItem}>
                <KPButton
                  title={item.label}
                  onPress={() => setGroupType(item.key)}
                  style={
                    groupType === item.key
                      ? styles.typeSelected
                      : styles.typeButton
                  }
                />
              </View>
            ))}
          </View>

          <View style={{ height: 16 }} />

          <KPCard style={styles.previewCard}>
            <View style={styles.previewRow}>
              <View style={styles.previewIcon}>
                <Ionicons
                  name={selectedType?.icon ?? "layers"}
                  size={18}
                  color={Colors.white}
                />
              </View>

              <View style={{ marginLeft: 12, flex: 1 }}>
                <KPText style={styles.previewLabel}>Selected group</KPText>
                <KPText style={styles.previewText}>
                  {selectedType?.label ?? "Other"}
                </KPText>
              </View>
            </View>
          </KPCard>

          <View style={{ height: 24 }} />

          <KPButton title="Create Group" onPress={handleCreate} />
        </KPCard>
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
    justifyContent: "center",
  },
  formCard: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    color: Colors.white,
  },
  subtitle: {
    color: Colors.textSecondary,
    lineHeight: 24,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  typeItem: {
    flex: 1,
    minWidth: 100,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  typeButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeSelected: {
    backgroundColor: Colors.primary,
  },
  previewCard: {
    padding: 14,
    backgroundColor: Colors.surfaceLight,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  previewText: {
    color: Colors.text,
    fontWeight: "700",
  },
});
