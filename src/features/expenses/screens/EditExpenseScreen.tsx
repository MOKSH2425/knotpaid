import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";

import { getMembers } from "@/features/members/services/member.service";
import { updateExpense } from "../services/expense.service";

export default function EditExpenseScreen() {
  const {
    expenseId,
    groupId,
    title,
    amount,
    paidBy: initialPaidBy,
  } = useLocalSearchParams<{
    expenseId: string;
    groupId: string;
    title: string;
    amount: string;
    paidBy: string;
  }>();

  const [expenseTitle, setExpenseTitle] = useState(title ?? "");
  const [expenseAmount, setExpenseAmount] = useState(amount ?? "");
  const [members, setMembers] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState(initialPaidBy ?? "");

  useEffect(() => {
    if (!groupId) return;

    const list = getMembers(groupId);
    setMembers(list);

    if (!paidBy && list.length > 0) {
      setPaidBy(list[0].id);
    }
  }, [groupId, paidBy]);

  function saveExpense() {
    const trimmedTitle = expenseTitle.trim();
    const parsedAmount = Number(expenseAmount);

    if (!trimmedTitle) {
      Alert.alert("Expense title required", "Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Please enter an amount greater than zero.",
      );
      return;
    }

    if (!paidBy) {
      Alert.alert("Payer required", "Please select who paid for this expense.");
      return;
    }

    updateExpense(expenseId, trimmedTitle, parsedAmount, paidBy);

    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <KPCard style={styles.formCard}>
          <KPText style={styles.title}>Edit Expense</KPText>
          <KPText style={styles.subtitle}>
            Update the expense details and payer when needed.
          </KPText>

          <View style={{ height: 24 }} />

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

          <View style={{ height: 16 }} />

          <KPCard style={styles.previewCard}>
            <KPText style={styles.previewLabel}>Preview</KPText>
            <KPText style={styles.previewTitle}>
              {expenseTitle.trim() || "Expense"}
            </KPText>
            <KPText style={styles.previewAmount}>
              {expenseAmount ? `₹ ${expenseAmount}` : "Enter amount"}
            </KPText>
          </KPCard>

          <View style={{ height: 22 }} />

          <KPText style={styles.sectionTitle}>Paid By</KPText>
          {members.map((member) => (
            <View key={member.id} style={{ marginBottom: 10 }}>
              <KPButton
                title={paidBy === member.id ? `✓ ${member.name}` : member.name}
                onPress={() => setPaidBy(member.id)}
                style={
                  paidBy === member.id
                    ? styles.payerSelected
                    : styles.payerButton
                }
              />
            </View>
          ))}

          <View style={{ height: 22 }} />

          <KPButton title="Save" onPress={saveExpense} />
        </KPCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  formCard: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: Colors.white,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  previewCard: {
    padding: 14,
    backgroundColor: Colors.surfaceLight,
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  previewAmount: {
    marginTop: 4,
    color: Colors.secondary,
    fontWeight: "700",
  },
  payerButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  payerSelected: {
    backgroundColor: Colors.primary,
  },
});
