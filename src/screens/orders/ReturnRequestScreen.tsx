import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  findNodeHandle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import AppHeader from '../../components/AppHeader';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { showSuccessToast } from '../../config/Key';
import { formatRupee } from '../../utils/currencyUtils';
import { formatOrderId } from '../../utils/formatDisplayId';
import {
  ACCOUNT_RE,
  CreateReturnPayload,
  IFSC_RE,
  RETURN_REASONS,
  buildReasonOptions,
  ReturnEligibility,
  ReturnEligibilityItem,
  UPI_RE,
  createReturnRequest,
  getReturnEligibility,
  normalizeReturnEligibility,
  uploadReturnMedia,
} from '../../services/ReturnService';

/** Extra space under form so the focused field can scroll above the sticky footer + keyboard. */
const SCROLL_FOOTER_GAP = 120;

type RefundMethod = 'upi' | 'bank';

const formatShortDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const SOURCE_LABELS: Record<string, string> = {
  razorpay: 'Razorpay',
  pinelabs: 'Pine Labs',
  pine_labs: 'Pine Labs',
  upi: 'UPI',
  card: 'Card',
  credit_card: 'Credit card',
  debit_card: 'Debit card',
  netbanking: 'Net banking',
  wallet: 'Wallet',
  online: 'Online payment',
  prepaid: 'Online payment',
};

