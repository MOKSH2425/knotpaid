import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function KPFab({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 22,
    bottom: 30,

    width: 62,
    height: 62,

    borderRadius: 31,

    justifyContent: "center",
    alignItems: "center",

    elevation: 8,
  },
});
