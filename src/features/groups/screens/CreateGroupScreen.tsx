import { useState } from "react";
import { View, StyleSheet } from "react-native";

import { KPButton, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";
import { createGroup } from "../services/group.service";
import { router } from "expo-router";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");

  return (
    <View style={styles.container}>
      <KPText style={styles.title}>Create Group</KPText>

      <KPInput
        placeholder="Trip to Goa"
        value={groupName}
        onChangeText={setGroupName}
      />

      <View style={{ height: 24 }} />

      <KPButton
        title="Create Group"
        onPress={() => {
          if (!groupName.trim()) return;

          createGroup(groupName);

          router.replace("/");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
