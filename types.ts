
export type Category = 
  | 'AirPods' 
  | 'Chargers' 
  | 'Cables' 
  | 'Skins' 
  | 'ScreenGuards' 
  | 'Speakers' 
  | 'WiredAudio' 
  | 'Neckbands' 
  | 'Accessory';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price?: number; // Optional for services
  description: string;
  image: string;
  isPopular?: boolean;
  size: 'large' | 'small'; // bento size
  isQuoteRequired?: boolean;
  isContactOnly?: boolean; 
  isModelRequired?: boolean; // requires iPhone model selection (11+)
  isUniversalModel?: boolean; // allows any model entry (all phones)
  rating?: number;
  reviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
  phoneDetails?: string;
  quotedPrice?: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMode: 'UPI' | 'COD';
  status: 'Pending' | 'Shipped' | 'Completed';
  timestamp: number;
}
