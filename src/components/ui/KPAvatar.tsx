import { View, Text, StyleSheet } from "react-native";

import { Colors } from "@/theme";

type Props = {
  name: string;
};

export default function KPAvatar({
  name,
}: Props) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.text}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  text: {
    color: Colors.white,

    fontSize: 20,

    fontWeight: "700",
  },
});