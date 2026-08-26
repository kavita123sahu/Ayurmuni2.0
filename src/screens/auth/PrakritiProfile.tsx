import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { PrakritiProfileSkeleton } from '../../simmerScreen/ShimmerHook';
import BackIconButton from '../../components/BackIconButton';
import TablerIcon from '../../components/TablerIcon';


const { width } = Dimensions.get('window');

const getDynamicTitle = (result: string) => {
  switch (result?.toLowerCase()) {
    case 'vata':
      return 'The Visionary';
    case 'pitta':
      return 'The Leader';
    case 'kapha':
      return 'The Nurturer';
    case 'vata-pitta':
      return 'The Dynamic Creator';
    case 'pitta-kapha':
      return 'The Strategic Builder';
    case 'vata-kapha':
      return 'The Calm Innovator';
    default:
      return 'Balanced Soul';
  }
};

const formatPrakritiData = (apiData: any) => {
  const dominantType = apiData?.result || '';

  const doshas = [
    {
      id: 1,
      name: 'VATA',
      percentage: apiData?.vata || 0,
      color: '#2563EB',
      icon: '༄',
    },
    {
      id: 2,
      name: 'PITTA',
      percentage: apiData?.pitta || 0,
      color: '#F59E0B',
      icon: '🔥',
    },
    {
      id: 3,
      name: 'KAPHA',
      percentage: apiData?.kapha || 0,
      color: '#87ccea',
      icon: '💧',
    },
  ];

  return {
    dominantType,
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

interface GuidelineCardProps {
  title: string;
  color: string;
  icon: any;
  image: any;
  data: any[];
}

const PrakritiProfile = (props: any) => {
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
      console.log('prakiirinanauluysysy', response);

      // Right after submit, result API can lag — one short retry
      // if (!hasValidPrakritiPayload(response) && fromAssessment) {
      //   await new Promise(resolve => setTimeout(resolve, 700));
      //   response = await _PROFILE_SERVICES.get_prakriti_info();
      // }

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
    // After PatientFAQ assessment → back is disabled; use Continue to Home
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
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        // Block hardware back after assessment; stay on results
        return true;
      });
      return () => sub.remove();
    }, [fromAssessment]),
  );

  const handleEditAssessment = () => {
    props.navigation.navigate('PatientFAQ', { allowBack: true });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Image
          source={Images.FinalLogo}
          style={{ height: 80, width: 80, tintColor: Colors.primaryColor }}
        />
      </View>

      <Text style={styles.emptyTitle}>No Prakriti Assessment Yet</Text>

      <Text style={styles.emptyDescription}>
        Complete a short Ayurvedic assessment to discover your unique body
        constitution and receive personalized health recommendations.
      </Text>

      <View style={styles.featureCard}>
        <View style={styles.featureRow}>
          <TablerIcon name="spoon" size={18} color={Colors.primaryColor} />
          <Text style={styles.featureText}>Personalized Analysis</Text>
        </View>

        <View style={styles.featureRow}>
          <TablerIcon name="briefcase" size={18} color={Colors.primaryColor} />
          <Text style={styles.featureText}>Diet Recommendations</Text>
        </View>

        <View style={styles.featureRow}>
          <TablerIcon name="heart" size={18} color={Colors.primaryColor} />
          <Text style={styles.featureText}>Lifestyle Guidance</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => props.navigation.navigate('PatientFAQ')}
      >
        <Text style={styles.startBtnText}>Start Assessment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisContent = () => {
    if (!analysisData) {
      return renderEmptyState();
    }

    return (
      <>
        <View style={styles.topSection}>
          <Text style={styles.completedText}>
            {fromAssessment
              ? 'ASSESSMENT COMPLETE'
              : 'PRAKRITI ANALYSIS COMPLETE'}
          </Text>
          <Text style={styles.mainTitle}>
            {analysisData.dominantType || 'Your Prakriti Type'}
          </Text>
          <Text style={styles.subtitle}>
            Your unique Ayurvedic body constitution.
          </Text>
        </View>

        <View style={styles.doshaCard}>
          {analysisData.doshas.map((item: any) => (
            <View key={item.id} style={styles.doshaItem}>
              <View style={[styles.iconCircle, { borderColor: item.color }]}>
                <Text style={[styles.doshaIcon, { color: item.color }]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={styles.doshaName}>{item.name}</Text>
              <Text style={styles.doshaPercent}>{item.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* Ask again — retake / update current body type */}
        <View style={styles.reassessCard}>
          <View style={styles.reassessCopy}>
            <Text style={styles.reassessTitle}>
              Update your current body type?
            </Text>
            <Text style={styles.reassessSub}>
              Retake the Prakriti assessment anytime if your lifestyle or balance
              has changed.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reassessBtn}
            activeOpacity={0.9}
            onPress={() => props.navigation.navigate('PatientFAQ')}
          >
            <Text style={styles.reassessBtnText}>Assess again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.essenceCard}>
          <Text style={styles.smallHeading}>CORE ESSENCE</Text>
          <Text style={styles.essenceTitle}>
            {analysisData.coreEssence.title}
          </Text>
          <Text style={styles.essenceDescription}>
            {analysisData.coreEssence.description}
          </Text>
        </View>

        <View style={styles.guidelineHeader}>
          <Text style={styles.guidelineTitle}>Lifestyle Guidelines</Text>
          <Text style={styles.personalizedText}>Personalized</Text>
        </View>

        <GuidelineCard
          title="Daily Rituals (Do's)"
          color={Colors.primaryColor}
          icon={require('../../assets/images/check-icon.png')}
          image={require('../../assets/images/bullettick.png')}
          data={analysisData.lifestyleGuidelines.doList}
        />

        <GuidelineCard
          title="To Avoid (Don'ts)"
          color="#EA580C"
          image={require('../../assets/images/crosstick.png')}
          icon={require('../../assets/images/DontIcon.png')}
          data={analysisData.lifestyleGuidelines.dontList}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => props.navigation.navigate('PatientFAQ')}
          >
            <TablerIcon name="edit" size={14} color={Colors.primaryColor} />
            <Text style={styles.actionText}>Retake Prakriti</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: '#FED7AA' }]}
            onPress={() =>
              props.navigation.navigate('AssessmentType', { form: 'medical' })
            }
          >
            <TablerIcon name="edit" size={14} color={Colors.primaryColor} />
            <Text style={styles.actionText}>Body Type</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.homeBtn}
          onPress={handleGoHome}
        >
          <Text style={styles.homeBtnText}>
            {fromAssessment ? 'Continue to Home' : 'Go to Home'}
          </Text>
        </TouchableOpacity>
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
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        {fromAssessment ? (
          <View style={[styles.iconBtn, styles.iconBtnPlaceholder]} />
        ) : (
          <BackIconButton onPress={handleHeaderBack} style={styles.iconBtn} />
        )}

        <Text style={styles.headerTitle}>Prakriti Analysis</Text>

        {hasPrakriti && !loading ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleEditAssessment}
            activeOpacity={0.8}
          >
            {/* <TablerIcon name="" size={22} color={Colors.primaryColor} /> */}
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
    </SafeAreaView>
  );
};

