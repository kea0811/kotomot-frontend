import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeColors, themes, getThemeById, applyTheme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: ThemeColors;
  setTheme: (themeId: string) => void;
  themes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'default'
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(() =>
    getThemeById(defaultTheme)
  );

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('koto-theme');
    console.log('Loading theme:', savedTheme || 'default');
    if (savedTheme) {
      const theme = getThemeById(savedTheme);
      setCurrentTheme(theme);
      applyTheme(theme);
      // Also ensure the HTML class is set
      document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');
      document.documentElement.classList.add(`theme-${savedTheme}`);
      console.log('Applied theme:', theme.name);
    } else {
      applyTheme(currentTheme);
      document.documentElement.classList.add('theme-default');
      console.log('Applied default theme:', currentTheme.name);
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('koto-theme', themeId);
    // Update HTML class
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');
    document.documentElement.classList.add(`theme-${themeId}`);
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
