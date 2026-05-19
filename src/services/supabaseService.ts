import { supabase } from '../lib/supabase';
import { Product, PreOrder, User } from '../types';

// Helper to map DB profile to User type
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name || '',
  email: profile.email || '',
  phone: profile.phone || '',
  lineId: profile.line_id || '',
  address: profile.address || '',
  role: profile.role || 'user',
});

// Helper to map DB product to Product type
const mapProductToClient = (p: any): Product => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price),
  description: p.description || '',
  image: p.image_url || '',
  status: p.status,
  specs: p.specs || { size: '', material: '', capacity: '' },
});

// Helper to map DB order to PreOrder type
const mapOrderToClient = (o: any): PreOrder => ({
  id: o.id,
  userId: o.user_id || 'GUEST',
  userName: o.user_name || '',
  userPhone: o.user_phone || '',
  userLineId: o.user_line_id || '',
  items: o.items || [],
  status: o.status,
  totalEstimatedPrice: Number(o.total_price),
  shippingAddress: o.shipping_address || '',
  notes: o.notes || '',
  createdAt: o.created_at,
});

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data.map(mapProductToClient);
};

export const upsertProduct = async (product: Partial<Product>) => {
  const dbData: any = {
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    image_url: product.image,
    status: product.status,
    specs: product.specs,
    updated_at: new Date().toISOString(),
  };

  if (product.id) {
    dbData.id = product.id;
  }

  const { data, error } = await supabase
    .from('products')
    .upsert(dbData)
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const removeProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// User Services
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) return null;
  return mapProfileToUser(data);
};

export const saveUserProfile = async (user: Partial<User>) => {
  if (!user.id) return;
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: user.name,
      phone: user.phone,
      line_id: user.lineId,
      address: user.address,
      role: user.role,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
};

// Order Services
export const getOrders = async (uid?: string): Promise<PreOrder[]> => {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  
  if (uid) {
    query = query.eq('user_id', uid);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data.map(mapOrderToClient);
};

export const createOrder = async (order: Omit<PreOrder, 'id' | 'createdAt' | 'status'>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: order.userId === 'GUEST' ? null : order.userId,
      user_name: order.userName,
      user_phone: order.userPhone,
      user_line_id: order.userLineId,
      items: order.items,
      total_price: order.totalEstimatedPrice,
      shipping_address: order.shippingAddress,
      notes: order.notes,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const updateOrderStatusRemotely = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
};

// Image Upload (Moved to Cloudinary)
// uploadProductImage functionality is now handled by cloudinaryService.ts
