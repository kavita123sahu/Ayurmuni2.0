import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { usePlaceOrder } from '../../hooks/UsePlaceOrder';
import { useProductOnlinePayment } from '../../hooks/useProductOnlinePayment';
import TablerIcon from '../../components/TablerIcon';
import { showSuccessToast } from '../../config/Key';
import { resolveImageUri, resolveProductImageUri } from '../../utils/imageUtils';
import { resolveCartItemImage } from '../../common/DataInterface';
import { isOrderVerifySuccessful } from '../../utils/orderPayload';
import {
    isCodAvailableForItems,
    resolvePayOnDelivery,
} from '../../utils/payOnDeliveryUtils';
import { formatRupee, RupeeAmount } from '../../utils/currencyUtils';
import CouponApplyCard from '../../components/CouponApplyCard';
import { useCheckoutCoupons } from '../../hooks/useCheckoutCoupons';

type PaymentMethod = 'cod' | 'online';

const SummaryRow = ({
    label,
    value,
    emphasize,
    success,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
    success?: boolean;
}) => (
    <View style={styles.summaryRow}>
        <Text
            style={[
                styles.summaryLabel,
                emphasize && styles.summaryLabelStrong,
                success && styles.summarySuccess,
            ]}
        >
            {label}
        </Text>
        <Text
            style={[
                styles.summaryValue,
                emphasize && styles.summaryValueStrong,
                success && styles.summarySuccess,
            ]}
        >
            {value}
        </Text>
    </View>
);

