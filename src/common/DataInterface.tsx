import { Platform, Text } from "react-native";
import { Images } from "./Images";
import { Colors } from "./Colors";
import React from "react";
import { resolveProductImageUri } from '../utils/imageUtils';
import { resolvePayOnDelivery } from '../utils/payOnDeliveryUtils';


export interface ProductItem {
  id: string;
  name: string;
  weight: string;
  size?: string;
  variant_id: string;
  price: number;
  quantity: number;
  image: string;
  brand_name?: string;
  doctorName?: string;
  source?: 'cart' | 'prescribed';
  gift_wrap?: boolean;
  pay_on_delivery?: boolean;
  prescription_required?: boolean;
  variant?: any;
  cart_item_id?: string;
}
export type SectionType = {
  id: string;
  title: string;
  type: 'cart' | 'prescribed';
  items: ProductItem[];
};


export type CartItem = {
  id: string;
  quantity: number | string;
  price: number | string;
  variant_id?: string;
  product_name?: string;
  variant_title?: string;
  variant?: {
    variant_id?: string;
    id?: string;
    variant_title?: string;
    title?: string;
    size?: string;
    selling_price?: number;
    brand_name?: string;
    pay_on_delivery?: boolean;
    prescription_required?: boolean;
    image_url?: string;
    cover_image?: {
      id?: string;
      media_url?: string;
      media_type?: string;
      is_cover?: boolean;
    };
    media?: {
      id?: string;
      media_url?: string;
      media_type?: string;
      is_cover?: boolean;
    }[];
  };
  pay_on_delivery?: boolean;
  cover_image?: {
    id?: string;
    media_url?: string;
    is_cover?: boolean;
  };
  media?: {
    id?: string;
    media_url?: string;
    is_cover?: boolean;
  }[];
};


export const renderCategoryName = (
  name: string,
  styles: any,
  maxChars = 14,
) => {
  const words = name.trim().split(/\s+/);

  let firstLine = '';
  let secondLine = '';

  words.forEach(word => {
    const testLine = firstLine ? `${firstLine} ${word}` : word;

    if (testLine.length <= maxChars || firstLine === '') {
      firstLine = testLine;
    } else {
      secondLine += (secondLine ? ' ' : '') + word;
    }
  });

  return (
    <Text style={styles.text} numberOfLines={2}>
      {secondLine ? `${firstLine}\n${secondLine}` : firstLine}
    </Text>
  );
};

export type OrderItem = {
  variant_id: string | number;
  quantity: number;
  discount?: number;
  shipping_charges?: number;
  gift_wrap?: boolean;
};

export type PlaceOrderPayload = {
  delivery_address_id: string | number;
  payment_type: 'cod' | 'prepaid' | 'online';
  /**
   * COD → "cash".
   * Prepaid → value from Razorpay SDK (upi / card / wallet / netbanking / …).
   * Optional on place-order; set after user selects method in Razorpay.
   */
  payment_method?: string;
  shipping_method: 'STD' | 'EXPRESS';
  shipping_charges: number;
  cod_charges: number;
  prepaid_amount: number;
  cart_item_ids: string[];
  gift_wrap_item_ids: string[];
  items?: OrderItem[];
};

export type PlaceOrderResponse = {
  success: boolean;
  message?: string;
  data?: {
    order_id: string | number;
    order_number?: string;
    total_amount?: number;
    status?: string;
    [key: string]: any;
  };
};


/** Resolve cart/checkout thumbnail from common API shapes */
export const resolveCartItemImage = (item: any): string =>
  resolveProductImageUri(item);

export const getProductData = (
  item: CartItem,
  doctorName?: string,
): ProductItem => ({
  id: item.id,

  name:
    item.variant?.variant_title ||
    item.variant?.title ||
    (item as any)?.product_name ||
    (item as any)?.name ||
    '',

  weight: item.variant?.size || '',

  size: item.variant?.size || '',

  brand_name: item.variant?.brand_name || '',

  variant_id:
    item.variant?.variant_id ||
    item.variant?.id ||
    (item as any)?.variant_id ||
    '',
  price: Number(
    item.variant?.selling_price ||
    item.price ||
    0,
  ),

  quantity: Number((item as any)?.quantity ?? 0),

  // cover_image.media_url → media is_cover → legacy image fields
  image: resolveCartItemImage(item),

  doctorName,
  gift_wrap: Boolean((item as any)?.gift_wrap || (item as any)?.is_gift_wrap),
  pay_on_delivery: resolvePayOnDelivery(item),
  prescription_required:
    (item as any)?.prescription_required ??
    (item as any)?.requires_prescription ??
    (item as any)?.is_prescription_required ??
    item.variant?.prescription_required,
  variant: item.variant,
  cart_item_id: String((item as any)?.id ?? (item as any)?.cart_item_id ?? ''),
});

