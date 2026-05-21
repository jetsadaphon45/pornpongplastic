export interface Product {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  discountRate?: number;
  category: 'rowboat' | 'fishing' | 'kayak' | 'accessory';
  categoryThai: string;
  images: string[];
  length?: string;
  width?: string;
  weight?: string;
  capacity?: string;
  seats?: number;
  description: string;
  longDescription: string;
  features: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  status?: 'instock' | 'outofstock' | 'preorder';
  stockQuantity?: number;
  specs?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}