/** Human label for where a prepaid refund goes back to, e.g. "UPI via Razorpay". */
const getPaymentSourceLabel = (order: any, refundMode?: string) => {
  const label = (v: any) => {
    const key = String(v ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (!key) return '';
    return SOURCE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };
  const instrument = label(
    refundMode || order?.payment_instrument || order?.payment_details?.method || order?.payment?.method,
  );
  const gateway = label(order?.payment_gateway || order?.gateway || order?.payment_method || order?.payment_type);
  if (instrument && gateway && instrument !== gateway) return `${instrument} via ${gateway}`;
  return instrument || gateway || 'Original payment method';
};

const isPast = (value: string) => {
  const t = new Date(value).getTime();
  return Number.isFinite(t) && t < Date.now();
};

type MediaItem = { id: string; uri: string; type: string; fileName?: string; uploadedUrl?: string };

const MAX_MEDIA = 4;

const ReturnRequestScreen = ({ route, navigation }: any) => {
  const order = route?.params?.order ?? {};
  const orderId = String(order?.id ?? order?.order_id ?? route?.params?.orderId ?? '');
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [reasonCode, setReasonCode] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [eligibility, setEligibility] = useState<ReturnEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  /** order_item_id → quantity to return */
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  /** Kept from the first response so the list doesn't change while switching reasons. */
  const [reasonOptions, setReasonOptions] = useState(RETURN_REASONS);
  const requestRef = useRef(0);
  const selectionTouchedRef = useRef(false);

  /** Scroll the focused TextInput into view above the sticky footer / keyboard. */
  const scrollFieldIntoView = useCallback(
    (e: { nativeEvent?: { target?: unknown } }) => {
      const target = e?.nativeEvent?.target;
      const responder = scrollRef.current as any;
      if (!target || !responder?.getScrollResponder) return;
      const scrollResponder = responder.getScrollResponder?.();
      if (!scrollResponder?.scrollResponderScrollNativeHandleToKeyboard) return;
      const node = findNodeHandle(target as any);
      if (!node) return;
      // Delay so KeyboardAvoidingView has resized before we measure.
      setTimeout(() => {
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
          node,
          SCROLL_FOOTER_GAP + Math.max(insets.bottom, 12),
          true,
        );
      }, Platform.OS === 'ios' ? 80 : 250);
    },
    [insets.bottom],
  );

  const loadEligibility = useCallback(
    async (code?: string) => {
      if (!orderId) return;
      const reqId = ++requestRef.current;
      setLoading(true);
      setLoadError('');
      try {
        const res = await getReturnEligibility(orderId, code || undefined);
        if (reqId !== requestRef.current) return;
        if (res?.success === false) {
          setLoadError(res?.message || 'Could not check return eligibility.');
          setEligibility(null);
          return;
        }
        const next = normalizeReturnEligibility(res, order);
        setEligibility(next);
        if (!code && next.allowedReasons.length) {
          setReasonOptions(buildReasonOptions(next.allowedReasons));
        }
        // Drop selections that are no longer eligible for the chosen reason.
        // Pre-select every eligible item until the user changes the selection;
        // afterwards keep their choices (dropping items that became ineligible).
        setSelected(prev => {
          const kept: Record<string, number> = {};
          next.items.forEach(item => {
            if (!item.eligible) return;
            if (!selectionTouchedRef.current) {
              kept[item.orderItemId] = item.returnableQuantity;
            } else if (prev[item.orderItemId]) {
              kept[item.orderItemId] = Math.min(prev[item.orderItemId], item.returnableQuantity);
            }
          });
          return kept;
        });
      } catch (e: any) {
        if (reqId !== requestRef.current) return;
        setLoadError(e?.message || 'Could not check return eligibility.');
      } finally {
        if (reqId === requestRef.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderId],
  );

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const onSelectReason = (code: string) => {
    setReasonCode(code);
    if (code !== 'other') setReasonText('');
    loadEligibility(code);
  };

  const items = eligibility?.items ?? [];
  const eligibleItems = items.filter(i => i.eligible);
  const isCod = Boolean(eligibility?.isCod);
  const paymentSource = getPaymentSourceLabel(order, eligibility?.refundMode);
  const selectedIds = Object.keys(selected).filter(id => selected[id] > 0);

  const refundTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (selected[item.orderItemId] ? item.price * selected[item.orderItemId] : 0),
        0,
      ),
    [items, selected],
  );

  const toggleItem = (item: ReturnEligibilityItem) => {
    if (!item.eligible) return;
    selectionTouchedRef.current = true;
    setSelected(prev => {
      const next = { ...prev };
      if (next[item.orderItemId]) delete next[item.orderItemId];
      else next[item.orderItemId] = item.returnableQuantity;
      return next;
    });
  };

  const toggleAll = () => {
    selectionTouchedRef.current = true;
    if (selectedIds.length === eligibleItems.length) {
      setSelected({});
      return;
    }
    const all: Record<string, number> = {};
    eligibleItems.forEach(item => {
      all[item.orderItemId] = item.returnableQuantity;
    });
    setSelected(all);
  };

  const changeQty = (item: ReturnEligibilityItem, delta: number) => {
    selectionTouchedRef.current = true;
    setSelected(prev => {
      const current = prev[item.orderItemId] ?? 0;
      const nextQty = Math.max(1, Math.min(item.returnableQuantity, current + delta));
      return { ...prev, [item.orderItemId]: nextQty };
    });
  };

  // ── Media ──────────────────────────────────────────────────────────────────

  const addMedia = (source: 'camera' | 'library') => {
    const remaining = MAX_MEDIA - media.length;
    if (remaining <= 0) return;
    const handler = (res: any) => {
      if (res?.didCancel || res?.errorCode) return;
      const assets: Asset[] = res?.assets ?? [];
      setMedia(prev =>
        [
          ...prev,
          ...assets
            .filter(a => a.uri)
            .map(a => ({
              id: `${Date.now()}-${a.fileName ?? a.uri}`,
              uri: a.uri as string,
              type: a.type || 'image/jpeg',
              fileName: a.fileName,
            })),
        ].slice(0, MAX_MEDIA),
      );
    };
    const options = { mediaType: 'photo' as const, quality: 0.7 as const, selectionLimit: remaining };
    if (source === 'camera') launchCamera(options, handler);
    else launchImageLibrary(options, handler);
  };

  const pickMedia = () =>
    Alert.alert('Add photo', 'Show the issue with the product', [
      { text: 'Camera', onPress: () => addMedia('camera') },
      { text: 'Gallery', onPress: () => addMedia('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  // ── Validation ─────────────────────────────────────────────────────────────

  const reasonLabel = reasonOptions.find(r => r.code === reasonCode)?.label ?? '';
  const finalReason = reasonCode === 'other' ? reasonText.trim() : reasonText.trim() || reasonLabel;

  const errors = {
    reason: !reasonCode
      ? 'Select a reason'
      : reasonCode === 'other' && reasonText.trim().length < 5
        ? 'Describe the issue (min 5 characters)'
        : '',
    items: selectedIds.length === 0 ? 'Select at least one item to return' : '',
    upi: isCod && refundMethod === 'upi' && !UPI_RE.test(upiId.trim()) ? 'Enter a valid UPI ID (e.g. name@bank)' : '',
    holder: isCod && refundMethod === 'bank' && holderName.trim().length < 3 ? 'Enter account holder name' : '',
    account:
      isCod && refundMethod === 'bank' && !ACCOUNT_RE.test(accountNumber.trim())
        ? 'Enter a valid account number (9–18 digits)'
        : '',
    confirm:
      isCod && refundMethod === 'bank' && confirmAccount.trim() !== accountNumber.trim()
        ? 'Account numbers do not match'
        : '',
    ifsc: isCod && refundMethod === 'bank' && !IFSC_RE.test(ifsc.trim().toUpperCase()) ? 'Enter a valid IFSC (e.g. HDFC0001234)' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (key: keyof typeof errors) => (showErrors ? errors[key] : '');

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (submitting) return;
    if (hasErrors) {
      setShowErrors(true);
      showSuccessToast(Object.values(errors).find(Boolean) as string, 'error');
      return;
    }
    try {
      setSubmitting(true);
      const uploaded = await Promise.all(
        media.map(async m => {
          if (m.uploadedUrl) return m.uploadedUrl;
          const url = await uploadReturnMedia({ uri: m.uri, type: m.type, fileName: m.fileName });
          setMedia(prev => prev.map(p => (p.id === m.id ? { ...p, uploadedUrl: url } : p)));
          return url;
        }),
      );

      const payload: CreateReturnPayload = {
        reason: finalReason,
        ...(reasonCode && reasonCode !== 'other' ? { reason_code: reasonCode } : {}),
        items: selectedIds.map(id => ({ order_item_id: id, quantity: selected[id] })),
        media: uploaded.filter(Boolean).map(url => ({ media_url: url, media_type: 'image' as const })),
      };
      if (isCod && refundMethod === 'upi') {
        payload.upi_id = upiId.trim();
      } else if (isCod && refundMethod === 'bank') {
        payload.account_holder_name = holderName.trim();
        payload.account_number = accountNumber.trim();
        payload.ifsc_code = ifsc.trim().toUpperCase();
      }

      const res = await createReturnRequest(orderId, payload);
      if (res?.success === false) {
        showSuccessToast(res?.message || 'Could not create return request', 'error');
        return;
      }
      const created = res?.data?.data ?? res?.data ?? {};
      showSuccessToast(res?.message || 'Return request submitted', 'success');
      if (created?.id) {
        navigation.replace('ReturnDetailsScreen', { returnId: created.id, returnRequest: created });
      } else {
        navigation.goBack();
      }
    } catch (e: any) {
      showSuccessToast(e?.message || 'Could not create return request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderItem = (item: ReturnEligibilityItem) => {
    const qty = selected[item.orderItemId] ?? 0;
    const checked = qty > 0;
    return (
      <TouchableOpacity
        key={item.orderItemId}
        activeOpacity={item.eligible ? 0.85 : 1}
        disabled={!item.eligible}
        onPress={() => toggleItem(item)}
        style={[styles.itemRow, checked && styles.itemRowChecked, !item.eligible && styles.itemRowDisabled]}
      >
        <View style={[styles.checkbox, checked && styles.checkboxOn, !item.eligible && styles.checkboxDisabled]}>
          {checked ? <TablerIcon name="check" size={13} color="#FFFFFF" /> : null}
        </View>
        <View style={styles.itemThumb}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImg} />
          ) : (
            <TablerIcon name="package" size={18} color="#94A3B8" />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, !item.eligible && styles.textMuted]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta}>
            {[
              item.price > 0 ? formatRupee(item.price, { decimals: 2 }) : null,
              `Qty ${item.quantity}`,
              item.eligible && item.returnableQuantity < item.quantity
                ? `${item.returnableQuantity} returnable`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {item.eligible && item.windowEndsAt ? (
            <Text style={styles.windowText}>
              Return by {formatShortDate(item.windowEndsAt)}
            </Text>
          ) : null}
          {!item.eligible ? (
            <View style={styles.ineligibleRow}>
              <TablerIcon name="alert-circle" size={12} color="#B45309" />
              <Text style={styles.ineligibleText} numberOfLines={2}>
                {item.reason ||
                  (item.windowEndsAt && isPast(item.windowEndsAt)
                    ? `Return window closed on ${formatShortDate(item.windowEndsAt)}`
                    : 'Not eligible for return')}
              </Text>
            </View>
          ) : null}
        </View>
        {checked && item.returnableQuantity > 1 ? (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => changeQty(item, -1)}
              disabled={qty <= 1}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <TablerIcon name="minus" size={13} color={qty <= 1 ? '#CBD5E1' : Colors.primaryColor} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{qty}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => changeQty(item, 1)}
              disabled={qty >= item.returnableQuantity}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <TablerIcon
                name="plus"
                size={13}
                color={qty >= item.returnableQuantity ? '#CBD5E1' : Colors.primaryColor}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderMethod = (key: RefundMethod, icon: TablerIconName, title: string, sub: string) => {
    const active = refundMethod === key;
    return (
      <TouchableOpacity
        style={[styles.methodCard, active && styles.methodCardOn]}
        onPress={() => setRefundMethod(key)}
        activeOpacity={0.85}
      >
        <View style={[styles.methodIcon, active && styles.methodIconOn]}>
          <TablerIcon name={icon} size={18} color={active ? '#FFFFFF' : Colors.primaryColor} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.methodTitle}>{title}</Text>
          <Text style={styles.methodSub}>{sub}</Text>
        </View>
        <View style={[styles.radio, active && styles.radioOn]}>
          {active ? <View style={styles.radioDot} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    error: string,
    props: Partial<React.ComponentProps<typeof TextInput>> = {},
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#94A3B8"
        style={[styles.input, !!error && styles.inputError]}
        {...props}
        onFocus={e => {
          props.onFocus?.(e);
          scrollFieldIntoView(e);
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={SCREEN_THEME.statusBarStyle} backgroundColor={SCREEN_THEME.statusBarBackground} />
      <AppHeader title="Return items" onLeftPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex1}
        // Android already resizes via windowSoftInputMode="adjustResize".
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: SCROLL_FOOTER_GAP + Math.max(insets.bottom, 12) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={styles.orderStrip}>
            <TablerIcon name="receipt" size={16} color={Colors.primaryColor} />
            <View style={styles.flex1}>
              <Text style={styles.orderStripText}>
                Order #{formatOrderId(eligibility?.orderCode || order?.order_code || orderId)}
              </Text>
              {eligibility?.returnWindowEndsAt ? (
                <Text
                  style={[
                    styles.orderStripSub,
                    isPast(eligibility.returnWindowEndsAt) && styles.orderStripSubClosed,
                  ]}
                >
                  {isPast(eligibility.returnWindowEndsAt)
                    ? `Return window closed on ${formatShortDate(eligibility.returnWindowEndsAt)}`
                    : `Return window open till ${formatShortDate(eligibility.returnWindowEndsAt)}`}
                </Text>
              ) : null}
            </View>
            <View style={[styles.payPill, isCod ? styles.payPillCod : styles.payPillPrepaid]}>
              <Text style={[styles.payPillText, isCod ? styles.payPillTextCod : styles.payPillTextPrepaid]}>
                {isCod ? 'COD' : 'Prepaid'}
              </Text>
            </View>
          </View>

          {/* Step 1 — reason */}
          <StepHeader index={1} title="Why are you returning?" />
          <View style={styles.card}>
            {reasonOptions.map(reason => {
              const active = reasonCode === reason.code;
              return (
                <TouchableOpacity
                  key={reason.code}
                  style={[styles.reasonRow, active && styles.reasonRowOn]}
                  onPress={() => onSelectReason(reason.code)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radio, active && styles.radioOn]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.reasonText, active && styles.reasonTextOn]}>{reason.label}</Text>
                </TouchableOpacity>
              );
            })}
            {reasonCode ? (
              <TextInput
                value={reasonText}
                onChangeText={setReasonText}
                placeholder={reasonCode === 'other' ? 'Describe the issue…' : 'Add more details (optional)'}
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={300}
                textAlignVertical="top"
                onFocus={scrollFieldIntoView}
                style={[styles.input, styles.textArea, !!err('reason') && styles.inputError]}
              />
            ) : null}
            {err('reason') ? <Text style={styles.errorText}>{err('reason')}</Text> : null}
          </View>

          {/* Step 2 — items */}
          <View style={styles.stepRow}>
            <StepHeader index={2} title="Select items" />
            {eligibleItems.length > 1 ? (
              <TouchableOpacity onPress={toggleAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.linkText}>
                  {selectedIds.length === eligibleItems.length ? 'Clear all' : 'Select all'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.card}>
            {loading && !eligibility ? (
              <View style={styles.centerBox}>
                <ActivityIndicator color={Colors.primaryColor} />
                <Text style={styles.mutedText}>Checking which items can be returned…</Text>
              </View>
            ) : loadError ? (
              <View style={styles.centerBox}>
                <TablerIcon name="alert-circle" size={22} color="#DC2626" />
                <Text style={styles.mutedText}>{loadError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => loadEligibility(reasonCode)}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : items.length === 0 ? (
              <View style={styles.centerBox}>
                <Text style={styles.mutedText}>
                  {eligibility?.message || 'No items in this order can be returned.'}
                </Text>
              </View>
            ) : (
              <>
                {loading ? <ActivityIndicator size="small" color={Colors.primaryColor} style={styles.inlineLoader} /> : null}
                {!eligibility?.eligible && eligibility?.message ? (
                  <View style={styles.noticeWarn}>
                    <TablerIcon name="alert-circle" size={14} color="#B45309" />
                    <Text style={styles.noticeWarnText}>{eligibility.message}</Text>
                  </View>
                ) : null}
                {items.map(renderItem)}
              </>
            )}
            {err('items') ? <Text style={styles.errorText}>{err('items')}</Text> : null}
          </View>

          {/* Step 3 — photos */}
          <StepHeader index={3} title="Add photos" optional />
          <View style={styles.card}>
            <Text style={styles.mutedText}>Photos of the product and packaging help us approve faster.</Text>
            <View style={styles.mediaRow}>
              {media.map(m => (
                <View key={m.id} style={styles.mediaThumb}>
                  <Image source={{ uri: m.uri }} style={styles.mediaImg} />
                  <TouchableOpacity
                    style={styles.mediaRemove}
                    onPress={() => setMedia(prev => prev.filter(p => p.id !== m.id))}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <TablerIcon name="x" size={11} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {media.length < MAX_MEDIA ? (
                <TouchableOpacity style={styles.mediaAdd} onPress={pickMedia} activeOpacity={0.85}>
                  <TablerIcon name="camera" size={20} color={Colors.primaryColor} />
                  <Text style={styles.mediaAddText}>Add</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Step 4 — refund method */}
          <StepHeader index={4} title={isCod ? 'Refund method' : 'Refund to'} />
          <View style={styles.card}>
            {isCod ? (
              <>
                <Text style={styles.mutedText}>
                  This was a Cash on Delivery order. Tell us where to send your refund.
                </Text>
                {renderMethod('upi', 'wallet', 'UPI', 'Fastest — refund to your UPI ID')}
                {renderMethod('bank', 'building', 'Bank account', 'Refund via NEFT / IMPS')}

                {refundMethod === 'upi'
                  ? field('UPI ID', upiId, setUpiId, err('upi'), {
                      placeholder: 'name@bank',
                      autoCapitalize: 'none',
                      keyboardType: 'email-address',
                      autoCorrect: false,
                    })
                  : (
                    <>
                      {field('Account holder name', holderName, setHolderName, err('holder'), {
                        placeholder: 'As per bank records',
                        autoCapitalize: 'words',
                      })}
                      {field('Account number', accountNumber, v => setAccountNumber(v.replace(/\D/g, '')), err('account'), {
                        placeholder: 'Enter account number',
                        keyboardType: 'number-pad',
                        secureTextEntry: true,
                        maxLength: 18,
                      })}
                      {field('Confirm account number', confirmAccount, v => setConfirmAccount(v.replace(/\D/g, '')), err('confirm'), {
                        placeholder: 'Re-enter account number',
                        keyboardType: 'number-pad',
                        maxLength: 18,
                      })}
                      {field('IFSC code', ifsc, v => setIfsc(v.toUpperCase().replace(/[^A-Z0-9]/g, '')), err('ifsc'), {
                        placeholder: 'HDFC0001234',
                        autoCapitalize: 'characters',
                        maxLength: 11,
                      })}
                    </>
                  )}
              </>
            ) : (
              <View style={styles.prepaidBox}>
                <View style={styles.methodIconOn}>
                  <TablerIcon name="credit-card" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.methodTitle}>{paymentSource}</Text>
                  <Text style={styles.methodSub}>
                    Prepaid order — no details needed. The refund goes straight back to the source you paid with
                    once the items are picked up and checked.
                  </Text>
                </View>
                <TablerIcon name="circle-check" size={18} color={Colors.primaryColor} />
              </View>
            )}
          </View>

          <View style={styles.noticeInfo}>
            <TablerIcon name="truck" size={14} color="#1E40AF" />
            <Text style={styles.noticeInfoText}>
              After approval we'll schedule a pickup. Keep the items in their original packaging.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.flex1}>
            <Text style={styles.footerLabel}>
              {selectedIds.length
                ? `${selectedIds.reduce((s, id) => s + selected[id], 0)} item(s) selected`
                : 'No items selected'}
            </Text>
            <Text style={styles.footerAmount}>
              {refundTotal > 0 ? `Refund ~ ${formatRupee(refundTotal, { decimals: 2 })}` : ' '}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, (submitting || selectedIds.length === 0) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Submit return</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const StepHeader = ({ index, title, optional }: { index: number; title: string; optional?: boolean }) => (
  <View style={styles.stepHeader}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepBadgeText}>{index}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    {optional ? <Text style={styles.optionalText}>Optional</Text> : null}
  </View>
);

export default ReturnRequestScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1, minWidth: 0 },
  scrollView: { flex: 1 },
  scroll: { padding: 12, flexGrow: 1 },

  orderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEF0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  orderStripText: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  orderStripSub: { marginTop: 1, fontSize: 11, color: '#047857', fontFamily: Fonts.PoppinsMedium },
  orderStripSubClosed: { color: '#B45309' },
  windowText: { marginTop: 2, fontSize: 10.5, color: '#047857', fontFamily: Fonts.PoppinsMedium },
  payPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  payPillCod: { backgroundColor: '#FEF3C7' },
  payPillPrepaid: { backgroundColor: '#DCFCE7' },
  payPillText: { fontSize: 10, fontFamily: Fonts.PoppinsSemiBold },
  payPillTextCod: { color: '#92400E' },
  payPillTextPrepaid: { color: '#166534' },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: Fonts.PoppinsSemiBold },
  stepTitle: { fontSize: 14, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  optionalText: { fontSize: 11, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
  linkText: { fontSize: 12, color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold, marginTop: 8 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF0',
    padding: 12,
    gap: 8,
  },

  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  reasonRowOn: { backgroundColor: '#ECF8F4' },
  reasonText: { flex: 1, fontSize: 13, color: '#334155', fontFamily: Fonts.PoppinsMedium },
  reasonTextOn: { color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.primaryColor },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primaryColor },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowChecked: { borderColor: Colors.primaryColor, backgroundColor: '#F3FAF8' },
  itemRowDisabled: { backgroundColor: '#F8FAFC', opacity: 0.75 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxOn: { backgroundColor: Colors.primaryColor, borderColor: Colors.primaryColor },
  checkboxDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  itemThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold, lineHeight: 17 },
  itemMeta: { marginTop: 2, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
  textMuted: { color: '#94A3B8' },
  ineligibleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ineligibleText: { flex: 1, fontSize: 10.5, color: '#B45309', fontFamily: Fonts.PoppinsMedium },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1E7DF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  stepBtn: { paddingHorizontal: 7, paddingVertical: 5 },
  stepQty: { minWidth: 16, textAlign: 'center', fontSize: 12, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },

  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mediaThumb: { width: 64, height: 64, borderRadius: 10, overflow: 'hidden' },
  mediaImg: { width: '100%', height: '100%' },
  mediaRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaAdd: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9CCFBE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3FAF8',
  },
  mediaAddText: { fontSize: 10.5, color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold },

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodCardOn: { borderColor: Colors.primaryColor, backgroundColor: '#F3FAF8' },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconOn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  methodSub: { marginTop: 1, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular, lineHeight: 15 },
  prepaidBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 11.5, color: '#475569', fontFamily: Fonts.PoppinsMedium },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsRegular,
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: '#F87171' },
  textArea: { minHeight: 72, marginTop: 4 },
  errorText: { fontSize: 11, color: '#DC2626', fontFamily: Fonts.PoppinsMedium },

  centerBox: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  mutedText: { fontSize: 12, color: '#64748B', fontFamily: Fonts.PoppinsRegular, lineHeight: 17 },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  retryText: { fontSize: 12, color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold },
  inlineLoader: { alignSelf: 'flex-end' },

  noticeWarn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 8,
  },
  noticeWarnText: { flex: 1, fontSize: 11.5, color: '#92400E', fontFamily: Fonts.PoppinsMedium },
  noticeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  noticeInfoText: { flex: 1, fontSize: 11.5, color: '#1E40AF', fontFamily: Fonts.PoppinsMedium, lineHeight: 16 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EEF0',
  },
  footerLabel: { fontSize: 11.5, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
  footerAmount: { fontSize: 14, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  submitBtn: {
    minWidth: 150,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontFamily: Fonts.PoppinsSemiBold },
});
