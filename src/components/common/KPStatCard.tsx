import { StyleSheet, View } from "react-native";

import { KPText } from "@/components/ui";
import { Colors, Radius } from "@/theme";

type Props = {
  title: string;
  value: string;
};

export default function KPStatCard({
  title,
  value,
}: Props) {
  return (
    <View style={styles.card}>
      <KPText style={styles.value}>
        {value}
      </KPText>

      <KPText style={styles.title}>
        {title}
      </KPText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: Radius.lg,
    marginHorizontal: 5,
  },

  value: {
    fontSize: 24,
    fontWeight: "800",
  },

  title: {
    marginTop: 8,
    color: Colors.textSecondary,
  },
});