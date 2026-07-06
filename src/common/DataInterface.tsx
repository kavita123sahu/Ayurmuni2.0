import { Images } from "./Images";


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
    variant_title?: string;
    size?: string;
    selling_price?: number;
    brand_name?: string;
    image_url?: string;
  };
  media?: {
    media_url?: string;
  }[];

};


export const getProductData = (
  item: CartItem,
  doctorName?: string,
): ProductItem => ({
  id: item.id,

  name: item.variant?.variant_title || '',

  weight: item.variant?.size || '',

  size: item.variant?.size || '',

  brand_name: item.variant?.brand_name || '',

  variant_id:
    item.variant?.variant_id || '',
  price: Number(
    item.variant?.selling_price ||
    item.price ||
    0,
  ),

  quantity: Number(item.quantity || 1),

  image:
    item.variant?.image_url || '',

  doctorName,
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
    reschedule: {
      backgroundColor: "#DBEAFE",
      color: "#2563EB",
    },
    rescheduled: {
      backgroundColor: "#DBEAFE",
      color: "#2563EB",
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


 export  const EXPERIENCE_OPTIONS = [
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
    {
        label: 'Select Date',
        value: 'custom_date',
    },
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





