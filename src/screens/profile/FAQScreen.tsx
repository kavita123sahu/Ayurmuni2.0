import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import StepCard from '../../components/StepCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import {
  formatFaqUpdatedLabel,
  useFaqDetail,
} from '../../hooks/useFaqs';
import { FAQ_CATEGORIES } from '../../services/FaqServices';

const FAQScreen = (props: any) => {
  const faqId = String(
    props?.route?.params?.faqId ||
    props?.route?.params?.id ||
    '',
  ).trim();
  const seedFaq = props?.route?.params?.faq || null;

  const { loading, faq, error, reload } = useFaqDetail(faqId || null);
  const detail = faq || seedFaq;

  const categoryLabel = useMemo(() => {
    if (!detail?.category) return detail?.category_label || '';
    const match = FAQ_CATEGORIES.find(
      c => c.key === String(detail.category).toLowerCase(),
    );
    return match?.title || detail.category_label || String(detail.category);
  }, [detail]);

  const metaLabel = formatFaqUpdatedLabel(detail);
  const imageUri = detail?.image_url || detail?.image || null;
  const steps = Array.isArray(detail?.steps) ? detail.steps : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="FAQ"
        onLeftPress={() => props.navigation.goBack()}
      />

      {loading && !detail ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primaryColor} />
          <Text style={styles.loaderText}>Loading article…</Text>
        </View>
      ) : error && !detail ? (
        <View style={styles.loader}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : !detail ? (
        <View style={styles.loader}>
          <Text style={styles.errorText}>FAQ not found</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: '#FDFDFB', paddingHorizontal: 20 }}
        >
          <View style={styles.content}>
            {!!categoryLabel && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{categoryLabel}</Text>
              </View>
            )}

            <Text style={styles.title}>{detail.question}</Text>

            {!!metaLabel && (
              <View style={styles.updatedBox}>
                <TablerIcon name="clock" size={16} color={Colors.primaryColor} />
                <Text style={styles.subText}>{metaLabel}</Text>
              </View>
            )}

            <Image
              source={imageUri ? { uri: String(imageUri) } : Images.FAQImage}
              style={styles.banner}
              resizeMode="cover"
            />

            {!!detail.answer && (
              <Text style={styles.description}>{detail.answer}</Text>
            )}

            {steps.length > 0 && (
              <StepCard title="Step-by-Step Instructions" steps={steps} />
            )}

            {!!detail.note && (
              <View style={styles.noteBox}>
                <View style={styles.iconCircle}>
                  <TablerIcon name="bell" size={20} color={Colors.primaryColor} />
                </View>
                <Text style={styles.noteText}>
                  <Text style={{ fontFamily: Fonts.PoppinsSemiBold }}>Note: </Text>
                  {String(detail.note)}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 28,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: '#E8F3EF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginTop: 12,
  },
  updatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },
  banner: {
    height: 180,
    width: '100%',
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
  description: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginTop: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
  noteBox: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.BGIcon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
});
