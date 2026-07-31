import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { showSuccessToast } from '../../config/Key';
import { openRazorpayPayment } from '../../services/RazorpayService';
import * as _ORDER_SERVICES from '../../services/OrderService';
import BackIconButton from '../../components/BackIconButton';
import {
  buildPrepaidOrderPayload,
  getRazorpayPaymentMethod,
  getVerifiedOrderResult,
  isPrepaidVerifyAcceptable,
} from '../../utils/orderPayload';

type Props = {
  route: any;
  navigation: any;
};

const ProductRazorpayScreen = ({ route, navigation }: Props) => {
  const {
    cartItems = [],
    address = {},
    charges = {},
    customerInfo = {},
    totalAmount = 0,
  } = route?.params ?? {};

  const [loading, setLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const paymentStartedRef = useRef(false);

  const shippingFee = Number(charges.shipping_charges ?? 50);
  const codCharges = Number(charges.cod_charges ?? 0);

  const normalizedCartItems = useMemo(
    () =>
      (cartItems as any[]).map(item => ({
        ...item,
        id: item.id ?? item.cart_item_id,
        cart_item_id: item.cart_item_id ?? item.id,
        gift_wrap: Boolean(item.gift_wrap),
      })),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      normalizedCartItems.reduce(
        (sum: number, item: any) =>
          sum + Number(item.price) * Number(item.quantity),
        0,
      ),
    [normalizedCartItems],
  );

  const payableAmount = Number(totalAmount || subtotal + shippingFee);

  useFocusEffect(
    React.useCallback(() => {
      if (!isVerifyingPayment) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );

      return () => subscription.remove();
    }, [isVerifyingPayment]),
  );

  const handlePayment = async () => {
    if (loading || paymentStartedRef.current) {
      return;
    }

    if (!address?.id) {
      showSuccessToast('Delivery address is missing', 'error');
      return;
    }

    if (!normalizedCartItems.length) {
      showSuccessToast('Cart is empty', 'error');
      return;
    }

    try {
      setLoading(true);
      paymentStartedRef.current = true;

      // Complete prepaid payload — online always sends payment_method: "upi"
      const placePayload = buildPrepaidOrderPayload({
        delivery_address_id: address.id,
        cartItems: normalizedCartItems,
        shipping_charges: shippingFee,
        cod_charges: codCharges,
        prepaid_amount: Math.round(payableAmount),
        payment_method: 'upi',
      });
      console.log(
        'ORDER_PAYLOAD_PREPAID =>',
        JSON.stringify(placePayload, null, 2),
      );

      const orderResponse = await _ORDER_SERVICES.place_order_API(placePayload);

      if (!orderResponse?.success) {
        showSuccessToast(orderResponse?.message ?? 'Order failed', 'error');
        return;
      }

      const paymentData = orderResponse?.data;

      const contactNumber = String(
        customerInfo?.phone_number ??
          address?.phone_number ??
          address?.phone ??
          '',
      ).replace(/\D/g, '');

      const customerName =
        customerInfo?.first_name ??
        customerInfo?.full_name ??
        address?.name ??
        'AyurMuni Customer';

      await openRazorpayPayment({
        key: paymentData?.razorpay_key,
        amount: Number(paymentData?.amount ?? payableAmount) * 100,
        order_id: paymentData?.razorpay_order_id,
        name: customerName,
        email: customerInfo?.email ?? address?.email ?? 'customer@ayurmuni.com',
        contact: contactNumber
          ? `91${contactNumber.slice(-10)}`
          : '919999999999',
        description: 'Product Order Payment',
        themeColor: Colors.primaryColor,
      })
        .then(async (razorpayResult: any) => {
          setIsVerifyingPayment(true);

          console.log(
            'RAZORPAY_SUCCESS_EVENT =>',
            JSON.stringify(razorpayResult, null, 2),
          );

          // Method selected by user in Razorpay (upi / card / wallet / …)
          const paymentMethod =
            getRazorpayPaymentMethod(razorpayResult) || 'upi';

          const verifyBody: Record<string, any> = {
            payment_id: paymentData?.payment_id,
            razorpay_order_id: paymentData?.razorpay_order_id,
            razorpay_payment_id: razorpayResult?.razorpay_payment_id,
            razorpay_signature: razorpayResult?.razorpay_signature,
            payment_type: 'prepaid',
            payment_method: paymentMethod,
          };

          console.log('VERIFY_PAYLOAD =>', JSON.stringify(verifyBody, null, 2));

          let verifyResponse: any;
          try {
            verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(
              verifyBody,
            );
          } catch (verifyError: any) {
            verifyResponse =
              verifyError?.response ?? verifyError?.data ?? verifyError;
          }

          setIsVerifyingPayment(false);

          // Razorpay already charged — confirm even on Unicommerce/sync verify noise
          if (isPrepaidVerifyAcceptable(verifyResponse, razorpayResult)) {
            showSuccessToast('Payment Successful', 'success');
            navigation.replace('OrderConfirmation', {
              orderResult:
                getVerifiedOrderResult(verifyResponse) ?? {
                  ...paymentData,
                  razorpay_payment_id: razorpayResult?.razorpay_payment_id,
                  payment_status: 'paid',
                },
              orderedCartItems: normalizedCartItems.map((item: any) => ({
                id: item.id,
                cart_item_id: item.id ?? item.cart_item_id,
                variant_id: String(item.variant_id),
                quantity: Number(item.quantity),
                name: item.name,
                image: item.image,
                price: item.price,
                source: item.source,
              })),
            });
            return;
          }

          showSuccessToast(
            verifyResponse?.message ?? 'Payment verification failed',
            'error',
          );
        })
        .catch((error: any) => {
          setIsVerifyingPayment(false);
          paymentStartedRef.current = false;

          if (
            error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
            error?.description?.toLowerCase().includes('cancel') ||
            error?.description?.toLowerCase().includes('dismiss') ||
            error?.description?.toLowerCase().includes('exit')
          ) {
            showSuccessToast('Payment cancelled', 'error');
            navigation.goBack();
            return;
          }

          showSuccessToast('Payment Failed', 'error');
        });
    } catch {
      setIsVerifyingPayment(false);
      showSuccessToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
      paymentStartedRef.current = false;
    }
  };

  return (
    <>
      {!isVerifyingPayment && (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <View style={styles.header}>
            <BackIconButton
              disabled={loading || isVerifyingPayment}
              onPress={() => {
                if (!loading && !isVerifyingPayment) {
                  navigation.goBack();
                }
              }}
            />
            <Text style={styles.headerTitle}>Confirm Order</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivery address</Text>
              <Text style={styles.valueText}>
                {[
                  address?.address_line_1,
                  address?.address_line_2,
                  address?.city,
                  address?.zipcode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.cardTitle}>Order items</Text>
              {cartItems.map((item: any) => (
                <View key={String(item.variant_id ?? item.id)} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name ?? 'Product'} × {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{Math.round(Number(item.price) * Number(item.quantity))}
                  </Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.valueText}>₹ {Math.round(subtotal)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Shipping</Text>
                <Text style={styles.valueText}>₹ {shippingFee}</Text>
              </View>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.amountRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹ {Math.round(payableAmount)}</Text>
              </View>

              <View style={styles.paymentInfo}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={Colors.primaryColor}
                />
                <Text style={styles.paymentInfoText}>
                  Secure payment powered by Razorpay
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={loading}
                onPress={handlePayment}
                style={[styles.payButton, loading && { opacity: 0.7 }]}
              >
                {loading ? (
                  <View style={styles.loaderRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.payText}>Processing Payment...</Text>
                  </View>
                ) : (
                  <View style={styles.loaderRow}>
                    <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.payText}>Pay Now</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelText}>Cancel Payment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}

      <Modal
        visible={isVerifyingPayment}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <SafeAreaView style={styles.verificationScreen}>
          <View style={styles.verificationContent}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.verificationTitle}>Verifying Payment</Text>
            <Text style={styles.verificationSubtitle}>
              Payment is being verified.{'\n'}
              Please do not press back or close the app.{'\n'}
              This may take a few seconds.
            </Text>
            <View style={styles.verificationInfo}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={Colors.primaryColor}
              />
              <Text style={styles.verificationInfoText}>
                Do not press back or close the app
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ProductRazorpayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  itemPrice: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  totalAmount: {
    fontSize: 28,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  paymentInfoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  payButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cancelButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  verificationScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  verificationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  verificationTitle: {
    marginTop: 24,
    fontSize: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  verificationSubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Fonts.PoppinsRegular,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  verificationInfoText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
});
