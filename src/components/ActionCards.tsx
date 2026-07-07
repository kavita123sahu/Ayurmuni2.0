import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import { CARD_SURFACE, CARD_RADIUS_LG } from '../constants/cardStyles';
import { RootStackParamList } from '../../type';

type CardType = {
  id: string;
  title: string;
  subtitle: string;
  icon?: ImageSourcePropType;
  iconName?: TablerIconName;
  bgIcon?: ImageSourcePropType;
  screen?: keyof RootStackParamList;
  onPress?: () => void;
};

type Props = {
  data?: CardType[];
  onpress: (item: CardType) => void;
};

const ActionCards: React.FC<Props> = ({ data = [], onpress }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <View style={styles.row}>
      {safeData.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => onpress(item)}
        >
          {item.bgIcon ? (
            <Image source={item.bgIcon} style={styles.bgIcon} />
          ) : (
            <View style={styles.bgIconDecor}>
              <TablerIcon
                name={item.iconName ?? 'pill'}
                size={48}
                color="rgba(13, 97, 78, 0.08)"
              />
            </View>
          )}

          <View style={styles.iconBox}>
            {item.iconName ? (
              <TablerIcon name={item.iconName} size={24} color="#0D614E" />
            ) : item.icon ? (
              <Image source={item.icon} style={styles.icon} />
            ) : (
              <TablerIcon name="pill" size={24} color="#0D614E" />
            )}
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default React.memo(ActionCards);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 14,
  },
  card: {
    flex: 1,
    borderRadius: CARD_RADIUS_LG,
    padding: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 114, 78, 0.15)',
    backgroundColor: 'rgba(15, 114, 78, 0.05)',
  },
  bgIcon: {
    position: 'absolute',
    right: 2,
    height: 70,
    width: 70,
    resizeMode: 'contain',
    opacity: 0.35,
  },
  bgIconDecor: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  iconBox: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 107, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    height: 28,
    width: 28,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#0D614E',
    marginTop: 2,
  },
});
