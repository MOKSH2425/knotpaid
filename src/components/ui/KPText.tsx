import { Text, TextProps } from "react-native";

import { useTheme } from "@/theme";

export function KPText({
  style,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  return (
    <Text
      {...props}
      style={[
        {
          color: colors.text,

          fontSize: 16,

          fontWeight: "500",
        },
        style,
      ]}
    />
  );
}