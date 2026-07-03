/**
 * Thin wrapper around @react-native-community/netinfo.
 *
 * ⚠️ DEPENDENCY: `yarn add @react-native-community/netinfo` if not already
 * installed in your app (very commonly already present).
 */
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function subscribeToConnectivity(
  onChange: (isConnected: boolean) => void,
): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    onChange(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
  return unsubscribe;
}

export async function isCurrentlyConnected(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}
