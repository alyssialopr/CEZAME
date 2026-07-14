import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '@/hooks/useUser';

export default function PrivateLayout() {
  const { session, isInitialized } = useAuth();
  const { data: userProfile, isLoading: isUserLoading } = useUser();

  if (!isInitialized || (session && isUserLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFAF8' }}>
        <ActivityIndicator size="large" color="#A8EA73" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  if (userProfile && !userProfile.is_onboarding_completed) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
