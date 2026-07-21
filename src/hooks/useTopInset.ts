import { useSafeAreaInsets } from "react-native-safe-area-context";

// The device's real safe-area inset (status bar height, notch, punch-hole
// camera cutout — all of which vary a lot across phones) plus a little
// breathing room, so a screen's first card never sits flush against the
// top edge on any device. Every screen calls this once instead of guessing
// a fixed pixel value.
export function useTopInset(extra = 2) {
  const insets = useSafeAreaInsets();
  return insets.top + extra;
}
