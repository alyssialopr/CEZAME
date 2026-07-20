import { Home, Settings, User } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#7C4DFF';
const INACTIVE_COLOR = '#8A8A99';

export type NavKey = 'index' | 'profile' | 'settings';

export const NAV_ITEMS: { key: NavKey; label: string; Icon: typeof Home }[] = [
  { key: 'index', label: 'Home', Icon: Home },
  { key: 'profile', label: 'Profil', Icon: User },
  { key: 'settings', label: 'Paramètres', Icon: Settings },
];

type NavBarProps = {
  activeKey?: NavKey | null;
  onPress: (key: NavKey) => void;
};

/**
 * Barre de navigation plate présentationnelle. Utilisée à la fois par la tab bar
 * du navigateur (custom-tab-bar.tsx) et en autonome sur l'écran de sélection.
 */
export const NavBar = forwardRef<View, NavBarProps>(({ activeKey, onPress }, ref) => {
  const insets = useSafeAreaInsets();

  return (
    <View ref={ref} style={[styles.bar, { paddingBottom: insets.bottom || 8 }]}>
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const focused = key === activeKey;
        const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <TouchableOpacity
            key={key}
            style={styles.item}
            onPress={() => onPress(key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}>
            <Icon color={color} size={24} />
            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

NavBar.displayName = 'NavBar';

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
