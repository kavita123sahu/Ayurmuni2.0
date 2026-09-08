import React from 'react';
import { View } from 'react-native';
// Direct icon imports — avoid barrel `@tabler/icons-react-native` (12k+ files, EMFILE on Windows).
import IconShoppingCart from '@tabler/icons-react-native/IconShoppingCart';
import IconBell from '@tabler/icons-react-native/IconBell';
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import IconChevronLeft from '@tabler/icons-react-native/IconChevronLeft';
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp';
import IconHome from '@tabler/icons-react-native/IconHome';
import IconPackage from '@tabler/icons-react-native/IconPackage';
import IconPill from '@tabler/icons-react-native/IconPill';
import IconPillFilled from '@tabler/icons-react-native/IconPillFilled';
import IconUser from '@tabler/icons-react-native/IconUser';
import IconUserFilled from '@tabler/icons-react-native/IconUserFilled';
import IconStethoscope from '@tabler/icons-react-native/IconStethoscope';
import IconMedicalCrossFilled from '@tabler/icons-react-native/IconMedicalCrossFilled';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import IconMinus from '@tabler/icons-react-native/IconMinus';
import IconStar from '@tabler/icons-react-native/IconStar';
import IconStarFilled from '@tabler/icons-react-native/IconStarFilled';
import IconHeart from '@tabler/icons-react-native/IconHeart';
import IconHeartFilled from '@tabler/icons-react-native/IconHeartFilled';
import IconLeafFilled from '@tabler/icons-react-native/IconLeafFilled';
import IconShoppingCartFilled from '@tabler/icons-react-native/IconShoppingCartFilled';
import IconBoxMultipleFilled from '@tabler/icons-react-native/IconBoxMultipleFilled';
import IconLayoutListFilled from '@tabler/icons-react-native/IconLayoutListFilled';
import IconCategoryFilled from '@tabler/icons-react-native/IconCategoryFilled';
import IconBarbellFilled from '@tabler/icons-react-native/IconBarbellFilled';
import IconSaladFilled from '@tabler/icons-react-native/IconSaladFilled';
import IconAppsFilled from '@tabler/icons-react-native/IconAppsFilled';
import IconClipboardListFilled from '@tabler/icons-react-native/IconClipboardListFilled';
import IconHomeFilled from '@tabler/icons-react-native/IconHomeFilled';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import IconMapPin from '@tabler/icons-react-native/IconMapPin';
import IconCrosshair from '@tabler/icons-react-native/IconCrosshair';
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft';
import IconArrowRight from '@tabler/icons-react-native/IconArrowRight';
import IconEdit from '@tabler/icons-react-native/IconEdit';
import IconX from '@tabler/icons-react-native/IconX';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import IconFilter from '@tabler/icons-react-native/IconFilter';
import IconShare from '@tabler/icons-react-native/IconShare';
import IconClock from '@tabler/icons-react-native/IconClock';
import IconCalendar from '@tabler/icons-react-native/IconCalendar';
import IconPhone from '@tabler/icons-react-native/IconPhone';
import IconMessage from '@tabler/icons-react-native/IconMessage';
import IconLocation from '@tabler/icons-react-native/IconLocation';
import IconBriefcase from '@tabler/icons-react-native/IconBriefcase';
import IconUsers from '@tabler/icons-react-native/IconUsers';
import IconClipboardList from '@tabler/icons-react-native/IconClipboardList';
import IconReceipt from '@tabler/icons-react-native/IconReceipt';
import IconSchool from '@tabler/icons-react-native/IconSchool';
import IconChartPie from '@tabler/icons-react-native/IconChartPie';
import IconCreditCard from '@tabler/icons-react-native/IconCreditCard';
import IconSettings from '@tabler/icons-react-native/IconSettings';
import IconHelp from '@tabler/icons-react-native/IconHelp';
import IconLogout from '@tabler/icons-react-native/IconLogout';
import IconBuildingStore from '@tabler/icons-react-native/IconBuildingStore';
import IconTruck from '@tabler/icons-react-native/IconTruck';
import IconPhoto from '@tabler/icons-react-native/IconPhoto';
import IconVideo from '@tabler/icons-react-native/IconVideo';
import IconUpload from '@tabler/icons-react-native/IconUpload';
import IconDownload from '@tabler/icons-react-native/IconDownload';
import IconEye from '@tabler/icons-react-native/IconEye';
import IconLock from '@tabler/icons-react-native/IconLock';
import IconMail from '@tabler/icons-react-native/IconMail';
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle';
import IconBuilding from '@tabler/icons-react-native/IconBuilding';
import IconCash from '@tabler/icons-react-native/IconCash';
import IconBolt from '@tabler/icons-react-native/IconBolt';
import IconCamera from '@tabler/icons-react-native/IconCamera';
import IconFile from '@tabler/icons-react-native/IconFile';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconReport from '@tabler/icons-react-native/IconReport';
import IconNotes from '@tabler/icons-react-native/IconNotes';
import IconListDetails from '@tabler/icons-react-native/IconListDetails';
import IconRefresh from '@tabler/icons-react-native/IconRefresh';
import IconArrowsExchange from '@tabler/icons-react-native/IconArrowsExchange';
import IconCurrentLocation from '@tabler/icons-react-native/IconCurrentLocation';
import IconBrandWhatsapp from '@tabler/icons-react-native/IconBrandWhatsapp';
import IconMicrophone from '@tabler/icons-react-native/IconMicrophone';
import IconCertificate from '@tabler/icons-react-native/IconCertificate';
import IconShieldCheck from '@tabler/icons-react-native/IconShieldCheck';
import IconWallet from '@tabler/icons-react-native/IconWallet';
import IconHistory from '@tabler/icons-react-native/IconHistory';
import IconMoodSmile from '@tabler/icons-react-native/IconMoodSmile';
import IconMoodSad from '@tabler/icons-react-native/IconMoodSad';
import IconFlame from '@tabler/icons-react-native/IconFlame';
import IconVolume from '@tabler/icons-react-native/IconVolume';
import IconVolumeOff from '@tabler/icons-react-native/IconVolumeOff';
import IconPlayerPlay from '@tabler/icons-react-native/IconPlayerPlay';
import IconPlayerPause from '@tabler/icons-react-native/IconPlayerPause';
import IconMaximize from '@tabler/icons-react-native/IconMaximize';
import IconMinimize from '@tabler/icons-react-native/IconMinimize';
import IconLeaf from '@tabler/icons-react-native/IconLeaf';
import IconHeartHandshake from '@tabler/icons-react-native/IconHeartHandshake';
import { Colors } from '../common/Colors';

