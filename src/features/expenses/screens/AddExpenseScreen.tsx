import { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { KPDateTimeField } from "@/components/common/KPDateTimeField";
import { KPParticipantSelector } from "@/components/common/KPParticipantSelector";
import { Colors, Spacing, useTheme } from "@/theme";
import { useDialog } from "@/providers/DialogProvider";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { useTopInset } from "@/hooks/useTopInset";

import { createExpense } from "../services/expense.service";
import { getMembers } from "@/features/members/services/member.service";

export default function AddExpenseScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dialog = useDialog();
  const guard = useSubmitGuard();
  const topInset = useTopInset();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());

  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const [members, setMembers] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId) return;

    const list = getMembers(groupId as string);
    setMembers(list);

    if (list.length > 0) {
      setPaidBy(list[0].id);
      // Default to everyone splitting it — matches the old always-split-
      // among-everyone behavior unless you deliberately narrow it down.
      setParticipantIds(list.map((member) => member.id));
    }
  }, [groupId]);

  function toggleParticipant(memberId: string) {
    setParticipantIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  const parsedAmount = Number(amount);
  const perPersonShare =
    participantIds.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0
      ? parsedAmount / participantIds.length
      : null;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: topInset }]}
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

          <KPText style={styles.sectionTitle}>When</KPText>
          <KPDateTimeField value={expenseDate} onChange={setExpenseDate} />

          <View style={{ height: 16 }} />

          <KPCard style={styles.previewCard}>
            <KPText style={styles.previewLabel}>Preview</KPText>
            <KPText style={styles.previewTitle}>
              {title.trim() || "New expense"}
            </KPText>
            <KPText style={styles.previewAmount}>
              {amount ? `₹ ${amount}` : "Enter an amount"}
            </KPText>
            {perPersonShare !== null ? (
              <KPText style={styles.previewShare}>
                ₹{perPersonShare.toFixed(2)} each • {participantIds.length}{" "}
                {participantIds.length === 1 ? "person" : "people"}
              </KPText>
            ) : null}
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

          <KPText style={styles.sectionTitle}>Split Between</KPText>
          <KPText style={styles.helperText}>
            Only the people you select here will owe a share of this expense.
          </KPText>
          <View style={{ height: 10 }} />
          <KPParticipantSelector
            members={members}
            selectedIds={participantIds}
            onToggle={toggleParticipant}
          />

          <View style={{ height: 24 }} />

          <KPButton
            title="Save Expense"
            onPress={guard(async () => {
              const trimmedTitle = title.trim();
              const parsedAmount = Number(amount);

              if (!trimmedTitle) {
                await dialog.alert({
                  title: "Expense title required",
                  message: "Please enter an expense title.",
                });
                return;
              }

              if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                await dialog.alert({
                  title: "Invalid amount",
                  message: "Please enter an amount greater than zero.",
                });
                return;
              }

              if (!paidBy) {
                await dialog.alert({
                  title: "Payer required",
                  message: "Please select who paid for this expense.",
                });
                return;
              }

              if (participantIds.length === 0) {
                await dialog.alert({
                  title: "Select who's splitting this",
                  message:
                    "Choose at least one person under Split Between.",
                });
                return;
              }

              createExpense(
                groupId as string,
                trimmedTitle,
                parsedAmount,
                paidBy,
                expenseDate.toISOString(),
                participantIds,
              );

              router.replace({
                pathname: "/group",
                params: { groupId },
              });
            })}
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
    helperText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
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
    previewShare: {
      marginTop: 6,
      color: colors.textSecondary,
      fontSize: 13,
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
