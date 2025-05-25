import React from 'react';
import { StatusBar, StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Context Providers
import { QuranProvider } from './src/context/QuranContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { useTheme } from './src/utils/useTheme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';

// Audio service is now imported only when needed

const Stack = createStackNavigator();

const AppContent = () => {
  const theme = useTheme();

  return (
    <>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer theme={{
            dark: theme.isDark,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.text,
              border: theme.colors.border,
              notification: theme.colors.primary,
            },
            fonts: {
              regular: {
                fontFamily: 'System',
                fontWeight: '400',
              },
              medium: {
                fontFamily: 'System',
                fontWeight: '500',
              },
              light: {
                fontFamily: 'System',
                fontWeight: '300',
              },
              thin: {
                fontFamily: 'System',
                fontWeight: '100',
              },
              bold: {
                fontFamily: 'System',
                fontWeight: '700',
              },
            },
          }}>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
                headerTintColor: theme.colors.primary,
                headerTitleStyle: {
                  fontWeight: '600',
                },
                cardStyle: {
                  backgroundColor: theme.colors.background,
                },
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ 
                  title: 'Bangla Quran',
                  headerTitleAlign: 'center',
                }} 
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ 
                  title: 'Search Quran',
                  headerTitleAlign: 'center',
                }} 
              />
            </Stack.Navigator>
          </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <QuranProvider>
        <AppContent />
      </QuranProvider>
    </ThemeProvider>
  );
};

export default App;