export default PrakritiProfile;

const GuidelineCard = React.memo(
  ({
    title,
    color,
    icon,
    image,
    data,
  }: GuidelineCardProps) => {
    return (
      <View
        style={[
          styles.guidelineCard,
          {
            borderLeftColor: color,
          },
        ]}
      >
        <View style={styles.guidelineTop}>
          <View
            style={[
              styles.guidelineIconWrap,
              {
                backgroundColor: `${color}15`,
              },
            ]}
          >

            <Image source={icon} style={{ height: 18, width: 18, tintColor: color }} />
          </View>

          <Text
            style={[
              styles.guidelineCardTitle,
              {
                color,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        {data.map((item: any, index: any) => (
          <View key={index} style={styles.bulletRow}>
            <View
              style={[
                styles.bulletDot,
                {
                  borderColor: color,
                },
              ]}
            >
              <Image source={image} style={{ height: 18, tintColor: color, width: 18, resizeMode: 'contain' }} />
            </View>

            <Text style={styles.bulletText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    )
  })


// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
    // backgroundColor: '#F5F5F5',
  },

  scrollContent: {
    paddingBottom: 40,
    backgroundColor: Colors.white
  },

  // ===== HEADER =====
  header: {

    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBtnPlaceholder: {
    width: 34,
    height: 34,
  },

  iconText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#000000',
  },


  //EMPTY CONATINER 
  emptyContainer: {
    // margin: 20,
    // // backgroundColor: '#FFFFFF',
    // borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
  },

  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 24,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  featureCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginTop: 24,
    padding: 18,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  featureText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },

  startBtn: {
    marginTop: 28,
    width: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  // ===== TOP SECTION =====
  topSection: {
    backgroundColor: '#0B7358',
    paddingHorizontal: 20,
    // paddingBottom: 80,
    paddingTop: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 120
  },

  completedText: {
    fontSize: 12,
    color: '#5AD0B1',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  mainTitle: {
    fontSize: 42,
    color: '#FFFFFF',
    marginBottom: -15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    fontSize: 14,
    color: '#FFFFFF99',
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 22,
  },

  reassessCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7EBE3',
  },
  reassessCopy: {
    marginBottom: 12,
  },
  reassessTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 4,
  },
  reassessSub: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  reassessBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reassessBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ===== DOSHA CARD =====
  doshaCard: {
    width: width - 32,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,

    marginTop: -90,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  doshaItem: {
    alignItems: 'center',
    flex: 1,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  doshaIcon: {
    fontSize: 22,
    fontWeight: '700',
  },

  doshaName: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
    letterSpacing: 1,
  },

  doshaPercent: {
    fontSize: 20,
    color: '#061E0E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ===== CORE ESSENCE =====
  essenceCard: {
    marginHorizontal: 16,
    marginTop: 26,
    borderRadius: 28,
    padding: 35,
    backgroundColor: Colors.primaryColor,
  },

  smallHeading: {
    color: '#B5E6D8',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 1,
    marginBottom: 14,
  },

  essenceTitle: {
    color: '#FFC52D',
    fontSize: 30,
    fontFamily: Fonts.PoppinsBold,
    marginBottom: 8,
  },

  essenceDescription: {
    color: '#FFFFFFB2',
    fontSize: 14,
    lineHeight: 23,
    fontFamily: Fonts.PoppinsMedium,
  },

  // ===== GUIDELINE =====
  guidelineHeader: {
    marginTop: 28,
    marginBottom: 18,
    marginHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  guidelineTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1F2937',
  },

  personalizedText: {
    color: '#F5A623',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  // Action Edit

  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    paddingHorizontal: 20,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },

  actionText: {
    marginLeft: 5,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  guidelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 24,
    padding: 20,
    borderLeftWidth: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  guidelineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  guidelineIconWrap: {
    width: 35,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  guidelineIcon: {
    fontSize: 16,
    fontWeight: '700',
  },

  guidelineCardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  bulletDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    // borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
  },

  bulletTick: {
    fontSize: 10,
    fontWeight: '700',
  },

  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    fontWeight: '500',
  },
  homeBtn: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    backgroundColor: '#FFFFFF',
  },
  editBtnText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});