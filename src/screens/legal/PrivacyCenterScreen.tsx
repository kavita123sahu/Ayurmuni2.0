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
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import {
  getPoliciesList,
  getRequiredPolicies,
} from '../../services/PolicyServices';

const PrivacyCenterScreen = (props: any) => {
  const navigation = props.navigation;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      // no policy_type → all policies
      const res = await getRequiredPolicies();
      console.log('[PrivacyCenter] policies response', res);
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
    const policy = item?.policy ?? item;
    navigation.navigate('PolicyDetail', {
      policyType: policy?.policy_type,
      title: policy?.title || policy?.name || 'Policy',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Privacy Center"
        onLeftPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
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
            Manage how Ayurmuni handles your personal and health information.
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
              const policy = item?.policy ?? item;
              return (
                <React.Fragment key={policy?.id || String(index)}>
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => openPolicy(item)}
                  >
                    <View style={styles.iconBox}>
                      <TablerIcon
                        name="shield"
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
                    </View>
                    <TablerIcon name="chevron-right" size={18} color="#9CA3AF" />
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PrivacyCenterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { backgroundColor: '#FDFDFB' },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  intro: {
    marginTop: 14,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  card: {
    backgroundColor: '#fff',
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
  divider: {
    height: 1,
    marginLeft: 62,
    backgroundColor: Colors.borderColor,
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  errorBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  retry: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
});
