import { View, StyleSheet } from "react-native";

import { Colors, Radius } from "@/theme";
import { KPText } from "@/components/ui";

type Props = {
  amount: number;
};

export default function BalanceCard({
  amount,
}: Props) {
  return (
    <View style={styles.card}>
      <KPText style={styles.label}>
        Total Expenses
      </KPText>

      <KPText style={styles.amount}>
        ₹ {amount.toFixed(2)}
      </KPText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: Radius.xl,
    marginBottom: 20,
  },

  label: {
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  amount: {
    fontSize: 34,
    fontWeight: "800",
  },
});