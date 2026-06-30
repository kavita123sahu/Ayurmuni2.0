import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Animated,
    FlatList,
    Platform,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, SimpleLineIcons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Utils } from '../../common/Utils';
import { showSuccessToast } from '../../config/Key';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
const { width: SW } = Dimensions.get('window');

/* ============================================================
   LUXURY THEME v2 — anchored to #0D614E
   Ivory ground, deep emerald + saturated antique-gold accent.
   Signature device: a 2px gold hairline "seal" rule on every card
   (top edge gradient + corner notch) instead of drop-shadow elevation.
   Flat surfaces, tight spacing scale (4/8/12/16/24 only).
   ============================================================ */

const C = {
    primary: '#0D614E',       // core brand green
    primaryDeep: '#073B2E',   // deepest green — splash/CTA gradient + dark text accents
    primaryLight: '#1C8268',  // lighter green for gradient glow
    primarySoft: '#E6EFEA',   // pale green tint for chips/pillars

    gold: '#C19A4B',          // richer, more saturated antique gold — THE signature accent
    goldBright: '#E0B768',    // hairline/rule highlight, used sparingly
    goldSoft: '#F6EEDA',
    goldDeep: '#8A6A2E',

    ivory: '#FAF7F0',         // base page background
    card: '#FFFFFF',          // flat card surface, no shadow
    cardBorder: '#E7E0D2',    // crisp 1px hairline border

    ink: '#15201A',           // primary text
    inkMuted: '#56615A',      // secondary text
    inkFaint: '#8B9189',      // tertiary text

    white: '#FFFFFF',

    // Dosha identity colors — distinct, but pulled into the same warm,
    // muted-luxury register rather than bright/neon.
    vata: '#3C7390',          // muted slate blue
    pitta: '#C19A4B',         // gold — fire/transformation
    kapha: '#62815A',         // deep sage
};

// Flat by default — luxury reads through hairline + gold seal, not elevation.
const FLAT = {
    borderWidth: 1,
    borderColor: C.cardBorder,
};

// Tight, consistent spacing scale — used instead of ad hoc margin/padding values.
const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

