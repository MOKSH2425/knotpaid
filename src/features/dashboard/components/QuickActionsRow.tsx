import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { KPText } from "@/components/ui";
import { Colors } from "@/theme";

type Props = {
  onSettingsPress: () => void;
};

export default function QuickActionsRow({ onSettingsPress }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.action} onPress={onSettingsPress}>
        <KPText style={styles.actionText}>⚙️ Settings</KPText>
      </Pressable>

      <Pressable style={styles.action} onPress={() => router.push("/settings")}>
        <KPText style={styles.actionText}>ℹ️ About</KPText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  action: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  actionText: {
    color: Colors.text,
    fontWeight: "700",
  },
});
