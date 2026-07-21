import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import { KPButton, KPCard, KPText } from "@/components/ui";
import { useTheme } from "@/theme";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  // Styles the confirm button red and fires a stronger haptic — use for
  // anything that deletes or removes data.
  destructive?: boolean;
};

type AlertOptions = {
  title: string;
  message?: string;
  buttonText?: string;
};

type DialogState =
  | {
      type: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | { type: "alert"; options: AlertOptions; resolve: () => void }
  | null;

type DialogContextValue = {
  // Resolves true if the user tapped confirm, false for cancel/dismiss.
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  // Resolves once the user has acknowledged the message.
  alert: (options: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [state, setState] = useState<DialogState>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ type: "confirm", options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setState({ type: "alert", options, resolve: () => resolve() });
    });
  }, []);

  function close(result: boolean) {
    if (!state) return;

    if (state.type === "confirm") {
      state.resolve(result);
    } else {
      state.resolve();
    }

    setState(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      <Modal
        visible={!!state}
        transparent
        animationType="fade"
        onRequestClose={() => close(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={() => close(false)}>
          {state ? (
            <Animated.View
              entering={ZoomIn.duration(180)}
              exiting={ZoomOut.duration(120)}
              style={styles.cardWrap}
            >
              <Pressable onPress={() => {}}>
                <KPCard>
                  <KPText style={[styles.title, { color: colors.text }]}>
                    {state.options.title}
                  </KPText>

                  {state.options.message ? (
                    <KPText
                      style={[
                        styles.message,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {state.options.message}
                    </KPText>
                  ) : null}

                  <View style={{ height: 22 }} />

                  {state.type === "confirm" ? (
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <KPButton
                          title={state.options.cancelText ?? "Cancel"}
                          textColor={colors.text}
                          style={{
                            backgroundColor: colors.surfaceLight,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                          onPress={() => close(false)}
                        />
                      </View>

                      <View style={{ width: 12 }} />

                      <View style={{ flex: 1 }}>
                        <KPButton
                          title={state.options.confirmText ?? "Confirm"}
                          haptic={state.options.destructive ? "warning" : "light"}
                          textColor={colors.white}
                          style={{
                            backgroundColor: state.options.destructive
                              ? colors.danger
                              : colors.primary,
                          }}
                          onPress={() => close(true)}
                        />
                      </View>
                    </View>
                  ) : (
                    <KPButton
                      title={state.options.buttonText ?? "OK"}
                      onPress={() => close(true)}
                    />
                  )}
                </KPCard>
              </Pressable>
            </Animated.View>
          ) : null}
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);

  if (!ctx) {
    throw new Error("useDialog must be used within a DialogProvider");
  }

  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
  },
  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
  },
});
