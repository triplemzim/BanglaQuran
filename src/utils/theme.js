export const colors = {
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  onBackground: '#FFFFFF',
  onSurface: '#E0E0E0',
  onPrimary: '#FFFFFF',
  text: '#E0E0E0',
  textSecondary: '#9E9E9E',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FFC107',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onBackground,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onBackground,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  arabic: {
    fontSize: 24,
    fontFamily: 'Scheherazade',
    textAlign: 'right',
    lineHeight: 40,
    color: colors.onBackground,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const shadow = {
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
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadow,
};
