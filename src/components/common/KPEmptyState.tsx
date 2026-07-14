import { View, StyleSheet } from "react-native";

import { KPButton, KPText } from "@/components/ui";
import { Colors } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function KPEmptyState({ onPress }: Props) {
  return (
    <View style={styles.container}>
      <KPText style={styles.icon}>💸</KPText>
      <KPText style={styles.title}>No Groups Yet</KPText>
      <KPText style={styles.subtitle}>
        Create your first group and start splitting expenses in seconds.
      </KPText>

      <View style={{ marginTop: 24, width: "100%" }}>
        <KPButton title="Create Group" onPress={onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: Colors.surface,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
