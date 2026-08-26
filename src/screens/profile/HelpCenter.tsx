import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { ExpandableSearch } from '../../components/SearchBar';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import FAQItem from '../../components/FAQItem';
import TablerIcon from '../../components/TablerIcon';
import { useDebounce } from '../../hooks/useDebaunce';
import { filterFaqsBySearch, useFaqs } from '../../hooks/useFaqs';
import { FAQ_CATEGORIES, FaqCategory } from '../../services/FaqServices';
import EmptyState from '../../components/EmptyState';

const HelpCenterScreen = (props: any) => {
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 360;
  const contentPad = isCompact ? 14 : 18;

  const initialCategory =
    (props?.route?.params?.category as FaqCategory | undefined) || null;

  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(
    initialCategory,
  );
  const debouncedSearch = useDebounce(searchText, 400);

  const { loading, refreshing, faqs, error, refresh, reload } = useFaqs({
    category: selectedCategory,
  });

  useEffect(() => {
    setActiveIndex(null);
  }, [selectedCategory, debouncedSearch]);

  const filteredFaqs = useMemo(
    () => filterFaqsBySearch(faqs, debouncedSearch),
    [faqs, debouncedSearch],
  );

  const openFaqDetail = useCallback(
    (faqId: string) => {
      props.navigation.navigate('FAQScreen', { faqId });
    },
    [props.navigation],
  );

  const onCategoryPress = useCallback((key: FaqCategory | null) => {
    setSelectedCategory(key);
  }, []);

  const selectedLabel =
    FAQ_CATEGORIES.find(c => c.key === selectedCategory)?.title || 'All';

  const HelpSection = () => (
    <View style={styles.helpCard}>
      <Text style={styles.helpTitle}>Still need help?</Text>
      <Text style={styles.helpDesc}>
        Our support team is available 24/7 to assist you with any
        healthcare-related inquiries.
      </Text>

      <View style={styles.helpRow}>
        <TouchableOpacity
          style={styles.callBtn}
          activeOpacity={0.85}
          onPress={() =>
            Linking.openURL('tel:+919667552698').catch(() => undefined)
          }
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callText}>Call Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.85}
          onPress={() =>
            Linking.openURL(
              'mailto:support@ayurmuni.com?subject=Ayurmuni%20Help',
            ).catch(() => undefined)
          }
        >
          <TablerIcon
            name="chat-support"
            size={18}
            color={Colors.primaryColor}
          />
          <Text style={styles.chatText}>Email Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <AppHeader
        title="Help Center"
        onLeftPress={() => props.navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
      >
        <View style={[styles.content, { paddingHorizontal: contentPad }]}>
          <ExpandableSearch
            placeholder="Search for help topics..."
            value={searchText}
            onChangeText={setSearchText}
            showTrigger={false}
            expanded={searchExpanded}
            onExpandedChange={setSearchExpanded}
          />

          {/* Category chips / tabs */}
          <View style={styles.chipSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.chipRow,
                { paddingRight: contentPad },
              ]}
              style={styles.chipScroll}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  isCompact && styles.chipCompact,
                  selectedCategory == null && styles.chipActive,
                ]}
                onPress={() => onCategoryPress(null)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    isCompact && styles.chipTextCompact,
                    selectedCategory == null && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {FAQ_CATEGORIES.map(item => {
                const active = selectedCategory === item.key;
                return (
                  <TouchableOpacity
                    key={String(item.key)}
                    style={[
                      styles.chip,
                      isCompact && styles.chipCompact,
                      active && styles.chipActive,
                    ]}
                    onPress={() => onCategoryPress(item.key)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isCompact && styles.chipTextCompact,
                        active && styles.chipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {selectedCategory ? `${selectedLabel} FAQs` : 'Popular Questions'}
            </Text>
            <Text style={styles.countText}>
              {loading ? '…' : `${filteredFaqs.length}`}
            </Text>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={Colors.primaryColor} />
              <Text style={styles.loaderText}>Loading FAQs…</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => reload()}
                activeOpacity={0.85}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredFaqs.length === 0 ? (
            <EmptyState
              title="No FAQs found"
              subtitle={
                debouncedSearch.trim()
                  ? 'Try another search keyword.'
                  : selectedCategory
                    ? `No articles in ${selectedLabel} yet.`
                    : 'Help articles will appear here soon.'
              }
            />
          ) : (
            filteredFaqs.map(item => (
              <FAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={activeIndex === item.id}
                onPress={() =>
                  setActiveIndex(activeIndex === item.id ? null : item.id)
                }
                // onOpenDetail={() => openFaqDetail(item.id)}
              />
            ))
          )}

      
        </View>
        
      </ScrollView>
          <HelpSection />
    </SafeAreaView>
  );
};

export default HelpCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    paddingTop: 8,
  },
  chipSection: {
    marginTop: 10,
    marginBottom: 4,
  },
  chipScroll: {
    marginHorizontal: -2,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingLeft: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  chipCompact: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 32,
  },
  chipActive: {
    backgroundColor: Colors.onfillColor,
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  chipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  countText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  helpCard: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.textColor,
  },
  helpDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
  helpRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  callBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    backgroundColor: '#065F46',
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  chatBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#065F46',
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatText: {
    marginLeft: 6,
    color: '#065F46',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  errorText: {
    fontSize: 13,
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
