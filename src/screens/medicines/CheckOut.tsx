import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  getPrescribedItems,
  isPrescriptionApproved,
  mapPrescribedItem,
} from '../../services/PrescriptionRequestService';
import { showSuccessToast } from '../../config/Key';

const MedicineCheckOut = (props: any) => {
  const insets = useSafeAreaInsets();
  const {
    request,
    prescribedItems: routeItems,
    notes,
    approved: routeApproved,
  } = props.route?.params || {};

  const [selectedSpeed, setSelectedSpeed] = useState<'standard' | 'express'>(
    'standard',
  );

  const approved = routeApproved || isPrescriptionApproved(request);

  useEffect(() => {
    if (!approved) {
      showSuccessToast(
        'Finalize order is available only after prescription is approved.',
        'error',
      );
      props.navigation.goBack();
    }
  }, [approved, props.navigation]);
  const orderData = useMemo(() => {
    if (Array.isArray(routeItems) && routeItems.length > 0) return routeItems;
    return getPrescribedItems(request).map(mapPrescribedItem);
  }, [routeItems, request]);

  const subtotal = useMemo(
    () =>
      orderData.reduce(
        (sum: number, item: any) => sum + (Number(item?.price) || 0),
        0,
      ),
    [orderData],
  );
  const deliveryFee = selectedSpeed === 'express' ? 9.99 : 0;
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Checkout"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 88 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>Finalize order</Text>
          <Text style={styles.count}>3 / 3</Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={['#0D614E', '#14937A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '100%' }]}
          />
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustChip}>
            <TablerIcon name="shield" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>Secure checkout</Text>
          </View>
          <View style={styles.trustChip}>
            <TablerIcon name="approved" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>
              {approved ? 'Rx approved' : 'Rx under review'}
            </Text>
          </View>
        </View>

        {(notes || request?.notes) ? (
          <View style={styles.notesBanner}>
            <TablerIcon name="file-medical" size={15} color={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notesTitle}>Prescription notes</Text>
              <Text style={styles.notesBody} numberOfLines={3}>
                {notes || request?.notes}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <TouchableOpacity onPress={() => props.navigation.navigate('MedicineScreen')}>
            <Text style={styles.link}>+ Add items</Text>
          </TouchableOpacity>
        </View>

        {approved ? (
          <Text style={styles.outsourceHint}>
            Items from your outsourced prescription
          </Text>
        ) : (
          <Text style={styles.outsourceHint}>
            Items will appear here once your prescription is approved.
          </Text>
        )}

        <View style={styles.summaryCard}>
          {orderData.length === 0 ? (
            <View style={styles.emptyBox}>
              <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
              <Text style={styles.emptyText}>
                Waiting for pharmacist to match medicines from your prescription.
              </Text>
            </View>
          ) : (
            <FlatList
              data={orderData}
              keyExtractor={(item: any) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }: any) => (
                <View style={styles.orderRow}>
                  <View style={styles.orderLeft}>
                    <View style={styles.smallIconBox}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.smallIcon} />
                      ) : (
                        <TablerIcon
                          name="package"
                          size={16}
                          color={Colors.primaryColor}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.medName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.medDesc} numberOfLines={1}>
                        {item.desc}
                      </Text>
                      {!!item.notes && (
                        <Text style={styles.itemNote} numberOfLines={1}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.price != null ? (
                    <RupeeAmount value={item.price} style={styles.price} />
                  ) : null}
                </View>
              )}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Delivery speed</Text>
        <View style={styles.speedRow}>
          <TouchableOpacity
            style={[
              styles.speedCard,
              selectedSpeed === 'standard' && styles.activeSpeed,
            ]}
            onPress={() => setSelectedSpeed('standard')}
          >
            <Text
              style={
                selectedSpeed === 'standard'
                  ? styles.speedTitleActive
                  : styles.speedTitle
              }
            >
              Standard
            </Text>
            <Text style={styles.speedDesc}>2–3 business days</Text>
            <Text style={styles.free}>Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.speedCard,
              selectedSpeed === 'express' && styles.activeSpeed,
            ]}
            onPress={() => setSelectedSpeed('express')}
          >
            <Text
              style={
                selectedSpeed === 'express'
                  ? styles.speedTitleActive
                  : styles.speedTitle
              }
            >
              Express
            </Text>
            <Text style={styles.speedDesc}>Within 24 hours</Text>
            <Text style={styles.price}>₹9.99</Text>
          </TouchableOpacity>
        </View>

        {orderData.length > 0 ? (
          <>
            <View style={styles.billRow}>
              <Text style={styles.billText}>Subtotal</Text>
              <RupeeAmount value={subtotal} style={styles.billprize} />
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billText}>Delivery fee</Text>
              <Text style={styles.free}>
                {selectedSpeed === 'standard' ? 'Free' : '₹9.99'}
              </Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.total}>Total amount</Text>
              <RupeeAmount value={total} style={styles.totalPrice} />
            </View>
          </>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={[styles.ctaWrap, { bottom: insets.bottom + 12 }]}
        onPress={() =>
          props.navigation.navigate('OrderStatus', {
            request,
            prescribedItems: orderData,
            notes: notes || request?.notes,
          })
        }
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkout}
        >
          <Text style={styles.checkoutText}>
            {approved && orderData.length > 0 ? 'Place order' : 'Track request'}
          </Text>
          <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MedicineCheckOut;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  count: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  progressBg: {
    height: 5,
    backgroundColor: '#0D614E22',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 8 },
  trustRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  trustText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  notesBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    padding: 10,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  notesBody: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
    lineHeight: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6,
  },
  link: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  outsourceHint: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 10,
    marginBottom: 10,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  emptyText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 16,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginRight: 8,
  },
  smallIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smallIcon: { width: '100%', height: '100%' },
  medName: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  medDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  itemNote: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 1,
  },
  price: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  speedRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  speedCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 10,
  },
  activeSpeed: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDF9',
  },
  speedTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#334155',
  },
  speedTitleActive: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  speedDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },
  free: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  billprize: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  total: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  totalPrice: {
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ctaWrap: { position: 'absolute', left: 14, right: 14 },
  checkout: {
    paddingVertical: 13,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
