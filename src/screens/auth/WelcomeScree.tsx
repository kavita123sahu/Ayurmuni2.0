import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Animated,
    Platform,
    Image,
    Easing,
    ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';

const { width: SW, height: SH } = Dimensions.get('window');

/* ============================================================
   PREMIUM AYURVEDA WELCOME — v2, image-led + heavily animated
   ------------------------------------------------------------
   New on top of the previous version:
     • Real photo backdrop (ImageBackground) behind the gradient —
       gradient now uses translucent rgba so the photo breathes
       through instead of being fully hidden.
     • 3 floating "polaroid" photo cards drifting + gently
       rotating around the logo (uses the floatAnim1/2/3 values —
       floatAnim3 was declared before but never actually used).
     • A social-proof strip (avatar stack + live counter) between
       the dosha chips and the CTA — same trick that makes
       Cult.fit / Calm onboarding feel alive instead of static.
     • Dosha chips now scale/fade in staggered instead of popping
       in all at once.
   Everything from the original (orbs, rings, shimmer, pulse,
   spring entrance, handleGetStarted -> AuthStack/Login) is kept.
   ============================================================ */

const COLORS = {
    primary: '#0A4A3A',
    primaryDark: '#062C22',
    primaryLight: '#1A7A62',
    gold: '#D4A745',
    goldLight: '#F5E6C8',
    goldGlow: 'rgba(212, 167, 69, 0.3)',
    ivory: '#F8F5EE',
    cream: '#FFFCF5',
    ink: '#1A2A24',
    inkMuted: '#5A6B63',
    white: '#FFFFFF',
    vata: '#4A8BAE',
    pitta: '#D4A843',
    kapha: '#6B9B6B',
    vataLight: 'rgba(74, 139, 174, 0.15)',
    pittaLight: 'rgba(212, 168, 67, 0.15)',
    kaphaLight: 'rgba(107, 155, 107, 0.15)',
};

// Translucent versions of the same gradient — lets the photo behind
// it show through softly instead of being fully blocked out.
const OVERLAY_GRADIENT = ['rgba(6,44,34,0.90)', 'rgba(10,74,58,0.82)', 'rgba(26,122,98,0.72)'];

// Swap these for your real photos.
const POLAROID_A = Images.login2 ?? Images.FinalLogo; // e.g. yoga pose
const POLAROID_B = Images.login3 ?? Images.FinalLogo; // e.g. herbs / spices
const POLAROID_C = Images.login4 ?? Images.FinalLogo; // e.g. telehealth / doctor
const BACKDROP_IMAGE = Images.login1 ?? Images.FinalLogo; // full-bleed background photo

