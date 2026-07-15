import { View, Text } from "react-native";

import { useTheme } from "@/theme";

type Props = {
  name: string;
};

export default function KPAvatar({ name }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.onPrimary, fontSize: 20, fontWeight: "700" }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
