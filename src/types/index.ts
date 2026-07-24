export interface Product {
  id: string;
  variantId?: string;
  name: string;
  price: number;
  image: any;
  lastOrdered?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
}