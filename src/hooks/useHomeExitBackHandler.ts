import { Alert, BackHandler, Platform, ToastAndroid } from 'react-native';
import { useEffect, useRef } from 'react';
import { showSuccessToast } from '../config/Key';
import { navigationRef } from '../navigation/navigationRef';

const EXIT_RESET_MS = 2500;
const EXIT_DEBOUNCE_MS = 400;

const showExitHint = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
    return;
  }

  showSuccessToast('Press back again to exit', 'success');
};

const confirmExitApp = (onCancel: () => void) => {
  Alert.alert(
    'Exit Ayurmuni',
    'Are you sure you want to exit the app?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => BackHandler.exitApp(),
      },
    ],
    { cancelable: true, onDismiss: onCancel },
  );
};

const getHomeStackState = () => {
  if (!navigationRef.isReady()) {
    return null;
  }

  const root = navigationRef.getRootState();
  const activeRootRoute = root?.routes?.[root.index ?? 0];

  if (activeRootRoute?.name !== 'HomeStack') {
    return null;
  }

  return activeRootRoute.state ?? null;
};

const getActiveTabName = (): string => {
  const homeStackState = getHomeStackState();
  const currentHomeRoute = homeStackState?.routes?.[homeStackState.index ?? 0];

  if (currentHomeRoute?.name !== 'TabStack') {
    return '';
  }

  const tabState = currentHomeRoute.state as
    | { routes?: Array<{ name: string }>; index?: number }
    | undefined;

  return tabState?.routes?.[tabState.index ?? 0]?.name ?? 'Home';
};

const isOnTabRoot = (): boolean => {
  const homeStackState = getHomeStackState();
  if (!homeStackState?.routes?.length) {
    return false;
  }

  const currentHomeRoute = homeStackState.routes[homeStackState.index ?? 0];
  return currentHomeRoute?.name === 'TabStack';
};

const goToHomeTab = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate('HomeStack', {
    screen: 'TabStack',
    params: { screen: 'Home' },
  });
};

/**
 * Prevents leaving HomeStack to Welcome/Login and handles double-back exit on Home tab.
 */
export const useHomeExitBackHandler = (navigation: any) => {
  const exitCountRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledRef = useRef(0);

  useEffect(() => {
    const resetExitCount = () => {
      exitCountRef.current = 0;
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };

    const handleExitFlow = () => {
      const now = Date.now();
      if (now - lastHandledRef.current < EXIT_DEBOUNCE_MS) {
        return;
      }
      lastHandledRef.current = now;

      if (exitCountRef.current === 0) {
        exitCountRef.current = 1;
        showExitHint();
        exitTimerRef.current = setTimeout(resetExitCount, EXIT_RESET_MS);
        return;
      }

      confirmExitApp(resetExitCount);
    };

    const handleRootBack = () => {
      if (!isOnTabRoot()) {
        return false;
      }

      const activeTab = getActiveTabName();

      if (activeTab !== 'Home') {
        goToHomeTab();
        resetExitCount();
        return true;
      }

      handleExitFlow();
      return true;
    };

    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (event: any) => {
      if (event.data.action.type !== 'GO_BACK') {
        return;
      }

      if (!isOnTabRoot()) {
        return;
      }

      event.preventDefault();

      const activeTab = getActiveTabName();

      if (activeTab !== 'Home') {
        goToHomeTab();
        resetExitCount();
        return;
      }

      handleExitFlow();
    });

    const hardwareBackSub = BackHandler.addEventListener('hardwareBackPress', handleRootBack);

    return () => {
      unsubscribeBeforeRemove();
      hardwareBackSub.remove();
      resetExitCount();
    };
  }, [navigation]);
};
