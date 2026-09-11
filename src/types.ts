export interface Product {
  id: string;
  sku?: string;
  model_id?: string;
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

export interface User {
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  title?: string;
  recipient_name?: string;
  phone?: string;
  address: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}
