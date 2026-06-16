import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DbProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
  sku?: string;
  model_id?: string;
  stock_quantity?: number;
  created_at?: string;
}

// Map database row back to rich frontend Product model (prevents design disruption)
export function mapDbToProduct(db: DbProduct): Product {
  const categoryThai = 
    db.category === 'rowboat' ? 'เรือพายอเนกประสงค์' :
    db.category === 'fishing' ? 'เรือตกปลา / พ่วงเครื่องยนต์' :
    db.category === 'kayak' ? 'เรือคายัคสุดแรง' :
    db.category === 'accessory' ? 'อุปกรณ์พรมัดระนาบ' : 'ทั่วไป';

  const mappedSku = db.sku || db.model_id || db.id || '';

  return {
    id: db.id || '',
    sku: mappedSku,
    model_id: db.model_id || db.sku || db.id || '',
    name: db.name,
    originalPrice: Math.round(db.price * 1.25),
    price: Number(db.price),
    discountRate: 20,
    category: db.category as any,
    categoryThai: categoryThai,
    images: [db.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'],
    length: db.category === 'rowboat' ? '2.50 เมตร' : db.category === 'kayak' ? '2.85 เมตร' : '3.00 เมตร',
    width: db.category === 'rowboat' ? '0.90 เมตร' : db.category === 'kayak' ? '0.82 เมตร' : '1.10 เมตร',
    weight: db.category === 'rowboat' ? '22 กิโลกรัม' : db.category === 'kayak' ? '21 กิโลกรัม' : '32 กิโลกรัม',
    capacity: db.category === 'rowboat' ? '180 กิโลกรัม' : db.category === 'kayak' ? '150 กิโลกรัม' : '280 กิโลกรัม',
    seats: db.category === 'rowboat' ? 2 : db.category === 'kayak' ? 1 : 3,
    description: db.description,
    longDescription: db.description || 'เรือพลาสติกหลอมหนาพิเศษ ตราพรพงศ์ แข็งแกร่งทนทาน ไร้รอยต่อตลอดทั้งลำ พร้อมสารกันรังสี UV-8 ช่วยพยุงการลอยตัวดีเลิศ มีความเสถียรตัวเหนือชั้น',
    features: [
      'โครงสร้างทรงเสถียรสูงพายง่ายไม่เอียงคว่ำง่าย',
      'ผลิตจากวัถุดิบเกรดเอ ทนทานแสงแดดเมืองไทย ไม่กรอบหัก',
      'มีหูหิ้วและช่องเกาะเกี่ยวหัวท้าย ขนย้ายสะดวกสบาย'
    ],
    colors: [
      { name: 'น้ำเงินตัดขาว', hex: '#1d4ed8' },
      { name: 'ส้มสะท้อนแสง', hex: '#f97316' },
      { name: 'เหลืองสดิตต์', hex: '#eab308' }
    ],
    rating: 4.8,
    reviewCount: 24,
    inStock: db.status !== 'outofstock',
    status: db.status as any,
    stockQuantity: db.stock_quantity !== undefined ? db.stock_quantity : (db.status === 'instock' ? 12 : 0),
    specs: `หมวดหมู่สินค้า: ${categoryThai}, เกรดพลาสติก: หนาทนทานพิเศษ`
  };
}

// Clean premium catalog values (without mountains, people, or placeholders)
const DEFAULT_CLEAN_SEED: DbProduct[] = [
  {
    id: 'f87a0bfa-8730-4e12-8811-37d4573f08b1',
    sku: 'boat-row-25',
    model_id: 'boat-row-25',
    name: 'เรือพายพลาสติก พรพงศ์ รุ่นมินิสปอร์ต 2.5 เมตร',
    description: 'เรือพายขนาดเล็กสำหรับใช้ในคลอง สวนอาหาร หรือบ่อเลี้ยงสัตว์น้ำ มีความคล่องตัวสูง พลาสติกหนากกว่า 5 มม. ยืดหยุ่นทนทานแรงกระแทก',
    price: 5900,
    category: 'rowboat',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  },
  {
    id: 'a99cda11-766a-499c-bfa8-cdc0762955f2',
    sku: 'boat-row-30',
    model_id: 'boat-row-30',
    name: 'เรือพลาสติก 2 ที่นั่ง รุ่นสแตนดาร์ดคลาสสิก 3.0 เมตร',
    description: 'เรือพาราพลาสติก ทรงโครงสร้างและฐานด้านล่างแบนกึ่งวี เพื่อประสิทธิภาพการสัญจรทางน้ำและขยับพายง่ายไม่เอียงคว่ำหน้า เสริมบ่อสัมภาระกลางลำเรือ',
    price: 8900,
    category: 'rowboat',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800'
  },
  {
    id: 'b4b1a1dd-a0fd-4de1-9de3-4d2bc50e26b3',
    sku: 'boat-kayak-1p',
    model_id: 'boat-kayak-1p',
    name: 'เรือคายัคนั่งบน รุ่นแอดเวนเจอร์ พรีเมียม 2.8 เมตร',
    description: 'สุดยอดคายัค Sit-on-top เกรดลุยทางน้ำทะเลและแก่งคลื่นน้ำ แข็งแรงทนทาน ลอยเหนือน้ำเยี่ยม ทรงดีไซน์ตัดน้ำแบบกระดูกงูด้านล่าง สปีดพายเร็ว',
    price: 10900,
    category: 'kayak',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  },
  {
    id: 'e21c8da7-0ba6-455c-a551-7ba8be3df2bb',
    sku: 'acc-paddle-wood',
    model_id: 'acc-paddle-wood',
    name: 'ไม้พายเรือเนื้อไม้แปรรูปยาว เกรดพรีเมียมเนื้อหนา',
    description: 'ด้ามพายพลาสติกผสมไม้คัดเกรด ไร้ตาไม้บูดเปราะ ทาสารแล็คเกอร์กันน้ำสามชั้นเพื่อรักษาเนื้อไม้แห้งสนิท สรีระโบราณพายจับกระชับรับแรงพายระนาบน้ำ',
    price: 450,
    category: 'accessory',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1552751753-078450580aab?q=80&w=800'
  },
  {
    id: '0fcdd1b2-11ef-42d4-bbbb-f26df85c472f',
    sku: 'acc-vest-pro',
    model_id: 'acc-vest-pro',
    name: 'เสื้อชูชีพสีสะท้อนแสงติดนกหวีดสากล รุ่น Safety-Max',
    description: 'เสื้อกู้ภัยพรีเมียมบุแผงโฟม PE หนามากกว่า 40 มม. เสริมระบบเข็มขัดนิรภัยล็อคทรวงอก 3 แถว และสายรั้งกระชับหว่างขากันตัวสวมหลุดปลิวระหว่างแช่น้ำ',
    price: 550,
    category: 'accessory',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=800'
  },
  {
    id: '92cd99a1-fb1f-4ef2-bfa2-cacda62540d9',
    sku: 'boat-fish-32',
    model_id: 'boat-fish-32',
    name: 'เรือหัวแหลมติดเครื่องยนต์ รุ่นมารีนโปรฟิชชิ่ง 3.2 เมตร',
    description: 'เรือพรีเมียมระดับจับปลาและขนส่งติดแป้นเสริมสำหรับติดตั้งเครื่องเรือ Outboard ด้านท้าย ลอยพยุงน้ำได้โดดเด่นด้วยท่อต้านทานลมรอบตัวเรือพลาสติกหนา',
    price: 13200,
    category: 'fishing',
    status: 'preorder',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  }
];

// Database CRUD Suite
export const supabaseProducts = {
  async list(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase URL/AnonKey is missing or not configured.');
    }
    // High discipline: strictly avoid local storage fallback
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapDbToProduct);
  },

  async insert(item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Do NOT send id for a new product insert so Supabase can generate a UUID
    const dbItem: any = {
      name: item.name,
      description: item.description || item.longDescription || '',
      price: Number(item.price),
      image_url: item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
      category: item.category,
      status: item.status || 'instock',
      sku: item.sku || item.model_id,
      model_id: item.model_id || item.sku,
      stock_quantity: Number(item.stockQuantity || item.stock_quantity || 1)
    };

    const { error } = await supabase.from('products').insert([dbItem]);
    if (error) {
      throw error;
    }
    return true;
  },

  async update(id: string, item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const dbItem: any = {
      name: item.name,
      description: item.description || item.longDescription || '',
      price: Number(item.price),
      image_url: item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
      category: item.category,
      status: item.status || 'instock',
      sku: item.sku || item.model_id,
      model_id: item.model_id || item.sku,
      stock_quantity: Number(item.stockQuantity || item.stock_quantity || 1)
    };

    const { error } = await supabase.from('products').update(dbItem).eq('id', id);
    if (error) {
      throw error;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw error;
    }
    return true;
  },

  async seed(): Promise<boolean> {
    if (!supabase) return false;
    // Strip ids so they are created freshly or use hardcoded UUID templates if supported
    const itemsToInsert = DEFAULT_CLEAN_SEED.map(item => {
      const { id, ...rest } = item;
      return {
        ...rest,
        // use predefined ids if valid uuid formats, else let supabase generate
        id: id
      };
    });
    const { error } = await supabase.from('products').insert(itemsToInsert);
    if (error) {
      console.error('Supabase seeding failed:', error);
      return false;
    }
    return true;
  }
};

