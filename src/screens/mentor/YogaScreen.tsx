import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Video from 'react-native-video';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';
import TablerIcon from '../../components/TablerIcon';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import {
  normalizeYogaSessionList,
  resolveYogaThumbnailUri,
  resolveYogaVideoUri,
} from '../../utils/yogaUtils';

const YogaListVideoThumb = ({ item }: { item: any }) => {
  const videoUri = resolveYogaVideoUri(item);
  const thumbUri = resolveYogaThumbnailUri(item);
  const [failed, setFailed] = useState(false);

  if (!videoUri || failed) {
    return (
      <Image
        source={
          thumbUri
            ? { uri: thumbUri }
            : require('../../assets/images/login/7.jpg')
        }
        style={styles.thumb}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.thumbWrap}>
      {thumbUri ? (
        <Image
          source={{ uri: thumbUri }}
          style={[styles.thumb, styles.thumbPoster]}
          resizeMode="cover"
        />
      ) : null}
      <Video
        source={{ uri: videoUri }}
        style={styles.thumb}
        resizeMode="cover"
        muted
        repeat
        paused={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="obey"
        disableFocus
        shutterColor="transparent"
        onError={() => setFailed(true)}
      />
      <View style={styles.videoBadge} pointerEvents="none">
        <TablerIcon name="video" size={14} color="#FFFFFF" />
      </View>
    </View>
  );
};

const YogaScreen = (props: any) => {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await _YOGA_SERVICES.getYogaSession();
      setSessions(normalizeYogaSessionList(res));
    } catch (e) {
      console.log('YOGA_LIST_ERROR', e);
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return sessions;
    return sessions.filter(item =>
      matchesSearch(
        q,
        item.title,
        item.name,
        item.short_description,
        item.difficulty,
        item.duration,
      ),
    );
  }, [debouncedSearch, sessions]);

  const renderItem = ({ item }: { item: any }) => {
    const meta = [item.difficulty, item.duration].filter(Boolean).join(' • ');
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          props.navigation.navigate('YogaSession', { item })
        }
      >
        <YogaListVideoThumb item={item} />
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title || item.name}
          </Text>
          {!!meta && <Text style={styles.subtitle}>{meta}</Text>}
          {!!item.short_description && (
            <Text numberOfLines={1} style={styles.desc}>
              {item.short_description}
            </Text>
          )}
        </View>
        <View style={styles.playBtn}>
          <TablerIcon name="video" size={18} color={Colors.primaryColor} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header
        title="Yoga Sessions"
        subtitle="Practice with guided videos"
        onBack={() => props.navigation.goBack()}
      />

      <View style={styles.searchWrap}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search yoga sessions..."
        />
      </View>

      {loading && sessions.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSessions(true)}
              tintColor={Colors.primaryColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No yoga sessions</Text>
              <Text style={styles.emptySub}>
                {debouncedSearch.trim()
                  ? 'Try another search.'
                  : 'Sessions will appear here when available.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default YogaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    padding: 10,
    marginBottom: 12,
    gap: 12,
  },
  thumbWrap: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  thumbPoster: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    borderRadius: 12,
  },
  videoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(13, 97, 78, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },
  desc: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D614E14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 220,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    textAlign: 'center',
  },
});
