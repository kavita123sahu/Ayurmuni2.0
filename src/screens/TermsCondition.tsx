import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../common/Colors';

/**
 * Legacy entry point — redirects to PolicyDetail backed by
 * GET /policies/customer/required/?policy_type=...
 */
const TermsCondition = (props: any) => {
  const agreed = props?.route?.params?.agreed;
  const requireAccept = agreed === false;
  const policyType =
    props?.route?.params?.policyType ||
    (requireAccept ? 'terms_of_service' : 'privacy_policy');

  useEffect(() => {
    props.navigation.replace('PolicyDetail', {
      policyType,
      requireAccept,
      agreed,
      title:
        policyType === 'terms_of_service'
          ? 'Terms & Conditions'
          : policyType === 'privacy_policy'
            ? 'Privacy Policy'
            : undefined,
    });
  }, [agreed, policyType, props.navigation, requireAccept]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryColor} />
    </View>
  );
};

export default TermsCondition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F6',
  },
});
