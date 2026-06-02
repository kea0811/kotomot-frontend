export interface ThemeColors {
  name: string;
  id: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const themes: ThemeColors[] = [
  {
    name: 'Default',
    id: 'default',
    primary: 'rgb(99, 102, 241)', // Modern indigo
    secondary: 'rgb(168, 85, 247)', // Vibrant purple
    accent: 'rgb(14, 165, 233)', // Sky blue
    background: 'rgb(250, 250, 251)', // Soft gray
    backgroundSecondary: 'rgb(243, 244, 246)', // Light gray
    card: 'rgb(255, 255, 255)',
    text: 'rgb(17, 24, 39)', // Dark gray
    textSecondary: 'rgb(55, 65, 81)', // Medium gray
    textMuted: 'rgb(107, 114, 128)', // Muted gray
    border: 'rgb(229, 231, 235)', // Light border
    borderLight: 'rgb(243, 244, 246)', // Very light border
    success: 'rgb(16, 185, 129)', // Emerald
    warning: 'rgb(251, 146, 60)', // Orange
    error: 'rgb(244, 63, 94)', // Rose
    gradient: {
      primary: 'linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247))',
      secondary: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(217, 70, 239))',
      accent: 'linear-gradient(135deg, rgb(14, 165, 233), rgb(6, 182, 212))',
    },
  },
  {
    name: 'Ocean',
    id: 'ocean',
    primary: 'rgb(2, 132, 199)', // sky-600
    secondary: 'rgb(6, 182, 212)', // cyan-500
    accent: 'rgb(14, 165, 233)', // sky-500
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(240, 249, 255)', // sky-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(12, 74, 110)', // sky-900
    textSecondary: 'rgb(14, 116, 144)', // sky-800
    textMuted: 'rgb(71, 85, 105)', // slate-600
    border: 'rgb(186, 230, 253)', // sky-200
    borderLight: 'rgb(224, 242, 254)', // sky-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(2, 132, 199), rgb(6, 182, 212))',
      secondary: 'linear-gradient(135deg, rgb(6, 182, 212), rgb(34, 211, 238))',
      accent: 'linear-gradient(135deg, rgb(14, 165, 233), rgb(56, 189, 248))',
    },
  },
  {
    name: 'Forest',
    id: 'forest',
    primary: 'rgb(5, 150, 105)', // emerald-600
    secondary: 'rgb(16, 185, 129)', // emerald-500
    accent: 'rgb(52, 211, 153)', // emerald-400
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(236, 253, 245)', // emerald-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(6, 78, 59)', // emerald-900
    textSecondary: 'rgb(6, 95, 70)', // emerald-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(167, 243, 208)', // emerald-200
    borderLight: 'rgb(209, 250, 229)', // emerald-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(5, 150, 105), rgb(16, 185, 129))',
      secondary: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(52, 211, 153))',
      accent: 'linear-gradient(135deg, rgb(52, 211, 153), rgb(110, 231, 183))',
    },
  },
  {
    name: 'Sunset',
    id: 'sunset',
    primary: 'rgb(234, 88, 12)', // orange-600
    secondary: 'rgb(239, 68, 68)', // red-500
    accent: 'rgb(251, 146, 60)', // orange-400
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(255, 247, 237)', // orange-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(154, 52, 18)', // orange-900
    textSecondary: 'rgb(194, 65, 12)', // orange-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(254, 215, 170)', // orange-200
    borderLight: 'rgb(255, 237, 213)', // orange-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(234, 88, 12), rgb(239, 68, 68))',
      secondary: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(248, 113, 113))',
      accent: 'linear-gradient(135deg, rgb(251, 146, 60), rgb(252, 165, 165))',
    },
  },
  {
    name: 'Lavender',
    id: 'lavender',
    primary: 'rgb(147, 51, 234)', // purple-600
    secondary: 'rgb(219, 39, 119)', // pink-600
    accent: 'rgb(168, 85, 247)', // purple-500
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(250, 245, 255)', // purple-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(88, 28, 135)', // purple-900
    textSecondary: 'rgb(107, 33, 168)', // purple-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(196, 181, 253)', // purple-200
    borderLight: 'rgb(221, 214, 254)', // purple-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(219, 39, 119))',
      secondary: 'linear-gradient(135deg, rgb(219, 39, 119), rgb(236, 72, 153))',
      accent: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(196, 181, 253))',
    },
  },
  {
    name: 'Midnight',
    id: 'midnight',
    primary: 'rgb(30, 58, 138)', // blue-900
    secondary: 'rgb(88, 28, 135)', // purple-900
    accent: 'rgb(59, 130, 246)', // blue-500
    background: 'rgb(15, 23, 42)', // slate-900
    backgroundSecondary: 'rgb(30, 41, 59)', // slate-800
    card: 'rgb(51, 65, 85)', // slate-700
    text: 'rgb(248, 250, 252)', // slate-50
    textSecondary: 'rgb(226, 232, 240)', // slate-200
    textMuted: 'rgb(148, 163, 184)', // slate-400
    border: 'rgb(71, 85, 105)', // slate-600
    borderLight: 'rgb(100, 116, 139)', // slate-500
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(30, 58, 138), rgb(88, 28, 135))',
      secondary: 'linear-gradient(135deg, rgb(88, 28, 135), rgb(107, 33, 168))',
      accent: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 197, 253))',
    },
  },
  {
    name: 'Coral',
    id: 'coral',
    primary: 'rgb(244, 63, 94)', // rose-500
    secondary: 'rgb(236, 72, 153)', // pink-500
    accent: 'rgb(251, 113, 133)', // rose-400
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(255, 241, 242)', // rose-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(136, 19, 55)', // rose-900
    textSecondary: 'rgb(159, 18, 57)', // rose-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(251, 207, 232)', // pink-200
    borderLight: 'rgb(252, 231, 243)', // pink-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(244, 63, 94), rgb(236, 72, 153))',
      secondary: 'linear-gradient(135deg, rgb(236, 72, 153), rgb(244, 114, 182))',
      accent: 'linear-gradient(135deg, rgb(251, 113, 133), rgb(252, 165, 165))',
    },
  },
  {
    name: 'Aurora',
    id: 'aurora',
    primary: 'rgb(20, 184, 166)', // teal-500
    secondary: 'rgb(168, 85, 247)', // purple-500
    accent: 'rgb(45, 212, 191)', // teal-400
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(240, 253, 250)', // teal-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(19, 78, 74)', // teal-900
    textSecondary: 'rgb(17, 94, 89)', // teal-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(153, 246, 228)', // teal-200
    borderLight: 'rgb(204, 251, 241)', // teal-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(20, 184, 166), rgb(168, 85, 247))',
      secondary: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(196, 181, 253))',
      accent: 'linear-gradient(135deg, rgb(45, 212, 191), rgb(129, 140, 248))',
    },
  },
  {
    name: 'Sand',
    id: 'sand',
    primary: 'rgb(146, 64, 14)', // amber-800
    secondary: 'rgb(180, 83, 9)', // amber-700
    accent: 'rgb(245, 158, 11)', // amber-500
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(255, 251, 235)', // amber-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(92, 38, 5)', // amber-900
    textSecondary: 'rgb(146, 64, 14)', // amber-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(252, 211, 77)', // amber-300
    borderLight: 'rgb(254, 243, 199)', // amber-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(146, 64, 14), rgb(180, 83, 9))',
      secondary: 'linear-gradient(135deg, rgb(180, 83, 9), rgb(217, 119, 6))',
      accent: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(251, 191, 36))',
    },
  },
  {
    name: 'Cherry',
    id: 'cherry',
    primary: 'rgb(190, 18, 60)', // rose-700
    secondary: 'rgb(244, 63, 94)', // rose-500
    accent: 'rgb(251, 113, 133)', // rose-400
    background: 'rgb(255, 255, 255)',
    backgroundSecondary: 'rgb(255, 241, 242)', // rose-50
    card: 'rgb(255, 255, 255)',
    text: 'rgb(136, 19, 55)', // rose-900
    textSecondary: 'rgb(159, 18, 57)', // rose-800
    textMuted: 'rgb(75, 85, 99)', // gray-600
    border: 'rgb(244, 63, 94)', // rose-500
    borderLight: 'rgb(255, 228, 230)', // rose-100
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    gradient: {
      primary: 'linear-gradient(135deg, rgb(190, 18, 60), rgb(244, 63, 94))',
      secondary: 'linear-gradient(135deg, rgb(244, 63, 94), rgb(251, 113, 133))',
      accent: 'linear-gradient(135deg, rgb(251, 113, 133), rgb(252, 165, 165))',
    },
  },
];

export const getThemeById = (id: string): ThemeColors => {
  return themes.find(theme => theme.id === id) || themes[0];
};

export const getThemeByName = (name: string): ThemeColors => {
  return themes.find(theme => theme.name === name) || themes[0];
};

export const applyTheme = (theme: ThemeColors) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  console.log('Applying theme CSS variables for:', theme.name);
  
  // Helper function to convert rgb string to rgba with opacity
  const addOpacity = (rgbColor: string, opacity: number) => {
    const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
    return rgbColor;
  };
  
  // Accent-only theming: the runtime theme controls just the accent family.
  // Neutral surfaces (background/card/foreground/border/muted) come from the
  // dark-aware CSS tokens in globals.css so light/dark always look correct.
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-hover', addOpacity(theme.primary, 0.05)); // 5% opacity for hover
  root.style.setProperty('--theme-success', theme.success);
  root.style.setProperty('--theme-warning', theme.warning);
  root.style.setProperty('--theme-error', theme.error);
  root.style.setProperty('--theme-gradient-primary', theme.gradient.primary);
  root.style.setProperty('--theme-gradient-secondary', theme.gradient.secondary);
  root.style.setProperty('--theme-gradient-accent', theme.gradient.accent);
};