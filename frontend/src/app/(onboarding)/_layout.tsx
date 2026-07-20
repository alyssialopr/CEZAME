import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/hooks/useUser';

export default function OnboardingLayout() {
  const { session, isInitialized } = useAuth();
  const { isLoading: isUserLoading } = useUser();

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

  // NB : pas de redirection sur `is_onboarding_completed` ici — l'écran d'onboarding
  // marque l'onboarding terminé (maj optimiste du cache) puis affiche son bilan et
  // navigue lui-même via « C'est parti ! ». Rediriger ici zapperait le bilan.

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
