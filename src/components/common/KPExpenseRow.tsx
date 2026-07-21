import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { KPCard, KPText } from "@/components/ui";
import { useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";
import { formatTimePart } from "@/utils/formatDate";

type Props = {
  title: string;
  amount: number;
  payerName?: string;
  expenseDate: string;
  onEdit: () => void;
  onDelete: () => void;
};

// Compact 2-line replacement for the old tall card + two full-width
// buttons. Edit/delete are small icon-only touch targets at the row's
// trailing edge — visually 30px, but hitSlop brings the real tappable
// area to ~46px so it still clears the 44dp accessibility minimum.
export function KPExpenseRow({
  title,
  amount,
  payerName,
  expenseDate,
  onEdit,
  onDelete,
}: Props) {
  const { colors } = useTheme();

  return (
    <KPCard
      style={{ marginBottom: 10, paddingVertical: 12, paddingHorizontal: 14 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <KPText
            style={{ fontSize: 16, fontWeight: "700" }}
            numberOfLines={1}
          >
            {title}
          </KPText>
          <KPText
            style={{ marginTop: 3, color: colors.textSecondary, fontSize: 12 }}
            numberOfLines={1}
          >
            {payerName ? `Paid by ${payerName} • ` : ""}
            {formatTimePart(expenseDate)}
          </KPText>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <KPText
            style={{ fontWeight: "800", fontSize: 16, color: colors.text }}
          >
            ₹{amount}
          </KPText>

          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                haptics.light();
                onEdit();
              }}
              style={({ pressed }) => ({
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceLight,
                marginRight: 6,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.text} />
            </Pressable>

            <Pressable
              hitSlop={8}
              onPress={() => {
                haptics.light();
                onDelete();
              }}
              style={({ pressed }) => ({
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.danger + "1A",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="trash-outline" size={15} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </KPCard>
  );
}
