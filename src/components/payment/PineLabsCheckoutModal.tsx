import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  type AppStateStatus,
  BackHandler,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import {
  isPineLabsHostUrl,
  isPineLabsReturnUrl,
  readPineLabsStatusText,
} from '../../services/PineLabsService';

/** `returned` = Pine Labs redirected back / payment confirmed; `closed` = user left. Both are verified. */
export type PineLabsCheckoutOutcome = 'returned' | 'closed';

/** What Pine Labs' own result page said (read from the page text). */
export type PineLabsPageResult = {
  status: 'success' | 'failed' | 'unknown';
  text: string;
};

type Props = {
  visible: boolean;
  url: string;
  returnUrl?: string;
  onFinish: (outcome: PineLabsCheckoutOutcome, pageResult?: PineLabsPageResult) => void;
  /** Called once each time the app returns to the foreground (e.g. back from a UPI app). */
  checkOnResume?: () => Promise<boolean>;
};

const NAV_SPINNER_MAX_MS = 8000;
/** Result page is a SPA route — give it time to render before reading. */
const STATUS_READ_DELAY_MS = 1500;
const STATUS_READ_TIMEOUT_MS = 5000;

const READ_STATUS_JS = `(function(){try{var t=(document.body&&document.body.innerText)||'';window.ReactNativeWebView.postMessage(JSON.stringify({type:'pl_status',text:t.slice(0,800),url:location.href}));}catch(e){window.ReactNativeWebView.postMessage(JSON.stringify({type:'pl_status',text:'',error:String(e)}));}})();true;`;

