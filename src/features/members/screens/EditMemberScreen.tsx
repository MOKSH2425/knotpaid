import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPInput, KPText } from "@/components/ui";

import { updateMember } from "../services/member.service";

export default function EditMemberScreen() {
  const { memberId, name } = useLocalSearchParams<{
    memberId: string;
    name: string;
  }>();

  const [value, setValue] = useState(name ?? "");

  return (
    <View style={styles.container}>
      <KPText style={styles.title}>Edit Member</KPText>

      <KPInput value={value} onChangeText={setValue} />

      <View style={{ height: 20 }} />

      <KPButton
        title="Save"
        onPress={() => {
          if (!value.trim()) return;

          updateMember(memberId, value.trim());

          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
