import { TouchableOpacity, StyleSheet, Text, ViewStyle } from "react-native";

import { Colors, Radius } from "@/theme";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export function KPButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,

    borderRadius: Radius.full,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  text: {
    color: Colors.white,

    fontSize: 16,

    fontWeight: "700",
  },
});
