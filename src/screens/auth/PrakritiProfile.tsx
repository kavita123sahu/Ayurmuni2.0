import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  BackHandler,
  Animated,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { PrakritiProfileSkeleton } from '../../simmerScreen/ShimmerHook';
import BackIconButton from '../../components/BackIconButton';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { PRAKRITI_IMAGES } from '../../common/DataInterface';

type DoshaItem = {
  id: number;
  name: string;
  percentage: number;
  color: string;
  soft: string;
  icon: TablerIconName;
  label: string;
};

const getDynamicTitle = (result: string) => {
  switch (result?.toLowerCase()) {
    case 'vata':
      return 'The Visionary';
    case 'pitta':
      return 'The Leader';
    case 'kapha':
      return 'The Nurturer';
    case 'vata-pitta':
    case 'pitta-vata':
      return 'The Dynamic Creator';
    case 'pitta-kapha':
    case 'kapha-pitta':
      return 'The Strategic Builder';
    case 'vata-kapha':
    case 'kapha-vata':
      return 'The Calm Innovator';
    default:
      return 'Balanced Soul';
  }
};

const formatDominantLabel = (result?: string) => {
  if (!result) return 'Your Prakriti';
  return String(result)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
};

const resolvePrakritiImage = (result?: string) => {
  if (!result) return undefined;
  const raw = String(result).trim();
  if (PRAKRITI_IMAGES[raw]) return PRAKRITI_IMAGES[raw];

  const titled = raw
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('-');

  const match = Object.entries(PRAKRITI_IMAGES).find(
    ([key]) => key.toLowerCase() === raw.toLowerCase() || key.toLowerCase() === titled.toLowerCase(),
  );
  return match?.[1];
};

const formatPrakritiData = (apiData: any) => {
  const dominantType = apiData?.result || '';

  const doshas: DoshaItem[] = [
    {
      id: 1,
      name: 'VATA',
      label: 'Air & Space',
      percentage: Number(apiData?.vata) || 0,
      color: '#2563EB',
      soft: '#EFF6FF',
      icon: 'bolt',
    },
    {
      id: 2,
      name: 'PITTA',
      label: 'Fire & Water',
      percentage: Number(apiData?.pitta) || 0,
      color: '#F59E0B',
      soft: '#FFFBEB',
      icon: 'flame',
    },
    {
      id: 3,
      name: 'KAPHA',
      label: 'Earth & Water',
      percentage: Number(apiData?.kapha) || 0,
      color: '#0EA5E9',
      soft: '#F0F9FF',
      icon: 'leaf',
    },
  ];

  return {
    dominantType,
    dominantLabel: formatDominantLabel(dominantType),
    imageUrl: resolvePrakritiImage(dominantType),
    subtitle: 'Your unique Ayurvedic soul-print.',
    doshas,
    coreEssence: {
      title: getDynamicTitle(dominantType),
      description: apiData?.content?.core_essence || '',
    },
    lifestyleGuidelines: {
      doList: apiData?.content?.lifestyle?.["do's"] || [],
      dontList: apiData?.content?.lifestyle?.["don'ts"] || [],
    },
  };
};

const hasValidPrakritiPayload = (response: any) => {
  if (!response || response.success !== true || !response?.data?.result) {
    return false;
  }

  const apiData = response?.data;
  if (!apiData || typeof apiData !== 'object') {
    return false;
  }

  const hasResult = Boolean(apiData?.result);
  const hasDoshas = [apiData?.vata, apiData?.pitta, apiData?.kapha].some(
    value => value != null && value !== '',
  );

  return hasResult || hasDoshas;
};

