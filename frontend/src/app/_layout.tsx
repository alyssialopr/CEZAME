import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack, usePathname } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TutorialOverlay } from '@/components/tutorial-overlay';
import { AuthProvider } from '@/providers/AuthProvider';
import { CategoryProvider } from '@/providers/CategoryProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { TutorialProvider } from '@/providers/TutorialProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffect, useRef } from 'react';
import { tracker } from '@/services/trackerService';

function RouteObserver() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname;
      tracker.trackScreen(pathname);
    }
  }, [pathname]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <QueryProvider>
          <CategoryProvider>
            <AuthProvider>
              <TutorialProvider>
                <RouteObserver />
                <AnimatedSplashOverlay />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(private)" options={{ headerShown: false }} />
                  <Stack.Screen name="(public)" options={{ headerShown: false }} />
                  <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                </Stack>
                <TutorialOverlay />
              </TutorialProvider>
            </AuthProvider>
          </CategoryProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

