import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import WelcomeScreen from './screens/welcomeScreen';

import './i18n'; // Import the i18n configuration
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import initialized i18n

SplashScreen.preventAutoHideAsync();

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="screens/AIChatScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/quizScreen" options={{ title: 'Quiz' }} />
      <Stack.Screen name="screens/landmarkdetailsScreen" options={{ title: 'Landmark Details' }} />
      <Stack.Screen name="screens/premiumScreen" options={{ title: 'Premium' }} />
      <Stack.Screen name="screens/AudioPlayerScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/TourDetailScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/profile/ProfileScreen" options={{ title: 'View Profile' }} />
      <Stack.Screen name="screens/profile/FavoriteLocations" options={{ title: 'Favorite Locations' }} />
      <Stack.Screen name="screens/profile/RecentlyVisited" options={{ title: 'Recently Visited' }} />
      <Stack.Screen name="screens/settings/AccountInfo" options={{ title: 'Account Info' }} />
      <Stack.Screen name="screens/settings/ChangePassword" options={{ title: 'Change Password' }} />
      <Stack.Screen name="screens/settings/PrivacySettings" options={{ title: 'Privacy Settings' }} />
      <Stack.Screen name="screens/settings/NotificationSettings" options={{ title: 'Notification Settings' }} />
      <Stack.Screen name="screens/settings/Language" options={{ title: 'Language' }} />
      <Stack.Screen name="screens/settings/ConnectedApps" options={{ title: 'Connected Apps' }} />
      <Stack.Screen name="screens/settings/HelpSupport" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleFinishWelcome = () => {
    setShowWelcome(false);
  };

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <I18nextProvider i18n={i18n}>
        {showWelcome ? (
          <WelcomeScreen onFinish={handleFinishWelcome} />
        ) : (
          <AppStack />
        )}
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutInner />
      </UserProvider>
    </AuthProvider>
  );
}
