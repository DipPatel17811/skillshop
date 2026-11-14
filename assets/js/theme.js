/* ==========================================================================
   Skillshop — Theme Switcher
   Supports light, dark, and sepia themes.
   ========================================================================== */

(function () {
  const THEME_KEY = 'skillshop-theme';
  const themes = ['light', 'dark', 'sepia'];
  const themeNames = {
    light: 'Light',
    dark: 'Dark',
    sepia: 'Sepia'
  };

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const icon = themeToggle.querySelector('svg use');
    const iconMap = {
      light: '#i-sun',
      dark: '#i-moon',
      sepia: '#i-palette'
    };
    icon.setAttribute('href', iconMap[theme] || '#i-sun');
    themeToggle.setAttribute('aria-label', `Switch to ${themeNames[theme] || 'Light'} theme`);
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const currentIndex = themes.indexOf(current);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
  });
})();
