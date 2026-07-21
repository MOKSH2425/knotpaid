import { useCallback, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { Colors, Spacing, useTheme } from "@/theme";
import { useRefresh } from "@/hooks/useRefresh";
import { useTopInset } from "@/hooks/useTopInset";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import KPEmptyState from "@/components/common/KPEmptyState";
import KPSettleUpSheet from "@/components/common/KPSettleUpSheet";
import { useDialog } from "@/providers/DialogProvider";
import { haptics } from "@/utils/haptics";
import { formatExpenseDateTime } from "@/utils/formatDate";

import { getMembers } from "@/features/members/services/member.service";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getExpenses } from "@/features/expenses/services/expense.service";
import { getGroups } from "../services/group.service";
import { exportGroupToPdf } from "../services/pdfExport.service";
import { calculateBalances } from "@/features/expenses/services/balance.service";
import KPAvatar from "@/components/ui/KPAvatar";
import {
  calculateSettlements,
  deleteSettlement,
  getSettlementHistory,
  recordSettlement,
} from "@/features/expenses/services/settlement.service";
import { buildGroupBackup } from "@/database/backup.service";
import { exportBackupToFile } from "@/utils/backupFile";
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
  const [settlementHistory, setSettlementHistory] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [settleTarget, setSettleTarget] = useState<{
    from: string;
    to: string;
    fromName: string;
    toName: string;
    amount: number;
  } | null>(null);

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
    setSettlementHistory(getSettlementHistory(current.id));
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
        paymentHistory: settlementHistory,
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

  const handleConfirmSettlement = guard(async (amount: number) => {
    if (!settleTarget || !group) return;

    try {
      recordSettlement(group.id, settleTarget.from, settleTarget.to, amount);
      loadData();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await dialog.alert({
        title: "Couldn't record payment",
        message: detail,
      });
    } finally {
      setSettleTarget(null);
    }
  });

  async function handleUndoSettlement(settlementId: string) {
    const confirmed = await dialog.confirm({
      title: "Undo this payment?",
      message:
        "This removes the recorded payment. The debt it settled will show up again as owed.",
      confirmText: "Undo",
      destructive: true,
    });

    if (!confirmed) return;

    deleteSettlement(settlementId);
    loadData();
  }

  const handleExportGroupBackup = guard(async () => {
    if (!group) return;

    setExportingBackup(true);

    try {
      const payload = buildGroupBackup(group.id);
      await exportBackupToFile(payload, group.name);
    } catch (error) {
      console.error("Group backup export failed:", error);

      const detail = error instanceof Error ? error.message : String(error);

      await dialog.alert({
        title: "Couldn't export backup",
        message: `Something went wrong generating the file.\n\nDetails: ${detail}`,
      });
    } finally {
      setExportingBackup(false);
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
          <View style={{ width: 18 }} />
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
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
                    </View>

                    <Pressable
                      onPress={() => {
                        haptics.light();
                        setSettleTarget({
                          from: item.from,
                          to: item.to,
                          fromName: from?.name ?? "Someone",
                          toName: to?.name ?? "Someone",
                          amount: item.amount,
                        });
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        backgroundColor: colors.primary,
                        opacity: pressed ? 0.75 : 1,
                      })}
                    >
                      <KPText
                        style={{
                          color: colors.onPrimary,
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        Mark as Paid
                      </KPText>
                    </Pressable>
                  </View>
                </KPCard>
              </Animated.View>
            );
          })
        )}

        {settlementHistory.length > 0 && (
          <>
            <View style={{ height: 25 }} />
            <KPText style={styles.sectionTitle}>Payment History</KPText>

            {settlementHistory.map((item, index) => {
              const from = members.find((m) => m.id === item.fromMemberId);
              const to = members.find((m) => m.id === item.toMemberId);

              return (
                <Animated.View key={item.id} entering={cardEntrance(index)}>
                  <KPCard
                    style={{
                      marginBottom: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <KPText style={{ fontWeight: "700", fontSize: 15 }}>
                          ✅ {from?.name ?? "Someone"} paid {to?.name ?? "Someone"}
                        </KPText>
                        <KPText
                          style={{
                            marginTop: 3,
                            color: colors.textSecondary,
                            fontSize: 12,
                          }}
                        >
                          {formatExpenseDateTime(item.settledAt)}
                        </KPText>
                      </View>

                      <KPText
                        style={{
                          fontWeight: "800",
                          fontSize: 15,
                          marginRight: 10,
                        }}
                      >
                        ₹{item.amount.toFixed(2)}
                      </KPText>

                      <Pressable
                        hitSlop={8}
                        onPress={() => handleUndoSettlement(item.id)}
                        style={({ pressed }) => ({
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.danger + "1A",
                          opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        <Ionicons
                          name="arrow-undo-outline"
                          size={15}
                          color={colors.danger}
                        />
                      </Pressable>
                    </View>
                  </KPCard>
                </Animated.View>
              );
            })}
          </>
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

        <View style={{ height: 12 }} />

        <KPButton
          title={
            exportingBackup ? "Preparing Backup..." : "Export This Group (Backup)"
          }
          textColor={colors.text}
          style={{
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={handleExportGroupBackup}
        />
      </ScrollView>

      <KPSettleUpSheet
        visible={!!settleTarget}
        onClose={() => setSettleTarget(null)}
        fromName={settleTarget?.fromName ?? ""}
        toName={settleTarget?.toName ?? ""}
        suggestedAmount={settleTarget?.amount ?? 0}
        onConfirm={handleConfirmSettlement}
      />

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
