import { useEffect, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { Spacing, useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";
import { useTopInset } from "@/hooks/useTopInset";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { useDialog } from "@/providers/DialogProvider";
import {
  getThemeMode,
  setThemeMode,
} from "@/features/settings/services/settings.service";
import type { ThemeMode } from "@/theme/colors";
import {
  buildFullBackup,
  restoreFullBackup,
  restoreGroupBackup,
  validateBackupPayload,
} from "@/database/backup.service";
import {
  exportBackupToFile,
  pickAndReadBackupFile,
} from "@/utils/backupFile";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const topInset = useTopInset();
  const dialog = useDialog();
  const guard = useSubmitGuard();
  const [themeMode, setTheme] = useState<ThemeMode>("dark");
  const [exportingAll, setExportingAll] = useState(false);
  const [restoringAll, setRestoringAll] = useState(false);
  const [importingGroup, setImportingGroup] = useState(false);

  useEffect(() => {
    setTheme(getThemeMode());
  }, []);

  function toggleTheme(value: boolean) {
    haptics.selection();
    const nextMode: ThemeMode = value ? "light" : "dark";
    setTheme(nextMode);
    setThemeMode(nextMode);
  }

  const handleExportAll = guard(async () => {
    setExportingAll(true);

    try {
      const payload = buildFullBackup();
      await exportBackupToFile(payload, "AllData");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await dialog.alert({
        title: "Couldn't export backup",
        message: `Something went wrong generating the file.\n\nDetails: ${detail}`,
      });
    } finally {
      setExportingAll(false);
    }
  });

  const handleRestoreAll = guard(async () => {
    const confirmed = await dialog.confirm({
      title: "Restore from backup?",
      message:
        "This replaces everything currently on this device — all groups, members, expenses, and settlements. This can't be undone.",
      confirmText: "Restore",
      destructive: true,
    });

    if (!confirmed) return;

    setRestoringAll(true);

    try {
      const raw = await pickAndReadBackupFile();
      if (!raw) return; // user cancelled the file picker

      const payload = validateBackupPayload(raw);

      if (payload.scope !== "all") {
        await dialog.alert({
          title: "Wrong backup type",
          message:
            'This looks like a single-group export, not a full backup. Use "Import Group" instead.',
        });
        return;
      }

      restoreFullBackup(payload);

      await dialog.alert({
        title: "Restore complete",
        message: "Your data has been restored from the backup file.",
      });

      router.replace("/");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await dialog.alert({
        title: "Couldn't restore backup",
        message: detail,
      });
    } finally {
      setRestoringAll(false);
    }
  });

  const handleImportGroup = guard(async () => {
    setImportingGroup(true);

    try {
      const raw = await pickAndReadBackupFile();
      if (!raw) return; // user cancelled the file picker

      const payload = validateBackupPayload(raw);

      if (payload.scope !== "group") {
        await dialog.alert({
          title: "Wrong backup type",
          message:
            'This looks like a full-app backup, not a single group. Use "Restore from Backup" instead.',
        });
        return;
      }

      const newGroupId = restoreGroupBackup(payload);

      haptics.success();
      router.push({ pathname: "/group", params: { groupId: newGroupId } });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await dialog.alert({
        title: "Couldn't import group",
        message: detail,
      });
    } finally {
      setImportingGroup(false);
    }
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: Spacing.lg,
        paddingTop: topInset,
      }}
    >
      <KPText
        style={{
          fontSize: 30,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        Settings
      </KPText>
      <KPText
        style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}
      >
        Personalize the app and review how your data is handled.
      </KPText>

      <View style={{ height: 20 }} />

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <KPText
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Theme
            </KPText>
            <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
              Switch between light and dark appearance.
            </KPText>
          </View>

          <Switch
            value={themeMode === "light"}
            onValueChange={toggleTheme}
            thumbColor={colors.white}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </KPCard>

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <KPText
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          About
        </KPText>
        <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
          KnotPaid helps you split shared expenses with friends, family, and
          groups.
        </KPText>
      </KPCard>

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <KPText
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Privacy
        </KPText>
        <KPText style={{ color: colors.textSecondary, lineHeight: 20 }}>
          Your groups, members, and expenses are stored locally on this device.
        </KPText>
      </KPCard>

      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <KPText
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Backup & Restore
        </KPText>
        <KPText
          style={{
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          Since everything lives only on this device, back it up before
          switching phones or reinstalling — there's no account to fall
          back on.
        </KPText>

        <KPButton
          title={exportingAll ? "Preparing Backup..." : "Export All Data"}
          textColor={colors.text}
          style={{
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={handleExportAll}
        />

        <View style={{ height: 10 }} />

        <KPButton
          title={restoringAll ? "Restoring..." : "Restore from Backup"}
          haptic="warning"
          textColor={colors.white}
          style={{ backgroundColor: colors.danger }}
          onPress={handleRestoreAll}
        />

        <View style={{ height: 16 }} />

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginBottom: 16,
          }}
        />

        <KPText
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 19,
            marginBottom: 10,
          }}
        >
          Got a group backup file from someone else, or from "Export This
          Group" on a group screen? Import it as a new group here — your
          existing data is left untouched.
        </KPText>

        <KPButton
          title={importingGroup ? "Importing..." : "Import Group"}
          textColor={colors.text}
          style={{
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={handleImportGroup}
        />
      </KPCard>

      <View style={{ height: 24 }} />
      <KPButton title="Back to Dashboard" onPress={() => router.replace("/")} />
    </ScrollView>
  );
}
