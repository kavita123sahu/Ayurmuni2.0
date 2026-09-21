import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { resolveDoctorProfileImageUri } from '../utils/doctorUtils';
import { sanitizeImageUri } from '../utils/imageUtils';

/** Soft WhatsApp-style palette for initials empty DP. */
const DP_PALETTE = [
  '#00A884',
  '#53BDEB',
  '#06CF9C',
  '#027EB5',
  '#7F66FF',
  '#FF7A59',
  '#FFB900',
  '#A855F7',
];

type Props = {
  uri?: string | null;
  doctor?: any;
  name?: string;
  size?: number;
  /** Stretch to parent (list/grid photo slots) */
  fill?: boolean;
  /** circle = WhatsApp DP; rounded = rectangular card slot */
  shape?: 'circle' | 'rounded';
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** Classic WhatsApp empty icon, or colored initials */
  emptyMode?: 'icon' | 'initials';
};

const getInitials = (name?: string) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const colorForName = (name?: string) => {
  const key = String(name || 'Doctor').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DP_PALETTE[Math.abs(hash) % DP_PALETTE.length];
};

/**
 * WhatsApp-style doctor DP.
 * Fixed square slot so name/layout beside it stays aligned when photo is missing.
 */
const DoctorAvatar = ({
  uri,
  doctor,
  name,
  size = 56,
  fill = false,
  shape = 'circle',
  borderRadius,
  style,
  imageStyle,
  emptyMode = 'icon',
}: Props) => {
  const resolvedUri = useMemo(() => {
    const direct = sanitizeImageUri(String(uri || '').trim());
    if (direct) return direct;
    return sanitizeImageUri(resolveDoctorProfileImageUri(doctor));
  }, [uri, doctor]);

  const displayName =
    name ||
    doctor?.doctor_name ||
    doctor?.name ||
    doctor?.full_name ||
    '';

  const radius =
    borderRadius != null
      ? borderRadius
      : shape === 'circle'
        ? size / 2
        : Math.max(10, Math.round(size * 0.18));

  const initialSize = Math.max(12, Math.round((fill ? 56 : size) * 0.36));
  const bg = colorForName(displayName);
  const initials = getInitials(displayName);

  const boxStyle = fill
    ? [styles.wrap, styles.fill, { borderRadius: radius }, style]
    : [
      styles.wrap,
      {
        width: size,
        height: size,
        borderRadius: radius,
      },
      style,
    ];

  const mediaStyle = fill
    ? [styles.image, styles.fill, { borderRadius: radius }, imageStyle]
    : [
      styles.image,
      {
        width: size,
        height: size,
        borderRadius: radius,
      },
      imageStyle,
    ];

  return (
    <View style={boxStyle}>
      {resolvedUri ? (
        <Image source={{ uri: resolvedUri }} style={mediaStyle} resizeMode="contain" />
      ) : emptyMode === 'initials' && initials ? (
        <View
          style={[
            styles.empty,
            fill ? styles.fill : { width: size, height: size },
            { borderRadius: radius, backgroundColor: bg },
          ]}
        >
          <Text style={[styles.initials, { fontSize: initialSize }]}>
            {initials}
          </Text>
        </View>
      ) : (
        <Image
          source={Images.doctorDefaultAvatar}
          style={mediaStyle}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default React.memo(DoctorAvatar);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF1F2',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
});
