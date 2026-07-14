import { TextInput, TextInputProps, StyleSheet } from "react-native";

import { Colors, Radius, Spacing } from "@/theme";

export function KPInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.textSecondary}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.surfaceLight,

    color: Colors.text,

    borderWidth: 1,

    borderColor: Colors.border,

    borderRadius: Radius.lg,

    paddingHorizontal: Spacing.lg,

    paddingVertical: 16,

    fontSize: 16,
  },
});
