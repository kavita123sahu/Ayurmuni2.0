import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import { useScrollHide } from '../context/ScrollHideContext';
import { TAB_BAR_BOTTOM_OFFSET } from '../constants/layout';

const { width } = Dimensions.get('window');
const scale = Math.min(width / 400, 1);

const TAB_HEIGHT = 64 * scale;
const INNER_SIZE = TAB_HEIGHT - 14;
const CONSULT_SIZE = 60 * scale;

const TAB_ICONS: Record<string, TablerIconName> = {
    Home: 'home',
    Products: 'package',
    Medicine: 'pill',
    Profile: 'user',
};

const CustomeTab = (props: any) => {
    const { state, navigation } = props;
    const insets = useSafeAreaInsets();
    const { tabBarAnimatedStyle } = useScrollHide();
    const stackNavigation = navigation.getParent?.() || navigation;
    const bottomInset = (insets.bottom || 0) + TAB_BAR_BOTTOM_OFFSET;

    const visibleRoutes = state.routes.filter(
        (route: any) => route.name !== 'Consult',
    );

    const isConsultActive = state.routes[state.index].name === 'Consult';

    return (
        <Animated.View
            style={[
                styles.wrapper,
                { bottom: bottomInset },
                tabBarAnimatedStyle,
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.container}>
                {visibleRoutes.map((route: any) => {
                    const isFocused =
                        state.index ===
                        state.routes.findIndex((r: any) => r.name === route.name);

                    const iconName = TAB_ICONS[route.name] ?? 'home';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconWrapper,
                                    isFocused && styles.activeWrapper,
                                ]}
                            >
                                <TablerIcon
                                    name={iconName}
                                    size={22}
                                    color={isFocused ? Colors.primaryColor : '#A0AAB3'}
                                />
                                <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.8}
                                    style={[
                                        styles.tabLabel,
                                        {
                                            color: isFocused ? Colors.primaryColor : '#A0AAB3',
                                            fontFamily: isFocused
                                                ? Fonts.PoppinsSemiBold
                                                : Fonts.PoppinsMedium,
                                        },
                                    ]}
                                >
                                    {route.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={() => stackNavigation.navigate('ConsultScreen')}
                activeOpacity={0.85}
                style={[
                    styles.consultBtn,
                    isConsultActive && { backgroundColor: Colors.primaryColor },
                ]}
            >
                <TablerIcon name="stethoscope" size={20} color="#fff" />
                <Text style={styles.consultLabel}>Consult</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default CustomeTab;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        zIndex: 100,
        elevation: 12,
    },
    container: {
        flex: 1,
        height: TAB_HEIGHT,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderWidth: 1,
        borderColor: 'rgba(230,236,240,0.95)',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        marginTop: 2,
        fontSize: 10,
        textAlign: 'center',
        width: '100%',
    },
    iconWrapper: {
        minWidth: 48,
        minHeight: 48,
        width: INNER_SIZE,
        height: INNER_SIZE,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },

    activeWrapper: {
        backgroundColor: 'rgba(13, 97, 78, 0.1)',
        borderRadius: 10,
    },
    consultBtn: {
        width: CONSULT_SIZE,
        height: CONSULT_SIZE,
        borderRadius: CONSULT_SIZE / 2,
        marginLeft: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: Colors.primaryColor,
        shadowOpacity: 0.22,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    consultLabel: {
        color: '#fff',
        fontSize: 9 * scale,
        marginTop: 2,
        fontFamily: Fonts.PoppinsMedium,
    },
});
