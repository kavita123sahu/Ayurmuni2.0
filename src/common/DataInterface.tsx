import { Images } from "./Images";

export type OrderStatus = 'DELIVERED' | 'IN_PROGRESS';

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

  export  const product = {
        images: [
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
        ],
    };

  const productImage = require('../assets/images/RecentsImage.png');

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


 export  const doctorsData = [
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