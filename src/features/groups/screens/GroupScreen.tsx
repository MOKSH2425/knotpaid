import { useCallback, useState } from "react";
import { Alert, StyleSheet, ScrollView, View } from "react-native";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { Colors, Spacing } from "@/theme";

import { getMembers } from "@/features/members/services/member.service";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  getExpenses,
  deleteExpense,
} from "@/features/expenses/services/expense.service";
import { getGroups } from "../services/group.service";
import { calculateBalances } from "@/features/expenses/services/balance.service";
import KPAvatar from "@/components/ui/KPAvatar";
import { calculateSettlements } from "@/features/expenses/services/settlement.service";
import KPFab from "@/components/common/KPFab";

const GROUP_TYPE_LABELS: Record<string, string> = {
  trip: "Trip",
  home: "Home",
  couple: "Couple",
  other: "Other",
};

export default function GroupScreen() {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [settlements, setSettlements] = useState<any[]>([]);

  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;

      const groups = getGroups();
      const current = groups.find((g) => g.id === groupId);

      if (!current) return;

      setGroup(current);
      setMembers(getMembers(current.id));
      setExpenses(getExpenses(current.id));
      setBalances(calculateBalances(current.id));
      setSettlements(calculateSettlements(current.id));
    }, [groupId]),
  );

  if (!group) return null;

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <KPCard style={styles.headerCard}>
          <KPText style={styles.title}>{group.name}</KPText>
          <KPText style={styles.subtitle}>
            {GROUP_TYPE_LABELS[group.type] || "Other"} group • {members.length}{" "}
            members
          </KPText>
        </KPCard>

        <View style={{ height: 18 }} />

        <View style={styles.actionRow}>
          <KPButton
            title="Manage Members"
            onPress={() =>
              router.push({
                pathname: "/members",
                params: { groupId },
              })
            }
          />
          <View style={{ width: 12 }} />
          <KPButton
            title="Rename"
            onPress={() =>
              router.push({
                pathname: "/rename-group",
                params: { groupId, name: group.name },
              })
            }
          />
        </View>

        <View style={{ height: 24 }} />

        <KPCard style={styles.summaryCard}>
          <KPText style={styles.summaryLabel}>Total Expenses</KPText>
          <KPText style={styles.summaryAmount}>
            ₹ {totalExpense.toFixed(2)}
          </KPText>
        </KPCard>

        <View style={{ height: 20 }} />

        <KPText style={styles.sectionTitle}>Members</KPText>
        {members.length === 0 ? (
          <KPCard>
            <KPText>No members added yet.</KPText>

            <View style={{ height: 15 }} />

            <KPButton
              title="Add First Member"
              onPress={() =>
                router.push({
                  pathname: "/members",
                  params: { groupId },
                })
              }
            />
          </KPCard>
        ) : (
          members.map((member) => (
            <KPCard key={member.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <KPAvatar name={member.name} />
                <View style={{ marginLeft: 15 }}>
                  <KPText style={{ fontWeight: "700", fontSize: 18 }}>
                    {member.name}
                  </KPText>
                  <KPText style={{ color: Colors.textSecondary }}>
                    Group Member
                  </KPText>
                </View>
              </View>
            </KPCard>
          ))
        )}

        <View style={{ height: 25 }} />

        <KPText style={styles.sectionTitle}>Expenses</KPText>
        {expenses.length === 0 ? (
          <KPCard>
            <KPText>No expenses yet.</KPText>
          </KPCard>
        ) : (
          expenses.map((expense) => (
            <KPCard key={expense.id} style={{ marginBottom: 12 }}>
              <KPText
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {expense.title}
              </KPText>

              <KPText style={{ marginTop: 6 }}>₹ {expense.amount}</KPText>

              <KPText
                style={{
                  marginTop: 6,
                  color: Colors.textSecondary,
                }}
              >
                Paid by {members.find((m) => m.id === expense.paidBy)?.name}
              </KPText>

              <View style={{ height: 15 }} />

              <KPButton
                title="Edit Expense"
                onPress={() =>
                  router.push({
                    pathname: "/edit-expense",
                    params: {
                      expenseId: expense.id,
                      groupId: group.id,
                      title: expense.title,
                      amount: expense.amount.toString(),
                      paidBy: expense.paidBy,
                    },
                  })
                }
              />

              <View style={{ height: 10 }} />

              <KPButton
                title="Delete Expense"
                onPress={() => {
                  Alert.alert("Delete Expense", `Delete "${expense.title}"?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteExpense(expense.id);

                        setExpenses(getExpenses(group.id));
                        setBalances(calculateBalances(group.id));
                        setSettlements(calculateSettlements(group.id));
                      },
                    },
                  ]);
                }}
              />
            </KPCard>
          ))
        )}

        <KPText style={styles.sectionTitle}>Balances</KPText>
        {members.map((member) => (
          <KPCard key={member.id} style={{ marginBottom: 12 }}>
            <KPText style={{ fontWeight: "700" }}>{member.name}</KPText>
            <KPText
              style={{
                color:
                  (balances[member.id] ?? 0) >= 0
                    ? Colors.success
                    : Colors.danger,
                fontWeight: "700",
                marginTop: 6,
              }}
            >
              {(balances[member.id] ?? 0) >= 0
                ? `Gets ₹${balances[member.id].toFixed(2)}`
                : `Owes ₹${Math.abs(balances[member.id]).toFixed(2)}`}
            </KPText>
          </KPCard>
        ))}

        <KPText style={styles.sectionTitle}>Settlements</KPText>
        {settlements.length === 0 ? (
          <KPCard>
            <KPText>🎉 Everyone is settled.</KPText>
          </KPCard>
        ) : (
          settlements.map((item, index) => {
            const from = members.find((m) => m.id === item.from);
            const to = members.find((m) => m.id === item.to);

            return (
              <KPCard key={index} style={{ marginBottom: 12 }}>
                <KPText style={{ fontWeight: "700" }}>
                  💸 {from?.name} pays {to?.name}
                </KPText>

                <KPText
                  style={{
                    marginTop: 6,
                    color: Colors.success,
                    fontWeight: "700",
                  }}
                >
                  ₹ {item.amount.toFixed(2)}
                </KPText>
              </KPCard>
            );
          })
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  headerCard: {
    paddingVertical: 18,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  summaryCard: {
    marginBottom: 12,
    paddingVertical: 18,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
