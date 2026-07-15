import { View } from "react-native";

import { KPButton, KPText } from "@/components/ui";
import { useTheme } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function KPEmptyState({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 48,
        alignItems: "center",
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: colors.surface,
      }}
    >
      <KPText style={{ fontSize: 44 }}>💸</KPText>
      <KPText
        style={{
          marginTop: 16,
          fontSize: 22,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        No Groups Yet
      </KPText>
      <KPText
        style={{
          marginTop: 8,
          textAlign: "center",
          color: colors.textSecondary,
          lineHeight: 20,
        }}
      >
        Create your first group and start splitting expenses in seconds.
      </KPText>

      <View style={{ marginTop: 24, width: "100%" }}>
        <KPButton title="Create Group" onPress={onPress} />
      </View>
    </View>
  );
}
