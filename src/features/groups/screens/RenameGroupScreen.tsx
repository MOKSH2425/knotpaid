import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  KPButton,
  KPInput,
  KPText,
} from "@/components/ui";

import { updateGroup } from "../services/group.service";

export default function RenameGroupScreen() {
  const { groupId, name } =
    useLocalSearchParams<{
      groupId: string;
      name: string;
    }>();

  const [value, setValue] = useState(name ?? "");

  function save() {
    if (!value.trim()) return;

    updateGroup(groupId, value.trim());

    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <KPText style={styles.title}>
        Rename Group
      </KPText>

      <KPInput
        placeholder="Group Name"
        value={value}
        onChangeText={setValue}
      />

      <View style={{ height: 20 }} />

      <KPButton
        title="Save Changes"
        onPress={save}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});