import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';

export default function PrivateLayout() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFAF8' }}>
        <ActivityIndicator size="large" color="#A8EA73" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