const SCREENS = [
    { id: 'splash', type: 'splash', tagline: 'The complete knowledge of life — how to live, remain healthy, and prevent suffering.', bgGradient: [C.primaryDeep, C.primary, C.primaryLight] },
    { id: 'what', type: 'info', items: [{ num: '1', title: 'Āyu (आयु)', desc: 'Not just "lifespan" — it means Quality of Living, not merely surviving.' }, { num: '2', title: 'Veda (वेद)', desc: 'Applied wisdom — science that can be practiced. Systematic, experiential knowledge that sustains life.' }], quote: '"The complete knowledge of life — how to live, how to remain healthy, and how to prevent suffering."', bgGradient: [C.ivory, C.ivory] },
    { id: 'strategy', type: 'strategy', shloka: ['स्वस्थस्य स्वास्थ्य रक्षणं आतुरस्य विकार प्रशमनं च॥'], shlokaTrans: 'Protect the health of the healthy · Alleviate disease in the diseased', goals: [{ icon: Images.tick, title: 'Prevention', subtitle: "Maintain health before disease arises", color: C.primary }, { icon: Images.clock, title: 'Healing', subtitle: 'Alleviate suffering in the diseased', color: C.primary }], pillars: [{ name: 'Mind', subtitle: "Right Thinking", icon: 'brain', color: C.primary }, { name: 'Diet', icon: 'brain', subtitle: "Seasonal Food", color: C.primary }, { name: 'LifeStyle ', subtitle: "Daily Rhythm", icon: 'brain', color: C.primary }, { name: 'Herbs', subtitle: "Herbal Medicine", icon: 'brain', color: C.primary }], bgGradient: [C.ivory, C.ivory] },
    { id: 'doshas', type: 'doshas', doshas: [{ name: 'Vāta', element: 'Air · Space', subtitle: 'Energy of movement — governs breathing, muscle movement, heart pulsation, and all cellular motion.', color: C.vata, icon: 'weather-windy', qualities: ['Creative', 'Flexibility'], status: 'Kinetic' }, { name: 'Pitta', element: 'Fire · Water', subtitle: 'Energy of transformation — governs digestion, metabolism, body temperature, and assimilation.', color: C.pitta, icon: 'fire', qualities: ['Intelligent', 'Understanding'], status: 'Thermal' }, { name: 'Kapha', element: 'Earth · Water', subtitle: 'Energy of structure — governs all bodily fluids, lubricates joints, maintains immunity and cellular structure.', color: C.kapha, icon: 'water', qualities: ['Love', 'Calmness'], status: 'Potential' }], bgGradient: [C.ivory, C.ivory] },
    { id: 'vata', type: 'doshaDetail', dosha: 'Vāta', element: 'Air · Space', subtitle: 'Governs breathing, movement, and every nerve impulse in the body.', physic: 'Like Kinetic Energy — the energy of movement itself.', governs: ['Breathing', 'Blinking', 'Heart pulsation', 'Muscle movement', 'Cell membranes', 'Nerve impulses'], balance: ['Creative', 'Adaptability', 'Flexibility'], imbalance: ['Fear', 'Restlessness', 'Anxiety'], color: C.vata, bgGradient: [C.ivory, C.ivory] },
    { id: 'pitta', type: 'doshaDetail', dosha: 'Pitta', element: 'Fire · Water', subtitle: 'Governs digestion, metabolism, and how the body transforms everything it takes in.', physic: 'Like Thermal Energy — the energy of transformation and heat.', governs: ['Digestion', 'Metabolism', 'Absorption', 'Body temperature', 'Assimilation', 'Nutrition'], balance: ['Intelligent', 'Courage', 'Understanding'], imbalance: ['Anger', 'Jealousy', 'Hatred'], color: C.pitta, bgGradient: [C.ivory, C.ivory] },
    { id: 'kapha', type: 'doshaDetail', dosha: 'Kapha', element: 'Earth · Water', subtitle: 'Forms the body\'s structure — the glue that holds every cell together.', physic: 'Like Potential Energy — stored energy, the foundation of all structure.', governs: ['Bodily fluids', 'Joint lubrication', 'Skin moisture', 'Immunity', 'Bones & muscles', 'Cellular glue'], balance: ['Love', 'Calmness', 'Forgiveness'], imbalance: ['Attachment', 'Greed', 'Envy'], color: C.kapha, bgGradient: [C.ivory, C.ivory] },
    { id: 'journey', type: 'cta', titleAccent: 'discover you?', desc: 'Find your unique Prakriti', cta1: 'Discover Your Prakriti', bgGradient: [C.primaryDeep, C.primary, C.primaryLight] },
];