const Checkout: React.FC = (props: any) => {
    const { selectedProducts = [] } = props.route.params ?? {};
    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 8);

    const [deliveryMethod] = useState('standard');
    const [billExpanded, setBillExpanded] = useState(false);

    const codAvailable = useMemo(
        () => isCodAvailableForItems(selectedProducts),
        [selectedProducts],
    );

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
        isCodAvailableForItems(selectedProducts) ? 'cod' : 'online',
    );

    useEffect(() => {
        if (!codAvailable && selectedMethod === 'cod') {
            setSelectedMethod('online');
        }
    }, [codAvailable, selectedMethod]);

    const { customerData } = useCustomerProfile({ refreshOnFocus: true });
    const { isPlacing, orderError, placeOrder } = usePlaceOrder();
    const { isPaying, isVerifyingPayment, payOnline } = useProductOnlinePayment();

    const defaultAddress =
        customerData?.addresses?.find((item: any) => item?.is_default) || null;

    const cartItems = useMemo(
        () =>
            selectedProducts.map((item: any) => ({
                id: item.id,
                cart_item_id: item.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image:
                    resolveImageUri(item.image) ||
                    resolveCartItemImage(item) ||
                    resolveProductImageUri(item),
                discount: item.discount ?? 0,
                source: item.source,
                gift_wrap: Boolean(item.gift_wrap),
                pay_on_delivery: resolvePayOnDelivery(item),
            })),
        [selectedProducts],
    );

    const shippingFee = 0;
    const codChargeDefault = 0;

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum: number, item: any) =>
                    sum + Number(item.price) * Number(item.quantity),
                0,
            ),
        [cartItems],
    );

    const codFee = selectedMethod === 'cod' ? codChargeDefault : 0;

    const {
        coupons,
        loading: couponsLoading,
        applied: appliedCoupon,
        error: couponError,
        discount: couponDiscount,
        applyCode,
        remove: removeCoupon,
    } = useCheckoutCoupons('product', subtotal);

    const total = Math.max(0, subtotal + shippingFee + codFee - couponDiscount);
    const isFreeShip = shippingFee === 0;
    const isLoading = isPlacing || isPaying;

    const itemUnits = useMemo(
        () =>
            cartItems.reduce(
                (sum: number, item: any) => sum + (Number(item.quantity) || 0),
                0,
            ),
        [cartItems],
    );

    const addressLine = useMemo(() => {
        if (!defaultAddress) return '';
        return [
            defaultAddress?.address_line_1,
            defaultAddress?.address_line_2,
            defaultAddress?.city,
            defaultAddress?.state,
            defaultAddress?.zipcode || defaultAddress?.pincode,
        ]
            .filter(Boolean)
            .join(', ');
    }, [defaultAddress]);

    const isCouponOrderError = (message?: string) => {
        const msg = String(message || '').toLowerCase();
        return (
            msg.includes('coupon') ||
            msg.includes('matching product') ||
            msg.includes('does not apply')
        );
    };

    const handleCOD = async () => {
        if (!codAvailable) {
            showSuccessToast('COD is disabled for this order', 'error');
            return;
        }
        if (!defaultAddress?.id) {
            showSuccessToast('Please select a delivery address', 'error');
            return;
        }

        const result = await placeOrder(cartItems, {
            delivery_address_id: defaultAddress.id,
            shipping_charges: shippingFee,
            cod_charges: codChargeDefault,
            payment_type: 'cod',
            payment_method: 'cash',
            shipping_method: deliveryMethod === 'express' ? 'EXPRESS' : 'STD',
            prepaid_amount: Math.round(total),
            coupon_code: appliedCoupon?.code,
        });

        if (isOrderVerifySuccessful(result)) {
            props.navigation.replace('OrderConfirmation', {
                orderResult: result?.data?.order ?? result?.data,
                orderedCartItems: cartItems.map((item: any) => ({
                    id: item.id,
                    cart_item_id: item.id,
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

        const failMsg = result?.message ?? orderError ?? 'Order failed';
        if (isCouponOrderError(failMsg) && appliedCoupon) {
            removeCoupon();
            showSuccessToast(
                'This coupon does not apply to items in your cart. Coupon removed — try placing the order again.',
                'error',
            );
            return;
        }

        showSuccessToast(failMsg, 'error');
    };

    const handleOnline = async () => {
        await payOnline({
            cartItems,
            address: defaultAddress,
            customerInfo: customerData ?? {},
            shippingFee,
            codCharges: 0,
            shippingMethod: deliveryMethod === 'express' ? 'EXPRESS' : 'STD',
            coupon_code: appliedCoupon?.code,
            prepaidAmount: Math.round(total),
            onCouponRejected: () => {
                removeCoupon();
            },
            onSuccess: (orderResult, orderedCartItems) => {
                props.navigation.replace('OrderConfirmation', {
                    orderResult,
                    orderedCartItems: (orderedCartItems || cartItems).map(
                        (item: any) => ({
                            id: item.id,
                            cart_item_id: item.id ?? item.cart_item_id,
                            variant_id: String(item.variant_id),
                            quantity: Number(item.quantity),
                            name: item.name,
                            image:
                                item.image ||
                                resolveProductImageUri(item) ||
                                '',
                            price: item.price,
                            source: item.source,
                        }),
                    ),
                });
            },
        });
    };

    const handlePlaceOrder = () => {
        if (!defaultAddress?.id) {
            showSuccessToast(
                'Please add a delivery address before checkout',
                'error',
            );
            return;
        }

        if (selectedMethod === 'cod') {
            if (!codAvailable) {
                showSuccessToast('COD is disabled for this order', 'error');
                return;
            }
            handleCOD();
        } else {
            handleOnline();
        }
    };

    const openProductDetails = (variantId: string) => {
        if (!variantId) return;
        props.navigation.navigate('ProductDetails', { varientID: variantId });
    };

    const openAddress = () => {
        props.navigation.navigate('ManageAdrees', { returnTo: 'Checkout' });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Checkout"
                onLeftPress={() => props.navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Delivery address — Blinkit style */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.addressCard}
                    onPress={openAddress}
                >
                    {defaultAddress ? (
                        <>
                            <View
                                style={[
                                    styles.addressIcon,
                                    { backgroundColor: '#EAF8F4' },
                                ]}
                            >
                                <TablerIcon
                                    name="map-pin"
                                    size={16}
                                    color={Colors.primaryColor}
                                />
                            </View>
                            <View style={styles.addressBody}>
                                <View style={styles.addressTop}>
                                    <Text style={styles.deliverTo}>
                                        Deliver to
                                    </Text>
                                    <View style={styles.homePill}>
                                        <Text style={styles.homePillText}>
                                            {defaultAddress?.address_type ||
                                                'Home'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {addressLine}
                                </Text>
                            </View>
                            <View style={styles.changeWrap}>
                                <Text style={styles.changeText}>Change</Text>
                                <TablerIcon
                                    name="chevron-right"
                                    size={14}
                                    color={Colors.primaryColor}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View
                                style={[
                                    styles.addressIcon,
                                    { backgroundColor: '#FEF3C7' },
                                ]}
                            >
                                <TablerIcon
                                    name="map-pin"
                                    size={16}
                                    color="#B45309"
                                />
                            </View>
                            <View style={styles.addressBody}>
                                <Text style={styles.emptyTitle}>
                                    Add delivery address
                                </Text>
                                <Text style={styles.emptySub}>
                                    Required to place your order
                                </Text>
                            </View>
                            <View style={styles.addPill}>
                                <Text style={styles.addPillText}>Add</Text>
                            </View>
                        </>
                    )}
                </TouchableOpacity>

                {/* Items strip */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View
                                style={[
                                    styles.sectionIcon,
                                    { backgroundColor: '#EEF2FF' },
                                ]}
                            >
                                <TablerIcon
                                    name="package"
                                    size={14}
                                    color="#4F46E5"
                                />
                            </View>
                            <Text style={styles.cardTitle}>
                                {itemUnits}{' '}
                                {itemUnits === 1 ? 'item' : 'items'} in order
                            </Text>
                        </View>
                    </View>

                    {cartItems.map((item: any) => (
                        <TouchableOpacity
                            key={item.id ?? item.variant_id}
                            style={styles.itemRow}
                            activeOpacity={0.85}
                            onPress={() =>
                                openProductDetails(String(item.variant_id))
                            }
                        >
                            {item.image ? (
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.itemImage}
                                />
                            ) : (
                                <View style={styles.itemImagePlaceholder}>
                                    <TablerIcon
                                        name="package"
                                        size={18}
                                        color="#94A3B8"
                                    />
                                </View>
                            )}
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text style={styles.itemQty}>
                                    Qty {item.quantity}
                                </Text>
                            </View>
                            <RupeeAmount
                                value={Math.round(
                                    Number(item.price) * Number(item.quantity),
                                )}
                                style={styles.itemPrice}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payment — compact chips */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View
                                style={[
                                    styles.sectionIcon,
                                    { backgroundColor: '#ECFDF5' },
                                ]}
                            >
                                <TablerIcon
                                    name="wallet"
                                    size={14}
                                    color="#15803D"
                                />
                            </View>
                            <Text style={styles.cardTitle}>Payment method</Text>
                        </View>
                    </View>

                    <View style={styles.payRow}>
                        <TouchableOpacity
                            style={[
                                styles.payChip,
                                selectedMethod === 'online' &&
                                    styles.payChipActive,
                            ]}
                            onPress={() => setSelectedMethod('online')}
                            activeOpacity={0.85}
                        >
                            <TablerIcon
                                name="credit-card"
                                size={16}
                                color={
                                    selectedMethod === 'online'
                                        ? Colors.primaryColor
                                        : '#64748B'
                                }
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.payChipTitle,
                                        selectedMethod === 'online' &&
                                            styles.payChipTitleActive,
                                    ]}
                                >
                                    Pay online
                                </Text>
                                <Text style={styles.payChipSub}>
                                    UPI · Card · Wallet
                                </Text>
                            </View>
                            {selectedMethod === 'online' ? (
                                <View style={styles.checkDot}>
                                    <TablerIcon
                                        name="check"
                                        size={12}
                                        color="#FFF"
                                    />
                                </View>
                            ) : null}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.payChip,
                                selectedMethod === 'cod' && styles.payChipActive,
                                !codAvailable && styles.payChipDisabled,
                            ]}
                            onPress={() => {
                                if (!codAvailable) return;
                                setSelectedMethod('cod');
                            }}
                            disabled={!codAvailable}
                            activeOpacity={codAvailable ? 0.85 : 1}
                        >
                            <TablerIcon
                                name="cash"
                                size={16}
                                color={
                                    !codAvailable
                                        ? '#94A3B8'
                                        : selectedMethod === 'cod'
                                          ? Colors.primaryColor
                                          : '#64748B'
                                }
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.payChipTitle,
                                        selectedMethod === 'cod' &&
                                            styles.payChipTitleActive,
                                        !codAvailable && styles.payChipMuted,
                                    ]}
                                >
                                    Cash on delivery
                                </Text>
                                <Text style={styles.payChipSub}>
                                    {codAvailable
                                        ? 'Pay when delivered'
                                        : 'Not available'}
                                </Text>
                            </View>
                            {selectedMethod === 'cod' && codAvailable ? (
                                <View style={styles.checkDot}>
                                    <TablerIcon
                                        name="check"
                                        size={12}
                                        color="#FFF"
                                    />
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    </View>

                    {selectedMethod === 'online' ? (
                        <View style={styles.onlineHint}>
                            <TablerIcon
                                name="bolt"
                                size={13}
                                color="#15803D"
                            />
                            <Text style={styles.onlineHintText}>
                                Instant confirmation · Secure Razorpay checkout
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Coupons */}
                <View style={styles.card}>
                    <CouponApplyCard
                        coupons={coupons}
                        loading={couponsLoading}
                        applied={appliedCoupon}
                        discount={couponDiscount}
                        error={couponError}
                        checkoutScope="product"
                        onApply={applyCode}
                        onRemove={removeCoupon}
                    />
                </View>

                {/* Bill summary */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.cardHeader}
                        activeOpacity={0.8}
                        onPress={() => setBillExpanded(v => !v)}
                    >
                        <View style={styles.cardHeaderLeft}>
                            <View
                                style={[
                                    styles.sectionIcon,
                                    { backgroundColor: '#FEF3C7' },
                                ]}
                            >
                                <TablerIcon
                                    name="receipt"
                                    size={14}
                                    color="#B45309"
                                />
                            </View>
                            <Text style={styles.cardTitle}>Bill details</Text>
                        </View>
                        <TablerIcon
                            name={billExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>

                    {billExpanded ? (
                        <>
                            <SummaryRow
                                label="Item total"
                                value={formatRupee(Math.round(subtotal))}
                            />
                            <SummaryRow
                                label="Delivery"
                                value={
                                    isFreeShip
                                        ? 'FREE'
                                        : formatRupee(shippingFee)
                                }
                                success={isFreeShip}
                            />
                            {selectedMethod === 'cod' ? (
                                <SummaryRow
                                    label="COD charges"
                                    value={formatRupee(codFee)}
                                />
                            ) : null}
                            {couponDiscount > 0 ? (
                                <SummaryRow
                                    label={`Coupon (${appliedCoupon?.code || ''})`}
                                    value={`− ${formatRupee(couponDiscount)}`}
                                    success
                                />
                            ) : null}
                            <View style={styles.billDivider} />
                        </>
                    ) : null}

                    <LinearGradient
                        colors={['#ECFDF5', '#D1FAE5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.totalStrip}
                    >
                        <Text style={styles.totalStripLabel}>
                            Grand total
                        </Text>
                        <RupeeAmount
                            value={Math.round(total)}
                            style={styles.totalStripValue}
                            iconSize={15}
                            iconColor={Colors.primaryColor}
                        />
                    </LinearGradient>
                </View>

                {/* Trust */}
                <View style={styles.trustStrip}>
                    <View style={styles.trustItem}>
                        <TablerIcon
                            name="shield"
                            size={14}
                            color={Colors.primaryColor}
                        />
                        <Text style={styles.trustText}>Secure</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <TablerIcon name="truck" size={14} color="#0369A1" />
                        <Text style={styles.trustText}>Fast delivery</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <TablerIcon name="leaf" size={14} color="#15803D" />
                        <Text style={styles.trustText}>Genuine</Text>
                    </View>
                </View>

                {!!orderError ? (
                    <View style={styles.errorBox}>
                        <TablerIcon
                            name="alert-circle"
                            size={16}
                            color="#B91C1C"
                        />
                        <Text style={styles.errorText}>{orderError}</Text>
                    </View>
                ) : null}

                <View style={{ height: 108 }} />
            </ScrollView>

            {/* Sticky CTA */}
            <View
                style={[styles.stickyBar, { paddingBottom: footerBottomPad }]}
            >
                <View style={styles.stickyRow}>
                    <View style={styles.stickyPriceBox}>
                        <RupeeAmount
                            value={Math.round(total)}
                            style={styles.stickyPrice}
                            iconSize={16}
                            iconColor={Colors.primaryColor}
                        />
                        <Text style={styles.stickyHint}>
                            {selectedMethod === 'cod'
                                ? 'Pay on delivery'
                                : 'Pay now'}
                            {' · '}
                            {itemUnits} {itemUnits === 1 ? 'item' : 'items'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={isLoading}
                        onPress={handlePlaceOrder}
                        style={styles.primaryBtnWrap}
                    >
                        <LinearGradient
                            colors={
                                isLoading
                                    ? ['#6c9180', '#6c9180']
                                    : ['#0D614E', '#14937A']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryBtn}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color="#FFFFFF"
                                    size="small"
                                />
                            ) : (
                                <>
                                    <Text style={styles.primaryBtnText}>
                                        {selectedMethod === 'cod'
                                            ? 'Place order'
                                            : 'Pay now'}
                                    </Text>
                                    <TablerIcon
                                        name="arrow-right"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={isVerifyingPayment}
                transparent={false}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <SafeAreaView style={styles.verificationScreen}>
                    <View style={styles.verificationContent}>
                        <ActivityIndicator
                            size="large"
                            color={Colors.primaryColor}
                        />
                        <Text style={styles.verificationTitle}>
                            Verifying Payment
                        </Text>
                        <Text style={styles.verificationSubtitle}>
                            Payment is being verified.{'\n'}
                            Please do not press back or close the app.{'\n'}
                            This may take a few seconds.
                        </Text>
                        <View style={styles.verificationInfo}>
                            <TablerIcon
                                name="shield"
                                size={16}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.verificationInfoText}>
                                Do not press back or close the app
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default Checkout;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },
    content: {
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 8,
    },

    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
        marginBottom: 8,
    },
    addressIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressBody: {
        flex: 1,
        minWidth: 0,
    },
    addressTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    deliverTo: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    homePill: {
        backgroundColor: '#ECF8F3',
        paddingHorizontal: 7,
        paddingVertical: 1,
        borderRadius: 4,
    },
    homePillText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    addressText: {
        fontSize: 12,
        lineHeight: 17,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A',
    },
    changeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    changeText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    emptyTitle: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    emptySub: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    addPill: {
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addPillText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
        marginBottom: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#F1F5F9',
    },
    itemImage: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
    },
    itemImagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
        minWidth: 0,
    },
    itemName: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 16,
    },
    itemQty: {
        marginTop: 2,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    itemPrice: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    payRow: {
        gap: 8,
    },
    payChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    payChipActive: {
        backgroundColor: '#ECF8F3',
        borderColor: Colors.primaryColor,
    },
    payChipDisabled: {
        opacity: 0.55,
    },
    payChipTitle: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
        includeFontPadding: false,
    },
    payChipTitleActive: {
        color: Colors.primaryColor,
    },
    payChipMuted: {
        color: '#94A3B8',
    },
    payChipSub: {
        marginTop: 1,
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },
    checkDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineHint: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    onlineHintText: {
        flex: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#15803D',
    },

    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    summaryLabel: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    summaryLabelStrong: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    summaryValue: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    summaryValueStrong: {
        fontSize: 15,
        color: Colors.primaryColor,
    },
    summarySuccess: {
        color: '#15803D',
    },
    billDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E8F0',
        marginVertical: 6,
    },
    totalStrip: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    totalStripLabel: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#14532D',
    },
    totalStripValue: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },

    trustStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
        marginBottom: 8,
    },
    trustItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    trustDivider: {
        width: StyleSheet.hairlineWidth,
        height: 18,
        backgroundColor: '#E2E8F0',
    },
    trustText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#475569',
    },

    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginBottom: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#B91C1C',
        lineHeight: 17,
    },

    stickyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E8F2EE',
        paddingTop: 8,
        paddingHorizontal: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    stickyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stickyPriceBox: {
        minWidth: 100,
    },
    stickyPrice: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    stickyHint: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },
    primaryBtnWrap: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryBtn: {
        minHeight: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 14,
    },
    primaryBtnText: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },

    verificationScreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    verificationContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    verificationTitle: {
        marginTop: 20,
        fontSize: 20,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    verificationSubtitle: {
        marginTop: 8,
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: Fonts.PoppinsRegular,
    },
    verificationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 22,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F5F8F6',
        gap: 8,
    },
    verificationInfoText: {
        color: '#475569',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },
});
