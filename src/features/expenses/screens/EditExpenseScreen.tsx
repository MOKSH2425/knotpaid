import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPInput, KPText } from "@/components/ui";

import { updateExpense } from "../services/expense.service";

export default function EditExpenseScreen() {
  const { expenseId, title, amount } = useLocalSearchParams<{
    expenseId: string;
    title: string;
    amount: string;
  }>();

  const [expenseTitle, setExpenseTitle] = useState(title ?? "");
  const [expenseAmount, setExpenseAmount] = useState(amount ?? "");

  return (
    <View style={styles.container}>
      <KPText style={styles.title}>Edit Expense</KPText>

      <KPInput
        placeholder="Expense Title"
        value={expenseTitle}
        onChangeText={setExpenseTitle}
      />

      <View style={{ height: 14 }} />

      <KPInput
        placeholder="Amount"
        keyboardType="numeric"
        value={expenseAmount}
        onChangeText={setExpenseAmount}
      />

      <View style={{ height: 22 }} />

      <KPButton
        title="Save"
        onPress={() => {
          if (!expenseTitle.trim()) return;
          if (!expenseAmount.trim()) return;

          updateExpense(expenseId, expenseTitle.trim(), Number(expenseAmount));

          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
});