// ---- Signature element ----------------------------------------------------
// A thin gold "seal" rule across the top edge of a card, plus a small notch
// at the corner — a manuscript-border motif used in place of drop shadows.
// Reused on every flat card so the gold accent reads as one consistent
// signature rather than scattered decoration.
const GoldSeal = ({ color = C.gold }: { color?: string }) => (
    <View style={styles.goldSealWrap} pointerEvents="none">
        <LinearGradient
            colors={['transparent', color, color, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.goldSealLine}
        />
    </View>
);

// Pressable wrapper that gives every card a subtle, premium press-response
// (scale + opacity) — small but reads as "interactive" rather than static.
const PressableCard = ({ style, children, onPress }: any) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
    return (
        <Animated.View style={[{ transform: [{ scale }] }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
                <View style={style}>{children}</View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Splash Screen Component - NO HOOKS inside render
const SplashScreen = ({ data }: any) => {
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 10000, useNativeDriver: true })
        ).start();
    }, []);

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <LinearGradient colors={data.bgGradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.splashContent}>
                <Animated.View style={[styles.mandala, { transform: [{ rotate: spin }] }]}>
                    <View style={styles.mandalaOuter}><View style={styles.mandalaInner}><Text style={styles.mandalaCenter}><Image source={Images.FinalLogo} style={{ height: 40, width: 40 }} /></Text></View></View>
                </Animated.View>
                <Text style={styles.overText}>Ancient Wisdom · Modern Life</Text>
                <Text style={styles.splashTitle}>Āyurveda</Text>
                <Text style={styles.splashSubtitle}>for You</Text>
                <View style={styles.goldRule} />
                <Text style={styles.splashTagline}>{data.tagline}</Text>
                <View style={styles.doshaPills}>
                    {['Vāta', 'Pitta', 'Kapha'].map((d, i) => (
                        <View key={d} style={[styles.pill, { borderColor: 'rgba(224,183,104,0.4)' }]}>
                            <View style={[styles.pillDot, { backgroundColor: [C.vata, C.goldBright, C.kapha][i] }]} />
                            <Text style={styles.pillName}>{d}</Text>
                            <Text style={styles.pillElem}>{['Air', 'Fire', 'Earth'][i]}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
};

const renderBoldText = (text: string) => {
    const highlights = ["Applied wisdom", "Quality of Living"];

    let parts: any[] = [text];

    highlights.forEach((word) => {
        parts = parts.flatMap((part) =>
            typeof part === "string"
                ? part.split(new RegExp(`(${word})`, "gi"))
                : part
        );
    });

    return parts.map((part, index) => {
        const isBold = highlights.some(
            (word) => part.toLowerCase() === word.toLowerCase()
        );

        return (
            <Text key={index} style={isBold ? styles.boldText : styles.infoDesc}>
                {part}
            </Text>
        );
    });
};

// Info Screen
const InfoScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            <Text style={styles.chip}>Module 01</Text>
            <Text style={styles.sectionTitle}>Decoding <Text style={styles.sectionTitleAccent}>Āyurveda</Text></Text>
            <View style={[styles.infoCard, FLAT]}>
                <GoldSeal />
                {data.items.map((item: any, idx: number) => (
                    <React.Fragment key={idx}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoNum}><Text style={styles.infoNumText}>{item.num}</Text></View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>{item.title}</Text>
                                <Text style={styles.infoDesc}>{renderBoldText(item.desc)}</Text>
                            </View>
                        </View>
                        {idx < data.items.length - 1 && <View style={styles.infoDivider} />}
                    </React.Fragment>
                ))}
            </View>
            <View style={[styles.quoteBox, FLAT]}>
                <Text style={styles.quoteLabel}>Definition</Text>
                <Text style={styles.quoteText}>{data.quote}</Text>
            </View>
        </SafeAreaView>
    </LinearGradient>
);



