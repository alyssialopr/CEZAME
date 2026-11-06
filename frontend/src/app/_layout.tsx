import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack, usePathname } from 'expo-router';
import { Platform, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TutorialOverlay } from '@/components/tutorial-overlay';
import { AuthProvider } from '@/providers/AuthProvider';
import { CategoryProvider } from '@/providers/CategoryProvider';
import { HeartsProvider } from '@/providers/HeartsProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { RewardsProvider } from '@/providers/RewardsProvider';
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

  const content = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <QueryProvider>
          <CategoryProvider>
            <AuthProvider>
              <RewardsProvider>
                <HeartsProvider>
                  <TutorialProvider>
                    <RouteObserver />
                    <AnimatedSplashOverlay />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                      <Stack.Screen name="(private)" options={{ headerShown: false }} />
                      <Stack.Screen name="(public)" options={{ headerShown: false }} />
                      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                    </Stack>
                    <TutorialOverlay />
                  </TutorialProvider>
                </HeartsProvider>
              </RewardsProvider>
            </AuthProvider>
          </CategoryProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.phoneContainer}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#FBFAF8',
    overflow: 'hidden',
    position: 'relative',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 20,
  },
});

