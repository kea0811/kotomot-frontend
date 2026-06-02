// Theme mode initialization script to prevent FOUC for dark/light mode
// This will be inlined in the HTML head to run before React hydration

export const themeModeInitScript = `
(function() {
  try {
    // Get saved theme mode from localStorage
    const savedThemeMode = localStorage.getItem('koto-theme-mode');
    let themeToApply = 'light'; // Default theme
    
    if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
      themeToApply = savedThemeMode;
    } else if (savedThemeMode === 'system' || !savedThemeMode) {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = systemPrefersDark ? 'dark' : 'light';
    }
    
    // Apply the theme class immediately
    document.documentElement.classList.add(themeToApply);
    document.documentElement.setAttribute('data-theme', themeToApply);
    
    // Prevent flash by setting style attribute
    document.documentElement.style.colorScheme = themeToApply;
    
  } catch (e) {
    // If anything fails, default to light theme
    console.error('Theme mode initialization failed:', e);
    document.documentElement.classList.add('light');
  }
})();
`;