export interface GenderOption {
  id: string;
  label: string;
  value: string;
}



export const genderOptions: GenderOption[] = [
  { id: '1', label: 'Male', value: 'male' },
  { id: '2', label: 'Female', value: 'female' },
  { id: '3', label: 'Others', value: 'others' },
];

export const product = {
  images: [
    Images.HomeBanner,
    Images.HomeBanner,
    Images.HomeBanner,
    Images.HomeBanner,
  ],
};
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'deliverd':
    case 'delivered':
      return '#1B5E54'; // Green

    case 'pending':
      return '#F59E0B'; // Orange

    case 'cancelled':
      return '#EF4444'; // Red

    case 'processing':
      return '#3366FF'; // Blue

    default:
      return '#3366FF';
  }
};


export type Appointment = {
  consultation_id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  isHorizontal: boolean
  status: string;

  image: string | null;
  rawData?: any;
};
export const UPCOMING_STATUS = [
  "pending",
  "confirmed",
  "reschedule",
  "rescheduled",
];

export const PAST_STATUS = [
  "completed",
  "cancelled",
  "missed",
  "expired",
];

export const PRAKRITI_IMAGES: Record<string, string> = {
  Kapha:
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/8d60cead33a545f29fa970408ebdb224.png",

  Pitta:
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/288266a4c4e94f399be1fa0cdb7b3a9a.png",

  Vata:
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/0b3da9d104be4bb1b37b1d1e698ff616.png",

  "Kapha-Vata":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/272b144fd9314a20a4e7d6bf579814c1.png",

  "Pitta-Kapha":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/888ac0e8619b4dfe812b2bf4583b37e8.png",

  "Pitta-Vata":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/ccb71b214bae4b01b5d62c9f82c0bd41.png",

  "Vata-Kapha":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/62eed856309c45e7b28d81bfeb4dda9f.png",

  "Vata-Pitta":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/491817a9fd8343459818b9ae3b6d1bf4.png",

  "Kapha-Pitta":
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/3afbc6d6dc164344a02c6c7573040989.png",

  Tridosha:
    "https://ayurmuni.s3.ap-south-1.amazonaws.com/prakriti_images/1435b1ad1380475caa127c9f00fb03d7.png",
};


export const getStatusStyle = (status: string) => {
  const styles = {
    confirmed: {
      backgroundColor: "#EEF4FF",
      color: "#1048b9",
    },
    pending: {
      backgroundColor: "#FFF7ED",
      color: "#EA580C",
    },
    cancelled: {
      backgroundColor: "#FEE2E2",
      color: "#EF4444",
    },
    completed: {
      backgroundColor: "#DCFCE7",
      color: "#16A34A",
    },
    missed: {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
    },
    expired: {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
    },
    no_show: {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
    },
    reschedule: {
      backgroundColor: "#FEF3C7",
      color: "#B45309",
    },
    rescheduled: {
      backgroundColor: "#FEF3C7",
      color: "#B45309",
    },
  };

  return (
    styles[status as keyof typeof styles] || {
      backgroundColor: "#F3F4F6",
      color: "#000",
    }
  );
};

export const TABS =
  [
    {
      key: "speciality",
      label: "Speciality",
    },
    {
      key: "availability",
      label: "Availability",
    },
    {
      key: "experience",
      label: "Experience",
    },
  ];


export const EXPERIENCE_OPTIONS = [
  {
    label: '1+ Years',
    value: '1',
  },
  {
    label: '5+ Years',
    value: '5',
  },
  {
    label: '10+ Years',
    value: '10',
  },
  {
    label: '15+ Years',
    value: '15',
  },
  {
    label: '20+ Years',
    value: '20',
  },
];