export interface DbCustomer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  membership_level?: string;
  points?: number;
  created_at?: string;
}

export const supabaseCustomers = {
  async list(): Promise<DbCustomer[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured. Returning empty customers.');
      return [];
    }
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  async insert(item: DbCustomer): Promise<DbCustomer> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name: item.name,
        email: item.email.toLowerCase().trim(),
        phone: item.phone,
        password: item.password,
        membership_level: item.membership_level || 'Standard',
        points: item.points || 0
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  async create(item: DbCustomer): Promise<DbCustomer> {
    return this.insert(item);
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    return true;
  },

  async updatePoints(id: string, points: number): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase
      .from('customers')
      .update({ points })
      .eq('id', id);

    if (error) {
      throw error;
    }
    return true;
  },

  async updateProfile(email: string, name: string, phone: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase
      .from('customers')
      .update({ name, phone })
      .eq('email', email.toLowerCase().trim());

    if (error) {
      throw error;
    }
    return true;
  },

  async checkEmailExists(email: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return false;
    }
    const { data, error } = await supabase
      .from('customers')
      .select('email')
      .eq('email', email.toLowerCase().trim());
    
    if (error) return false;
    return (data && data.length > 0);
  },

  async validateUser(email: string, passwordStr: string): Promise<DbCustomer | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password', passwordStr);

    if (error || !data || data.length === 0) {
      return null;
    }
    return data[0];
  }
};

