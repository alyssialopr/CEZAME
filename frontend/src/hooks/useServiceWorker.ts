import { useEffect, useState } from 'react';
import {
  applyAppUpdate,
  checkForAppUpdate,
  initServiceWorker,
  PwaUpdateState,
  subscribePwaState,
} from '@/services/pwaService';

export function useServiceWorker() {
  const [state, setState] = useState<PwaUpdateState>({
    isSupported: false,
    isRegistered: false,
    updateAvailable: false,
    isChecking: false,
  });

  useEffect(() => {
    initServiceWorker();
    return subscribePwaState(setState);
  }, []);

  return {
    ...state,
    checkForUpdate: checkForAppUpdate,
    applyUpdate: applyAppUpdate,
  };
}
