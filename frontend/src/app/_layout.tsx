import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(private)" options={{ headerShown: false }} />
              <Stack.Screen name="(public)" options={{ headerShown: false }} />
            </Stack>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
