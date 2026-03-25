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


export interface FAQ {
  question: string;
  description: string;
  steps: Step[];
}