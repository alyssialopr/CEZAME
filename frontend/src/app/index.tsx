import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/hooks/useUser';

export default function RootIndex() {
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
    return <Redirect href="/login" />;
  }

  if (userProfile && !userProfile.is_onboarding_completed) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/categories" />;
}
