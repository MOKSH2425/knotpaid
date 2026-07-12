import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { KPButton, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";

import { createExpense } from "../services/expense.service";
import { useLocalSearchParams } from "expo-router";
import { getMembers } from "@/features/members/services/member.service";

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const [members, setMembers] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState("");

  useEffect(() => {
    if (!groupId) return;

    const list = getMembers(groupId as string);
    setMembers(list);

    if (list.length > 0) {
      setPaidBy(list[0].id);
    }
  }, [groupId]);

  return (
    <View style={styles.container}>
      <KPText style={styles.heading}>Add Expense</KPText>

      <KPInput placeholder="Dinner" value={title} onChangeText={setTitle} />

      <View style={{ height: 16 }} />

      <KPInput
        placeholder="1200"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={{ height: 24 }} />

      <KPText style={{ marginBottom: 10 }}>Paid By</KPText>
      {members.map((member) => (
        <KPButton
          key={member.id}
          title={paidBy === member.id ? `✓ ${member.name}` : member.name}
          onPress={() => setPaidBy(member.id)}
        />
      ))}

      <View style={{ height: 24 }} />

      <KPButton
        title="Save Expense"
        onPress={() => {
          createExpense(groupId as string, title, Number(amount), paidBy);

          router.replace({
            pathname: "/group",
            params: { groupId },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
});
