import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  const theme = {
    colors: {
      primary: '#1E88E5',
      primaryDark: '#1565C0',
      background: isDark ? '#121212' : '#F5F5F5',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      error: '#CF6679',
      onBackground: isDark ? '#FFFFFF' : '#000000',
      onSurface: isDark ? '#E0E0E0' : '#333333',
      onPrimary: '#FFFFFF',
      text: isDark ? '#E0E0E0' : '#333333',
      textSecondary: isDark ? '#9E9E9E' : '#666666',
      border: isDark ? '#333333' : '#E0E0E0',
      success: '#4CAF50',
      warning: '#FFC107',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      h2: {
        fontSize: 20,
        fontWeight: '600',
      },
      h3: {
        fontSize: 18,
        fontWeight: '600',
      },
      body: {
        fontSize: 16,
      },
      caption: {
        fontSize: 14,
      },
      arabic: {
        fontSize: 24,
        fontFamily: 'Scheherazade',
        textAlign: 'right',
        lineHeight: 40,
      },
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 50,
    },
    shadow: {
      sm: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
