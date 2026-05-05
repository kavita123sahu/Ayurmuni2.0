import { Images } from "./Images";

export type OrderStatus = 'DELIVERED' | 'IN_PROGRESS';


// KEYSROE pass word = Ayurmuni , Aimantra, 

export interface Order {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: OrderStatus;
}

export interface Step {
  id: number;
  text: string;
}

export interface GenderOption {
  id: string;
  label: string;
  value: string;
}



export interface FAQ {
  question: string;
  description: string;
  steps: Step[];
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

const productImage = require('../assets/images/RecentsImage.png');


const productImage2 = require('../assets/images/DietImage.png');
const productImage1 = require('../assets/images/YogaImage.png');
const productImage3 = require('../assets/images/ImageSpa.png');

export const topSelling = [
  {
    id: '1',
    name: 'Foxtail millet',
    subtitle: 'Acne Clear  Cream',
    subname: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 649,
    image: productImage,
    tag: 'Bestselling',
  },
  {
    id: '2',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage,
    tag: '15% OFF',
  },
  {
    id: '3',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage,
    tag: 'Hot',
  },
  {
    id: '4',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage,
    tag: '15% OFF',
  },
  {
    id: '5',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage,
    tag: 'Hot',
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


export const topSelling1 = [
  {
    id: '1',
    name: 'Foxtail millet',
    subtitle: 'Dynamic flow to build heat and agility',
    subname: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 649,
    image: productImage1,
    tag: 'Bestselling',
  },
  {
    id: '2',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage1,
    tag: '15% OFF',
  },
  {
    id: '3',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage1,
    tag: 'Hot',
  },
  {
    id: '4',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage1,
    tag: '15% OFF',
  },
  {
    id: '5',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage1,
    tag: 'Hot',
  },
];

export const topSelling2 = [
  {
    id: '1',
    name: 'Foxtail millet',
    subtitle: 'Dynamic flow to build heat and agility',
    subname: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 649,
    image: productImage2,
    tag: 'Bestselling',
  },
  {
    id: '2',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage2,
    tag: '15% OFF',
  },
  {
    id: '3',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage2,
    tag: 'Hot',
  },
  {
    id: '4',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage2,
    tag: '15% OFF',
  },
  {
    id: '5',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage2,
    tag: 'Hot',
  },
];

export const topSelling3 = [
  {
    id: '1',
    name: 'Foxtail millet',
    subtitle: 'Dynamic flow to build heat and agility',
    subname: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 649,
    image: productImage3,
    tag: 'Bestselling',
  },
  {
    id: '2',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage3,
    tag: '15% OFF',
  },
  {
    id: '3',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage3,
    tag: 'Hot',
  },
  {
    id: '4',
    name: 'Face Cream',
    subtitle: 'Acne Clear  Cream',
    price: 399,
    oldPrice: 699,
    image: productImage3,
    tag: '15% OFF',
  },
  {
    id: '5',
    name: 'Organic Rice',
    subtitle: 'Acne Clear  Cream',
    oldPrice: 699.00,
    price: 250,
    image: productImage3,
    tag: 'Hot',
  },
];


export const doctorsData = [
  {
    id: '1',
    name: 'Dr. Arjun R Nair',
    specialization: 'Panchakarma Specialist',
    experience: '12 Yrs. Exp',
    rating: '4.4',
    image: require('../assets/images/doctor.png'), // ya { uri: 'url' }
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Neha Sharma',
    specialization: 'Cardiologist',
    experience: '8 Yrs. Exp',
    rating: '4.7',
    image: require('../assets/images/doctor.png'),
    available: false,
  },
];


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


export const QUESTIONS_DATA = [

  // ══════════════ SECTION 1: PHYSICAL TRAITS ══════════════
  {
    section: 'Physical Traits',
    sectionIcon: '🧘',
    sectionColor: '#FFF0E6',
    sectionIndex: 0,

    id: 'body_type',
    question: 'Apna body physique kaisa describe karoge?',
    description: 'Apne natural body structure ke baare mein socho — bina exercise ke normally kaisa dikhta hai.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Lean & Thin',
        sublabel: 'Weight gain bahut mushkil se hota hai',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Medium & Balanced',
        sublabel: 'Proportionate build, na zyaada patla na mota',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Heavy & Broad',
        sublabel: 'Weight asaani se badhta hai, strong frame',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  {
    section: 'Physical Traits',
    sectionIcon: '🧘',
    sectionColor: '#FFF0E6',
    sectionIndex: 0,

    id: 'hair_scalp',
    question: 'Aapke scalp ke baal kaise hote hain?',
    description: 'Apne baalon ki natural texture aur health ke baare mein socho — bina product lagaaye.',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Dry & Frizzy',
        sublabel: 'Toot jaate hain, rulhe rehte hain',
        image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Soft & Thin',
        sublabel: 'Patle baal, greying ya hair fall hota hai',
        image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Thick & Shiny',
        sublabel: 'Ghane, chamkile aur mazboot baal',
        image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  {
    section: 'Physical Traits',
    sectionIcon: '🧘',
    sectionColor: '#FFF0E6',
    sectionIndex: 0,

    id: 'skin',
    question: 'Aapki skin texture kaisi hai?',
    description: 'Apni skin ko dhyan se observe karo — khaaskar chehre aur haathon ki natural condition.',
    coverImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Dry & Rough',
        sublabel: 'Khichti rehti hai, moisturizer zaroori',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Soft / Combination',
        sublabel: 'Normal se sensitive, T-zone thodi oily',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Oily & Smooth',
        sublabel: 'Chikni rehti hai, pores visible',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  // ══════════════ SECTION 2: FUNCTIONAL TRAITS ══════════════
  {
    section: 'Functional Traits',
    sectionIcon: '⚡',
    sectionColor: '#E8F5EE',
    sectionIndex: 1,

    id: 'hunger',
    question: 'Aapka hunger pattern kaisa rehta hai?',
    description: 'Ek normal din mein bhookh kab aur kaise lagti hai — khaana khane ke baad ka feel bhi dhyan rakho.',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Irregular Hunger',
        sublabel: 'Kabhi bahut bhookh, kabhi bilkul nahi',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Strong & On Time',
        sublabel: 'Samay par tez bhookh lagti hai',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Low Hunger',
        sublabel: 'Thoda khaake pet bhar jaata, jaldi full',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  {
    section: 'Functional Traits',
    sectionIcon: '⚡',
    sectionColor: '#E8F5EE',
    sectionIndex: 1,

    id: 'sleep',
    question: 'Neend kaisi rehti hai (bina alarm ke)?',
    description: 'Jab koi tension na ho aur body naturally so sake — tab neend kaisi hoti hai.',
    coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Halki Neend',
        sublabel: 'Baar baar jaag jaata, thodi si awaaz mein bhi',
        image: 'https://images.unsplash.com/photo-1520206319751-4e2da59c3ed4?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Acchi Neend',
        sublabel: 'Sahi se sota, asaani se jaag bhi jaata',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Gehri Lambi Neend',
        sublabel: 'Bahut gehri neend, uthna bahut mushkil',
        image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  {
    section: 'Functional Traits',
    sectionIcon: '⚡',
    sectionColor: '#E8F5EE',
    sectionIndex: 1,

    id: 'activity_pace',
    question: 'Daily activities kaise karte ho?',
    description: 'Ghar se kaam, shopping, ya office — in sab mein tera natural pace kaisa hai.',
    coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Fast & Always Moving',
        sublabel: 'Ek jagah nahi baith sakta, hamesha busy',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Steady & Balanced',
        sublabel: 'Na zyaada tez, na slow — sahi pace',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Slow & Calm',
        sublabel: 'Apna time leta, jaldi karna pasand nahi',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  // ══════════════ SECTION 3: PSYCHOLOGICAL TRAITS ══════════════
  {
    section: 'Psychological Traits',
    sectionIcon: '🧠',
    sectionColor: '#EEF0FF',
    sectionIndex: 2,

    id: 'stress_response',
    question: 'Challenging situation mein kaisa react karte ho?',
    description: 'Jab koi badi problem aaye ya pressure ho — tera pehla natural reaction kya hota hai.',
    coverImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Anxious & Restless',
        sublabel: 'Overthink karta, restless ho jaata',
        image: 'https://images.unsplash.com/photo-1455793185729-b65c4d24bfaf?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Bold & Direct',
        sublabel: 'Seedha baat karta, kabhi kabhi aggressive',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Calm & Reserved',
        sublabel: 'Composed rehta, baat sochke karta',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  {
    section: 'Psychological Traits',
    sectionIcon: '🧠',
    sectionColor: '#EEF0FF',
    sectionIndex: 2,

    id: 'hobbies',
    question: 'Kaise activities enjoy karte ho?',
    description: 'Free time mein naturally kya karna achha lagta hai — job ya duty ki baat nahi, sirf enjoyment.',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    dosha: true,
    options: [
      {
        label: 'Social & Outgoing',
        sublabel: 'Logon se milna, parties, hangout',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
        dosha: 'V',
      },
      {
        label: 'Competitive & Problem-Solving',
        sublabel: 'Challenges, debates, puzzle-solving',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
        dosha: 'P',
      },
      {
        label: 'Creative & Artistic',
        sublabel: 'Art, music, writing, cooking',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
        dosha: 'K',
      },
    ],
  },

  // ══════════════ SECTION 4: PERSONAL INFO ══════════════
  {
    section: 'Personal Info',
    sectionIcon: '👤',
    sectionColor: '#FFF8E6',
    sectionIndex: 3,

    id: 'diet',
    question: 'Aap kya khaate ho?',
    description: 'Teri regular diet kaisi hai — isse aapki Prakriti ke hisaab se sahi ahar plan kiya jaayega.',
    coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    dosha: false,
    options: [
      {
        label: 'Vegetarian',
        sublabel: 'Sirf sabzi, dal, doodh — no meat',
        image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&q=80',
      },
      {
        label: 'Non-Vegetarian',
        sublabel: 'Chicken, mutton, fish bhi khaata',
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=80',
      },
      {
        label: 'Eggetarian',
        sublabel: 'Anda khaata, baaki meat nahi',
        image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80',
      },
    ],
  },

  {
    section: 'Personal Info',
    sectionIcon: '👤',
    sectionColor: '#FFF8E6',
    sectionIndex: 3,

    id: 'physical_activity',
    question: 'Physical activity level kaisa hai?',
    description: 'Ek average hafte mein kitna physically active rehte ho — gym, walk, sports sab count hota hai.',
    coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    dosha: false,
    options: [
      {
        label: 'Sedentary',
        sublabel: 'Mostly baithe rehna, bahut kam movement',
        image: 'https://images.unsplash.com/photo-1545696968-1a31176eca9e?w=400&q=80',
      },
      {
        label: 'Moderate',
        sublabel: 'Ghar ka kaam, walk, ya 1-2x gym/week',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80',
      },
      {
        label: 'Very Active',
        sublabel: 'Regular workout, 3+ din per week',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
      },
    ],
  },

  {
    section: 'Personal Info',
    sectionIcon: '👤',
    sectionColor: '#FFF8E6',
    sectionIndex: 3,

    id: 'sleep_duration',
    question: 'Average neend kitni hoti hai?',
    description: 'Roz raat ko kitne ghante sote ho on average — weekends bhi consider karo.',
    coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80',
    dosha: false,
    options: [
      {
        label: '6–8 Ghante',
        sublabel: 'Normal recommended sleep',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80',
      },
      {
        label: '6 Se Kam',
        sublabel: 'Neend poori nahi hoti',
        image: 'https://images.unsplash.com/photo-1520206319751-4e2da59c3ed4?w=400&q=80',
      },
      {
        label: '8 Se Zyaada',
        sublabel: 'Zyaada sone ki zaroorat ya aadat',
        image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&q=80',
      },
    ],
  },
];