/** `intent://pay?…#Intent;scheme=upi;package=…;end` → `upi://pay?…` (Android WebView can't open intent URLs). */
const intentToSchemeUrl = (url: string): string => {
  if (!url.startsWith('intent://')) return url;
  const scheme = /[#;]scheme=([^;]+)/i.exec(url)?.[1];
  const body = url.slice('intent://'.length).split('#Intent')[0];
  return scheme ? `${scheme}://${body}` : url;
};

const intentFallbackUrl = (url: string): string | null => {
  const fallback = /S\.browser_fallback_url=([^;]+)/i.exec(url)?.[1];
  return fallback ? decodeURIComponent(fallback) : null;
};

const PineLabsCheckoutModal = ({ visible, url, returnUrl, onFinish, checkOnResume }: Props) => {
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const finishedRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webRef = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const readingStatusRef = useRef(false);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const finish = useCallback(
    (outcome: PineLabsCheckoutOutcome, pageResult?: PineLabsPageResult) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      console.log('PINELABS_CHECKOUT_FINISH =>', outcome, pageResult ?? '');
      onFinish(outcome, pageResult);
    },
    [onFinish],
  );

  /** Pine Labs result page → read its text first; merchant / backend return → finish now. */
  const handleReturn = useCallback(
    (target: string) => {
      console.log('PINELABS_RETURN_DETECTED =>', target);
      if (!isPineLabsHostUrl(target)) {
        finish('returned');
        return;
      }
      if (readingStatusRef.current) return;
      readingStatusRef.current = true;
      setTimeout(() => webRef.current?.injectJavaScript(READ_STATUS_JS), STATUS_READ_DELAY_MS);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => finish('returned'), STATUS_READ_TIMEOUT_MS);
    },
    [finish],
  );

  const onMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg?.type !== 'pl_status') return;
        const text = String(msg.text || '').replace(/\s+/g, ' ').trim();
        const result: PineLabsPageResult = { status: readPineLabsStatusText(text), text };
        console.log('PINELABS_STATUS_PAGE =>', result.status, '|', text);
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        if (result.status === 'failed') {
          // Pine Labs offers "Retry payment / choose a different method" on this page — keep it open.
          console.log('PINELABS_PAYMENT_FAILED => staying on checkout so the user can retry');
          setPaymentFailed(true);
          return;
        }
        finish('returned', result);
      } catch {
        // ignore non-JSON messages from the page
      }
    },
    [finish],
  );

  const confirmClose = useCallback(() => {
    Alert.alert(
      'Cancel payment?',
      'If you have already paid, we will confirm your booking automatically.',
      [
        { text: 'Continue paying', style: 'cancel' },
        { text: 'Yes, cancel', style: 'destructive', onPress: () => finish('closed') },
      ],
    );
    return true;
  }, [finish]);

  useEffect(() => {
    if (!visible) return;
    finishedRef.current = false;
    readingStatusRef.current = false;
    setPaymentFailed(false);
    setFirstLoadDone(false);
    setNavigating(false);
    const sub = BackHandler.addEventListener('hardwareBackPress', confirmClose);
    return () => sub.remove();
  }, [visible, confirmClose]);

  useEffect(() => {
    if (!visible || !checkOnResume) return;
    let prev: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener('change', async next => {
      const resumed = prev !== 'active' && next === 'active';
      prev = next;
      if (!resumed || finishedRef.current) return;
      console.log('PINELABS_APP_RESUMED => checking payment once');
      if (await checkOnResume()) finish('returned');
    });
    return () => sub.remove();
  }, [visible, checkOnResume, finish]);

  useEffect(
    () => () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    },
    [],
  );

  const showNavSpinner = useCallback(() => {
    setNavigating(true);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      setNavigating(false);
      setFirstLoadDone(true);
    }, NAV_SPINNER_MAX_MS);
  }, []);

  const hideNavSpinner = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    setNavigating(false);
    setFirstLoadDone(true);
  }, []);

  const openExternal = useCallback((target: string) => {
    const appUrl = intentToSchemeUrl(target);
    console.log('PINELABS_OPEN_APP =>', appUrl);
    Linking.openURL(appUrl).catch(() => {
      const fallback = intentFallbackUrl(target);
      if (fallback) {
        Linking.openURL(fallback).catch(() => undefined);
        return;
      }
      Alert.alert('App not found', 'Please choose another payment method.');
    });
  }, []);

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const next = request.url || '';
      console.log('PINELABS_NAV_REQUEST =>', next);
      if (request.isTopFrame === false) return true;
      if (isPineLabsReturnUrl(next, returnUrl)) {
        handleReturn(next);
        // Let Pine Labs' own result page render so its text can be read.
        return isPineLabsHostUrl(next);
      }
      if (/^https?:\/\//i.test(next) || next.startsWith('about:') || next.startsWith('data:') || next.startsWith('blob:')) {
        return true;
      }
      openExternal(next);
      return false;
    },
    [handleReturn, returnUrl, openExternal],
  );

  const onNavigationStateChange = useCallback(
    (nav: WebViewNavigation) => {
      console.log('PINELABS_NAV =>', nav.url, nav.loading ? '(loading)' : '');
      if (isPineLabsReturnUrl(nav.url, returnUrl)) {
        handleReturn(nav.url);
        return;
      }
      // Left the result page (retry / another method) → read it again next time it shows.
      readingStatusRef.current = false;
      setPaymentFailed(false);
    },
    [handleReturn, returnUrl],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={confirmClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={confirmClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <TablerIcon name="x" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Secure payment</Text>
            <View style={styles.secureRow}>
              <TablerIcon name="lock" size={11} color={Colors.primaryColor} />
              <Text style={styles.subtitle}>Powered by Pine Labs</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => finish('returned')}
            style={styles.statusBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TablerIcon name="refresh" size={13} color={Colors.primaryColor} />
            <Text style={styles.statusText}>Check status</Text>
          </TouchableOpacity>
        </View>

        {navigating && firstLoadDone ? <View style={styles.progressBar} /> : null}

        {paymentFailed ? (
          <View style={styles.failBanner}>
            <TablerIcon name="x" size={14} color="#B91C1C" />
            <Text style={styles.failText}>
              Payment failed. Tap Retry below, choose a different method, or close to pay another way.
            </Text>
          </View>
        ) : null}

        {url ? (
          <WebView
            ref={(instance: any) => {
              webRef.current = instance;
            }}
            source={{ uri: url }}
            onMessage={onMessage}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            mixedContentMode="always"
            cacheEnabled
            allowsInlineMediaPlayback
            onLoadStart={showNavSpinner}
            onLoadEnd={hideNavSpinner}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 0.9) hideNavSpinner();
            }}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={onNavigationStateChange}
            onError={e => {
              console.log('PINELABS_WEBVIEW_ERROR =>', e.nativeEvent);
              hideNavSpinner();
            }}
            onHttpError={e => console.log('PINELABS_WEBVIEW_HTTP_ERROR =>', e.nativeEvent)}
            {...(Platform.OS === 'android' ? { overScrollMode: 'never' as const } : {})}
            style={styles.webview}
          />
        ) : null}

        {!firstLoadDone ? (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.loaderText}>Opening secure checkout…</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

export default memo(PineLabsCheckoutModal);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E8F4EF',
  },
  statusText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  failBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FECACA',
  },
  failText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#991B1B',
    fontFamily: Fonts.PoppinsMedium,
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.primaryColor,
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    top: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  loaderText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
});