// Strategy Screen
const StrategyScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            {/* <Text style={styles.chip}>Module 02</Text> */}
            <Text style={styles.sectionTitle}>The <Text style={styles.sectionTitleAccent}>Strategy</Text></Text>
            <View style={styles.shlokaBox}>
                <Text style={styles.shlokaText}> स्वस्थस्य स्वास्थ्य रक्षणं,{"\n"}आतुरस्य विकार प्रशमनं च॥</Text>
                <Text style={styles.shlokaTrans}>{data.shlokaTrans}</Text>
            </View>
            <View style={styles.goalGrid}>
                {data.goals.map((goal: any, idx: number) => (
                    <View key={idx} style={styles.goalCard}>
                        <View style={[styles.goalIconWrap, { backgroundColor: `${goal.color}` }]}>
                            <Image source={goal.icon} style={{ height: 15, width: 15, tintColor: Colors.white }} />
                        </View>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalDesc}>{goal.subtitle}</Text>
                    </View>
                ))}
            </View>
            <Text style={styles.pillarsLabel}>Four pillars of health</Text>
            <View style={styles.pillarsGrid}>
                {data.pillars.map((pillar: any, idx: number) => (
                    <View key={idx} style={styles.pillarCard}>
                        {/* <MaterialCommunityIcons name={pillar.icon} size={20} color={pillar.color} /> */}
                        <Text style={[styles.pillarName, { color: pillar.color }]}>{pillar.name}</Text>
                        <Text style={styles.pillarDesc}>{pillar.subtitle}</Text>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    </LinearGradient>
);

// Doshas Screen
const DoshasScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            <Text style={styles.chip}>Module 03</Text>
            <Text style={styles.sectionTitle}>Three <Text style={styles.sectionTitleAccent}>Energies</Text></Text>
            <View style={styles.doshaList}>
                {data.doshas.map((dosha: any, idx: number) => (
                    <PressableCard key={idx} style={[styles.doshaBigCard, { backgroundColor: C.card, borderWidth: 1, borderColor: `${dosha.color}30` }]}>
                        <GoldSeal color={dosha.color} />
                        <View style={styles.doshaBigHeader}>
                            <View style={[styles.doshaBigIcon, { backgroundColor: `${dosha.color}18` }]}>{dosha?.name === 'Pitta' ? <SimpleLineIcons name={dosha.icon} size={22} color={dosha.color} /> : <MaterialCommunityIcons name={dosha.icon} size={22} color={dosha.color} />}</View>
                            <View><Text style={styles.doshaBigName}>{dosha.name}</Text><Text style={[styles.doshaBigElem, { color: dosha.color }]}>{dosha.element}</Text></View>
                            <View style={[styles.doshaBadge, { backgroundColor: `${dosha.color}18` }]}><Text style={[styles.doshaBadgeText, { color: dosha.color }]}>{dosha?.status}</Text></View>
                        </View>
                        <Text style={styles.doshaBigDesc}>{dosha?.subtitle}</Text>
                        <View style={styles.doshaQualities}>{dosha.qualities.map((q: string, i: number) => (<View key={i} style={[styles.qualityTag, { backgroundColor: `${dosha.color}14`, borderColor: `${dosha.color}30` }]}><Text style={[styles.qualityTagText, { color: dosha.color }]}>{q}</Text></View>))}</View>
                    </PressableCard>
                ))}
            </View>
        </SafeAreaView>
    </LinearGradient>
);

// Dosha Detail Screen
const DoshaDetailScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            <View style={[styles.energyBadge, { backgroundColor: `${data.color}16`, borderColor: `${data.color}40` }]}>
                <View style={[styles.energyDot, { backgroundColor: data.color }]} /><Text style={[styles.energyText, { color: data.color }]}>{data.element}</Text>
            </View>
            <Text style={[styles.doshaDetailTitle, { color: data.color }]}>{data.dosha}</Text>
            <Text style={styles.doshaDetailDesc}>{data?.subtitle}</Text>
            <View style={[styles.analogyBox, FLAT, { backgroundColor: C.card, borderColor: `${data.color}35` }]}>
                <GoldSeal color={data.color} />
                <Text style={[styles.analogyLabel, { color: data.color }]}>Physics Analogy</Text><Text style={[styles.analogyText, { color: data.color }]}>{data?.physic}</Text>
            </View>
            <Text style={styles.governsLabel}>What {data.dosha} governs</Text>
            <View style={styles.governsGrid}>{data.governs.map((item: string, idx: number) => (<View key={idx} style={[styles.govItem, FLAT]}><View style={[styles.govDot, { backgroundColor: data.color }]} /><Text style={styles.govText}>{item}</Text></View>))}</View>
            <View style={styles.balanceRow}>
                <View style={[styles.balanceBox, FLAT, { backgroundColor: `${data.color}10`, borderColor: `${data.color}30` }]}><Text style={[styles.balanceLabel, { color: data.color }]}>In balance</Text><Text style={styles.balanceValues}>{data.balance.join('\n')}</Text></View>
                <View style={[styles.balanceBox, FLAT, { backgroundColor: 'rgba(184,58,58,0.07)', borderColor: 'rgba(184,58,58,0.22)' }]}><Text style={[styles.balanceLabel, { color: '#B83A3A' }]}>Out of balance</Text><Text style={styles.balanceValues}>{data.imbalance.join('\n')}</Text></View>
            </View>
        </SafeAreaView>
    </LinearGradient>
);