export const supabaseOrders = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not select from orders table in Supabase:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        ...row,
        // Old view compatible fields:
        id: row.id,
        customerName: row.customer_name || row.customerName || '',
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
        productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
        color: row.color || 'คละสี',
        amount: Number(row.total_amount || row.amount || 0),
        status: row.payment_status || row.status || 'Pending',
        shipmentNo: row.shipmentNo || row.shipment_no || '',
        
        // New view exact fields:
        customer_id: row.customer_id || null,
        customer_name: row.customer_name || row.customerName || '',
        customer_email: row.customer_email || 'guest@example.com',
        total_amount: Number(row.total_amount || row.amount || 0),
        payment_status: row.payment_status || row.status || 'pending',
        created_at: row.created_at || row.date || ''
      }));
    } catch (e: any) {
      console.warn('Orders fetch caught error:', e.message);
      return [];
    }
  },

  async create(item: {
    customer_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    payment_status: string;
    order_status: string;
    created_at?: string;
    // compatible fields:
    productName?: string;
    color?: string;
  }): Promise<any> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const dbPayload = {
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        total_amount: Number(item.total_amount),
        payment_status: item.payment_status || 'pending',
        order_status: item.order_status || 'waiting_payment',
        created_at: item.created_at || new Date().toISOString(),
        
        // compatible fields:
        customerName: item.customer_name,
        productName: item.productName || 'เรือพลาสติกและอุปกรณ์',
        color: item.color || 'คละสี',
        amount: Number(item.total_amount),
        status: item.payment_status === 'pending' ? 'Pending' : item.payment_status
      };

      const customer_id = item.customer_id;
      const customer_name = item.customer_name;
      const customer_email = item.customer_email;

      console.log({
        customer_id,
        customer_name,
        customer_email
      });

      const { data, error } = await supabase.from('orders').insert([dbPayload]).select();
      if (error) {
        console.warn('First insert attempt failed:', error.message);
        // Fallback for schema that might be missing some fields
        const { data: fallbackData, error: fallbackError } = await supabase.from('orders').insert([{
          customer_id: item.customer_id,
          customer_name: item.customer_name,
          customer_email: item.customer_email,
          customer_phone: item.customer_phone,
          customerName: item.customer_name,
          total_amount: Number(item.total_amount),
          amount: Number(item.total_amount),
          payment_status: item.payment_status || 'pending',
          order_status: item.order_status || 'waiting_payment',
          status: item.payment_status === 'pending' ? 'Pending' : item.payment_status
        }]).select();

        if (fallbackError) {
          console.warn('Fallback insert attempt failed:', fallbackError.message);
          // Absolute barebones fallback
          const { data: simpleData, error: simpleError } = await supabase.from('orders').insert([{
            customer_id: item.customer_id,
            customer_name: item.customer_name,
            customer_email: item.customer_email,
            total_amount: Number(item.total_amount),
            payment_status: item.payment_status || 'pending'
          }]).select();
          
          if (simpleError) {
            throw simpleError;
          }
          return simpleData?.[0];
        }
        return fallbackData?.[0];
      }
      return data?.[0];
    } catch (err: any) {
      console.error('Failed to create order in Supabase:', err.message);
      throw err;
    }
  },

  async update(id: string, item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('orders').update(item).eq('id', id);
      if (error) {
        throw error;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to update order in Supabase:', err.message);
      throw err;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        throw error;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to delete order from Supabase:', err.message);
      throw err;
    }
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('orders').update({ payment_status: status, status }).eq('id', id);
      if (error) {
        await supabase.from('orders').update({ status }).eq('id', id);
      }
      return true;
    } catch {
      return false;
    }
  },

  async listWaitingVerify(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_status', 'waiting_verify')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not select waiting verify from orders table in Supabase:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        ...row,
        id: row.id,
        customerName: row.customer_name || row.customerName || '',
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
        productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
        color: row.color || 'คละสี',
        amount: Number(row.total_amount || row.amount || 0),
        status: row.payment_status || row.status || 'Pending',
        shipmentNo: row.shipmentNo || row.shipment_no || '',
        payment_slip_url: row.payment_slip_url || '',
        
        customer_id: row.customer_id || null,
        customer_name: row.customer_name || row.customerName || '',
        customer_email: row.customer_email || 'guest@example.com',
        customer_phone: row.customer_phone || '',
        total_amount: Number(row.total_amount || row.amount || 0),
        payment_status: row.payment_status || row.status || 'pending',
        order_status: row.order_status || 'waiting_payment',
        created_at: row.created_at || row.date || ''
      }));
    } catch (e: any) {
      console.warn('Orders fetch waiting verify caught error:', e.message);
      return [];
    }
  },

  async approve(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'approved',
          order_status: 'confirmed',
          status: 'Approved'
        })
        .eq('id', id);
      if (error) {
        await supabase.from('orders').update({ payment_status: 'approved' }).eq('id', id);
      }
      return true;
    } catch (err: any) {
      console.error('Failed to approve order:', err.message);
      return false;
    }
  },

  async reject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'rejected',
          order_status: 'payment_failed',
          status: 'Rejected'
        })
        .eq('id', id);
      if (error) {
        await supabase.from('orders').update({ payment_status: 'rejected' }).eq('id', id);
      }
      return true;
    } catch (err: any) {
      console.error('Failed to reject order:', err.message);
      return false;
    }
  },

  async uploadSlip(orderId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      // Create a unique clean path name
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `slip_${orderId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file to storage bucket of Supabase:', uploadError.message);
        throw uploadError;
      }

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-slips')
        .getPublicUrl(cleanFileName);

      // Update the orders table with payment_slip_url and payment_status = 'waiting_verify'
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_slip_url: publicUrl,
          payment_status: 'waiting_verify',
          status: 'WaitingVerify' // Legacy view support
        })
        .eq('id', orderId);

      if (updateError) {
        console.warn('Update with payment_slip_url failed, attempting base update:', updateError.message);
        // Fallback update in case payment_slip_url field is missing in your Postgres DB schema
        const { error: baseUpdateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'waiting_verify',
            status: 'WaitingVerify'
          })
          .eq('id', orderId);
        
        if (baseUpdateError) {
          throw baseUpdateError;
        }
      }

      return publicUrl;
    } catch (err: any) {
      console.error('Failed in uploadSlip:', err.message || err);
      throw err;
    }
  }
};

export const supabasePreOrders = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase.from('preorders').select('*');
      if (error) {
        const { data: data2, error: error2 } = await supabase.from('pre_orders').select('*');
        if (error2) {
          console.warn('Could not select from preorders/pre_orders table in Supabase:', error2.message);
          return [];
        }
        return (data2 || []).map(this.mapRow);
      }
      return (data || []).map(this.mapRow);
    } catch (e: any) {
      console.warn('Pre-orders fetch caught error:', e.message);
      return [];
    }
  },
  mapRow(row: any) {
    return {
      id: row.id,
      customerName: row.customerName || row.customer_name || '',
      phone: row.phone || '',
      date: row.date || row.created_at ? new Date(row.date || row.created_at).toISOString().split('T')[0] : '',
      productName: row.productName || row.product_name || '',
      color: row.color || '',
      quantity: Number(row.quantity || 1),
      deposit: Number(row.deposit || 0),
      fullPrice: Number(row.fullPrice || row.full_price || 0),
      estDelivery: row.estDelivery || row.est_delivery_date || row.est_delivery || '',
      status: row.status || 'AwaitingDeposit'
    };
  },
  async updateStatus(id: string, status: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('preorders').update({ status }).eq('id', id);
      await supabase.from('pre_orders').update({ status }).eq('id', id);
      return true;
    } catch {
      return false;
    }
  }
};

export const supabaseCoupons = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) {
        console.warn('Could not select from coupons table in Supabase:', error.message);
        return [];
      }
      return (data || []).map((row: any) => ({
        code: row.code,
        discount: Number(row.discount || 0),
        type: row.type || 'flat',
        description: row.description || '',
        active: row.active !== undefined ? row.active : true
      }));
    } catch {
      return [];
    }
  },
  async insert(item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('coupons').insert([item]);
      return !error;
    } catch {
      return false;
    }
  },
  async updateActive(code: string, active: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('coupons').update({ active }).eq('code', code);
      return true;
    } catch {
      return false;
    }
  },
  async delete(code: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('coupons').delete().eq('code', code);
      return true;
    } catch {
      return false;
    }
  }
};

export const supabaseReviews = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase.from('reviews').select('*');
      if (error) {
        console.warn('Could not select from reviews table in Supabase:', error.message);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        productName: row.productName || row.product_name || '',
        author: row.author || '',
        rating: Number(row.rating || 5),
        date: row.date || row.created_at ? new Date(row.date || row.created_at).toISOString().split('T')[0] : '',
        comment: row.comment || '',
        approved: row.approved !== undefined ? row.approved : false
      }));
    } catch {
      return [];
    }
  },
  async updateApproval(id: string, approved: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('reviews').update({ approved }).eq('id', id);
      return true;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('reviews').delete().eq('id', id);
      return true;
    } catch {
      return false;
    }
  }
};

export const supabasePromotions = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase.from('promotions').select('*');
      if (error) {
        console.warn('Could not select from promotions table in Supabase:', error.message);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name || '',
        discount: row.discount || '',
        startDate: row.startDate || row.start_date || '',
        endDate: row.endDate || row.end_date || '',
        status: row.status || 'Active'
      }));
    } catch {
      return [];
    }
  },
  async insert(item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const dbItem: any = {
        name: item.name,
        discount: item.discount,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status
      };
      await supabase.from('promotions').insert([dbItem]);
      return true;
    } catch {
      return false;
    }
  },
  async update(id: string, item: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const dbItem: any = {
        name: item.name,
        discount: item.discount,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status
      };
      await supabase.from('promotions').update(dbItem).eq('id', id);
      return true;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('promotions').delete().eq('id', id);
      return true;
    } catch {
      return false;
    }
  }
};

