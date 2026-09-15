import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
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
import { navigateToMyCart } from '../../navigation/productNavigation';

const OrderStatus: React.FC = (props: any) => {
  const insets = useSafeAreaInsets();
  const {
    request,
    prescribedItems: routeItems,
    notes,
  } = props.route?.params || {};

  const [secondsLeft, setSecondsLeft] = useState(5);
  const approved = isPrescriptionApproved(request) || Boolean(routeItems?.length);

  const orderData = useMemo(() => {
    if (Array.isArray(routeItems) && routeItems.length > 0) return routeItems;
    return getPrescribedItems(request).map(mapPrescribedItem);
  }, [routeItems, request]);

  const total = useMemo(
    () =>
      orderData.reduce(
        (sum: number, item: any) => sum + (Number(item?.price) || 0),
        0,
      ),
    [orderData],
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    const redirect = setTimeout(() => {
      navigateToMyCart(props.navigation);
    }, 5000);
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [props.navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Order Status"
        onLeftPress={() => navigateToMyCart(props.navigation)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <LinearGradient
          colors={['#ECFDF5', '#F0FDFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.successCircle}>
            <TablerIcon name="approved" size={26} color={Colors.primaryColor} />
          </View>
          <Text style={styles.title}>
            {approved ? 'Prescription approved' : 'Request received'}
          </Text>
          <Text style={styles.subtitle}>
            {approved
              ? 'Your prescription is approved. Taking you to cart shortly.'
              : 'We received your request. Redirecting to cart shortly.'}
          </Text>
          <View style={styles.redirectChip}>
            <TablerIcon name="clock" size={12} color={Colors.primaryColor} />
            <Text style={styles.redirectText}>
              Opening cart in {secondsLeft}s
            </Text>
          </View>
        </LinearGradient>

        {(notes || request?.notes) ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesBody} numberOfLines={3}>
              {notes || request?.notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Request ID</Text>
              <Text style={styles.orderId}>
                #{String(request?.id || 'RX').slice(0, 10)}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <TablerIcon name="approved" size={12} color={Colors.primaryColor} />
              <Text style={styles.statusPillText}>
                {approved ? 'Approved' : 'Submitted'}
              </Text>
            </View>
          </View>

          <Text style={styles.summaryTitle}>Prescribed items</Text>
          {orderData.length === 0 ? (
            <Text style={styles.emptyText}>
              Items from your outsourced prescription will appear in cart after matching.
            </Text>
          ) : (
            <FlatList
              data={orderData}
              keyExtractor={(item: any) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }: any) => (
                <View style={styles.itemRow}>
                  <View style={styles.imageBox}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <TablerIcon
                        name="package"
                        size={18}
                        color={Colors.primaryColor}
                      />
                    )}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSub} numberOfLines={1}>
                      {item.desc || 'From outsourced prescription'}
                    </Text>
                  </View>
                  {item.price != null ? (
                    <RupeeAmount value={item.price} style={styles.price} />
                  ) : null}
                </View>
              )}
            />
          )}

          {total > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Estimated total</Text>
              <RupeeAmount value={total} style={styles.totalAmount} />
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigateToMyCart(props.navigation)}
        >
          <LinearGradient
            colors={['#0D614E', '#14937A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Go to cart now</Text>
            <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderStatus;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 14, paddingTop: 6 },
  hero: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CDEADF',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  successCircle: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsRegular,
    paddingHorizontal: 8,
  },
  redirectChip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  redirectText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 10,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  notesBody: {
    marginTop: 3,
    fontSize: 12,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 17,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 12,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orderId: {
    marginTop: 2,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  statusPillText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 17,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBox: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemCopy: { flex: 1, marginHorizontal: 8, minWidth: 0 },
  itemName: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 1,
  },
  price: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6EFEA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  primaryBtn: {
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
