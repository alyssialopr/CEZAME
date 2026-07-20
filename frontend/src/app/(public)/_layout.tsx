import { Redirect, RelativePathString, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';

export default function PublicLayout() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFAF8' }}>
        <ActivityIndicator size="large" color="#A8EA73" />
      </View>
    );
  }

  if (session) {
    return <Redirect href={"/(private)/categories" as RelativePathString} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
