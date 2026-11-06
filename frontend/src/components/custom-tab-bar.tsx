import { BottomTabBarProps } from 'expo-router/js-tabs';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import type { ViewInstance } from 'react-native';

import { NavBar, NavKey } from '@/components/nav-bar';
import { useTutorialTarget } from '@/hooks/useTutorialTarget';
import { useTutorial } from '@/providers/TutorialProvider';

/**
 * Tab bar du navigateur (prop `tabBar` de <Tabs>, expo-router).
 * S'appuie sur NavBar et relaie la navigation React Navigation.
 */
export function CustomTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const router = useRouter();
  const barRef = useRef<ViewInstance>(null);
  const { pressTarget } = useTutorial();
  useTutorialTarget('tab-bar', barRef);

  const activeKey = state.routes[state.index]?.name as NavKey;

  const handlePress = (key: NavKey) => {
    // Pendant le tuto, taper un onglet fait avancer sans changer d'onglet.
    if (pressTarget('tab-bar')) return;
    const route = state.routes.find((r) => r.name === key);
    if (!route) return;
    const event = emitter.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (activeKey !== key && !event.defaultPrevented) {
      navigateToTab(route.key);
    } else if (key === 'index' && !event.defaultPrevented) {
      // Si déjà sur l'accueil, appuyer sur Home ramène à la sélection des 5 thèmes
      router.push('/categories');
    }
  };

  return <NavBar ref={barRef} activeKey={activeKey} onPress={handlePress} />;
}
