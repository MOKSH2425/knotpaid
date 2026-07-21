import { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";
import { useRefresh } from "@/hooks/useRefresh";
import { useTopInset } from "@/hooks/useTopInset";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import KPEmptyState from "@/components/common/KPEmptyState";
import { useDialog } from "@/providers/DialogProvider";

import { getMembers } from "@/features/members/services/member.service";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getExpenses } from "@/features/expenses/services/expense.service";
import { getGroups } from "../services/group.service";
import { exportGroupToPdf } from "../services/pdfExport.service";
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

// Small helper so every card list in this screen staggers in the same way
// without repeating the FadeInDown config everywhere.
function cardEntrance(index: number) {
  return FadeInDown.delay(index * 60).springify().damping(16);
}

export default function GroupScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const topInset = useTopInset();
  const dialog = useDialog();
  const guard = useSubmitGuard();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [settlements, setSettlements] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const loadData = useCallback(() => {
    if (!groupId) return;

    const groups = getGroups();
    const current = groups.find((g) => g.id === groupId);

    if (!current) return;

    setGroup(current);
    setMembers(getMembers(current.id));
    setExpenses(getExpenses(current.id));
    setBalances(calculateBalances(current.id));
    setSettlements(calculateSettlements(current.id));
  }, [groupId]);

  const { refreshing, onRefresh } = useRefresh(loadData);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleExport = guard(async () => {
    setExporting(true);

    try {
      await exportGroupToPdf({
        groupName: group.name,
        groupType: group.type,
        members,
        expenses,
        balances,
        settlements,
      });
    } catch (error) {
      console.error("PDF export failed:", error);

      const detail =
        error instanceof Error ? error.message : String(error);

      await dialog.alert({
        title: "Couldn't export PDF",
        message: `Something went wrong generating the file.\n\nDetails: ${detail}`,
      });
    } finally {
      setExporting(false);
    }
  });

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
          paddingTop: topInset,
          paddingBottom: 140,
        }}
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
          <KPEmptyState
            icon="👥"
            title="No Members Yet"
            message="Add the people sharing expenses in this group."
            buttonText="Add First Member"
            onPress={() =>
              router.push({
                pathname: "/members",
                params: { groupId },
              })
            }
          />
        ) : (
          members.map((member, index) => (
            <Animated.View key={member.id} entering={cardEntrance(index)}>
              <KPCard style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <KPAvatar name={member.name} />
                  <View style={{ marginLeft: 15 }}>
                    <KPText style={{ fontWeight: "700", fontSize: 18 }}>
                      {member.name}
                    </KPText>
                    <KPText style={{ color: colors.textSecondary }}>
                      Group Member
                    </KPText>
                  </View>
                </View>
              </KPCard>
            </Animated.View>
          ))
        )}

        <View style={{ height: 25 }} />

        <KPText style={styles.sectionTitle}>Balances</KPText>
        {members.map((member, index) => (
          <Animated.View key={member.id} entering={cardEntrance(index)}>
            <KPCard style={{ marginBottom: 12 }}>
              <KPText style={{ fontWeight: "700" }}>{member.name}</KPText>
              <KPText
                style={{
                  color:
                    (balances[member.id] ?? 0) >= 0
                      ? colors.success
                      : colors.danger,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                {(balances[member.id] ?? 0) >= 0
                  ? `Gets ₹${balances[member.id].toFixed(2)}`
                  : `Owes ₹${Math.abs(balances[member.id]).toFixed(2)}`}
              </KPText>
            </KPCard>
          </Animated.View>
        ))}

        <View style={{ height: 10 }} />

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
              <Animated.View key={index} entering={cardEntrance(index)}>
                <KPCard style={{ marginBottom: 12 }}>
                  <KPText style={{ fontWeight: "700" }}>
                    💸 {from?.name} pays {to?.name}
                  </KPText>

                  <KPText
                    style={{
                      marginTop: 6,
                      color: colors.success,
                      fontWeight: "700",
                    }}
                  >
                    ₹ {item.amount.toFixed(2)}
                  </KPText>
                </KPCard>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 26 }} />

        <KPButton
          title={`View All Expenses (${expenses.length})`}
          onPress={() =>
            router.push({
              pathname: "/group-expenses",
              params: { groupId },
            })
          }
        />

        <View style={{ height: 12 }} />

        <KPButton
          title={exporting ? "Generating PDF..." : "Export PDF"}
          textColor={colors.text}
          style={{
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={handleExport}
        />
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
      color: colors.textSecondary,
      fontSize: 15,
    },
    summaryCard: {
      marginBottom: 12,
      paddingVertical: 18,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
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
}
