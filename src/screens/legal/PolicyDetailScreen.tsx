import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import PolicyContentRenderer from '../../components/PolicyContentRenderer';
import TablerIcon from '../../components/TablerIcon';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import { safeGoBack } from '../../navigation/navigationUtils';
import {
  acceptPolicies,
  getPoliciesList,
  getRequiredPolicies,
} from '../../services/PolicyServices';
import { isPolicyVersionUpdated } from '../../utils/policyUtils';

type RouteParams = {
  policyType?: string;
  title?: string;
  requireAccept?: boolean;
  agreed?: boolean;
};

const PolicyDetailScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const params = (props?.route?.params || {}) as RouteParams;
  const policyType = params.policyType;

  const requireAccept =
    params.requireAccept === true || params.agreed === false;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [policyEntry, setPolicyEntry] = useState<any>(null);

  const headerTitle =
    params.title ||
    policy?.title ||
    policy?.name ||
    (policyType === 'terms_of_service'
      ? 'Terms of Use'
      : policyType === 'privacy_policy'
        ? 'Privacy Policy'
        : 'Legal Policy');

  const load = useCallback(
    async (isRefresh = false) => {
      // if (isRefresh) setRefreshing(true);
      // else setLoading(true);
      // setError(null);

      try {
        const res = await getRequiredPolicies(policyType);
        const list = getPoliciesList(res);
        const entry = list[0];
        const doc = entry?.policy ?? entry ?? null;
        if (!doc) {
          setError('Unable to load this policy right now.');
          setPolicy(null);
          setPolicyEntry(null);
          return;
        }
        setPolicy(doc);
        setPolicyEntry(entry);
      } catch (e: any) {
        setError(e?.message || 'Failed to load policy. Please try again.');
        setPolicy(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [policyType],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleBack = () => {
    if (props.navigation?.canGoBack?.()) {
      props.navigation.goBack();
      return;
    }
    if (requireAccept) {
      props.navigation?.navigate?.('AccessMode');
      return;
    }
    safeGoBack(props.navigation);
  };

  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      const type = policy?.policy_type || policyType;
      if (type) {
        await acceptPolicies({ policy_type: type });
      } else {
        await acceptPolicies({ type: 'all' });
      }
      showSuccessToast('Policy accepted', 'success');
      if (requireAccept) {
        props.navigation?.navigate?.('Onboarding');
      }
    } catch (e: any) {
      showSuccessToast(
        e?.message || 'Unable to accept policy right now',
        'error',
      );
    } finally {
      setAccepting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title={headerTitle} onLeftPress={handleBack} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => load(true)}
                tintColor={Colors.primaryColor}
              />
            }
          >
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <TablerIcon name="shield" size={22} color={Colors.primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  {policy?.title || headerTitle}
                </Text>
                {!!policy?.subtitle && (
                  <Text style={styles.bannerSub}>{policy.subtitle}</Text>
                )}
                {isPolicyVersionUpdated(policyEntry) ? (
                  <View style={styles.updateNote}>
                    <TablerIcon
                      name="alert-circle"
                      size={13}
                      color="#B45309"
                    />
                    <Text style={styles.updateNoteText}>
                      This policy has been updated (v{policy?.version}). Please
                      review the latest version.
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.card}>
              <PolicyContentRenderer content={policy?.content} />
            </View>
          </ScrollView>

          {requireAccept ? (
            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                style={[styles.agreeBtn, accepting && styles.btnDisabled]}
                activeOpacity={0.85}
                disabled={accepting}
                onPress={handleAccept}
              >
                {accepting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.agreeText}>Agree</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.disagreeBtn}
                activeOpacity={0.85}
                onPress={() =>
                  showSuccessToast('You need to accept to continue', 'error')
                }
              >
                <Text style={styles.disagreeText}>Disagree</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
};

export default PolicyDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 28 },
  banner: {
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EAF8F4',
    borderWidth: 1,
    borderColor: '#CFE8DF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bannerSub: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  updateNote: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  updateNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF2',
  },
  agreeBtn: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disagreeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnDisabled: { opacity: 0.7 },
  agreeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  disagreeText: {
    color: Colors.primaryColor,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
