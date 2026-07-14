import { View, StyleSheet } from "react-native";

import { Colors, Radius, Shadows } from "@/theme";
import { KPText } from "@/components/ui";

type Props = {
  amount: number;
};

export default function BalanceCard({ amount }: Props) {
  return (
    <View style={styles.card}>
      <KPText style={styles.label}>Total Expenses</KPText>
      <KPText style={styles.amount}>₹ {amount.toFixed(2)}</KPText>
      <KPText style={styles.subtext}>Across all groups and members</KPText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: Radius.xl,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  label: {
    color: Colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  amount: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
  },
  subtext: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
