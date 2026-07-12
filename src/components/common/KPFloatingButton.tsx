import { TouchableOpacity, StyleSheet, Text } from "react-native";

import { Colors } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function KPFloatingButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",

    right: 24,

    bottom: 32,

    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",

    elevation: 8,

    shadowColor: "#000",

    shadowOpacity: 0.25,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  plus: {
    color: "#fff",

    fontSize: 34,

    fontWeight: "300",

    marginTop: -2,
  },
});