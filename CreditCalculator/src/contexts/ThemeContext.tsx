import React, { createContext, useState, useMemo, useCallback } from 'react';
import {
  webLightTheme,
  webDarkTheme,
  type Theme,
} from '@fluentui/react-components';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: webLightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);
  const value = useMemo(
    () => ({ theme: isDark ? webDarkTheme : webLightTheme, isDark, toggleTheme }),
    [isDark, toggleTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
