import { Pressable, StyleSheet, Text } from "react-native";

import { Colors } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function FloatingButton({ onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>＋</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 30,
    right: 24,

    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    elevation: 10,
  },

  icon: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "300",
  },
});