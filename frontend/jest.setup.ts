import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetFake } from './test/fakeSupabase';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// lucide-react-native n'est publié qu'en .mjs : on remplace chaque icône par une vue vide.
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const icon = (props: any) => require('react').createElement(View, props);
  return new Proxy({ __esModule: true }, { get: (target: any, key) => (key in target ? target[key] : icon) });
});

jest.mock('@/lib/supabase', () => ({ supabase: require('./test/fakeSupabase').supabase }));

beforeEach(async () => {
  resetFake();
  await AsyncStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
