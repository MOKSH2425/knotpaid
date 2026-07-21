import { View } from "react-native";

import { KPButton, KPText } from "@/components/ui";
import { useTheme } from "@/theme";

type Props = {
  onPress: () => void;
  icon?: string;
  title?: string;
  message?: string;
  buttonText?: string;
};

export default function KPEmptyState({
  onPress,
  icon = "💸",
  title = "No Groups Yet",
  message = "Create your first group and start splitting expenses in seconds.",
  buttonText = "Create Group",
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 24,
        alignItems: "center",
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <KPText style={{ fontSize: 44 }}>{icon}</KPText>
      <KPText
        style={{
          marginTop: 16,
          fontSize: 22,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {title}
      </KPText>
      <KPText
        style={{
          marginTop: 8,
          textAlign: "center",
          color: colors.textSecondary,
          lineHeight: 20,
        }}
      >
        {message}
      </KPText>

      <View style={{ marginTop: 24, width: "100%" }}>
        <KPButton title={buttonText} onPress={onPress} />
      </View>
    </View>
  );
}
