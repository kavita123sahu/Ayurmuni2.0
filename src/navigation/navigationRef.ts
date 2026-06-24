// src/navigation/navigationRef.ts
//
// Lets non-screen code (like GlobalCallListener) trigger navigation
// without needing a navigation prop. Attach this to <NavigationContainer ref={navigationRef}>.

import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../type';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Safe navigate helper — checks isReady() so we never crash if something
 * tries to navigate before the container has mounted (e.g. a call invite
 * arriving during app cold-start).
 */
export function navigate(name: keyof RootStackParamList, params?: any) {
    if (navigationRef.isReady()) {
        // @ts-ignore - generic helper, screen-specific params are still typed at call sites
        navigationRef.navigate(name, params);
    }
}