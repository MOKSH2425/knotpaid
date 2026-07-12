import { View, StyleSheet } from "react-native";

import { KPButton, KPText } from "@/components/ui";

type Props = {
  onPress: () => void;
};

export default function KPEmptyState({
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <KPText
        style={{
          fontSize: 50,
        }}
      >
        💸
      </KPText>

      <KPText
        style={{
          marginTop: 20,
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        No Groups Yet
      </KPText>

      <KPText
        style={{
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Create your first group and start splitting expenses.
      </KPText>

      <View
        style={{
          marginTop: 30,
          width: "100%",
        }}
      >
        <KPButton
          title="Create Group"
          onPress={onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    alignItems: "center",
  },
});