export interface Product {
  id: string;
  name: string;
  category: 'fiberglass' | 'plastic' | 'rowboat' | 'accessory';
  price: number;
  description: string;
  specs: {
    size: string;
    material: string;
    capacity: string;
  };
  image: string;
  status: 'available' | 'preorder' | 'outofstock';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  lineId: string;
  address: string;
  role: 'admin' | 'user';
}

export interface PreOrder {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userLineId: string;
  items: CartItem[];
  status: 'pending' | 'contacting' | 'producing' | 'shipped' | 'cancelled';
  totalEstimatedPrice: number;
  shippingAddress: string;
  notes: string;
  createdAt: string;
}
