import { View } from "react-native";

import { Radius, Shadows, useTheme } from "@/theme";
import { KPText } from "@/components/ui";

type Props = {
  amount: number;
};

export default function BalanceCard({ amount }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: Radius.xl,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.md,
      }}
    >
      <KPText
        style={{ color: colors.textSecondary, marginBottom: 8, fontSize: 14 }}
      >
        Total Expenses
      </KPText>
      <KPText style={{ fontSize: 34, fontWeight: "800", color: colors.text }}>
        ₹ {amount.toFixed(2)}
      </KPText>
      <KPText
        style={{ marginTop: 8, color: colors.textSecondary, fontSize: 13 }}
      >
        Across all groups and members
      </KPText>
    </View>
  );
}
