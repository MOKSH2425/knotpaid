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
  background: "#151B17",
  surface: "#1D2721",
  surfaceLight: "#28352D",
  surfaceElevated: "#2E3A31",

  primary: BrandTan,
  secondary: BrandGreen,
  accent: "#E9D7BE",

  onPrimary: "#231A10",
  onSecondary: "#FDF9EC",
  onAccent: "#231A10",

  white: "#FFFFFF",
  text: "#FDF9EC",
  textSecondary: "#B9C1BA",
  border: "#35453C",

  success: "#61C687",
  warning: "#E6B85A",
  danger: "#E46A6A",
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