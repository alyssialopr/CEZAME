import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cleanPath = pathname || '/';
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch {}

    // Nettoie les noms de groupes de répertoires accidentellement présents dans l'URL
    cleanPath = cleanPath
      .replace(/\/\(private\)/g, '')
      .replace(/\/\(public\)/g, '')
      .replace(/\/\(onboarding\)/g, '/onboarding')
      .replace(/\/\(tabs\)/g, '');

    if (!cleanPath || cleanPath === '') {
      cleanPath = '/';
    }

    if (cleanPath !== pathname) {
      router.replace(cleanPath as any);
    } else {
      router.replace('/');
    }
  }, [pathname, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFAF8' }}>
      <ActivityIndicator size="large" color="#7C4DFF" />
    </View>
  );
}