export const AVAILABILITY_OPTIONS = [
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Tomorrow',
    value: 'tomorrow',
  },
  {
    label: 'This Week',
    value: 'this_week',
  },
  {
    label: 'Next Week',
    value: 'next_week',
  },
  {
    label: 'This Month',
    value: 'this_month',
  },
  {
    label: 'Next Month',
    value: 'next_month',
  },
  // {
  //   label: 'Select Date',
  //   value: 'custom_date',
  // },
];



export const reviews = [
  {
    id: 1,
    name: "Rohan Sharma",
    rating: 5,
    review:
      "Excellent quality! The grains are clean and cook perfectly. Highly recommended.",
  },
  {
    id: 2,
    name: "Ankit Verma",
    rating: 4,
    review: "Very good experience, sessions are helpful.",
  },
]


export const generateDates = (daysBefore = 3, daysAfter = 10) => {
  const dates = [];
  const today = new Date();

  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    dates.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }), // 🔥 dynamic
      date: d.getDate(),
      fullDate: d.toDateString(),
      isToday: i === 0,
    });
  }

  return dates;
};


export const formatTo12Hour = (time24: string) => {
  if (!time24) return '';

  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;

  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${meridiem}`;
};

export const formatDate = (
  date: string | Date,
) => {

  if (!date) {
    return '';
  }

  const formattedDate =
    typeof date === 'string'
      ? new Date(date)
      : date;

  return formattedDate
    .toISOString()
    .split('T')[0];
};


export const generateFutureDates = (
  monthOffset = 0,
) => {

  const today = new Date();

  const currentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );

  const year = currentMonth.getFullYear();

  const month = currentMonth.getMonth();

  const totalDays = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const dates = [];

  /*
  |--------------------------------------------------------------------------
  | TODAY RESET
  |--------------------------------------------------------------------------
  */

  const todayDate = new Date();

  todayDate.setHours(
    0,
    0,
    0,
    0,
  );

  for (let i = 1; i <= totalDays; i++) {

    const dateObj = new Date(
      year,
      month,
      i,
    );

    /*
    |--------------------------------------------------------------------------
    | LOCAL DATE FORMAT (NO UTC ISSUE)
    |--------------------------------------------------------------------------
    */

    const localYear =
      dateObj.getFullYear();

    const localMonth =
      String(
        dateObj.getMonth() + 1,
      ).padStart(2, '0');

    const localDay =
      String(
        dateObj.getDate(),
      ).padStart(2, '0');

    const fullDate =
      `${localYear}-${localMonth}-${localDay}`;

    /*
    |--------------------------------------------------------------------------
    | DISABLE PAST DATES
    |--------------------------------------------------------------------------
    */

    const compareDate =
      new Date(dateObj);

    compareDate.setHours(
      0,
      0,
      0,
      0,
    );

    const isPast =
      compareDate < todayDate;

    dates.push({

      day: dateObj
        .toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
          },
        )
        .toUpperCase(),

      date: i,

      month: dateObj
        .toLocaleDateString(
          'en-US',
          {
            month: 'short',
          },
        ),

      fullDate,

      isDisabled: isPast,
    });
  }

  return dates;
};

export const Theme = {
  bg: '#FAF8F3',
  cardBg: '#FFFFFF',
  cardBorder: '#EFE6D8',
  gold: '#B8933F',
  goldSoft: '#F4E9D3',
  emerald: Colors?.primaryColor || '#0A8F5A',
  emeraldSoft: '#E8F3EC',
  danger: Colors?.errorColor || '#D64545',
  dangerSoft: '#FBEAEA',
  ink: '#1F2A24',
  subInk: '#8A8578',
  divider: '#F0EBE0',
};

export const shadow = (strength: 'sm' | 'md' | 'lg' = 'md') => {
  const map = {
    sm: { h: 4, opacity: 0.06, radius: 8, elevation: 3 },
    md: { h: 8, opacity: 0.1, radius: 16, elevation: 6 },
    lg: { h: 14, opacity: 0.14, radius: 26, elevation: 12 },
  } as const;
  const cfg = map[strength];
  return {
    shadowColor: '#1F2A24',
    shadowOffset: { width: 0, height: cfg.h },
    shadowOpacity: cfg.opacity,
    shadowRadius: cfg.radius,
    elevation: Platform.OS === 'android' ? cfg.elevation : 0,
  };
};



