const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const fs = require('fs');

try {
  const gracefulFs = require('graceful-fs');
  gracefulFs.gracefulify(fs);
} catch (_) {}

const USED_TABLER_ICONS = [
  'IconShoppingCart', 'IconBell', 'IconChevronDown', 'IconChevronRight', 'IconChevronLeft',
  'IconChevronUp', 'IconHome', 'IconPackage', 'IconPill', 'IconUser', 'IconStethoscope',
  'IconPlus', 'IconMinus', 'IconStar', 'IconStarFilled', 'IconHeart', 'IconHeartFilled',
  'IconSearch', 'IconMapPin', 'IconCrosshair', 'IconArrowLeft', 'IconArrowRight', 'IconEdit',
  'IconX', 'IconCheck', 'IconTrash', 'IconFilter', 'IconShare', 'IconClock', 'IconCalendar',
  'IconPhone', 'IconMessage', 'IconLocation', 'IconBriefcase', 'IconUsers', 'IconClipboardList',
  'IconReceipt', 'IconSchool', 'IconChartPie', 'IconCreditCard', 'IconSettings', 'IconHelp',
  'IconLogout', 'IconBuildingStore', 'IconTruck', 'IconPhoto', 'IconVideo', 'IconUpload',
  'IconDownload', 'IconEye', 'IconLock', 'IconMail', 'IconAlertCircle', 'IconBuilding',
  'IconCash', 'IconBolt', 'IconCamera', 'IconFile', 'IconCircleCheck', 'IconReport', 'IconNotes',
  'IconListDetails', 'IconRefresh', 'IconArrowsExchange', 'IconCurrentLocation', 'IconBrandWhatsapp',
  'IconMicrophone', 'IconCertificate', 'IconShieldCheck', 'IconWallet', 'IconHistory',
  'IconMoodSmile', 'IconMoodSad',
];

const unusedTablerIcons = new RegExp(
  `node_modules[/\\\\]@tabler[/\\\\]icons-react-native[/\\\\]dist[/\\\\](?:esm[/\\\\]icons|cjs[/\\\\]icons)[/\\\\](?!(${USED_TABLER_ICONS.join(
    '|',
  )})\\.(?:mjs|cjs)$).+\\.(?:mjs|cjs)$`,
);

/** @type {import('metro-config').MetroConfig} */
const config = {
  maxWorkers: 1,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    blockList: exclusionList([
      unusedTablerIcons,
      /node_modules[/\\]@tabler[/\\]icons-react-native[/\\]dist[/\\](?:esm|cjs)[/\\]tabler-icons-react-native\.(?:mjs|cjs)$/,
      /node_modules[/\\]pdf-lib[/\\]cjs[/\\].*/,
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
