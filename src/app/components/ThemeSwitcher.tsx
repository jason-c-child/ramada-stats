'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'win95' as const,
      name: 'Windows 95',
      icon: '🖥️',
      description: 'Classic Windows 95 interface'
    },
    {
      id: 'winxp' as const,
      name: 'Windows XP',
      icon: '🪟',
      description: 'Modern Windows XP style'
    },
    {
      id: 'macos' as const,
      name: 'macOS',
      icon: '🍎',
      description: 'Clean macOS design'
    }
  ];

  return (
    <div className="theme-switcher">
      <div className="theme-switcher-title">
        <span className="theme-switcher-icon">🎨</span>
        <span className="theme-switcher-text">Theme</span>
      </div>
      <div className="theme-switcher-options">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`theme-option ${theme === themeOption.id ? 'theme-option-active' : ''}`}
            title={themeOption.description}
          >
            <div className="theme-option-icon">{themeOption.icon}</div>
            <div className="theme-option-name">{themeOption.name}</div>
            {theme === themeOption.id && (
              <div className="theme-option-check">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 