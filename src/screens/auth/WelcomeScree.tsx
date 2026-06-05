
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
import { MaterialCommunityIcons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { useNavigation } from '@react-navigation/native';

const { width: SW } = Dimensions.get('window');

// Theme Colors
const C = {
    primary: '#0D614E',
    primaryLight: '#1a7a62',
    primaryDark: '#0a4a3a',
    background: '#FDFDFB',
    bgDark: '#0A1A0D',
    white: '#FFFFFF',
    vata: '#5BB5C8',
    pitta: '#8BBF6A',
    kapha: '#C8A45B',
};

const SCREENS = [
    { id: 'splash', type: 'splash', tagline: 'The complete knowledge of life — how to live, remain healthy, and prevent suffering.', bgGradient: [C.primaryDark, C.primary, C.primaryLight] },
    { id: 'what', type: 'info', items: [{ num: '1', title: 'Āyu (आयु)', desc: 'Not just "lifespan" — it means Quality of Living, not merely surviving.' }, { num: '2', title: 'Veda (वेद)', desc: 'Applied wisdom — science that can be practiced. Systematic, experiential knowledge that sustains life.' }], quote: '"The complete knowledge of life — how to live, how to remain healthy, and how to prevent suffering."', bgGradient: [C.bgDark, '#0D1810'] },
    { id: 'strategy', type: 'strategy', shloka: ['स्वस्थस्य स्वास्थ्य रक्षणं आतुरस्य विकार प्रशमनं च॥'], shlokaTrans: 'Protect the health of the healthy · Alleviate disease in the diseased', goals: [{ icon: Images.tick, title: 'Prevention', subtitle: "Maintain health before disease arises", color: C.primary }, { icon: Images.clock, title: 'Healing', subtitle: 'Alleviate suffering in the diseased', color: C.primary }], pillars: [{ name: 'Mind', subtitle: "Right Thinking", icon: 'brain', color: C.primary }, { name: 'Diet', icon: 'brain', subtitle: "Seasonal Food", color: C.primary }, { name: 'LifeStyle ', subtitle: "Daily Rhythm", icon: 'brain', color: C.primary }, { name: 'Herbs', subtitle: "Herbal Medicine", icon: 'brain', color: C.primary }], bgGradient: [C.bgDark, '#0D1810'] },
    { id: 'doshas', type: 'doshas', doshas: [{ name: 'Vāta', element: 'Air · Space', subtitle: 'Energy of movement — governs breathing, muscle movement, heart pulsation, and all cellular motion.', color: C.vata, icon: 'weather-windy', qualities: ['Creative', 'Flexibility'], status: 'Kinetic' }, { name: 'Pitta', element: 'Fire · Water', subtitle: 'Energy of transformation — governs digestion, metabolism, body temperature, and assimilation.', color: C.pitta, icon: 'Fire', qualities: ['Intelligent', 'Understanding'], status: 'Thermal' }, { name: 'Kapha', element: 'Earth · Water', subtitle: 'Energy of structure — governs all bodily fluids, lubricates joints, maintains immunity and cellular structure.', color: C.kapha, icon: 'water', qualities: ['Love', 'Calmness'], status: 'Potential' }], bgGradient: [C.bgDark, '#0D1810'] },
    { id: 'vata', type: 'doshaDetail', dosha: 'Vāta', element: 'Air · Space', subtitle: 'Like Kinetic Energy — the energy of movement itself.', physic: 'Like Kinetic Energy — the energy of movement itself.', governs: ['Breathing', 'Blinking', 'Heart pulsation', 'Muscle movement', 'Cell membranes', 'Nerve impulses'], balance: ['Creative', 'Adaptability', 'Flexibility'], imbalance: ['Fear', 'Restlessness', 'Anxiety'], color: C.vata, bgGradient: ['#080F1A', '#0a1a2a'] },
    { id: 'pitta', type: 'doshaDetail', dosha: 'Pitta', element: 'Fire · Water', subtitle: 'Expresses as the bodys metabolic system — transformation at every level.', physic: 'Like Thermal Energy — the energy of transformation and heat.', governs: ['Digestion', 'Metabolism', 'Absorption', 'Body temp', 'Body temp', 'Assimilation', 'Nutrition'], balance: ['Intelligent', 'Courage', 'Understanding'], imbalance: ['Anger', 'Jealousy', 'Hatred'], color: C.pitta, bgGradient: ['#0F140A', '#1a2010'] },
    { id: 'kapha', type: 'doshaDetail', dosha: 'Kapha', element: 'Earth · Water', subtitle: 'The energy that forms the bodys structure — the glue that holds cells together.', physic: 'Like Potential Energy — stored energy, the foundation of all structure.', governs: ['Bodily fluids', 'Joint lubrication', 'Skin moisture', 'Immunity', 'Bones & muscles', 'Cellular glue'], balance: ['Love', 'Calmness', 'Forgiveness'], imbalance: ['Attachment', 'Greed', 'Envy'], color: C.kapha, bgGradient: ['#0A120F', '#102018'] },
    { id: 'journey', type: 'cta', titleAccent: 'discover you?', desc: 'Find your unique Prakriti', cta1: 'Discover Your Prakriti', bgGradient: [C.primaryDark, C.primary, C.primaryLight] },
];

// Splash Screen Component - NO HOOKS inside render
const SplashScreen = ({ data }: any) => {
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
        ).start();
    }, []);

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });



    return (
        <LinearGradient colors={data.bgGradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.splashContent}>
                <Animated.View style={[styles.mandala, { transform: [{ rotate: spin }] }]}>
                    <View style={styles.mandalaOuter}><View style={styles.mandalaInner}><Text style={styles.mandalaCenter}>🌿</Text></View></View>
                </Animated.View>
                <Text style={styles.overText}>Ancient Wisdom · Modern Life</Text>
                <Text style={styles.splashTitle}>
                    Āyur<Text style={styles.splashTitleAccent}>veda</Text>{'\n'}
                    <Text style={styles.splashSubtitle}>for You</Text>
                </Text>
                <Text style={styles.splashTagline}>{data.tagline}</Text>
                <View style={styles.doshaPills}>
                    {['Vāta', 'Pitta', 'Kapha'].map((d, i) => (
                        <View key={d} style={[styles.pill, { borderColor: [C.vata, C.pitta, C.kapha][i] }]}>
                            <View style={[styles.pillDot, { backgroundColor: [C.vata, C.pitta, C.kapha][i] }]} />
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

    let parts = [text];

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
            <Text
                key={index}
                style={isBold ? styles.boldText : styles.infoDesc}
            >
                {part}
            </Text>
        );
    });
};
// Info Screen
const InfoScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            {/* <Text style={styles.chip}>Module 01</Text> */}
            <Text style={styles.sectionTitle}>Decoding <Text style={styles.sectionTitleAccent}>Āyurveda</Text></Text>
            <View style={styles.infoCard}>
                {data.items.map((item: any, idx: number) => (
                    <React.Fragment key={idx}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoNum}><Text style={styles.infoNumText}>{item.num}</Text></View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>{item.title}</Text>
                                {/* <Text style={styles.infoDesc}>{item.desc}</Text> */}
                                <Text style={styles.infoDesc}>
                                    {renderBoldText(item.desc)}
                                </Text>
                            </View>
                        </View>
                        {idx < data.items.length - 1 && <View style={styles.infoDivider} />}
                    </React.Fragment>
                ))}
            </View>
            <View style={styles.quoteBox}>
                <Text style={styles.quoteLabel}>Definition</Text>
                <Text style={styles.quoteText}>{data.quote}</Text>
                {/* <Text style={styles.quoteAuthor}>— Charaka Samhita</Text> */}
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
            {/* <Text style={styles.chip}>Module 03</Text> */}
            <Text style={styles.sectionTitle}>Three <Text style={styles.sectionTitleAccent}>Energies</Text></Text>
            <View style={styles.doshaList}>
                {data.doshas.map((dosha: any, idx: number) => (
                    <View key={idx} style={[styles.doshaBigCard, { backgroundColor: `${dosha.color}10`, borderColor: `${dosha.color}40` }]}>
                        <View style={styles.doshaBigHeader}>
                            <View style={[styles.doshaBigIcon, { backgroundColor: `${dosha.color}20` }]}><MaterialCommunityIcons name={dosha.icon} size={22} color={dosha.color} /></View>
                            <View><Text style={styles.doshaBigName}>{dosha.name}</Text><Text style={[styles.doshaBigElem, { color: dosha.color }]}>{dosha.element}</Text></View>
                            <View style={[styles.doshaBadge, { backgroundColor: `${dosha.color}20` }]}><Text style={[styles.doshaBadgeText, { color: dosha.color }]}>{dosha?.status}</Text></View>
                        </View>
                        <Text style={styles.doshaBigDesc}>{dosha?.subtitle}</Text>
                        <View style={styles.doshaQualities}>{dosha.qualities.map((q: string, i: number) => (<View key={i} style={[styles.qualityTag, { backgroundColor: `${dosha.color}15` }]}><Text style={[styles.qualityTagText, { color: dosha.color }]}>{q}</Text></View>))}</View>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    </LinearGradient>
);

// Dosha Detail Screen
const DoshaDetailScreen = ({ data }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide}>
        <SafeAreaView style={styles.slideInner}>
            <View style={[styles.energyBadge, { backgroundColor: `${data.color}15`, borderColor: `${data.color}40` }]}>
                <View style={[styles.energyDot, { backgroundColor: data.color }]} /><Text style={[styles.energyText, { color: data.color }]}>{data.element}</Text>
            </View>
            <Text style={[styles.doshaDetailTitle, { color: data.color }]}>{data.dosha}</Text>
            <Text style={styles.doshaDetailDesc}>{data?.subtitle}</Text>
            <View style={[styles.analogyBox, { backgroundColor: `${data.color}10`, borderColor: `${data.color}50` }]}>
                <Text style={[styles.analogyLabel, { color: data.color }]}>Physics Analogy</Text><Text style={[styles.analogyText, { color: data.color }]}>{data?.physic}</Text>
            </View>
            <Text style={styles.governsLabel}>What {data.dosha} governs</Text>
            <View style={styles.governsGrid}>{data.governs.map((item: string, idx: number) => (<View key={idx} style={styles.govItem}><View style={[styles.govDot, { backgroundColor: data.color }]} /><Text style={styles.govText}>{item}</Text></View>))}</View>
            <View style={styles.balanceRow}>
                <View style={[styles.balanceBox, { backgroundColor: `${data.color}15`, borderColor: `${data.color}30` }]}><Text style={[styles.balanceLabel, { color: data.color }]}>In balance</Text><Text style={styles.balanceValues}>{data.balance.join('\n')}</Text></View>
                <View style={[styles.balanceBox, { backgroundColor: 'rgba(226,75,74,0.1)', borderColor: 'rgba(226,75,74,0.2)' }]}><Text style={[styles.balanceLabel, { color: '#E24B4A' }]}>Out of balance</Text><Text style={styles.balanceValues}>{data.imbalance.join('\n')}</Text></View>
            </View>
        </SafeAreaView>
    </LinearGradient>
);

// CTA Screen
const CTAScreen = ({ data, onPress }: any) => (
    <LinearGradient colors={data.bgGradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.ctaContent}>
            <View style={styles.ctaIconWrap}><Text style={styles.ctaIcon}>🌿</Text></View>
            <Text style={styles.ctaOver}>Begin Your Journey</Text>
            <Text style={styles.ctaTitle}>Ready to</Text>
            <Text style={[styles.ctaTitle, styles.ctaTitleAccent]}>{data.titleAccent}</Text>
            <Text style={styles.ctaDesc}>{data.desc}</Text>

            {/* ()=>props.navigation.navigate('PatientFAQ') */}
            <TouchableOpacity style={styles.ctaPrimary} onPress={onPress}><Text style={styles.ctaPrimaryText}>{data.cta1}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary}><Text style={styles.ctaSecondaryText}>Explore Herbs</Text></TouchableOpacity>
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


    const navigation = useNavigation();

    // Define renderScreen BEFORE using it in renderItem
    const renderScreen = (item: any, onPress?: () => void) => {
        switch (item.type) {
            case 'splash': return <SplashScreen data={item} />;
            case 'info': return <InfoScreen data={item} />;
            case 'strategy': return <StrategyScreen data={item} />;
            case 'doshas': return <DoshasScreen data={item} />;
            case 'doshaDetail': return <DoshaDetailScreen data={item} />;
            case 'cta': return <CTAScreen data={item} onPress={() => navigation.navigate('PatientFAQ')
            } />;
            default: return null;
        }
    };

    const renderItem = ({ item, index }: any) => {
        const inputRange = [(index - 1) * SW, index * SW, (index + 1) * SW];
        const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });

        return (
            <Animated.View style={[styles.slideContainer, { transform: [{ scale }] }]}>
                {renderScreen(item, onComplete)}
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.headerGradient}>
                <SafeAreaView style={styles.header}>
                    <Text style={styles.headerLogo}>🌿 AYURVEDA</Text>
                    {/* <TouchableOpacity onPress={() => setIsAutoPlaying(!isAutoPlaying)}>
            <Text style={styles.autoPlayBtn}>{isAutoPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity> */}
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
                <View style={styles.dotsWrapper}>
                    {SCREENS.map((_, index) => (
                        <TouchableOpacity key={index} onPress={() => goToSlide(index)}>
                            <View style={[styles.dot, activeIndex === index && styles.dotActive, { backgroundColor: activeIndex === index ? C.pitta : 'rgba(255,255,255,0.3)' }]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.primaryDark },
    slideContainer: { width: SW, flex: 1 },
    slide: { flex: 1 },
    slideInner: { flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 60, paddingBottom: 100 },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 8 : 16, paddingBottom: 12 },
    headerLogo: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, letterSpacing: 2, color: C.white },
    autoPlayBtn: { fontSize: 14, color: C.white, padding: 8 },
    navContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 50, left: 0, right: 0, alignItems: 'center' },
    dotsWrapper: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    dotActive: { width: 20 },
    splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    mandala: { marginBottom: 32 },
    mandalaOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
    mandalaInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    mandalaCenter: { fontSize: 28 },
    overText: { fontSize: 10, letterSpacing: 4, color: C.pitta, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium, marginBottom: 12 },
    splashTitle: { fontSize: 52, fontFamily: Fonts.PoppinsMedium, color: C.white, },
    splashTitleAccent: { fontFamily: Fonts.PoppinsMedium },
    splashSubtitle: { fontSize: 52, fontFamily: Fonts.PoppinsMedium, color: C.white, textAlign: 'center', },
    splashTagline: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
    doshaPills: { flexDirection: 'row', gap: 10 },
    pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 24, borderWidth: 0.5, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 10, minWidth: 100 },
    pillDot: { width: 7, height: 7, borderRadius: 3.5 },
    pillName: { fontSize: 15, color: C.white, fontFamily: Fonts.PoppinsMedium, },
    pillElem: { fontSize: 9, fontFamily: Fonts.PoppinsSemiBold, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    chip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(139,191,106,0.15)', borderWidth: 0.5, borderColor: 'rgba(139,191,106,0.25)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.pitta, marginBottom: 16 },
    sectionTitle: { fontSize: 38, fontFamily: Fonts.PoppinsMedium, color: C.white, marginBottom: 20, },
    sectionTitleAccent: { fontFamily: Fonts.PoppinsMedium, color: C.pitta },
    infoCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 18, marginBottom: 14 },
    infoRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
    infoNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    infoNumText: { fontSize: 11, color: C.white, fontWeight: '500' },
    infoContent: { flex: 1 },
    infoTitle: { fontSize: 20, color: C.white, fontFamily: Fonts.PoppinsMedium },
    // infoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: Fonts.PoppinsMedium, lineHeight: 18 },
    infoDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.45)',
        fontFamily: Fonts.PoppinsRegular,
    },

    boldText: {
        fontFamily: Fonts.PoppinsSemiBold, // 👈 only font change
        color: '#ffff',
    },
    infoDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 14 },
    quoteBox: { backgroundColor: 'rgba(139,191,106,0.08)', borderWidth: 0.5, borderColor: 'rgba(139,191,106,0.2)', borderRadius: 14, padding: 14 },
    quoteLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium, color: C.pitta, marginBottom: 8 },
    quoteText: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
    quoteAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 },
    shlokaBox: { backgroundColor: 'rgba(139,191,106,0.06)', borderWidth: 0.5, borderColor: 'rgba(139,191,106,0.18)', borderLeftWidth: 2, borderLeftColor: C.primary, borderRadius: 12, padding: 16, marginBottom: 18 },
    shlokaText: { fontSize: 16, fontStyle: 'italic', color: C.pitta, lineHeight: 26, textAlign: 'left', },
    shlokaTrans: { fontSize: 11, color: 'rgba(255, 255, 255, 0.96)', textAlign: 'center', marginTop: 8, fontFamily: Fonts.PoppinsMedium },
    goalGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    goalCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, alignItems: 'center' },
    goalIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    goalIcon: { fontSize: 18, fontFamily: Fonts.PoppinsMedium },
    goalTitle: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: C.white, marginBottom: 4 },
    goalDesc: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
    pillarsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, fontFamily: Fonts.PoppinsMedium, textTransform: 'uppercase', marginBottom: 12 },
    pillarsGrid: { flexDirection: 'row', gap: 8 },
    pillarCard: { flex: 1, height: 80, backgroundColor: 'rgba(139,191,106,0.08)', borderWidth: 0.5, borderColor: 'rgba(139,191,106,0.15)', borderRadius: 12, padding: 10, alignItems: 'center', gap: 10 },
    pillarName: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, marginBottom: -10 },
    pillarDesc: { fontSize: 9, color: '#ffffff', fontFamily: Fonts.PoppinsMedium, textAlign: 'center' },
    doshaList: { gap: 12 },
    doshaBigCard: { borderRadius: 20, padding: 18, borderWidth: 0.5 },
    doshaBigHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    doshaBigIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    doshaBigName: { fontSize: 22, color: C.white, fontFamily: Fonts.PoppinsMedium, },
    doshaBigElem: { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: Fonts.PoppinsMedium, },
    doshaBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    doshaBadgeText: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, },
    doshaBigDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18, fontFamily: Fonts.PoppinsMedium, marginBottom: 10 },
    doshaQualities: { flexDirection: 'row', gap: 6, fontFamily: Fonts.PoppinsMedium, },
    qualityTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 0.5 },
    qualityTagText: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, },
    energyBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, marginBottom: 16 },
    energyDot: { width: 6, height: 6, borderRadius: 3 },
    energyText: { fontSize: 12, letterSpacing: 1, fontFamily: Fonts.PoppinsMedium, },
    doshaDetailTitle: { fontSize: 42, fontFamily: Fonts.PoppinsMedium, marginBottom: 8, },
    doshaDetailDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: Fonts.PoppinsMedium, marginBottom: 16, lineHeight: 22 },
    analogyBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    analogyLabel: { fontSize: 10, letterSpacing: 2, fontFamily: Fonts.PoppinsMedium, textTransform: 'uppercase', marginBottom: 6 },
    analogyText: { fontSize: 18, fontFamily: Fonts.PoppinsMedium, },
    governsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: Fonts.PoppinsMedium, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
    governsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    govItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, width: '48%' },
    govDot: { width: 6, height: 6, borderRadius: 3 },
    govText: { fontFamily: Fonts.PoppinsMedium, fontSize: 12, color: 'rgba(255,255,255,0.55)' },
    balanceRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    balanceBox: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 0.5 },
    balanceLabel: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
    balanceValues: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.55)', lineHeight: 20 },
    ctaContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    ctaIconWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    ctaIcon: { fontSize: 34 },
    ctaOver: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16 },
    ctaTitle: { fontSize: 42, fontFamily: Fonts.PoppinsMedium, color: C.white, lineHeight: 48, textAlign: 'center' },
    ctaTitleAccent: { fontFamily: Fonts.PoppinsMedium, opacity: 0.85 },
    ctaDesc: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.62)', lineHeight: 22, textAlign: 'center', marginTop: 16, marginBottom: 32, maxWidth: 260 },
    ctaPrimary: { backgroundColor: C.white, borderRadius: 50, paddingVertical: 15, paddingHorizontal: 28, width: '100%', alignItems: 'center', marginBottom: 12 },
    ctaPrimaryText: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: C.primary, letterSpacing: 0.3 },
    ctaSecondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 50, paddingVertical: 14, paddingHorizontal: 28, width: '100%', alignItems: 'center' },
    ctaSecondaryText: { fontSize: 13, color: 'rgba(255,255,255,0.78)', fontFamily: Fonts.PoppinsMedium, letterSpacing: 0.3 },
});

export default AyurvedicIntroFlow;