// CTA Screen
const CTAScreen = ({ data, navigation }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.ctaContent}>
            <View style={styles.ctaIconWrap}>
                <Image
                    source={Images.FinalLogo}
                    style={[{ justifyContent: 'center', borderRadius: 20, backgroundColor: '#ffffff', height: 40, width: 40, alignItems: 'center', marginRight: -1 }]}
                    resizeMode="contain"
                />

            </View>
            {/* <View style={styles.ctaIconWrap}><Text style={styles.ctaIcon}>  <Image  source={Images.FinalLogo}  style={{height:20, width:20,alignItems:'center' }}/></Text></View> */}
            <Text style={styles.ctaOver}>Begin Your Journey</Text>
            <Text style={styles.ctaTitle}>Ready to</Text>
            <Text style={[styles.ctaTitle, styles.ctaTitleAccent]}>{data.titleAccent}</Text>
            <View style={styles.goldRule} />
            <Text style={styles.ctaDesc}>{data.desc}</Text>

            <TouchableOpacity
                style={styles.ctaPrimary}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}
            >
                <Text style={styles.ctaPrimaryText}>{data.cta1}</Text>
            </TouchableOpacity>
        </View>
    </LinearGradient>
);

// Main Component - All hooks at top level, NOT inside conditional
const AyurvedicIntroFlow = ({ onComplete, }: { onComplete?: () => void, }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayInterval = useRef<any>(null);

    console.log("_PROFILE_SERVICES",)
    const spinAnim = useRef(new Animated.Value(0)).current;
    const isFocused = useIsFocused();

    const navigation = useNavigation();

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
        ).start();
    }, []);


    // useEffect(() => {
    //     if (isFocused) {
    //         getUser();
    //     }
    // }, [isFocused]);


    // const getUser = async () => {
    //     try {
    //         const token = await Utils.getData('_TOKEN');

    //         if (!token) {
    //             navigation.replace('AuthStack', {
    //                 screen: 'Login',
    //             });
    //             return;
    //         }

    //         const result: any =
    //             await _PROFILE_SERVICES.user_profile();

    //         console.log('PROFILE RESULT =>', result);

    //         const isCustomer =
    //             result?.data?.user_roles?.includes(
    //                 'customer'
    //             );

    //         console.log('isCustomerisCustomer', isCustomer)

    //         // if (result?.status === 404) {
    //         //   props.navigation.replace(
    //         //     'HomeStack',
    //         //     {
    //         //       screen: 'Onboarding',
    //         //     },
    //         //   );
    //         //   return;
    //         // }

    //         if (!isCustomer) {
    //             navigation.replace(
    //                 'AuthStack',
    //                 {
    //                     screen: 'Login',
    //                 },
    //             );
    //             return;
    //         }

    //         if (!result?.data?.is_onboarded && !result?.data?.is_skipped) {
    //             navigation.replace(
    //                 'HomeStack',
    //                 {
    //                     screen: 'AssessmentType',
    //                 },
    //             );
    //             return;
    //         }

    //         if (result?.data?.is_skipped) {
    //             navigation.replace(
    //                 'HomeStack',
    //                 {
    //                     screen: 'Home',
    //                 },
    //             );
    //             return;
    //         }

    //         if (!result?.success) {
    //             showSuccessToast(
    //                 result?.message ||
    //                 'Something went wrong',
    //                 'error',
    //             );
    //             return;
    //         }

    //         // SUCCESS

    //         console.log(
    //             'PROFILE DATA =>',
    //             result,
    //         );

    //         await Utils.storeData(
    //             '_USER_INFO',
    //             result?.data,
    //         );

    //         navigation.replace(
    //             'HomeStack',
    //             {
    //                 screen: 'Home',
    //             },
    //         );

    //     } catch (error: any) {
    //         console.log(
    //             'GET USER ERROR =>',
    //             error,
    //         );

    //         if (
    //             error?.response?.status === 403
    //         ) {
    //             navigation.replace(
    //                 'AuthStack',
    //                 {
    //                     screen: 'Login',
    //                 },
    //             );

    //             return;
    //         }

    //         showSuccessToast(
    //             'Network Error',
    //             'error',
    //         );
    //     }
    // };


    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayInterval.current = setInterval(() => {
                const nextIndex = (activeIndex + 1) % SCREENS.length;
                goToSlide(nextIndex);
            }, 6000);
        }
        return () => { if (autoPlayInterval.current) clearInterval(autoPlayInterval.current); };
    }, [activeIndex, isAutoPlaying]);

    const goToSlide = (index: number) => {
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };


    const renderScreen = (item: any) => {
        switch (item.type) {
            case 'splash': return <SplashScreen data={item} />;
            case 'info': return <InfoScreen data={item} />;
            case 'strategy': return <StrategyScreen data={item} />;
            case 'doshas': return <DoshasScreen data={item} />;
            case 'doshaDetail': return <DoshaDetailScreen data={item} />;
            case 'cta': return <CTAScreen data={item} navigation={navigation} />;
            default: return null;
        }
    };

    const renderItem = ({ item, index }: any) => {
        const inputRange = [(index - 1) * SW, index * SW, (index + 1) * SW];
        const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });

        return (
            <Animated.View style={[styles.slideContainer, { transform: [{ scale }] }]}>
                {renderScreen(item)}
            </Animated.View>
        );
    };

    // Dark backdrop only on the two bookend screens (splash / CTA); light status bar text reads better there.
    // Content screens are light, so the status bar switches to dark text.
    const isDarkSlide = activeIndex === 0 || activeIndex === SCREENS.length - 1;

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkSlide ? 'light-content' : 'dark-content'} backgroundColor={isDarkSlide ? C.primaryDeep : C.ivory} />
            <LinearGradient
                colors={isDarkSlide ? ['rgba(0,0,0,0.25)', 'transparent'] : ['rgba(255,255,255,0.6)', 'transparent']}
                style={styles.headerGradient}
            >
                <SafeAreaView style={styles.header}>
                    {/* <Text style={[styles.headerLogo, { color: isDarkSlide ? C.white : C.primary }]}> <Image  source={Images.FinalLogo}  style={{height:20, width:20,alignItems:'center' }}/> AYURVEDA</Text> */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={Images.FinalLogo}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text
                            style={[
                                styles.headerLogo,
                                { color: isDarkSlide ? C.white : C.primary }
                            ]}
                        >
                            AYURVEDA
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <Animated.FlatList
                ref={flatListRef}
                data={SCREENS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SW))}
            />

            <View style={styles.navContainer}>
                <View style={[styles.dotsWrapper, { backgroundColor: isDarkSlide ? 'rgba(255,255,255,0.18)' : 'rgba(13,97,78,0.08)' }]}>
                    {SCREENS.map((_, index) => (
                        <TouchableOpacity key={index} onPress={() => goToSlide(index)}>
                            <View style={[
                                styles.dot,
                                activeIndex === index && styles.dotActive,
                                { backgroundColor: activeIndex === index ? C.gold : (isDarkSlide ? 'rgba(255,255,255,0.45)' : 'rgba(13,97,78,0.25)') },
                            ]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.ivory },
    slideContainer: { width: SW, flex: 1 },
    slide: { flex: 1 },
    slideInner: { flex: 1, paddingHorizontal: SPACE.xl, paddingTop: Platform.OS === 'ios' ? 16 : 56, paddingBottom: 88 },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACE.lg, paddingTop: Platform.OS === 'ios' ? 8 : 14, paddingBottom: SPACE.md },
    // headerLogo: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, letterSpacing: 2 },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    logoImage: {
        width: 20,
        height: 20,
        marginRight: 8,
    },

    headerLogo: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 2,
    },
    navContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 36 : 44, left: 0, right: 0, alignItems: 'center' },
    dotsWrapper: { flexDirection: 'row', gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, borderRadius: 30 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    dotActive: { width: 20 },

    // Signature gold seal — thin gradient rule across the top edge of a flat
    // card, used everywhere instead of drop shadows.
    goldSealWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, overflow: 'hidden' },
    goldSealLine: { flex: 1 },
    goldRule: { width: 36, height: 2, backgroundColor: C.gold, borderRadius: 1, marginTop: SPACE.sm, marginBottom: SPACE.md },

    // Splash (dark gradient bookend)
    splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACE.xl },
    mandala: { marginBottom: SPACE.xl },
    mandalaOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: 'rgba(224,183,104,0.4)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    mandalaInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
    mandalaCenter: { fontSize: 26 },
    overText: { fontSize: 10, letterSpacing: 4, color: C.gold, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium, marginBottom: SPACE.sm },
    splashTitle: { fontSize: 50, fontFamily: Fonts.PoppinsMedium, color: C.white },
    splashSubtitle: { fontSize: 50, fontFamily: Fonts.PoppinsMedium, color: C.white, textAlign: 'center' },
    splashTagline: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 20, marginBottom: SPACE.xl },
    doshaPills: { flexDirection: 'row', gap: SPACE.sm },
    pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 10, minWidth: 100 },
    pillDot: { width: 7, height: 7, borderRadius: 3.5 },
    pillName: { fontSize: 15, color: C.white, fontFamily: Fonts.PoppinsMedium },
    pillElem: { fontSize: 9, fontFamily: Fonts.PoppinsSemiBold, letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },

    // Shared chip / section title (light content screens)
    chip: { alignSelf: 'flex-start', paddingHorizontal: SPACE.md, paddingVertical: SPACE.xs, borderRadius: 10, backgroundColor: C.goldSoft, borderWidth: 0.5, borderColor: 'rgba(184,146,74,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.goldDeep, marginBottom: SPACE.md, fontFamily: Fonts.PoppinsMedium },
    sectionTitle: { fontSize: 34, fontFamily: Fonts.PoppinsMedium, color: C.ink, marginBottom: SPACE.lg },
    sectionTitleAccent: { fontFamily: Fonts.PoppinsMedium, color: C.primary },

    // Info screen
    infoCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: SPACE.lg, marginBottom: SPACE.md, position: 'relative', overflow: 'hidden' },
    infoRow: { flexDirection: 'row', gap: SPACE.md, alignItems: 'flex-start' },
    infoNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    infoNumText: { fontSize: 11, color: C.white, fontWeight: '500' },
    infoContent: { flex: 1 },
    infoTitle: { fontSize: 18, color: C.ink, fontFamily: Fonts.PoppinsMedium },
    infoDesc: { fontSize: 13, color: C.inkMuted, fontFamily: Fonts.PoppinsRegular },
    boldText: { fontFamily: Fonts.PoppinsSemiBold, color: C.ink },
    infoDivider: { height: 1, backgroundColor: C.cardBorder, marginVertical: SPACE.md },
    quoteBox: { backgroundColor: C.primarySoft, borderWidth: 1, borderColor: 'rgba(13,97,78,0.18)', borderRadius: 12, padding: SPACE.lg },
    quoteLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium, color: C.primary, marginBottom: SPACE.xs },
    quoteText: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: C.ink, lineHeight: 20 },
    quoteAuthor: { fontSize: 11, color: C.inkFaint, marginTop: SPACE.xs },

    // Strategy screen
    shlokaBox: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderLeftWidth: 3, borderLeftColor: C.gold, borderRadius: 10, padding: SPACE.lg, marginBottom: SPACE.lg },
    shlokaText: { fontSize: 15, fontStyle: 'italic', color: C.goldDeep, lineHeight: 24, textAlign: 'left' },
    shlokaTrans: { fontSize: 11, color: C.inkMuted, textAlign: 'center', marginTop: SPACE.xs, fontFamily: Fonts.PoppinsMedium },
    goalGrid: { flexDirection: 'row', gap: SPACE.sm, marginBottom: SPACE.lg },
    goalCard: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: SPACE.md, alignItems: 'center', position: 'relative', overflow: 'hidden' },
    goalIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: SPACE.xs },
    goalTitle: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: C.ink, marginBottom: 2 },
    goalDesc: { fontSize: 11, fontFamily: Fonts.PoppinsMedium, color: C.inkMuted, textAlign: 'center' },
    pillarsLabel: { fontSize: 10, color: C.inkFaint, letterSpacing: 2, fontFamily: Fonts.PoppinsMedium, textTransform: 'uppercase', marginBottom: SPACE.md },
    pillarsGrid: { flexDirection: 'row', gap: SPACE.sm },
    pillarCard: { flex: 1, height: 76, backgroundColor: C.primarySoft, borderWidth: 1, borderColor: 'rgba(13,97,78,0.15)', borderRadius: 10, padding: SPACE.sm, alignItems: 'center', justifyContent: 'center', gap: 4 },
    pillarName: { fontSize: 12, fontFamily: Fonts.PoppinsMedium },
    pillarDesc: { fontSize: 9, color: C.inkMuted, fontFamily: Fonts.PoppinsMedium, textAlign: 'center' },

    // Doshas screen
    doshaList: { gap: SPACE.md },
    doshaBigCard: { borderRadius: 16, padding: SPACE.lg, position: 'relative', overflow: 'hidden' },
    doshaBigHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, marginBottom: SPACE.sm },
    doshaBigIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    doshaBigName: { fontSize: 20, color: C.ink, fontFamily: Fonts.PoppinsMedium },
    doshaBigElem: { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium },
    doshaBadge: { marginLeft: 'auto', paddingHorizontal: SPACE.sm, paddingVertical: 4, borderRadius: 8 },
    doshaBadgeText: { fontSize: 11, fontFamily: Fonts.PoppinsMedium },
    doshaBigDesc: { fontSize: 12, color: C.inkMuted, lineHeight: 17, fontFamily: Fonts.PoppinsMedium, marginBottom: SPACE.sm },
    doshaQualities: { flexDirection: 'row', gap: 6 },
    qualityTag: { paddingHorizontal: SPACE.sm, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    qualityTagText: { fontSize: 10, fontFamily: Fonts.PoppinsMedium },

    // Dosha detail screen
    energyBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: SPACE.md, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginBottom: SPACE.lg },
    energyDot: { width: 6, height: 6, borderRadius: 3 },
    energyText: { fontSize: 12, letterSpacing: 1, fontFamily: Fonts.PoppinsMedium },
    doshaDetailTitle: { fontSize: 38, fontFamily: Fonts.PoppinsMedium, marginBottom: SPACE.xs },
    doshaDetailDesc: { fontSize: 13, color: C.inkMuted, fontFamily: Fonts.PoppinsMedium, marginBottom: SPACE.lg, lineHeight: 20 },
    analogyBox: { padding: SPACE.lg, borderRadius: 14, marginBottom: SPACE.lg, position: 'relative', overflow: 'hidden' },
    analogyLabel: { fontSize: 10, letterSpacing: 2, fontFamily: Fonts.PoppinsMedium, textTransform: 'uppercase', marginBottom: 4 },
    analogyText: { fontSize: 17, fontFamily: Fonts.PoppinsMedium },
    governsLabel: { fontSize: 10, color: C.inkFaint, fontFamily: Fonts.PoppinsMedium, letterSpacing: 2, textTransform: 'uppercase', marginBottom: SPACE.md },
    governsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, marginBottom: SPACE.lg },
    govItem: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 10, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, width: '48%' },
    govDot: { width: 6, height: 6, borderRadius: 3 },
    govText: { fontFamily: Fonts.PoppinsMedium, fontSize: 12, color: C.inkMuted },
    balanceRow: { flexDirection: 'row', gap: SPACE.md, marginTop: SPACE.xs },
    balanceBox: { flex: 1, borderRadius: 12, padding: SPACE.md, borderWidth: 1 },
    balanceLabel: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACE.sm },
    balanceValues: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: C.inkMuted, lineHeight: 19 },

    // CTA (dark gradient bookend)
    ctaContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACE.xl + 8 },
    ctaIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(224,183,104,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACE.xl - 4 },
    ctaIcon: { fontSize: 32 },
    ctaOver: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: SPACE.md },
    ctaTitle: { fontSize: 40, fontFamily: Fonts.PoppinsMedium, color: C.white, lineHeight: 46, textAlign: 'center' },
    ctaTitleAccent: { fontFamily: Fonts.PoppinsMedium, color: C.goldBright },
    ctaDesc: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.75)', lineHeight: 20, textAlign: 'center', marginBottom: SPACE.xl, maxWidth: 250 },
    ctaPrimary: { backgroundColor: C.white, borderRadius: 50, paddingVertical: 15, paddingHorizontal: 28, width: '100%', alignItems: 'center' },
    ctaPrimaryText: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: C.primary, letterSpacing: 0.3 },
});

export default AyurvedicIntroFlow;