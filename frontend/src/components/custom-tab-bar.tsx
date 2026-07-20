import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRef } from 'react';
import { View } from 'react-native';

import { NavBar, NavKey } from '@/components/nav-bar';
import { useTutorialTarget } from '@/hooks/useTutorialTarget';
import { useTutorial } from '@/providers/TutorialProvider';

/**
 * Tab bar du navigateur (prop `tabBar` de <Tabs>, expo-router).
 * S'appuie sur NavBar et relaie la navigation React Navigation.
 */
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const barRef = useRef<View>(null);
  const { pressTarget } = useTutorial();
  useTutorialTarget('tab-bar', barRef);

  const activeKey = state.routes[state.index]?.name as NavKey;

  const handlePress = (key: NavKey) => {
    // Pendant le tuto, taper un onglet fait avancer sans changer d'onglet.
    if (pressTarget('tab-bar')) return;
    const route = state.routes.find((r) => r.name === key);
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (activeKey !== key && !event.defaultPrevented) {
      navigation.navigate(key);
    }
  };

  return <NavBar ref={barRef} activeKey={activeKey} onPress={handlePress} />;
}
