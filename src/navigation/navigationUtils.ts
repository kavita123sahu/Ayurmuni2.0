import { CommonActions } from '@react-navigation/native';
import { navigate as navigateRoot } from './navigationRef';
import type { RootStackParamList } from '../../type';

export const getRootNavigation = (navigation: any) => {
  let current = navigation;

  for (let depth = 0; depth < 10 && current; depth += 1) {
    const parent = current.getParent?.();
    if (!parent) {
      return current;
    }
    current = parent;
  }

  return navigation;
};

type HomeStackRoute = {
  name: string;
  params?: Record<string, unknown>;
  state?: {
    routes: Array<{ name: string; params?: Record<string, unknown> }>;
    index: number;
  };
};

const buildHomeStackRoute = (
  screen: string,
  params?: Record<string, unknown>,
): HomeStackRoute => {
  if (screen === 'TabStack') {
    const tabScreen = (params?.screen as string) || 'Home';
    return {
      name: 'TabStack',
      state: {
        routes: [{ name: tabScreen }],
        index: 0,
      },
    };
  }

  return { name: screen, params };
};

/** Clears Welcome/Auth history so hardware back cannot return to login. */
export const resetRootToHomeStack = (
  navigation: any,
  screen: string = 'TabStack',
  params?: Record<string, unknown>,
) => {
  const root = getRootNavigation(navigation);

  root?.dispatch?.(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'HomeStack',
          state: {
            routes: [buildHomeStackRoute(screen, params)],
            index: 0,
          },
        },
      ],
    }),
  );
};

/** Walk up navigators to find the root stack that owns product/category screens. */
export const getStackNavigation = (navigation: any) => {
  let current = navigation;

  for (let depth = 0; depth < 6 && current; depth += 1) {
    const routeNames: string[] = current?.getState?.()?.routeNames ?? [];
    if (
      routeNames.includes('CategoryProducts') ||
      routeNames.includes('SearchScreen') ||
      routeNames.includes('ProductDetails') ||
      routeNames.includes('Checkout') ||
      routeNames.includes('MyCart') ||
      routeNames.includes('PatientVideoCallScreen') ||
      routeNames.includes('Appointments')
    ) {
      return current;
    }
    current = current?.getParent?.();
  }

  return navigation?.getParent?.() || navigation;
};

export const navigateToStackScreen = (
  navigation: any,
  screen: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList],
) => {
  const stackNav = getStackNavigation(navigation);

  if (stackNav?.navigate) {
    (stackNav as { navigate: (name: string, p?: unknown) => void }).navigate(
      screen,
      params,
    );
    return;
  }

  navigateRoot(screen, params);
};
export const safeGoBack = (navigation: any) => {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
    return;
  }

  const parent = navigation?.getParent?.();
  if (parent?.canGoBack?.()) {
    parent.goBack();
    return;
  }

  navigation?.navigate?.('TabStack', { screen: 'Home' });
};

/**
 * Leave video call and land on Appointments without leaving
 * PatientVideoCallScreen in the stack (avoids back → video call again).
 */
export const popVideoCallAndGoToAppointments = (navigation: any) => {
  const stackNav = getStackNavigation(navigation) ?? navigation;

  stackNav.dispatch((state: any) => {
    const routes = state.routes.filter(
      (route: { name: string }) => route.name !== 'PatientVideoCallScreen',
    );

    let index = routes.length - 1;
    const appointmentsIndex = routes.findIndex(
      (route: { name: string }) => route.name === 'Appointments',
    );

    if (appointmentsIndex >= 0) {
      index = appointmentsIndex;
    } else {
      routes.push({
        name: 'Appointments',
        key: `Appointments-${Date.now()}`,
      });
      index = routes.length - 1;
    }

    return CommonActions.reset({
      ...state,
      routes,
      index,
    });
  });
};
