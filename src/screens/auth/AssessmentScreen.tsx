

import React, { useState, useRef, useEffect, act } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    StyleSheet, Animated, Dimensions, StatusBar,
    FlatList, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── COLOR PALETTE ───────────────────────────────────────────
const C = {
    saffron: '#E8721C',
    saffronLight: '#FFF0E6',
    saffronMid: '#F5A05A',
    cream: '#FDF6EE',
    deep: '#2C1A0E',
    muted: '#8B6B4A',
    border: '#E8D5C0',
    white: '#FFFFFF',
    green: '#3D7A5A',
    greenLight: '#E8F5EE',
    vata: '#7C3AED',
    pitta: '#E8721C',
    kapha: '#059669',
    card: '#FFFFFF',
    shadow: 'rgba(232,114,28,0.12)',
};

const S = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};
// ─── REAL IMAGES (Unsplash — free to use) ─────────────────────
// Each question has a `coverImage` and each option has an `image`
const QUESTIONS_DATA = [

    // ══════════════ SECTION 1: PHYSICAL TRAITS ══════════════
    {
        section: 'Physical Traits',
        sectionIcon: '🧘',
        sectionColor: '#FFF0E6',
        sectionIndex: 0,

        id: 'body_type',
        question: 'How would you describe your natural body type?',
        description: 'Think about your body structure without exercise — how it naturally looks.',
        coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Lean & Thin',
                sublabel: 'Hard to gain weight, light body frame',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Medium & Balanced',
                sublabel: 'Proportionate build, neither too thin nor heavy',
                image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Heavy & Broad',
                sublabel: 'Gains weight easily, strong frame',
                image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    {
        section: 'Physical Traits',
        sectionIcon: '🧘',
        sectionColor: '#FFF0E6',
        sectionIndex: 0,

        id: 'hair_scalp',
        question: 'How would you describe your hair and scalp?',
        description: 'Consider your natural hair texture and condition without using products.',
        coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Dry & Frizzy',
                sublabel: 'Breaks easily, rough texture',
                image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Soft & Thin',
                sublabel: 'Fine hair, prone to greying or hair fall',
                image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Thick & Shiny',
                sublabel: 'Dense, smooth and healthy hair',
                image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    {
        section: 'Physical Traits',
        sectionIcon: '🧘',
        sectionColor: '#FFF0E6',
        sectionIndex: 0,

        id: 'skin',
        question: 'What is your natural skin type?',
        description: 'Observe your skin, especially face and hands, in its natural condition.',
        coverImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Dry & Rough',
                sublabel: 'Feels tight, needs frequent moisturizing',
                image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Normal / Combination',
                sublabel: 'Balanced with slight oiliness in T-zone',
                image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Oily & Smooth',
                sublabel: 'Naturally oily, visible pores',
                image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    // ══════════════ SECTION 2: FUNCTIONAL TRAITS ══════════════
    {
        section: 'Functional Traits',
        sectionIcon: '⚡',
        sectionColor: '#E8F5EE',
        sectionIndex: 1,
        id: 'hunger',
        question: 'How is your appetite usually?',
        description: 'Observe how often you feel hungry and how your body reacts after meals.',
        coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Irregular',
                sublabel: 'Sometimes very hungry, sometimes no appetite',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Strong & Regular',
                sublabel: 'Feels hungry on time with strong digestion',
                image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Low Appetite',
                sublabel: 'Feels full quickly, eats small portions',
                image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    {
        section: 'Functional Traits',
        sectionIcon: '⚡',
        sectionColor: '#E8F5EE',
        sectionIndex: 1,

        id: 'sleep',
        question: 'How is your natural sleep pattern?',
        description: 'Without stress or alarms, how does your sleep usually feel?',
        coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Light Sleep',
                sublabel: 'Wakes up easily, disturbed by small noises',
                image: 'https://images.unsplash.com/photo-1520206319751-4e2da59c3ed4?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Moderate Sleep',
                sublabel: 'Sleeps well and wakes up easily',
                image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Deep Sleep',
                sublabel: 'Very deep sleep, hard to wake up',
                image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    {
        section: 'Functional Traits',
        sectionIcon: '⚡',
        sectionColor: '#E8F5EE',
        sectionIndex: 1,

        id: 'activity_pace',
        question: 'How do you usually perform daily activities?',
        description: 'Think about your natural pace during work, errands, or daily life.',
        coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Fast & Active',
                sublabel: 'Always moving, finds it hard to stay still',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Balanced',
                sublabel: 'Steady and consistent pace',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Slow & Calm',
                sublabel: 'Takes time, prefers relaxed pace',
                image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    // ══════════════ SECTION 3: PSYCHOLOGICAL TRAITS ══════════════
    {
        section: 'Psychological Traits',
        sectionIcon: '🧠',
        sectionColor: '#EEF0FF',
        sectionIndex: 2,

        id: 'stress_response',
        question: 'How do you react in stressful situations?',
        description: 'Think about your natural first reaction when facing pressure or challenges.',
        coverImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Anxious & Restless',
                sublabel: 'Overthinks and feels uneasy',
                image: 'https://images.unsplash.com/photo-1455793185729-b65c4d24bfaf?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Bold & Reactive',
                sublabel: 'Direct and sometimes aggressive',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Calm & Composed',
                sublabel: 'Handles situations patiently',
                image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

    {
        section: 'Psychological Traits',
        sectionIcon: '🧠',
        sectionColor: '#EEF0FF',
        sectionIndex: 2,

        id: 'hobbies',
        question: 'What kind of activities do you enjoy?',
        description: 'Think about what you naturally like to do in your free time.',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
        dosha: true,
        options: [
            {
                label: 'Social & Outgoing',
                sublabel: 'Enjoy meeting people and socializing',
                image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
                dosha: 'V',
            },
            {
                label: 'Competitive & Analytical',
                sublabel: 'Enjoy challenges and problem-solving',
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
                dosha: 'P',
            },
            {
                label: 'Creative & Relaxing',
                sublabel: 'Enjoy art, music, or calm activities',
                image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
                dosha: 'K',
            },
        ],
    },

];
const SECTION_ICONS = [
    { uri: 'https://img.icons8.com/ios-filled/50/yoga.png' },
    { uri: 'https://img.icons8.com/ios-filled/50/energy.png' },
    { uri: 'https://img.icons8.com/ios-filled/50/brain.png' },
    { uri: 'https://img.icons8.com/ios-filled/50/user.png' },
];
const SECTIONS = ['Physical Traits', 'Functional Traits', 'Psychological Traits', 'Personal Info'];
const SECTION_COLORS = ['#FFF0E6', '#E8F5EE', '#EEF0FF', '#FFF8E6'];

// ─── SPLASH / WELCOME SCREEN ──────────────────────────────────
function Welcome({ onStart }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;


    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.welcomeContainer}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' }}
                style={styles.welcomeBg}
                resizeMode="cover"
            />
            <View style={styles.welcomeOverlay} />
            <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.welcomeLogo}>
                    <Text style={styles.welcomeLogoText}>🌿</Text>
                </View>
                <Text style={styles.welcomeTitle}>Ayurmuni</Text>
                <Text style={styles.welcomeSubtitle}>Prakriti Analysis</Text>
                <Text style={styles.welcomeDesc}>
                    Apni natural Ayurvedic body constitution discover karo.{'\n'}
                    Sirf 10–12 questions — 5 minute se kam!
                </Text>
                <View style={styles.doshaRow}>
                    {[
                        { label: 'Vata', icon: '🌬', color: Colors.primaryColor, sub: 'Air & Space' },
                        { label: 'Pitta', icon: '🔥', color:Colors.primaryColor , sub: 'Fire & Water' },
                        { label: 'Kapha', icon: '🌊', color: Colors.primaryColor, sub: 'Earth & Water' },
                    ].map(d => (
                        <View key={d.label} style={styles.doshaChip}>
                            <Text style={styles.doshaChipIcon}>{d.icon}</Text>
                            <Text style={styles.doshaChipLabel}>{d.label}</Text>
                            <Text style={styles.doshaChipSub}>{d.sub}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
                    <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
                
                <Text style={styles.welcomeFineText}>Free · No login required · Results turant milenge</Text>
            </Animated.View>
        </View>
    );
}

// ─── OPTION CARD (Image-first) ────────────────────────────────
function OptionCard({ option, selected, onPress, index }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const selectAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(selectAnim, {
            toValue: selected ? 1 : 0,
            duration: 220,
            useNativeDriver: false,
        }).start();
    }, [selected]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    const borderColor = selectAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E6E6E6', '#0D614E'],
    });

    const bgColor = selectAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#F1F8F6'],
    });

    return (
        <Animated.View style={[styles.optionCardWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Animated.View
                style={{
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor,
                    backgroundColor: bgColor,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>

                    {/* IMAGE */}
                    <View>
                        <Image
                            source={{ uri: option.image }}
                            style={{
                                width: '100%',
                                height: 90,
                            }}
                        />

                        {/* subtle overlay */}
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.15)',
                            }}
                        />

                        {/* CHECK ICON */}
                        {selected && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: '#0D614E',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{
                                    color: '#fff',
                                    fontSize: 11,
                                    fontFamily: Fonts.PoppinsSemiBold
                                }}>
                                    ✓
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* TEXT */}
                    <View style={{ padding: 10 }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 13,
                                fontFamily: Fonts.PoppinsSemiBold,
                                color: selected ? '#0D614E' : '#1A1A1A',
                                marginBottom: 3,
                            }}
                        >
                            {option.label}
                        </Text>

                        <Text
                            numberOfLines={2}
                            style={{
                                fontSize: 11,
                                fontFamily: Fonts.PoppinsRegular,
                                color: selected ? '#0D614ECC' : '#666',
                                lineHeight: 15,
                            }}
                        >
                            {option.sublabel}
                        </Text>
                    </View>

                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

// ─── QUESTION SCREEN ──────────────────────────────────────────
function QuestionScreen({ question, qIndex, total, answer, onAnswer, onNext, onBack }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fadeAnim.setValue(0); slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
    }, [qIndex]);

    const progress = (qIndex + 1) / total;
    const sectionColor = SECTION_COLORS[question.sectionIndex];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Top Bar */}
            <View style={styles.topBar}>

                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Image source={Images.backIcon} style={{ height: 40, width: 40 }} />
                </TouchableOpacity>


                <View style={styles.topBarCenter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image
                            source={SECTION_ICONS[question.sectionIndex]}
                            style={{ width: 14, height: 14, tintColor: C.deep }}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Image
                                source={SECTION_ICONS[question.sectionIndex]}
                                style={{ width: 16, height: 16, tintColor: C.saffron }}
                            />
                            <Text style={styles.topBarSection}>{question.section}</Text>
                        </View>

                    </View>

                    <Text style={styles.topBarCount}>{qIndex + 1} / {total}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress */}
            <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>

                <View style={styles.sectionDots}>
                    {SECTIONS.map((s, i) => {
                        const done = i < question.sectionIndex;
                        const active = i === question.sectionIndex;
                        return (

                            <View style={[
                                styles.sectionDot,
                                done && { backgroundColor: Colors.primaryColor, borderColor: Colors.green },
                                active && { backgroundColor: Colors.background, borderColor: Colors.primaryColor },
                            ]}>
                                {done ? (
                                    <Text style={{ fontSize: 10, color: 'white' }}>✓</Text>
                                ) : (
                                    <Image
                                        source={SECTION_ICONS[i]}
                                        style={{ width: 15, height: 15, tintColor: active ? Colors.black  : Colors.white}}
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    <View style={styles.coverWrap}>
                        <Image
                            source={{ uri: question.coverImage }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />

                        <View style={styles.coverGradient} />
                        <View style={styles.coverTextWrap}>
                            <View style={[styles.sectionBadge, { backgroundColor: sectionColor }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Image
                                        source={SECTION_ICONS[question.sectionIndex]}
                                        style={{ width: 16, height: 16, tintColor: C.saffron }}
                                    />
                                    <Text style={styles.topBarSection}>{question.section}</Text>
                                </View>
                                {/* <Text style={styles.sectionBadgeText}>{question.sectionIcon} {question.section}</Text> */}
                            </View>
                            <Text style={styles.questionText}>{question.question}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descWrap}>
                        <Text style={styles.descText}> {question.description}</Text>
                    </View>

                    {/* Options Grid */}
                    <View style={styles.optionsGrid}>
                        {question.options.map((opt, i) => (
                            <OptionCard
                                key={i}
                                option={opt}
                                selected={answer === i}
                                onPress={() => onAnswer(i)}
                                index={i}
                            />
                        ))}
                    </View>

                    <View style={{ height: S.xxl }} />
                </Animated.View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.btnBack} onPress={onBack}>
                    <Text style={styles.btnBackText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btnNext, answer === null && styles.btnNextDisabled]}
                    onPress={answer !== null ? onNext : undefined}
                    disabled={answer === null}
                >
                    <Text style={styles.btnNextText}>
                        {qIndex === total - 1 ? 'Submit' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── RESULT SCREEN ────────────────────────────────────────────
function ResultScreen({ scores, onRestart }) {
    const total = (scores.V + scores.P + scores.K) || 1;
    const vp = Math.round(scores.V / total * 100);
    const pp = Math.round(scores.P / total * 100);
    const kp = Math.round(scores.K / total * 100);

    const dominant = scores.V >= scores.P && scores.V >= scores.K ? 'Vata'
        : scores.P >= scores.K ? 'Pitta' : 'Kapha';

    const info = {
        Vata: {
            emoji: '🌬', color: C.vata,
            title: 'Vata Prakriti',
            sub: 'Air & Space dominant',
            desc: 'Tujhe creativity, speed aur flexibility milti hai Vata se. Light food, warm drinks aur regular routine teri health ke liye best hai.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
            tips: ['🍵 Garam khana aur drinks lena', '🧘 Roz meditation karo', '🛏️ Neend ka time fix rakho', '🌿 Tel massage helpful hai'],
        },
        Pitta: {
            emoji: '🔥', color: C.pitta,
            title: 'Pitta Prakriti',
            sub: 'Fire & Water dominant',
            desc: 'Teri strong digestion, sharp mind aur leadership quality Pitta se aati hai. Cooling foods aur stress management teri key hai.',
            image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
            tips: ['🥗 Thanda aur refreshing khana', '🌊 Paani zyaada piyo', '😌 Anger management practice karo', '🌙 Dhoop se bachna'],
        },
        Kapha: {
            emoji: '🌊', color: C.kapha,
            title: 'Kapha Prakriti',
            sub: 'Earth & Water dominant',
            desc: 'Teri stability, loyalty aur endurance Kapha ki gift hai. Light food, regular exercise aur variety teri energy badhayegi.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
            tips: ['🏃 Roz exercise zaroor karo', '🌶️ Light spicy khana helpful', '🌅 Subah jaldi utho', '🚫 Zyaada sona avoid karo'],
        },
    };

    const d = info[dominant];
    const barAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.timing(barAnim, { toValue: 1, duration: 1000, delay: 300, useNativeDriver: false }).start(); }, []);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.cardBackground }} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: d.image }} style={styles.resultHeroImg} resizeMode="cover" />
            <View style={[styles.resultHeroOverlay, { backgroundColor: Colors.background + '99' }]} />
            <View style={styles.resultHeroContent}>
                <Image
                    source={{ uri: d.image }}
                    style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 10 }}
                />
                <Text style={styles.resultTitle}>{d.title}</Text>
                <Text style={styles.resultSub}>{d.sub}</Text>
            </View>

            <View style={styles.resultBody}>
                <Text style={styles.resultDesc}>{d.desc}</Text>

                {/* Dosha Bars */}
                <View style={styles.resultCard}>
                    <Text style={styles.resultCardTitle}>Your Dosha Profile</Text>
                    {[
                        { label: '🌬 Vata', pct: vp, color: C.vata },
                        { label: '🔥 Pitta', pct: pp, color: C.pitta },
                        { label: '🌊 Kapha', pct: kp, color: C.kapha },
                    ].map(row => (
                        <View key={row.label} style={{ marginBottom: 14 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={styles.doshaBarlabel}>{row.label}</Text>
                                <Text style={[styles.doshaBarlabel, { color: row.color }]}>{row.pct}%</Text>
                            </View>
                            <View style={styles.doshaBarTrack}>
                                <Animated.View style={[styles.doshaBarFill, {
                                    backgroundColor: row.color,
                                    width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', row.pct + '%'] }),
                                }]} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.resultCard}>
                    <Text style={styles.resultCardTitle}>Your Lifestyle Tips</Text>
                    {d.tips.map((tip, i) => (
                        <View key={i} style={styles.tipRow}>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
                    <Text style={styles.restartBtnText}>Try Again</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </View>
        </ScrollView>
    );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function AssessmentScreen() {
    const [screen, setScreen] = useState('welcome');
    const [qIndex, setQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [scores, setScores] = useState({ V: 0, P: 0, K: 0 });

    const total = QUESTIONS_DATA.length;

    const handleStart = () => setScreen('quiz');

    const handleAnswer = (optIndex: any) => {
        setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    };

    const handleNext = () => {
        const q = QUESTIONS_DATA[qIndex];
        const optIndex = answers[qIndex];
        if (q.dosha && optIndex !== undefined) {
            const d = q.options[optIndex].dosha;
            if (d) setScores(prev => ({ ...prev, [d]: prev[d] + 1 }));
        }
        if (qIndex < total - 1) setQIndex(i => i + 1);
        else setScreen('result');
    };

    const handleBack = () => {
        if (qIndex === 0) setScreen('welcome');
        else setQIndex(i => i - 1);
    };

    const handleRestart = () => {
        setScreen('welcome');
        setQIndex(0);
        setAnswers({});
        setScores({ V: 0, P: 0, K: 0 });
    };

    if (screen === 'welcome') return <Welcome onStart={handleStart} />;
    if (screen === 'result') return <ResultScreen scores={scores} onRestart={handleRestart} />;

    return (
        <QuestionScreen
            question={QUESTIONS_DATA[qIndex]}
            qIndex={qIndex}
            total={total}
            answer={answers[qIndex] !== undefined ? answers[qIndex] : null}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
        />
    );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({

    // Welcome
    welcomeContainer: { flex: 1, backgroundColor: '#1A0E06' },
    welcomeBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    welcomeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,14,6,0.72)' },
    welcomeContent: { flex: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40, justifyContent: 'center' },
    welcomeLogo: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    welcomeLogoText: { fontSize: 30 },
    welcomeTitle: { fontSize: 36, fontFamily : Fonts.PoppinsSemiBold, color: C.white, letterSpacing: 0.5 },
    welcomeSubtitle: { fontSize: 16,  fontFamily : Fonts.PoppinsMedium, color: Colors.secondaryColor, marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase' },
    welcomeDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily : Fonts.PoppinsMedium, lineHeight: 24, marginBottom: 30 },
    doshaRow: { flexDirection: 'row', gap: 10, marginBottom: 36 },
    doshaChip: { flex: 1, backgroundColor: Colors.cardBackground, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    doshaChipIcon: { fontSize: 20, fontFamily : Fonts.PoppinsMedium, color: Colors.white,  marginBottom: 4 },
    doshaChipLabel: { fontSize: 12,  fontFamily : Fonts.PoppinsMedium, color: Colors.black, },
    doshaChipSub: { fontSize: 10, color: 'rgba(20, 19, 19, 0.6)',  fontFamily : Fonts.PoppinsMedium, textAlign: 'center', marginTop: 2 },
    startBtn: { backgroundColor: Colors.primaryColor, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16,  shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
    startBtnText: { fontSize: 17,fontFamily : Fonts.PoppinsMedium, color: C.white, letterSpacing: 0.5 },
    welcomeFineText: { fontSize: 12, color: 'rgba(255,255,255,0.5)',  fontFamily : Fonts.PoppinsMedium, textAlign: 'center' },

    // Layout
    safeArea: { flex: 1, backgroundColor: C.white },
    scroll: { flex: 1, backgroundColor: C.cream },

    // Top Bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: S.lg,
        paddingVertical: S.md,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderColor,
    },
    // topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: Colors.primaryColor },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    backBtnText: { fontSize: 20, color: C.saffron, fontWeight: '600' },
    topBarCenter: { flex: 1, alignItems: 'center' },
    topBarSection: { fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: C.deep },
    topBarCount: { fontSize: 14, color: Colors.subTextColor, fontFamily: Fonts.PoppinsMedium, marginTop: 2 },
    // Progress
    progressWrap: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
    progressTrack: { height: 4, backgroundColor: Colors.borderColor, borderRadius: 99, overflow: 'hidden', marginBottom: 10 },
    progressFill: { height: '100%', backgroundColor: Colors.primaryColor, borderRadius: 99 },
    sectionDots: { flexDirection: 'row', gap: 8 },
    sectionDot: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: Colors.primaryColor, borderWidth: 1, borderColor: Colors.borderColor, alignItems: 'center', justifyContent: 'center' },

    // Cover
    coverWrap: { height: 220, position: 'relative', marginBottom: 0 },
    coverImage: { width: '100%', height: '100%' },
    coverGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,14,6,0.55)' },
    coverTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    sectionBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 8 },
    sectionBadgeText: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: Colors.subTextColor },
    questionText: { fontSize: 18, fontFamily: Fonts.PoppinsMedium, color: C.white, lineHeight: 28, },

    // Description
    descWrap: { backgroundColor: Colors.background, padding: 14, marginHorizontal: 14, marginTop: 14, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.primaryColor },
    descText: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: C.deep, lineHeight: 20 },

    // Options
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: S.lg,
        marginTop: S.lg,
    },

    optionCardWrap: {
        width: (SW - (S.lg * 2) - S.sm) / 2, // PERFECT CALCULATION
        marginBottom: S.md,
    },

    //   optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 9, marginTop: 16 },
    optionCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: C.border, backgroundColor: C.white, flex: 1, width: (SW - 44) / 2 },
    optionCardSelected: { borderColor: C.saffron, shadowColor: C.saffron, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    optionImage: { width: '100%', height: 100 },
    optionTick: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: C.saffron, alignItems: 'center', justifyContent: 'center' },
    optionBottom: { padding: 10, backgroundColor: C.white },
    optionBottomSelected: { backgroundColor: C.saffronLight },
    optionLabel: { fontSize: 12, fontWeight: '700', color: C.deep, marginBottom: 2 },
    optionLabelSelected: { color: C.saffron },
    optionSublabel: { fontSize: 10, color: C.muted, lineHeight: 14 },
    optionSublabelSelected: { color: C.saffron + 'CC' },

    // Nav Bar
    navBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: Colors.primaryColor },
    btnBack: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.borderColor, alignItems: 'center' },
    btnBackText: { fontSize: 15, fontFamily: Fonts.PoppinsMedium, color: Colors.textColor },
    btnNext: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primaryColor, alignItems: 'center',  shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
    btnNextDisabled: { backgroundColor: Colors.cardBackground, shadowOpacity: 0.1, elevation: 0  },
    btnNextText: { fontSize: 15, fontWeight: '700', color: C.white },

    // Result
    resultHeroImg: { width: '100%', height: 280 },
    resultHeroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
    resultHeroContent: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
    resultEmoji: { fontSize: 52, marginBottom: 10 },
    resultTitle: { fontSize: 30, fontFamily:Fonts.PoppinsMedium, color: Colors.white, },
    resultSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, fontFamily: Fonts.PoppinsMedium, textTransform: 'uppercase', marginTop: 4 },
    resultBody: { backgroundColor: C.cream, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    resultDesc: { fontSize: 14, color: Colors.textColor, lineHeight: 24, marginBottom: 20, fontFamily: Fonts.PoppinsMedium, marginTop: 4 },
    resultCard: { backgroundColor: C.white, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.primaryColor },
    resultCardTitle: { fontSize: 16, fontFamily : Fonts.PoppinsSemiBold, color: Colors.black, marginBottom: 16, },
    doshaBarlabel: { fontSize: 14, fontFamily : Fonts.PoppinsMedium, color: Colors.black,  },
    doshaBarTrack: { height: 10, backgroundColor: '#0D614E0D', borderRadius: 99, overflow: 'hidden' },
    doshaBarFill: { height: '100%', borderRadius: 99 },
    tipRow: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBackground },
    tipText: { fontSize: 14, fontFamily: Fonts.PoppinsRegular, color: Colors.black, lineHeight: 20 },
    restartBtn: { backgroundColor: Colors.primaryColor, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    restartBtnText: { fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: C.white },
});