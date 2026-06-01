import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
  created_at?: string;
}

// Map database row back to rich frontend Product model (prevents design disruption)
export function mapDbToProduct(db: DbProduct): Product {
  const categoryThai = 
    db.category === 'rowboat' ? 'เรือพายอเนกประสงค์' :
    db.category === 'fishing' ? 'เรือตกปลา / พ่วงเครื่องยนต์' :
    db.category === 'kayak' ? 'เรือคายัคสุดแรง' :
    db.category === 'accessory' ? 'อุปกรณ์พรมัดระนาบ' : 'ทั่วไป';

  return {
    id: db.id,
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
    stockQuantity: db.status === 'instock' ? 12 : 0,
    specs: `หมวดหมู่สินค้า: ${categoryThai}, เกรดพลาสติก: หนาทนทานพิเศษ`
  };
}

// Clean premium catalog values (without mountains, people, or placeholders)
const DEFAULT_CLEAN_SEED: DbProduct[] = [
  {
    id: 'boat-row-25',
    name: 'เรือพายพลาสติก พรพงศ์ รุ่นมินิสปอร์ต 2.5 เมตร',
    description: 'เรือพายขนาดเล็กสำหรับใช้ในคลอง สวนอาหาร หรือบ่อเลี้ยงสัตว์น้ำ มีความคล่องตัวสูง พลาสติกหนากว่า 5 มม. ยืดหยุ่นทนทานแรงกระแทก',
    price: 5900,
    category: 'rowboat',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  },
  {
    id: 'boat-row-30',
    name: 'เรือพลาสติก 2 ที่นั่ง รุ่นสแตนดาร์ดคลาสสิก 3.0 เมตร',
    description: 'เรือพาราพลาสติก ทรงโครงสร้างและฐานด้านล่างแบนกึ่งวี เพื่อประสิทธิภาพการสัญจรทางน้ำและขยับพายง่ายไม่เอียงคว่ำหน้า เสริมบ่อสัมภาระกลางลำเรือ',
    price: 8900,
    category: 'rowboat',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800'
  },
  {
    id: 'boat-kayak-1p',
    name: 'เรือคายัคนั่งบน รุ่นแอดเวนเจอร์ พรีเมียม 2.8 เมตร',
    description: 'สุดยอดคายัค Sit-on-top เกรดลุยทางน้ำทะเลและแก่งคลื่นน้ำ แข็งแรงทนทาน ลอยเหนือน้ำเยี่ยม ทรงดีไซน์ตัดน้ำแบบกระดูกงูด้านล่าง สปีดพายเร็ว',
    price: 10900,
    category: 'kayak',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  },
  {
    id: 'acc-paddle-wood',
    name: 'ไม้พายเรือเนื้อไม้แปรรูปยาว เกรดพรีเมียมเนื้อหนา',
    description: 'ด้ามพายพลาสติกผสมไม้คัดเกรด ไร้ตาไม้บูดเปราะ ทาสารแล็คเกอร์กันน้ำสามชั้นเพื่อรักษาเนื้อไม้แห้งสนิท สรีระโบราณพายจับกระชับรับแรงพายระนาบน้ำ',
    price: 450,
    category: 'accessory',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1552751753-078450580aab?q=80&w=800'
  },
  {
    id: 'acc-vest-pro',
    name: 'เสื้อชูชีพสีสะท้อนแสงติดนกหวีดสากล รุ่น Safety-Max',
    description: 'เสื้อกู้ภัยพรีเมียมบุแผงโฟม PE หนามากกว่า 40 มม. เสริมระบบเข็มขัดนิรภัยล็อคทรวงอก 3 แถว และสายรั้งกระชับหว่างขากันตัวสวมหลุดปลิวระหว่างแช่น้ำ',
    price: 550,
    category: 'accessory',
    status: 'instock',
    image_url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=800'
  },
  {
    id: 'boat-fish-32',
    name: 'เรือหัวแหลมติดเครื่องยนต์ รุ่นมารีนโปรฟิชชิ่ง 3.2 เมตร',
    description: 'เรือพรีเมียมระดับจับปลาและขนส่งติดแป้นเสริมสำหรับติดตั้งเครื่องเรือ Outboard ด้านท้าย ลอยพยุงน้ำได้โดดเด่นด้วยท่อต้านทานลมรอบตัวเรือพลาสติกหนา',
    price: 13200,
    category: 'fishing',
    status: 'preorder',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'
  }
];

// Helper to interact with local storage IF AND ONLY IF Supabase is not configured
const getLocalProducts = (): DbProduct[] => {
  try {
    const saved = localStorage.getItem('pornpong_supabase_fallback_products');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('pornpong_supabase_fallback_products', JSON.stringify(DEFAULT_CLEAN_SEED));
    return DEFAULT_CLEAN_SEED;
  } catch {
    return DEFAULT_CLEAN_SEED;
  }
};

const saveLocalProducts = (prods: DbProduct[]) => {
  try {
    localStorage.setItem('pornpong_supabase_fallback_products', JSON.stringify(prods));
  } catch (err) {
    console.error('Failed to write local backup products:', err);
  }
};

// Database CRUD Suite
export const supabaseProducts = {
  async list(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured. Using local fallback.');
      return getLocalProducts().map(mapDbToProduct);
    }
    // High discipline: strictly avoid local storage fallback if Supabase is configured
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      // Seeding database conditionally if configured but empty
      if (!data || data.length === 0) {
        console.log('Database table is empty. Auto-seeding default clean products list...');
        await this.seed();
        const { data: reloaded, error: reloadErr } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
        
        if (reloadErr) throw reloadErr;
        return (reloaded || DEFAULT_CLEAN_SEED).map(mapDbToProduct);
      }

      return data.map(mapDbToProduct);
    } catch (err) {
      console.error('Supabase fetch failed:', err);
      // Explicitly propagate the error instead of fallback to localStorage when configured!
      throw err;
    }
  },

  async insert(item: any): Promise<boolean> {
    const dbItem: DbProduct = {
      id: item.id,
      name: item.name,
      description: item.description || item.longDescription || '',
      price: Number(item.price),
      image_url: item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
      category: item.category,
      status: item.status || 'instock'
    };

    if (!isSupabaseConfigured || !supabase) {
      const local = getLocalProducts();
      local.unshift(dbItem);
      saveLocalProducts(local);
      return true;
    }

    try {
      const { error } = await supabase.from('products').insert([dbItem]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to insert product in Supabase:', err);
      throw err;
    }
  },

  async update(id: string, item: any): Promise<boolean> {
    const dbItem: Partial<DbProduct> = {
      name: item.name,
      description: item.description || item.longDescription || '',
      price: Number(item.price),
      image_url: item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
      category: item.category,
      status: item.status || 'instock'
    };

    if (!isSupabaseConfigured || !supabase) {
      const local = getLocalProducts();
      const updated = local.map(p => p.id === id ? { ...p, ...dbItem } : p);
      saveLocalProducts(updated);
      return true;
    }

    try {
      const { error } = await supabase.from('products').update(dbItem).eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update product in Supabase:', err);
      throw err;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const local = getLocalProducts();
      const updated = local.filter(p => p.id !== id);
      saveLocalProducts(updated);
      return true;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to delete product in Supabase:', err);
      throw err;
    }
  },

  async seed(): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('products').insert(DEFAULT_CLEAN_SEED);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase seeding failed:', err);
      return false;
    }
  }
};