const IconFileMedical = IconStethoscope;

const ICON_MAP = {
  'circle-x': IconX,
  'shopping-cart': IconShoppingCart,
  bell: IconBell,
  'chevron-down': IconChevronDown,
  'chevron-right': IconChevronRight,
  'chevron-left': IconChevronLeft,
  'chevron-up': IconChevronUp,
  home: IconHome,
  'home-filled': IconHomeFilled,
  package: IconPackage,
  'package-filled': IconBoxMultipleFilled,
  pill: IconPill,
  'pill-filled': IconPillFilled,
  user: IconUser,
  'user-filled': IconUserFilled,
  users: IconUsers,
  stethoscope: IconStethoscope,
  'medical-cross-filled': IconMedicalCrossFilled,
  'leaf-filled': IconLeafFilled,
  'shopping-cart-filled': IconShoppingCartFilled,
  'layout-list-filled': IconLayoutListFilled,
  'category-filled': IconCategoryFilled,
  'apps-filled': IconAppsFilled,
  'barbell-filled': IconBarbellFilled,
  'salad-filled': IconSaladFilled,
  'clipboard-list-filled': IconClipboardListFilled,
  plus: IconPlus,
  minus: IconMinus,
  star: IconStar,
  'star-filled': IconStarFilled,
  heart: IconHeart,
  'heart-filled': IconHeartFilled,
  search: IconSearch,
  'map-pin': IconMapPin,
  crosshair: IconCrosshair,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  edit: IconEdit,
  x: IconX,
  check: IconCheck,
  trash: IconTrash,
  filter: IconFilter,
  share: IconShare,
  clock: IconClock,
  calendar: IconCalendar,
  phone: IconPhone,
  message: IconMessage,
  location: IconLocation,
  briefcase: IconBriefcase,
  'clipboard-list': IconClipboardList,
  receipt: IconReceipt,
  'file-medical': IconFileMedical,
  school: IconSchool,
  'chart-pie': IconChartPie,
  'credit-card': IconCreditCard,
  settings: IconSettings,
  help: IconHelp,
  logout: IconLogout,
  store: IconBuildingStore,
  truck: IconTruck,
  photo: IconPhoto,
  video: IconVideo,
  upload: IconUpload,
  download: IconDownload,
  eye: IconEye,
  lock: IconLock,
  mail: IconMail,
  'alert-circle': IconAlertCircle,
  building: IconBuilding,
  cash: IconCash,
  bolt: IconBolt,
  camera: IconCamera,
  file: IconFile,
  'circle-check': IconCircleCheck,
  report: IconReport,
  notes: IconNotes,
  list: IconListDetails,
  refresh: IconRefresh,
  exchange: IconArrowsExchange,
  'current-location': IconCurrentLocation,
  whatsapp: IconBrandWhatsapp,
  mic: IconMicrophone,
  certificate: IconCertificate,
  shield: IconShieldCheck,
  wallet: IconWallet,
  history: IconHistory,
  'mood-smile': IconMoodSmile,
  'mood-sad': IconMoodSad,
  trophy: IconCertificate,
  flame: IconFlame,
  volume: IconVolume,
  'volume-off': IconVolumeOff,
  play: IconPlayerPlay,
  pause: IconPlayerPause,
  maximize: IconMaximize,
  minimize: IconMinimize,
  leaf: IconLeaf,
  'heart-handshake': IconHeartHandshake,
  approved: IconCircleCheck,
  verify: IconCircleCheck,
  unverify: IconAlertCircle,
  notification: IconBell,
  consult: IconStethoscope,
  'chat-support': IconMessage,
  prescription: IconFileMedical,
  ingredient: IconListDetails,
  refund: IconRefresh,
  favourite: IconHeart,
  wishlist: IconHeart,
  orders: IconReceipt,
  payment: IconCreditCard,
  patient: IconUsers,
  medical: IconFileMedical,
  cart: IconShoppingCart,
  upi: IconWallet,
  card: IconCreditCard,
  flash: IconBolt,
  dropdown: IconChevronDown,
  tick: IconCheck,
  'tick-icon': IconCircleCheck,
  spoon: IconListDetails,
  breakdown: IconListDetails,
  instruction: IconNotes,
  'plus-bag': IconShoppingCart,
  medicines: IconPill,
  office: IconBuilding,
  sos: IconAlertCircle,
} as const;

export type TablerIconName = keyof typeof ICON_MAP;

type Props = {
  name: TablerIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
};

const TablerIcon: React.FC<Props> = ({
  name,
  size = 22,
  color = Colors.primaryColor,
  strokeWidth = 2,
  style,
}) => {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return (
    <View style={style}>
      <IconComponent size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
};

export default TablerIcon;
