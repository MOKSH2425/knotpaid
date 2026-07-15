import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";

import DashboardHeader from "../components/DashboardHeader";
import BalanceCard from "../components/BalanceCard";
import StatsRow from "../components/StatsRow";

import KPEmptyState from "@/components/common/KPEmptyState";
import { KPText } from "@/components/ui";

import { useTheme } from "@/theme";

import { getGroups } from "@/features/groups/services/group.service";
import { getMembers } from "@/features/members/services/member.service";
import { getExpenses } from "@/features/expenses/services/expense.service";

import KPFab from "@/components/common/KPFab";

import GroupCard from "../components/GroupCard";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [groups, setGroups] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  function load() {
    const data = getGroups();

    setGroups(data);

    let totalExpense = 0;
    let totalMembers = 0;
    let totalExpenses = 0;

    data.forEach((group) => {
      const members = getMembers(group.id);
      const expenses = getExpenses(group.id);

      totalMembers += members.length;
      totalExpenses += expenses.length;

      expenses.forEach((expense) => {
        totalExpense += expense.amount;
      });
    });

    setTotal(totalExpense);
    setMemberCount(totalMembers);
    setExpenseCount(totalExpenses);
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />

        <BalanceCard amount={total} />

        <StatsRow
          groups={groups.length}
          members={memberCount}
          expenses={expenseCount}
        />

        <KPText style={styles.heading}>Your Groups</KPText>

        {groups.length === 0 ? (
          <KPEmptyState onPress={() => router.push("/create-group")} />
        ) : (
          groups.map((group) => {
            const members = getMembers(group.id);
            const expenses = getExpenses(group.id);

            let total = 0;

            expenses.forEach((expense) => {
              total += expense.amount;
            });

            return (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                members={members.length}
                expenses={expenses.length}
                total={total}
              />
            );
          })
        )}
      </ScrollView>

      {/* ✅ STEP 3 — Floating Action Button */}
      <KPFab onPress={() => router.push("/create-group")} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  card: {
    marginBottom: 18,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  member: {
    marginBottom: 18,
  },
});
