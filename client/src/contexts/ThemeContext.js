import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, default to true (dark mode)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Default to dark mode
  });

  // Set initial theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : true;

    if (initialDarkMode) {
      root.style.setProperty('--bg-main', '#121212');
      root.style.setProperty('--bg-card', '#1E1E1E');
      root.style.setProperty('--text-primary', '#E0E0E0');
      root.style.setProperty('--text-secondary', '#B0B0B0');
      root.style.setProperty('--color-primary', '#3984fa');
      root.style.setProperty('--gradient', 'linear-gradient(135deg, #3984fa 0%, #3984fa 100%)');
      root.style.setProperty('--gradient-hover', 'linear-gradient(135deg, #2a6dd4 0%, #2a6dd4 100%)');
      root.style.setProperty('--border-color', '#2D2D2D');
      root.style.setProperty('--bg-secondary', '#1E1E1E');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.5)');
      document.body.className = 'dark-mode';
    } else {
      root.style.setProperty('--bg-main', '#FFFFFF');
      root.style.setProperty('--bg-card', '#F3F4F6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--color-primary', '#3984fa');
      root.style.setProperty('--gradient', 'linear-gradient(135deg, #3984fa 0%, #3984fa 100%)');
      root.style.setProperty('--gradient-hover', 'linear-gradient(135deg, #2a6dd4 0%, #2a6dd4 100%)');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
      document.body.className = 'light-mode';
    }
  }, []);

  useEffect(() => {
    // Update CSS variables when theme changes
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.style.setProperty('--bg-main', '#121212');
      root.style.setProperty('--bg-card', '#1E1E1E');
      root.style.setProperty('--text-primary', '#E0E0E0');
      root.style.setProperty('--text-secondary', '#B0B0B0');
      root.style.setProperty('--color-primary', '#3984fa');
      root.style.setProperty('--gradient', 'linear-gradient(135deg, #3984fa 0%, #3984fa 100%)');
      root.style.setProperty('--gradient-hover', 'linear-gradient(135deg, #2a6dd4 0%, #2a6dd4 100%)');
      root.style.setProperty('--border-color', '#2D2D2D');
      root.style.setProperty('--bg-secondary', '#1E1E1E');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.5)');
    } else {
      root.style.setProperty('--bg-main', '#FFFFFF');
      root.style.setProperty('--bg-card', '#F3F4F6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--color-primary', '#3984fa');
      root.style.setProperty('--gradient', 'linear-gradient(135deg, #3984fa 0%, #3984fa 100%)');
      root.style.setProperty('--gradient-hover', 'linear-gradient(135deg, #2a6dd4 0%, #2a6dd4 100%)');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
    }

    // Save to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update body class for transitions
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
