import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeColors, themes, getThemeById, applyTheme as applyColorTheme } from '@/lib/themes';

// === Types ===
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // Mode (light/dark/system)
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
  // Color palette
  colorTheme: ThemeColors;
  setColorTheme: (themeId: string) => void;
  colorThemes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// === Storage keys ===
const MODE_STORAGE_KEY = 'koto-theme-mode';
const COLOR_STORAGE_KEY = 'koto-theme';

// === Helpers ===
const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyMode = (mode: 'light' | 'dark') => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.setAttribute('data-theme', mode);
};

// === Provider ===
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultColorTheme?: string;
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultColorTheme = 'default',
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorThemeState] = useState<ThemeColors>(() => getThemeById(defaultColorTheme));

  const resolvedMode = useMemo((): 'light' | 'dark' => {
    if (mode === 'system') return systemTheme;
    return mode;
  }, [mode, systemTheme]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try { localStorage.setItem(MODE_STORAGE_KEY, newMode); } catch {}
  }, []);

  const setColorTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    setColorThemeState(theme);
    applyColorTheme(theme);
    localStorage.setItem(COLOR_STORAGE_KEY, themeId);
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');
    document.documentElement.classList.add(`theme-${themeId}`);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const savedMode = getInitialMode();
    const currentSystemTheme = getSystemTheme();
    setModeState(savedMode);
    setSystemTheme(currentSystemTheme);
    setMounted(true);

    const initialResolved = savedMode === 'system' ? currentSystemTheme : savedMode === 'dark' ? 'dark' : 'light';
    applyMode(initialResolved);

    // Load saved color theme
    const savedColor = localStorage.getItem(COLOR_STORAGE_KEY);
    if (savedColor) {
      const theme = getThemeById(savedColor);
      setColorThemeState(theme);
      applyColorTheme(theme);
      document.documentElement.classList.add(`theme-${savedColor}`);
    } else {
      applyColorTheme(colorTheme);
      document.documentElement.classList.add('theme-default');
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply mode changes
  useEffect(() => {
    if (!mounted) return;
    applyMode(resolvedMode);
  }, [resolvedMode, mounted]);

  const value = useMemo<ThemeContextType>(() => ({
    mode: mounted ? mode : defaultMode,
    resolvedMode: mounted ? resolvedMode : 'light',
    setMode,
    systemTheme,
    colorTheme: mounted ? colorTheme : getThemeById(defaultColorTheme),
    setColorTheme,
    colorThemes: themes,
  }), [mode, resolvedMode, setMode, systemTheme, colorTheme, setColorTheme, mounted, defaultMode, defaultColorTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// === Hooks ===

/** Full theme context */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within a ThemeProvider');
  return context;
}

/** Light/dark/system mode — drop-in replacement for old useThemeMode */
export function useThemeMode() {
  const { mode, resolvedMode, setMode, systemTheme } = useThemeContext();
  return { theme: mode, resolvedTheme: resolvedMode, setTheme: setMode, systemTheme };
}

/** Color palette — drop-in replacement for old useTheme */
export function useTheme() {
  const { colorTheme, setColorTheme, colorThemes } = useThemeContext();
  return { currentTheme: colorTheme, setTheme: setColorTheme, themes: colorThemes };
}

export function useIsDarkMode(): boolean {
  const { resolvedMode } = useThemeContext();
  return resolvedMode === 'dark';
}

export function useThemeMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}

// Re-export for backwards compat
export { ThemeProvider as ThemeModeProvider };
