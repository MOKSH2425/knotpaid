import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

import { Colors, Radius, Shadows } from "@/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function KPCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,

    borderRadius: Radius.xl,

    padding: 20,

    borderWidth: 1,

    borderColor: Colors.border,

    ...Shadows.md,
  },
});