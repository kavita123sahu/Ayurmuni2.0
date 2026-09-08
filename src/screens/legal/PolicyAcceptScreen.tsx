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
import TablerIcon from '../../components/TablerIcon';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import {
  acceptPolicies,
  getPoliciesList,
  getRequiredPolicies,
} from '../../services/PolicyServices';
import {
  getPolicyDoc,
  isPolicyVersionUpdated,
} from '../../utils/policyUtils';
import { Utils } from '../../common/Utils';

type NextRoute =
  | { name: 'AssessmentType'; params?: any }
  | { name: 'Home' }
  | { name: 'AccessMode' }
  | { name: 'Onboarding' };

/**
 * Mandatory Terms & Policies accept gate.
 * Used after customer profile is created, or when login says policy_accepted.customer=false.
 * Guest users never land here.
 */
const PolicyAcceptScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const nextRoute: NextRoute = props?.route?.params?.nextRoute || {
    name: 'Home',
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [agreed, setAgreed] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getRequiredPolicies();
      setPolicies(getPoliciesList(res));
    } catch (e: any) {
      setError(e?.message || 'Unable to load policies.');
      setPolicies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openPolicy = (item: any) => {
    const policy = getPolicyDoc(item);
    props.navigation.navigate('PolicyDetail', {
      policyType: policy?.policy_type,
      title: policy?.title || policy?.name || 'Policy',
    });
  };

  const continueNext = () => {
    if (nextRoute.name === 'Home') {
      resetRootToHomeStack(props.navigation, 'TabStack', {
        screen: 'Home',
      });
      return;
    }
    if (nextRoute.name === 'AccessMode') {
      resetRootToHomeStack(props.navigation, 'AccessMode');
      return;
    }
    if (nextRoute.name === 'AssessmentType') {
      props.navigation.replace('AssessmentType', nextRoute.params || {
        form: 'all',
      });
      return;
    }
    if (nextRoute.name === 'Onboarding') {
      props.navigation.replace('Onboarding');
      return;
    }
    resetRootToHomeStack(props.navigation, 'TabStack', { screen: 'Home' });
  };

  const handleAccept = async () => {
    if (!agreed) {
      showSuccessToast('Please accept Terms & Policies to continue', 'error');
      return;
    }
    if (accepting) return;
    setAccepting(true);
    try {
      await acceptPolicies({ type: 'all' });
      await Utils.storeData('_POLICY_ACCEPTED_CUSTOMER', true);
      showSuccessToast('Policies accepted', 'success');
      continueNext();
    } catch (e: any) {
      showSuccessToast(
        e?.message || 'Unable to accept policies right now',
        'error',
      );
    } finally {
      setAccepting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Terms & Policies" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
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
            <Text style={styles.intro}>
              Please review and accept Ayurmuni’s legal policies to continue.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => load()}>
                  <Text style={styles.retry}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.card}>
              {policies.map((item, index) => {
                const policy = getPolicyDoc(item);
                const updated = isPolicyVersionUpdated(item);
                return (
                  <React.Fragment key={policy?.id || String(index)}>
                    <TouchableOpacity
                      style={styles.row}
                      activeOpacity={0.75}
                      onPress={() => openPolicy(item)}
                    >
                      <View style={styles.iconBox}>
                        <TablerIcon
                          name="file-medical"
                          size={20}
                          color={Colors.primaryColor}
                        />
                      </View>
                      <View style={styles.textWrap}>
                        <Text style={styles.title}>
                          {policy?.title || policy?.name || 'Policy'}
                        </Text>
                        {!!policy?.subtitle && (
                          <Text style={styles.subtitle} numberOfLines={2}>
                            {policy.subtitle}
                          </Text>
                        )}
                        {updated ? (
                          <View style={styles.updateNote}>
                            <TablerIcon
                              name="alert-circle"
                              size={12}
                              color="#B45309"
                            />
                            <Text style={styles.updateNoteText}>
                              This policy has been updated — please review
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <TablerIcon
                        name="chevron-right"
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                    {index < policies.length - 1 ? (
                      <View style={styles.divider} />
                    ) : null}
                  </React.Fragment>
                );
              })}

              {!policies.length && !error ? (
                <Text style={styles.empty}>No policies available.</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.checkRow}
              activeOpacity={0.85}
              onPress={() => setAgreed(v => !v)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? (
                  <TablerIcon name="check" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.checkLabel}>
                I have read and agree to the Terms of Use, Privacy Policy, and
                other applicable policies listed above.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                (!agreed || accepting) && styles.acceptBtnDisabled,
              ]}
              activeOpacity={0.88}
              disabled={!agreed || accepting}
              onPress={handleAccept}
            >
              {accepting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptText}>Accept & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default PolicyAcceptScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#FDFDFB',
    flexGrow: 1,
  },
  intro: {
    marginTop: 14,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  updateNote: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  updateNoteText: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
  },
  divider: {
    height: 1,
    marginLeft: 62,
    backgroundColor: Colors.borderColor,
  },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  checkRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxOn: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  acceptBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnDisabled: { opacity: 0.55 },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  errorBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
  },
  retry: {
    marginTop: 6,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
