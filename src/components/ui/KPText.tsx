import {
  Text,
  TextProps,
  StyleSheet,
} from "react-native";

import { Colors } from "@/theme";

export function KPText({
  style,
  ...props
}: TextProps) {
  return (
    <Text
      {...props}
      style={[styles.text, style]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.text,

    fontSize: 16,
  },
});