const DoshaMeter = ({ item, index }: { item: DoshaItem; index: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    widthAnim.setValue(0);
    Animated.timing(widthAnim, {
      toValue: Math.max(0, Math.min(100, item.percentage)),
      duration: 700,
      delay: 120 + index * 120,
      useNativeDriver: false,
    }).start();
  }, [item.percentage, index, widthAnim]);

  return (
    <View style={styles.meterRow}>
      <View style={[styles.meterIcon, { backgroundColor: item.soft }]}>
        <TablerIcon name={item.icon} size={16} color={item.color} />
      </View>
      <View style={styles.meterBody}>
        <View style={styles.meterTop}>
          <View>
            <Text style={styles.meterName}>{item.name}</Text>
            <Text style={styles.meterLabel}>{item.label}</Text>
          </View>
          <Text style={[styles.meterPercent, { color: item.color }]}>
            {item.percentage}%
          </Text>
        </View>
        <View style={styles.meterTrack}>
          <Animated.View
            style={[
              styles.meterFill,
              {
                backgroundColor: item.color,
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

interface GuidelineCardProps {
  title: string;
  subtitle: string;
  color: string;
  soft: string;
  icon: TablerIconName;
  data: any[];
  positive?: boolean;
}

const GuidelineCard = React.memo(
  ({ title, subtitle, color, soft, icon, data, positive }: GuidelineCardProps) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    return (
      <View style={styles.guidelineCard}>
        <View style={styles.guidelineTop}>
          <View style={[styles.guidelineIconWrap, { backgroundColor: soft }]}>
            <TablerIcon name={icon} size={18} color={color} />
          </View>
          <View style={styles.guidelineTitleWrap}>
            <Text style={[styles.guidelineCardTitle, { color }]}>{title}</Text>
            <Text style={styles.guidelineSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {data.map((item: any, index: number) => (
          <View
            key={`${title}-${index}`}
            style={[
              styles.bulletRow,
              index === data.length - 1 && styles.bulletRowLast,
            ]}
          >
            <View
              style={[
                styles.bulletDot,
                {
                  backgroundColor: soft,
                  borderColor: `${color}33`,
                },
              ]}
            >
              <TablerIcon
                name={positive ? 'check' : 'x'}
                size={12}
                color={color}
              />
            </View>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  },
);

const PrakritiProfile = (props: any) => {
  const insets = useSafeAreaInsets();
  const fromAssessment = Boolean(props?.route?.params?.fromAssessment);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPrakriti, setHasPrakriti] = useState(false);

  const getPrakritiInfo = useCallback(async () => {
    try {
      setLoading(true);
      setHasPrakriti(false);
      setAnalysisData(null);

      let response: any = await _PROFILE_SERVICES.get_prakriti_info();

      if (!hasValidPrakritiPayload(response) && fromAssessment) {
        await new Promise<void>(resolve => setTimeout(resolve, 700));
        response = await _PROFILE_SERVICES.get_prakriti_info();
      }

      if (!hasValidPrakritiPayload(response)) {
        setHasPrakriti(false);
        setAnalysisData(null);
        return;
      }

      setAnalysisData(formatPrakritiData(response.data));
      setHasPrakriti(true);
    } catch (error) {
      console.log('prakriti-error', error);
      setHasPrakriti(false);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  }, [fromAssessment]);

  useFocusEffect(
    useCallback(() => {
      getPrakritiInfo();
    }, [getPrakritiInfo]),
  );

  const handleGoHome = () => {
    props.navigation.replace('HomeStack', {
      screen: 'Home',
    });
  };

  const handleHeaderBack = useCallback(() => {
    if (fromAssessment) {
      return;
    }
    props.navigation.goBack();
  }, [fromAssessment, props.navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!fromAssessment) {
        return undefined;
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [fromAssessment]),
  );

  const handleEditAssessment = () => {
    props.navigation.navigate('PatientFAQ', { allowBack: true });
  };

  const handleStartAssessment = () => {
    props.navigation.navigate('PatientFAQ');
  };

  const dominantHighlight = useMemo(() => {
    if (!analysisData?.doshas?.length) return Colors.primaryColor;
    const top = [...analysisData.doshas].sort(
      (a: DoshaItem, b: DoshaItem) => b.percentage - a.percentage,
    )[0];
    return top?.color || Colors.primaryColor;
  }, [analysisData]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#E8F8F2', '#F7FAF9']}
        style={styles.emptyHero}
      >
        <View style={styles.emptyIconWrap}>
          <Image
            source={Images.FinalLogo}
            style={styles.emptyLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.emptyEyebrow}>Discover your nature</Text>
        <Text style={styles.emptyTitle}>Know your Prakriti</Text>
        <Text style={styles.emptyDescription}>
          A short Ayurvedic assessment reveals your body constitution and unlocks
          personalized diet & lifestyle guidance.
        </Text>
      </LinearGradient>

      <View style={styles.featureCard}>
        {[
          {
            icon: 'chart-pie' as TablerIconName,
            title: 'Dosha balance',
            copy: 'See your Vata, Pitta & Kapha mix',
          },
          {
            icon: 'leaf' as TablerIconName,
            title: 'Diet guidance',
            copy: 'Foods that support your constitution',
          },
          {
            icon: 'heart' as TablerIconName,
            title: 'Daily rituals',
            copy: 'Simple do’s and don’ts for balance',
          },
        ].map(item => (
          <View key={item.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <TablerIcon name={item.icon} size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.copy}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleStartAssessment}
        style={styles.startBtnWrap}
      >
        <LinearGradient
          colors={['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startBtn}
        >
          <Text style={styles.startBtnText}>Start assessment</Text>
          <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisContent = () => {
    if (!analysisData) {
      return renderEmptyState();
    }

    return (
      <>
        <LinearGradient
          colors={['#0B7358', '#0D614E', '#0A4F40']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <TablerIcon name="circle-check" size={14} color="#6EE7B7" />
            <Text style={styles.completedText}>
              {fromAssessment ? 'Assessment complete' : 'Prakriti analysis'}
            </Text>
          </View>

          <View style={styles.heroMain}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>Your dominant type</Text>
              <Text style={styles.mainTitle}>{analysisData.dominantLabel}</Text>
              <Text style={styles.subtitle}>
                {analysisData.coreEssence.title} · personalized for your balance
              </Text>
            </View>

            {analysisData.imageUrl ? (
              <View style={styles.heroImageWrap}>
                <Image
                  source={{ uri: analysisData.imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                style={[
                  styles.heroImageWrap,
                  styles.heroImageFallback,
                  { borderColor: dominantHighlight },
                ]}
              >
                <TablerIcon name="leaf" size={28} color="#FFFFFF" />
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.doshaCard}>
          <View style={styles.doshaHeader}>
            <Text style={styles.doshaCardTitle}>Dosha composition</Text>
            <Text style={styles.doshaCardHint}>Your unique mix</Text>
          </View>
          {analysisData.doshas.map((item: DoshaItem, index: number) => (
            <DoshaMeter key={item.id} item={item} index={index} />
          ))}
        </View>

        <View style={styles.essenceCard}>
          <LinearGradient
            colors={['#0D614E', '#117A64']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.essenceGradient}
          >
            <Text style={styles.smallHeading}>Core essence</Text>
            <Text style={styles.essenceTitle}>
              {analysisData.coreEssence.title}
            </Text>
            {analysisData.coreEssence.description ? (
              <Text style={styles.essenceDescription}>
                {analysisData.coreEssence.description}
              </Text>
            ) : (
              <Text style={styles.essenceDescription}>
                Your constitution guides how you digest, think, and restore.
                Follow the rituals below to stay in balance.
              </Text>
            )}
          </LinearGradient>
        </View>

        <View style={styles.guidelineHeader}>
          <View>
            <Text style={styles.guidelineTitle}>Lifestyle guidelines</Text>
            <Text style={styles.guidelineLead}>
              Built around your {analysisData.dominantLabel} nature
            </Text>
          </View>
          <View style={styles.personalizedPill}>
            <Text style={styles.personalizedText}>For you</Text>
          </View>
        </View>

        <GuidelineCard
          title="Daily rituals"
          subtitle="Support balance every day"
          color={Colors.primaryColor}
          soft="#ECF8F3"
          icon="circle-check"
          positive
          data={analysisData.lifestyleGuidelines.doList}
        />

        <GuidelineCard
          title="Things to ease"
          subtitle="Reduce friction for your dosha"
          color="#EA580C"
          soft="#FFF7ED"
          icon="alert-circle"
          data={analysisData.lifestyleGuidelines.dontList}
        />

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={handleEditAssessment}
          >
            <TablerIcon name="refresh" size={16} color={Colors.primaryColor} />
            <Text style={styles.secondaryBtnText}>Retake assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() =>
              props.navigation.navigate('AssessmentType', { form: 'medical' })
            }
          >
            <TablerIcon name="clipboard-list" size={16} color={Colors.primaryColor} />
            <Text style={styles.secondaryBtnText}>Body type</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 88 + insets.bottom }} />
      </>
    );
  };

  const renderBody = () => {
    if (loading) {
      return <PrakritiProfileSkeleton />;
    }

    if (!hasPrakriti) {
      return renderEmptyState();
    }

    return renderAnalysisContent();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        {fromAssessment ? (
          <View style={styles.iconBtnPlaceholder} />
        ) : (
          <BackIconButton onPress={handleHeaderBack} />
        )}

        <Text style={styles.headerTitle}>Prakriti Analysis</Text>

        {hasPrakriti && !loading ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleEditAssessment}
            activeOpacity={0.8}
          >
            <TablerIcon name="edit" size={18} color={Colors.primaryColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderBody()}
      </ScrollView>

      {hasPrakriti && !loading ? (
        <View
          style={[
            styles.stickyBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handleGoHome}>
            <LinearGradient
              colors={['#0D614E', '#14937A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.homeBtn}
            >
              <Text style={styles.homeBtnText}>
                {fromAssessment ? 'Continue to Home' : 'Go to Home'}
              </Text>
              <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default PrakritiProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EEF0',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },

  emptyContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyHero: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyLogo: {
    height: 52,
    width: 52,
    tintColor: Colors.primaryColor,
  },
  emptyEyebrow: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyTitle: {
    marginTop: 6,
    fontSize: 26,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Fonts.PoppinsRegular,
  },
  featureCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF3F1',
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.onfillColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  featureText: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  startBtnWrap: {
    marginTop: 22,
    borderRadius: 14,
    overflow: 'hidden',
  },
  startBtn: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 72,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 11,
    color: '#A7F3D0',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroKicker: {
    fontSize: 12,
    color: '#B5E6D8',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 34,
    lineHeight: 40,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 20,
  },
  heroImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  doshaCard: {
    marginHorizontal: 16,
    marginTop: -48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF3F1',
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 4 },
    }),
  },
  doshaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doshaCardTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  doshaCardHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  meterIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterBody: {
    flex: 1,
    minWidth: 0,
  },
  meterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  meterName: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  meterLabel: {
    marginTop: 1,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  meterPercent: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  meterTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 8,
  },

  essenceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  essenceGradient: {
    padding: 20,
  },
  smallHeading: {
    color: '#B5E6D8',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  essenceTitle: {
    color: '#FBBF24',
    fontSize: 24,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
    includeFontPadding: false,
  },
  essenceDescription: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.PoppinsRegular,
  },

  guidelineHeader: {
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  guidelineTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },
  guidelineLead: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  personalizedPill: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  personalizedText: {
    color: '#C2410C',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  guidelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF3F1',
  },
  guidelineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  guidelineIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guidelineTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  guidelineCardTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  guidelineSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletRowLast: {
    marginBottom: 0,
  },
  bulletDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontFamily: Fonts.PoppinsRegular,
  },

  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  secondaryBtnText: {
    color: Colors.primaryColor,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(253,253,251,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EEF0',
  },
  homeBtn: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
