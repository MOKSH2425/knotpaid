import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { Radius, useTheme } from "@/theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  // Optional explicit text color override — use this for buttons whose
  // background isn't colors.primary/colors.secondary (e.g. a neutral
  // surfaceLight "list item" style button), since onPrimary/onSecondary
  // are only guaranteed to contrast against primary/secondary fills.
  textColor?: string;
  style?: ViewStyle | ViewStyle[];
};

export function KPButton({
  title,
  onPress,
  variant = "primary",
  textColor,
  style,
}: Props) {
  const { colors } = useTheme();

  const bg = variant === "primary" ? colors.primary : colors.secondary;
  const defaultTextColor =
    variant === "primary" ? colors.onPrimary : colors.onSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        {
          height: 56,
          borderRadius: Radius.full,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          elevation: 3,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: textColor ?? defaultTextColor,
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