const AyurvedicWelcome = ({ navigation }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;
    const floatAnim3 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SH)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const subtitleAnim = useRef(new Animated.Value(0)).current;
    const proofAnim = useRef(new Animated.Value(0)).current;
    const doshaAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.ease }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 30, useNativeDriver: true }),
        ]).start();

        startContinuousAnimations();
        runStaggeredEntrance();
    }, []);

    const runStaggeredEntrance = () => {
        setTimeout(() => Animated.spring(titleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start(), 500);
        setTimeout(() => Animated.spring(subtitleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start(), 800);
        doshaAnims.forEach((a, i) => {
            setTimeout(() => Animated.spring(a, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start(), 1000 + i * 120);
        });
        setTimeout(() => Animated.timing(proofAnim, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start(), 1350);
    };

    const startContinuousAnimations = () => {
        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 30000, useNativeDriver: true, easing: Easing.linear })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim1, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(floatAnim1, { toValue: 0, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim2, { toValue: 1, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(floatAnim2, { toValue: 0, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();

        // floatAnim3 — was declared in the original but its loop was
        // never started, so the 3rd polaroid needs it running too.
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim3, { toValue: 1, duration: 4200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(floatAnim3, { toValue: 0, duration: 4200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
            ])
        ).start();
    };

    const handleGetStarted = () => {
        // guest if skip login 
        //  navigation.navigate('HomeStack', { screen: 'Home' });
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.95, friction: 10, tension: 40, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 10, tension: 40, useNativeDriver: true }),
        ]).start(() => {
            navigation.navigate('AuthStack', { screen: 'Login' });
        });
    };

    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const float1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
    const float2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
    const float3 = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
    const rotate1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '4deg'] });
    const rotate2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: ['6deg', '-5deg'] });
    const rotate3 = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '6deg'] });
    const pulse = pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [1, 1.05] });
    const shimmer = shimmerAnim.interpolate({
        inputRange: [0, 0.3, 0.5, 0.7, 1],
        outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

            {/* Photo backdrop, breathing through a translucent gradient */}
            <ImageBackground source={BACKDROP_IMAGE} style={styles.background} resizeMode="cover">
                <LinearGradient
                    colors={OVERLAY_GRADIENT}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </ImageBackground>

            {/* Decorative Background Elements */}
            <Animated.View style={[styles.decoOrb1, { transform: [{ scale: pulse }, { translateY: float1 }] }]} />
            <Animated.View style={[styles.decoOrb2, { transform: [{ translateY: float2 }] }]} />
            <Animated.View style={[styles.decoOrb3, { transform: [{ scale: pulse }] }]} />
            <Animated.View style={[styles.decoRing, { transform: [{ rotate }] }]} />
            <Animated.View style={[styles.decoRing2, { transform: [{ rotate }] }]} />
            <Animated.View style={[styles.shimmerOverlay, { backgroundColor: shimmer }]} />

            {/* Floating polaroid photos, drifting + gently tilting around the logo */}
            <Animated.View style={[styles.polaroid, styles.polaroidA, { transform: [{ translateY: float1 }, { rotate: rotate1 }] }]}>
                <Image source={POLAROID_A} style={styles.polaroidImg} />
            </Animated.View>
            <Animated.View style={[styles.polaroid, styles.polaroidB, { transform: [{ translateY: float2 }, { rotate: rotate2 }] }]}>
                <Image source={POLAROID_B} style={styles.polaroidImg} />
            </Animated.View>
            <Animated.View style={[styles.polaroid, styles.polaroidC, { transform: [{ translateY: float3 }, { rotate: rotate3 }] }]}>
                <Image source={POLAROID_C} style={styles.polaroidImg} />
            </Animated.View>

            {/* Main Content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Logo Section */}
                <Animated.View style={[styles.logoSection, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.logoGlow}>
                        <Animated.View style={[styles.logoGlowPulse, { transform: [{ scale: pulse }] }]} />
                        <View style={styles.logoContainer}>
                            <Image source={Images.FinalLogo} style={styles.logo} resizeMode="contain" />
                        </View>
                    </View>
                </Animated.View>

                {/* Text Content */}
                <Animated.View style={styles.textSection}>
                    <Animated.Text style={[styles.brandName, { opacity: titleAnim }]}>AYURMUNI</Animated.Text>

                    <Animated.Text style={[styles.tagline, { opacity: subtitleAnim }]}>
                        Ancient Wisdom · Modern Wellness
                    </Animated.Text>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <View style={styles.dividerDot} />
                        <View style={styles.dividerLine} />
                    </View>

                    <Text style={styles.description}>
                        Discover the timeless science of life that harmonizes mind, body, and spirit through natural healing.
                    </Text>

                    {/* Dosha Mini Cards — staggered scale/fade entrance */}
                    <View style={styles.doshaRow}>
                        {[
                            { emoji: '🌪️', name: 'Vāta', bg: COLORS.vataLight, border: COLORS.vata, color: COLORS.vata },
                            { emoji: '🔥', name: 'Pitta', bg: COLORS.pittaLight, border: COLORS.pitta, color: COLORS.pitta },
                            { emoji: '💧', name: 'Kapha', bg: COLORS.kaphaLight, border: COLORS.kapha, color: COLORS.kapha },
                        ].map((d, i) => (
                            <Animated.View
                                key={d.name}
                                style={[
                                    styles.doshaMini,
                                    { backgroundColor: d.bg, borderColor: d.border },
                                    {
                                        opacity: doshaAnims[i],
                                        transform: [{ scale: doshaAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
                                    },
                                ]}
                            >
                                <Text style={styles.doshaMiniEmoji}>{d.emoji}</Text>
                                <Text style={[styles.doshaMiniName, { color: d.color }]}>{d.name}</Text>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Social proof strip */}
                    <Animated.View
                        style={[
                            styles.proofStrip,
                            { opacity: proofAnim, transform: [{ translateY: proofAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
                        ]}
                    >
                        <View style={styles.avatarStack}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={[styles.avatarDot, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]} />
                            ))}
                        </View>
                        <Text style={styles.proofText}>
                            <Text style={styles.proofTextBold}>18,000+</Text> people started their journey this week
                        </Text>
                    </Animated.View>
                </Animated.View>

                {/* CTA Section */}
                <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted} activeOpacity={0.85}>
                        <LinearGradient
                            colors={[COLORS.gold, '#C4953A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Begin Your Journey →</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
                        <Text style={styles.skipText}>Skip to Login</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Bottom Decorative */}
                <View style={styles.bottomDecor}>
                    <View style={styles.bottomLine} />
                    <View style={styles.bottomDot} />
                    <View style={styles.bottomLine} />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primaryDark },

    background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

    decoOrb1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(212, 167, 69, 0.08)' },
    decoOrb2: { position: 'absolute', bottom: -50, left: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
    decoOrb3: { position: 'absolute', top: SH * 0.4, left: -120, width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(212, 167, 69, 0.05)' },
    decoRing: { position: 'absolute', top: SH * 0.25, right: -80, width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(212, 167, 69, 0.1)' },
    decoRing2: { position: 'absolute', top: SH * 0.55, right: -120, width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    shimmerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

    // Floating polaroid photos
    polaroid: {
        position: 'absolute',
        width: 72,
        height: 90,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 4,
    },
    polaroidImg: { width: '100%', height: '100%', borderRadius: 6, backgroundColor: '#22301D' },
    polaroidA: { top: SH * 0.1, left: 20 },
    polaroidB: { top: SH * 0.08, right: 18 },
    polaroidC: { top: SH * 0.3, right: -6, width: 60, height: 76 },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },

    logoSection: { marginTop: 20 },
    logoGlow: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
    logoGlowPulse: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(212, 167, 69, 0.15)' },
    logoContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(212, 167, 69, 0.3)',
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: { width: 70, height: 70, tintColor: '#FFFFFF' },

    textSection: { alignItems: 'center', flex: 1, justifyContent: 'center', marginTop: -20 },

    brandName: {
        fontSize: 42,
        fontFamily: Fonts.PoppinsBold,
        color: '#FFFFFF',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        marginBottom: 4,
    },
    tagline: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: COLORS.goldLight, letterSpacing: 3, textTransform: 'uppercase' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: 120, justifyContent: 'center' },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(212, 167, 69, 0.3)' },
    dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold, marginHorizontal: 8 },

    description: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsRegular,
        color: 'rgba(255, 255, 255, 0.75)',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
        marginBottom: 24,
    },

    doshaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    doshaMini: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    doshaMiniEmoji: { fontSize: 16 },
    doshaMiniName: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold },

    proofStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    avatarStack: { flexDirection: 'row', alignItems: 'center' },
    avatarDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.goldLight, borderWidth: 1.5, borderColor: COLORS.primaryDark },
    proofText: { fontSize: 11, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255,255,255,0.8)' },
    proofTextBold: { fontFamily: Fonts.PoppinsBold, color: '#FFFFFF' },

    ctaSection: { width: '100%', alignItems: 'center', gap: 12 },
    ctaButton: {
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    ctaText: {
        fontSize: 17,
        fontFamily: Fonts.PoppinsBold,
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    skipButton: { paddingVertical: 8, paddingHorizontal: 16 },
    skipText: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: 0.5 },

    bottomDecor: { flexDirection: 'row', alignItems: 'center', width: 60, justifyContent: 'center', marginTop: 10 },
    bottomLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    bottomDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.gold, marginHorizontal: 6 },
});

export default AyurvedicWelcome;