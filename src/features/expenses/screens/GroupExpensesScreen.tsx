import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { KPCard, KPInput, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";
import { useDialog } from "@/providers/DialogProvider";
import { useRefresh } from "@/hooks/useRefresh";
import { useTopInset } from "@/hooks/useTopInset";
import KPEmptyState from "@/components/common/KPEmptyState";
import { KPExpenseRow } from "@/components/common/KPExpenseRow";
import { formatDayHeader, dayKey } from "@/utils/formatDate";
import KPFab from "@/components/common/KPFab";

import { getMembers } from "@/features/members/services/member.service";
import { getGroups } from "@/features/groups/services/group.service";
import {
  getExpenses,
  deleteExpense,
} from "../services/expense.service";
import { calculateBalances } from "../services/balance.service";
import { calculateSettlements } from "../services/settlement.service";

export default function GroupExpensesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dialog = useDialog();
  const topInset = useTopInset();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const loadData = useCallback(() => {
    if (!groupId) return;

    const groups = getGroups();
    const current = groups.find((g) => g.id === groupId);
    if (!current) return;

    setGroup(current);
    setMembers(getMembers(current.id));
    setExpenses(getExpenses(current.id));
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const { refreshing, onRefresh } = useRefresh(loadData);

  const memberName = useCallback(
    (memberId: string) => members.find((m) => m.id === memberId)?.name,
    [members],
  );

  // Search matches on the expense title and on who paid — covers "what
  // did we call that" and "who paid for that" without needing separate
  // filter controls.
  const filteredExpenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;

    return expenses.filter((expense) => {
      const payer = memberName(expense.paidBy) ?? "";
      return (
        expense.title.toLowerCase().includes(q) ||
        payer.toLowerCase().includes(q)
      );
    });
  }, [expenses, query, memberName]);

  // Already sorted newest-first (expenseDate DESC) by getExpenses, so
  // grouping preserves that order — most recent day at the top.
  const groupedByDay = useMemo(() => {
    const groups: { key: string; header: string; items: any[] }[] = [];

    filteredExpenses.forEach((expense) => {
      const key = dayKey(expense.expenseDate);
      const existing = groups.find((g) => g.key === key);

      if (existing) {
        existing.items.push(expense);
      } else {
        groups.push({
          key,
          header: formatDayHeader(expense.expenseDate),
          items: [expense],
        });
      }
    });

    return groups;
  }, [filteredExpenses]);

  async function handleDelete(expense: any) {
    const confirmed = await dialog.confirm({
      title: "Delete Expense",
      message: `Delete "${expense.title}"? This can't be undone.`,
      confirmText: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    deleteExpense(expense.id);

    setExpenses(getExpenses(groupId));
    calculateBalances(groupId);
    calculateSettlements(groupId);
  }

  function editExpense(expense: any) {
    router.push({
      pathname: "/edit-expense",
      params: {
        expenseId: expense.id,
        groupId,
        title: expense.title,
        amount: expense.amount.toString(),
        paidBy: expense.paidBy,
        expenseDate: expense.expenseDate,
      },
    });
  }

  if (!group) return null;

  let cardIndex = 0;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: topInset, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <KPText style={styles.title}>Expenses</KPText>
        <KPText style={styles.subtitle}>
          {group.name} • {expenses.length}{" "}
          {expenses.length === 1 ? "expense" : "expenses"}
        </KPText>

        <View style={{ height: 18 }} />

        {expenses.length > 0 ? (
          <View style={{ position: "relative", justifyContent: "center" }}>
            <KPInput
              placeholder="🔍  Search expenses or payer"
              value={query}
              onChangeText={setQuery}
              style={query.length > 0 ? { paddingRight: 42 } : undefined}
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={10}
                style={{ position: "absolute", right: 14 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={{ height: 18 }} />

        {expenses.length === 0 ? (
          <KPEmptyState
            icon="🧾"
            title="No Expenses Yet"
            message="Log your first shared expense for this group."
            buttonText="Add First Expense"
            onPress={() =>
              router.push({
                pathname: "/add-expense",
                params: { groupId },
              })
            }
          />
        ) : filteredExpenses.length === 0 ? (
          <KPCard style={{ alignItems: "center", paddingVertical: 24 }}>
            <KPText style={{ color: colors.textSecondary, textAlign: "center" }}>
              No expenses match "{query}".
            </KPText>
            <View style={{ height: 12 }} />
            <Pressable onPress={() => setQuery("")}>
              <KPText style={{ color: colors.primary, fontWeight: "700" }}>
                Clear search
              </KPText>
            </Pressable>
          </KPCard>
        ) : (
          groupedByDay.map((dayGroup) => (
            <View key={dayGroup.key} style={{ marginBottom: 8 }}>
              <KPText style={styles.dayHeader}>{dayGroup.header}</KPText>

              {dayGroup.items.map((expense) => {
                const index = cardIndex++;

                return (
                  <Animated.View
                    key={expense.id}
                    entering={FadeInDown.delay(index * 45)
                      .springify()
                      .damping(16)}
                  >
                    <KPExpenseRow
                      title={expense.title}
                      amount={expense.amount}
                      payerName={memberName(expense.paidBy)}
                      expenseDate={expense.expenseDate}
                      onEdit={() => editExpense(expense)}
                      onDelete={() => handleDelete(expense)}
                    />
                  </Animated.View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <KPFab
        onPress={() => {
          if (members.length === 0) {
            router.push({
              pathname: "/members",
              params: { groupId },
            });
          } else {
            router.push({
              pathname: "/add-expense",
              params: { groupId },
            });
          }
        }}
      />
    </>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      fontSize: 15,
    },
    dayHeader: {
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.textSecondary,
      marginBottom: 10,
      marginTop: 4,
    },
  });
}
