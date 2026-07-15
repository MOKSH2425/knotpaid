import { TextInput, TextInputProps } from "react-native";
import { Radius, Spacing, useTheme } from "@/theme";

export function KPInput(props: TextInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      selectionColor={colors.primary}
      {...props}
      style={[
        {
          height: 56,
          backgroundColor: colors.surface,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.xl,
          paddingHorizontal: Spacing.lg,
          fontSize: 16,
        },
        props.style,
      ]}
    />
  );
}