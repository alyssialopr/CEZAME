import { Platform } from 'react-native';

export interface PwaUpdateState {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  isChecking: boolean;
}

type Listener = (state: PwaUpdateState) => void;

const listeners = new Set<Listener>();
let registrationRef: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
let isInitialized = false;
let isReloading = false;

let state: PwaUpdateState = {
  isSupported: false,
  isRegistered: false,
  updateAvailable: false,
  isChecking: false,
};

function notify() {
  listeners.forEach((listener) => listener({ ...state }));
}

function setState(partial: Partial<PwaUpdateState>) {
  state = { ...state, ...partial };
  notify();
}

function isWebServiceWorkerSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator
  );
}

function trackInstallingWorker(worker: ServiceWorker | null) {
  if (!worker) return;

  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      waitingWorker = worker;
      setState({ updateAvailable: true, isChecking: false });
    }
  });
}

async function performRegistration() {
  if (!isWebServiceWorkerSupported()) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    registrationRef = registration;

    if (registration.waiting) {
      waitingWorker = registration.waiting;
      setState({
        isRegistered: true,
        updateAvailable: true,
      });
    } else {
      setState({ isRegistered: true });
    }

    if (registration.installing) {
      trackInstallingWorker(registration.installing);
    }

    registration.addEventListener('updatefound', () => {
      trackInstallingWorker(registration.installing);
    });
  } catch (error) {
    console.warn('Échec de l’enregistrement du Service Worker:', error);
  }
}

export function initServiceWorker(): void {
  if (isInitialized) return;
  isInitialized = true;

  const supported = isWebServiceWorkerSupported();
  setState({ isSupported: supported });

  if (!supported) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isReloading) return;
    isReloading = true;
    window.location.reload();
  });

  if (document.readyState === 'complete') {
    void performRegistration();
  } else {
    window.addEventListener(
      'load',
      () => {
        void performRegistration();
      },
      { once: true }
    );
  }
}

export function subscribePwaState(listener: Listener): () => void {
  listeners.add(listener);
  listener({ ...state });
  return () => {
    listeners.delete(listener);
  };
}

export async function checkForAppUpdate(): Promise<
  'update-available' | 'up-to-date' | 'unsupported'
> {
  if (!isWebServiceWorkerSupported()) return 'unsupported';

  if (waitingWorker || registrationRef?.waiting) {
    waitingWorker = waitingWorker ?? registrationRef?.waiting ?? null;
    setState({ updateAvailable: true });
    return 'update-available';
  }

  setState({ isChecking: true });
  try {
    if (!registrationRef) {
      await performRegistration();
    }

    if (!registrationRef) {
      return 'unsupported';
    }

    await registrationRef.update();

    if (registrationRef.waiting) {
      waitingWorker = registrationRef.waiting;
      setState({ updateAvailable: true });
      return 'update-available';
    }

    if (registrationRef.installing) {
      await new Promise<void>((resolve) => {
        const worker = registrationRef?.installing;
        if (!worker) {
          resolve();
          return;
        }
        const onStateChange = () => {
          if (worker.state === 'installed' || worker.state === 'redundant') {
            worker.removeEventListener('statechange', onStateChange);
            resolve();
          }
        };
        worker.addEventListener('statechange', onStateChange);
      });

      if (registrationRef.waiting) {
        waitingWorker = registrationRef.waiting;
        setState({ updateAvailable: true });
        return 'update-available';
      }
    }

    return 'up-to-date';
  } catch (error) {
    console.warn('Impossible de vérifier les mises à jour:', error);
    return 'up-to-date';
  } finally {
    setState({ isChecking: false });
  }
}

export function applyAppUpdate(): void {
  if (!isWebServiceWorkerSupported()) return;

  const target = waitingWorker ?? registrationRef?.waiting;
  if (target) {
    target.postMessage({ type: 'SKIP_WAITING' });
    return;
  }

  window.location.reload();
}
