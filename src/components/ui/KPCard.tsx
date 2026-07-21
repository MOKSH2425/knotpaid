import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { Radius, Shadows, useTheme } from "@/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function KPCard({ children, style }: Props) {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderRadius: Radius.xl,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          ...(isDark ? {} : Shadows.card),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}