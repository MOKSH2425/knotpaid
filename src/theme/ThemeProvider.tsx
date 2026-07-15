import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Colors,
  getCurrentThemeMode,
  subscribeToThemeChanges,
  type ThemeMode,
} from "./colors";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: typeof Colors;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: getCurrentThemeMode(),
  colors: Colors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getCurrentThemeMode());

  useEffect(() => {
    const unsubscribe = subscribeToThemeChanges((nextMode) => {
      setMode(nextMode);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, colors: Colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
