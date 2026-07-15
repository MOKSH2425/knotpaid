import { db } from "@/database/db";
import { applyTheme, type ThemeMode } from "@/theme/colors";

const SETTINGS_TABLE = "app_settings";

export function ensureSettingsTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )
  `);
}

function getSetting(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM ${SETTINGS_TABLE} WHERE key = ?`,
    [key],
  );

  return row?.value ?? null;
}

function setSetting(key: string, value: string) {
  db.runSync(
    `INSERT OR REPLACE INTO ${SETTINGS_TABLE} (key, value) VALUES (?, ?)`,
    [key, value],
  );
}

export function getThemeMode(): ThemeMode {
  const value = getSetting("themeMode");
  return value === "light" ? "light" : "dark";
}

export function setThemeMode(mode: ThemeMode) {
  setSetting("themeMode", mode);
  applyTheme(mode);
}

export function initializeSettings() {
  ensureSettingsTable();
  const storedTheme = getThemeMode();
  applyTheme(storedTheme);
  return storedTheme;
}
