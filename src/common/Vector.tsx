import React from 'react';
import TablerIcon, { TablerIconName } from '../components/TablerIcon';

/** Maps legacy vector-icon names → Tabler icons (removes react-native-vector-icons dependency). */
const NAME_MAP: Record<string, TablerIconName> = {
  'chevron-forward': 'chevron-right',
  'chevron-back': 'chevron-left',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'arrow-right': 'arrow-right',
  'arrow-left': 'arrow-left',
  heart: 'heart-filled',
  'heart-outline': 'heart',
  close: 'x',
  'close-circle': 'x',
  check: 'check',
  edit: 'edit',
  'edit-2': 'edit',
  calendar: 'calendar',
  'calendar-outline': 'calendar',
  'calendar-check-2': 'calendar',
  clock: 'clock',
  'hourglass-outline': 'clock',
  videocam: 'video',
  'videocam-off': 'video',
  call: 'phone',
  'call-end': 'phone',
  play: 'video',
  star: 'star-filled',
  'star-outline': 'star',
  home: 'home',
  search: 'search',
  bell: 'bell',
  'person-outline': 'user',
  'body-outline': 'user',
  'medkit-outline': 'file-medical',
  'chatbubble-ellipses-outline': 'message',
  'document-text-outline': 'file',
  'document-text': 'file',
  'cloud-upload-outline': 'upload',
  'camera-outline': 'camera',
  'folder-open-outline': 'file',
  'eye-outline': 'eye',
  'trash-bin-outline': 'trash',
  'card-outline': 'credit-card',
  'shield-checkmark': 'shield',
  'shield-check': 'shield',
  'list': 'list',
  gallery: 'photo',
  brand: 'store',
  'bank-outline': 'credit-card',
  mic: 'mic',
  'mic-off': 'mic',
  send: 'arrow-right',
  attachment: 'file',
  quote: 'notes',
  'flip-camera-android': 'camera',
  'flip-camera-ios': 'camera',
  'volume-up': 'phone',
  hearing: 'phone',
  'cloud-upload': 'upload',
  'time-outline': 'clock',
};

type LegacyIconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: object;
};

const LegacyIcon = ({ name, size = 22, color = '#1E293B' }: LegacyIconProps) => (
  <TablerIcon
    name={NAME_MAP[name] || 'chevron-right'}
    size={size}
    color={color}
  />
);

export const Ionicons = LegacyIcon;
export const AntDesign = LegacyIcon;
export const MaterialIcons = LegacyIcon;
export const MaterialCommunityIcons = LegacyIcon;
export const Feather = LegacyIcon;
export const Entypo = LegacyIcon;
export const Fontisto = LegacyIcon;
export const FontAwesome = LegacyIcon;
export const FontAwesome5 = LegacyIcon;
export const FontAwesome6 = LegacyIcon;
export const Foundation = LegacyIcon;
export const Octicons = LegacyIcon;
export const SimpleLineIcons = LegacyIcon;
export const Zocial = LegacyIcon;
export const EvilIcons = LegacyIcon;
