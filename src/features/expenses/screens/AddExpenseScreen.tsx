import { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";

import { createExpense } from "../services/expense.service";
import { getMembers } from "@/features/members/services/member.service";

export default function AddExpenseScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <KPCard style={styles.formCard}>
          <KPText style={styles.heading}>Add Expense</KPText>
          <KPText style={styles.subtitle}>
            Record a shared expense and choose who paid it.
          </KPText>

          <View style={{ height: 24 }} />

          <KPInput placeholder="Dinner" value={title} onChangeText={setTitle} />

          <View style={{ height: 16 }} />

          <KPInput
            placeholder="1200"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={{ height: 16 }} />

          <KPCard style={styles.previewCard}>
            <KPText style={styles.previewLabel}>Preview</KPText>
            <KPText style={styles.previewTitle}>
              {title.trim() || "New expense"}
            </KPText>
            <KPText style={styles.previewAmount}>
              {amount ? `₹ ${amount}` : "Enter an amount"}
            </KPText>
          </KPCard>

          <View style={{ height: 24 }} />

          <KPText style={styles.sectionTitle}>Paid By</KPText>
          {members.map((member) => (
            <View key={member.id} style={{ marginBottom: 10 }}>
              <KPButton
                title={paidBy === member.id ? `✓ ${member.name}` : member.name}
                onPress={() => setPaidBy(member.id)}
                textColor={paidBy === member.id ? colors.onPrimary : colors.text}
                style={
                  paidBy === member.id
                    ? styles.payerSelected
                    : styles.payerButton
                }
              />
            </View>
          ))}

          <View style={{ height: 24 }} />

          <KPButton
            title="Save Expense"
            onPress={() => {
              const trimmedTitle = title.trim();
              const parsedAmount = Number(amount);

              if (!trimmedTitle) {
                Alert.alert(
                  "Expense title required",
                  "Please enter an expense title.",
                );
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
                Alert.alert(
                  "Payer required",
                  "Please select who paid for this expense.",
                );
                return;
              }

              createExpense(
                groupId as string,
                trimmedTitle,
                parsedAmount,
                paidBy,
              );

              router.replace({
                pathname: "/group",
                params: { groupId },
              });
            }}
          />
        </KPCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      padding: Spacing.lg,
      justifyContent: "center",
    },
    formCard: {
      padding: 20,
    },
    heading: {
      fontSize: 32,
      fontWeight: "800",
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
    },
    previewCard: {
      padding: 14,
      backgroundColor: colors.surfaceLight,
    },
    previewLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    previewAmount: {
      marginTop: 4,
      color: colors.secondary,
      fontWeight: "700",
    },
    payerButton: {
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    payerSelected: {
      backgroundColor: colors.primary,
    },
  });
}
