// Single wrapper around expo-haptics. Every screen imports `haptics` from
// here instead of calling expo-haptics directly — one place to change if
// you ever want to retune the feel of the whole app.
//
// Requires: npx expo install expo-haptics

import * as Haptics from "expo-haptics";

export const haptics = {
  // Small tap feedback — default for most buttons (Save, Continue, navigation).
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  // Slightly stronger — use for the FAB (+) and primary create actions.
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  // Use right before a destructive confirm (Delete).
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {},
    );
  },
  // Use after something completes successfully (rarely needed since most
  // actions here are instant local writes — the button's own press-feedback
  // usually covers it).
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  },
  // Use for toggles / switches (e.g. the theme switch in Settings).
  selection: () => {
    Haptics.selectionAsync().catch(() => {});
  },
};
