export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // This runs immediately to prevent flash
            const theme = localStorage.getItem('koto-theme') || 'default';
            const themes = {
              'default': { bg: 'rgb(250, 250, 251)', text: 'rgb(17, 24, 39)' },
              'midnight': { bg: 'rgb(15, 23, 42)', text: 'rgb(248, 250, 252)' },
              'ocean': { bg: 'rgb(255, 255, 255)', text: 'rgb(12, 74, 110)' },
              'forest': { bg: 'rgb(255, 255, 255)', text: 'rgb(6, 78, 59)' },
              'sunset': { bg: 'rgb(255, 255, 255)', text: 'rgb(154, 52, 18)' },
              'lavender': { bg: 'rgb(255, 255, 255)', text: 'rgb(88, 28, 135)' },
              'coral': { bg: 'rgb(255, 255, 255)', text: 'rgb(136, 19, 55)' },
              'aurora': { bg: 'rgb(255, 255, 255)', text: 'rgb(19, 78, 74)' },
              'sand': { bg: 'rgb(255, 255, 255)', text: 'rgb(92, 38, 5)' },
              'cherry': { bg: 'rgb(255, 255, 255)', text: 'rgb(136, 19, 55)' }
            };
            const t = themes[theme] || themes['default'];
            document.documentElement.style.backgroundColor = t.bg;
            document.documentElement.style.color = t.text;
            document.documentElement.classList.add('theme-' + theme);
          })();
        `,
      }}
    />
  );
}
