// Theme initialization script to prevent flash
// This will be inlined in the HTML head to run before React hydration

export const themeInitScript = `
(function() {
  try {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('koto-theme') || 'default';
    
    // Define all themes (matching the themes.ts file)
    const themes = {
      'default': {
        background: 'rgb(250, 250, 251)',
        backgroundSecondary: 'rgb(243, 244, 246)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(17, 24, 39)',
        textSecondary: 'rgb(55, 65, 81)',
        textMuted: 'rgb(107, 114, 128)',
        border: 'rgb(229, 231, 235)',
        borderLight: 'rgb(243, 244, 246)',
        primary: 'rgb(99, 102, 241)',
        secondary: 'rgb(168, 85, 247)',
        accent: 'rgb(14, 165, 233)',
        success: 'rgb(16, 185, 129)',
        warning: 'rgb(251, 146, 60)',
        error: 'rgb(244, 63, 94)',
      },
      'ocean': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(240, 249, 255)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(12, 74, 110)',
        textSecondary: 'rgb(14, 116, 144)',
        textMuted: 'rgb(71, 85, 105)',
        border: 'rgb(186, 230, 253)',
        borderLight: 'rgb(224, 242, 254)',
        primary: 'rgb(2, 132, 199)',
        secondary: 'rgb(6, 182, 212)',
        accent: 'rgb(14, 165, 233)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'forest': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(236, 253, 245)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(6, 78, 59)',
        textSecondary: 'rgb(6, 95, 70)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(167, 243, 208)',
        borderLight: 'rgb(209, 250, 229)',
        primary: 'rgb(5, 150, 105)',
        secondary: 'rgb(16, 185, 129)',
        accent: 'rgb(52, 211, 153)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'sunset': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(255, 247, 237)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(154, 52, 18)',
        textSecondary: 'rgb(194, 65, 12)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(254, 215, 170)',
        borderLight: 'rgb(255, 237, 213)',
        primary: 'rgb(234, 88, 12)',
        secondary: 'rgb(239, 68, 68)',
        accent: 'rgb(251, 146, 60)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'lavender': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(250, 245, 255)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(88, 28, 135)',
        textSecondary: 'rgb(107, 33, 168)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(196, 181, 253)',
        borderLight: 'rgb(221, 214, 254)',
        primary: 'rgb(147, 51, 234)',
        secondary: 'rgb(219, 39, 119)',
        accent: 'rgb(168, 85, 247)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'midnight': {
        background: 'rgb(15, 23, 42)',
        backgroundSecondary: 'rgb(30, 41, 59)',
        card: 'rgb(51, 65, 85)',
        text: 'rgb(248, 250, 252)',
        textSecondary: 'rgb(226, 232, 240)',
        textMuted: 'rgb(148, 163, 184)',
        border: 'rgb(71, 85, 105)',
        borderLight: 'rgb(100, 116, 139)',
        primary: 'rgb(30, 58, 138)',
        secondary: 'rgb(88, 28, 135)',
        accent: 'rgb(59, 130, 246)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'coral': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(255, 241, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(136, 19, 55)',
        textSecondary: 'rgb(159, 18, 57)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(251, 207, 232)',
        borderLight: 'rgb(252, 231, 243)',
        primary: 'rgb(244, 63, 94)',
        secondary: 'rgb(236, 72, 153)',
        accent: 'rgb(251, 113, 133)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'aurora': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(240, 253, 250)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(19, 78, 74)',
        textSecondary: 'rgb(17, 94, 89)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(153, 246, 228)',
        borderLight: 'rgb(204, 251, 241)',
        primary: 'rgb(20, 184, 166)',
        secondary: 'rgb(168, 85, 247)',
        accent: 'rgb(45, 212, 191)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'sand': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(255, 251, 235)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(92, 38, 5)',
        textSecondary: 'rgb(146, 64, 14)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(252, 211, 77)',
        borderLight: 'rgb(254, 243, 199)',
        primary: 'rgb(146, 64, 14)',
        secondary: 'rgb(180, 83, 9)',
        accent: 'rgb(245, 158, 11)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      },
      'cherry': {
        background: 'rgb(255, 255, 255)',
        backgroundSecondary: 'rgb(255, 241, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(136, 19, 55)',
        textSecondary: 'rgb(159, 18, 57)',
        textMuted: 'rgb(75, 85, 99)',
        border: 'rgb(244, 63, 94)',
        borderLight: 'rgb(255, 228, 230)',
        primary: 'rgb(190, 18, 60)',
        secondary: 'rgb(244, 63, 94)',
        accent: 'rgb(251, 113, 133)',
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(245, 158, 11)',
        error: 'rgb(239, 68, 68)',
      }
    };
    
    // Get the theme colors
    const theme = themes[savedTheme] || themes['default'];
    
    // Helper function to add opacity to rgb colors
    const addOpacity = (rgbColor, opacity) => {
      const match = rgbColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
      if (match) {
        return 'rgba(' + match[1] + ', ' + match[2] + ', ' + match[3] + ', ' + opacity + ')';
      }
      return rgbColor;
    };
    
    // Apply all theme colors immediately
    const root = document.documentElement;
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-background-secondary', theme.backgroundSecondary);
    root.style.setProperty('--theme-card', theme.card);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-border-light', theme.borderLight);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-foreground', theme.text);
    root.style.setProperty('--theme-muted', theme.textMuted);
    root.style.setProperty('--theme-hover', addOpacity(theme.primary, 0.05));
    root.style.setProperty('--theme-success', theme.success);
    root.style.setProperty('--theme-warning', theme.warning);
    root.style.setProperty('--theme-error', theme.error);
    
    // Set gradients
    root.style.setProperty('--theme-gradient-primary', 'linear-gradient(135deg, ' + theme.primary + ', ' + theme.secondary + ')');
    root.style.setProperty('--theme-gradient-secondary', 'linear-gradient(135deg, ' + theme.secondary + ', ' + theme.accent + ')');
    root.style.setProperty('--theme-gradient-accent', 'linear-gradient(135deg, ' + theme.accent + ', ' + theme.primary + ')');
    
    // Set body background immediately
    document.documentElement.style.backgroundColor = theme.background;
    document.documentElement.style.color = theme.text;
  } catch (e) {
    // If anything fails, just continue with default theme
    console.error('Theme initialization failed:', e);
  }
})();
`;