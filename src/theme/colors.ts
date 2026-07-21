export type ThemeMode = "light" | "dark";

type ThemeListener = (mode: ThemeMode) => void;

const themeListeners = new Set<ThemeListener>();
let currentThemeMode: ThemeMode = "dark";

export function subscribeToThemeChanges(listener: ThemeListener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

export function getCurrentThemeMode() {
  return currentThemeMode;
}

const BrandCream = "#FDF9EC";
const BrandTan = "#C6AA8D";
const BrandGreen = "#465D4F";
const BrandBrown = "#3C2A1C";

export const LightColors = {
  background: BrandCream,
  surface: "#FFFFFF",
  surfaceLight: "#F7F2E8",
  surfaceElevated: "#FFFFFF",

  primary: BrandGreen,
  secondary: BrandTan,
  accent: BrandBrown,

  onPrimary: "#FFFFFF",
  onSecondary: "#2D2118",
  onAccent: "#FDF9EC",

  white: "#FFFFFF",
  text: "#2D2118",
  textSecondary: "#7A746C",
  border: "#E6DDCF",

  success: "#3B8C63",
  warning: "#C49439",
  danger: "#C94E4E",
};

export const DarkColors = {
  background: "#10140F",
  surface: "#1C231B",
  surfaceLight: "#262F24",
  surfaceElevated: "#333F30",

  primary: "#D3AD7C",
  secondary: "#527260",
  accent: "#EDD9B8",

  onPrimary: "#241B10",
  onSecondary: "#FBF6EA",
  onAccent: "#241B10",

  white: "#FFFFFF",
  text: "#F6F1E4",
  textSecondary: "#A7B3A2",
  border: "#46543F",

  success: "#5FC98A",
  warning: "#F0C065",
  danger: "#F1685F",
};

export const Colors = {
  ...DarkColors,
};

export function applyTheme(mode: ThemeMode) {
  currentThemeMode = mode;
  Object.assign(Colors, mode === "light" ? LightColors : DarkColors);
  themeListeners.forEach((listener) => listener(mode));
}

export default Colors;