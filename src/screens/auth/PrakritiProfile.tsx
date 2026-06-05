import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import { Styles } from '../../common/Styles';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';


const { width } = Dimensions.get('window');

interface GuidelineCardProps {
  title: string;
  color: string;
  icon: any;
  image: any;
  data: any[];
}

const PrakritiProfile = (props: any) => {

  const [analysisData, setAnalysisData] = React.useState<any>({
    dominantType: '',
    subtitle: '',
    doshas: [],
    coreEssence: {
      title: '',
      description: '',
    },
    lifestyleGuidelines: {
      doList: [],
      dontList: [],
    },
  });


  useEffect(() => {
    getPrakritiInfo();
    // console.log('analysisData', analysisData);
  }, []);

  const getPrakritiInfo = async () => {
    try {
      const response: any =
        await _PROFILE_SERVICES.get_prakriti_info();

      console.log(
        'prakriti-response',
        response,
      );

      if (response?.success) {
        const apiData = response?.data;

        // ===== RESULT =====

        const dominantType =
          apiData?.result || '';

        // ===== DOSHAS =====

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

        // ===== TITLE =====

        const getDynamicTitle = (
          result: string,
        ) => {
          switch (
          result?.toLowerCase()
          ) {
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

        // ===== FINAL FORMATTED DATA =====

        const formattedData = {
          dominantType,

          subtitle:
            'Your unique Ayurvedic soul-print.',

          doshas,

          coreEssence: {
            title:
              getDynamicTitle(
                dominantType,
              ),

            description:
              apiData?.content
                ?.core_essence || '',
          },

          lifestyleGuidelines: {
            doList:
              apiData?.content
                ?.lifestyle?.["do's"] ||
              [],

            dontList:
              apiData?.content
                ?.lifestyle?.["don'ts"] ||
              [],
          },
        };

        console.log(
          'formattedData',
          formattedData,
        );

        setAnalysisData(
          formattedData,
        );
      }
    } catch (error) {
      console.log(
        'prakriti-error',
        error,
      );
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatusBar barStyle={'dark-content'} backgroundColor={Colors.primaryColor} />
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => props.navigation.goBack()}>
            <Image source={Images.backIcon} style={{ height: 40, width: 40 }} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Prakriti Analysis</Text>

          <TouchableOpacity style={styles.iconBtn}>
            <Image source={Images.share} style={{ height: 40, width: 40 }} />
          </TouchableOpacity>
        </View>

        {/* ===== TOP CONTENT ===== */}
        <View style={styles.topSection}>
          <Text style={styles.completedText}>
            PRAKRITI ANALYSIS COMPLETE
          </Text>

          <Text style={styles.mainTitle}>
            {analysisData?.dominantType || 'Your Prakriti Type'}
          </Text>

          <Text style={styles.subtitle}>
            Your unique Ayurvedic soul-print, Priya.
          </Text>
        </View>

        {/* ===== DOSHA CARD ===== */}
        <View style={styles.doshaCard}>
          {analysisData.doshas.map((item: any) => (
            <View key={item.id} style={styles.doshaItem}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    borderColor: item.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.doshaIcon,
                    {
                      color: item.color,
                    },
                  ]}
                >
                  {item.icon}
                </Text>
              </View>

              <Text style={styles.doshaName}>{item.name}</Text>

              <Text style={styles.doshaPercent}>
                {item.percentage}%
              </Text>
            </View>
          ))}
        </View>

        {/* ===== CORE ESSENCE ===== */}
        <View style={styles.essenceCard}>
          <Text style={styles.smallHeading}>CORE ESSENCE</Text>

          <Text style={styles.essenceTitle}>
            {analysisData.coreEssence.title}
          </Text>

          <Text style={styles.essenceDescription}>
            {analysisData.coreEssence.description}
          </Text>
        </View>

        {/* ===== GUIDELINES ===== */}
        <View style={styles.guidelineHeader}>
          <Text style={styles.guidelineTitle}>
            Lifestyle Guidelines
          </Text>

          <Text style={styles.personalizedText}>
            Personalized
          </Text>
        </View>

        {/* ===== DO CARD ===== */}
        <GuidelineCard
          title="Daily Rituals (Do's)"
          color={Colors.primaryColor}
          icon={require('../../assets/images/check-icon.png')}
          image={require('../../assets/images/bullettick.png')}
          data={analysisData.lifestyleGuidelines.doList}
        />

        {/* ===== DONT CARD ===== */}
        <GuidelineCard
          title="To Avoid (Don'ts)"
          color="#EA580C"
          image={require('../../assets/images/crosstick.png')}
          icon={require('../../assets/images/DontIcon.png')}
          data={analysisData.lifestyleGuidelines.dontList}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrakritiProfile;

const GuidelineCard = ({
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
  );
};


// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // ===== HEADER =====
  header: {
    backgroundColor: '#0B7358',
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

  iconText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
  },

  // ===== TOP SECTION =====
  topSection: {
    backgroundColor: '#0B7358',
    paddingHorizontal: 20,
    // paddingBottom: 80,
    paddingTop: 30,
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
});