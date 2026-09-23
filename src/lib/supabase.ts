import { createClient } from '@supabase/supabase-js';
import { Product, UserAddress } from '../types';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL : '') ||
  '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY : '') ||
  '';

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
export const DEFAULT_CLEAN_SEED: DbProduct[] = [
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

export const DEFAULT_PRODUCTS: Product[] = DEFAULT_CLEAN_SEED.map(mapDbToProduct);

const PRODUCTS_STORAGE_KEY = 'pornpong_products_cache';

export function getLocalStoredProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_PRODUCTS;
}

export function saveLocalStoredProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

// Database CRUD Suite
export const supabaseProducts = {
  async list(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      // Supabase is not configured yet (e.g. preview mode or environment variables pending)
      // Return cached/seeded products seamlessly without throwing an unhandled exception
      return getLocalStoredProducts();
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error, fallback to catalog:', error.message);
        return getLocalStoredProducts();
      }

      if (!data || data.length === 0) {
        // Table exists but has no data -> auto-seed into Supabase
        await this.seed();
        return getLocalStoredProducts();
      }

      const mapped = data.map(mapDbToProduct);
      saveLocalStoredProducts(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('Failed to load products from Supabase directly:', err?.message || err);
      return getLocalStoredProducts();
    }
  },

  async insert(item: any): Promise<boolean> {
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

    if (!isSupabaseConfigured || !supabase) {
      const current = getLocalStoredProducts();
      const newProduct: Product = {
        ...mapDbToProduct(dbItem),
        id: 'local-' + Date.now()
      };
      saveLocalStoredProducts([newProduct, ...current]);
      return true;
    }

    const { error } = await supabase.from('products').insert([dbItem]);
    if (error) {
      throw error;
    }
    return true;
  },

  async update(id: string, item: any): Promise<boolean> {
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

    if (!isSupabaseConfigured || !supabase) {
      const current = getLocalStoredProducts();
      const updated = current.map(p => (p.id === id ? { ...p, ...item, id } : p));
      saveLocalStoredProducts(updated);
      return true;
    }

    const { error } = await supabase.from('products').update(dbItem).eq('id', id);
    if (error) {
      throw error;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      const current = getLocalStoredProducts();
      saveLocalStoredProducts(current.filter(p => p.id !== id));
      return true;
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

export interface UnifiedCustomer {
  id: string;
  user_id?: string;
  name: string;
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  membership_level: string;
  rank: string;
  points: number;
  rewardPoints: number;
  registerDate: string;
  createdAtFull: string;
  status: string;
  verification_status: string;
  is_verified: boolean;
  source: 'profiles' | 'customers' | 'both';
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

  async listUnified(): Promise<UnifiedCustomer[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured. Returning empty customers.');
      return [];
    }

    const resultMap = new Map<string, UnifiedCustomer>();

    // 1. Fetch from 'profiles' table in Supabase
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pErr && Array.isArray(profiles)) {
        for (const p of profiles) {
          const uid = String(p.id || p.user_id || '').trim();
          const email = String(p.email || '').toLowerCase().trim();
          const key = uid || email;
          if (!key) continue;

          const fullName = p.full_name || p.name || p.display_name || 'ผู้ใช้งาน Supabase';
          const phone = p.phone || p.phone_number || p.telephone || 'ไม่ระบุ';
          const pts = Number(p.points ?? p.reward_points ?? 0);
          const rank = p.membership_level || p.rank || 'Standard';
          const isVerified = Boolean(p.is_verified || p.verified || p.email_confirmed_at || p.phone_confirmed_at);
          const createdAt = p.created_at || p.updated_at || new Date().toISOString();
          const regDate = createdAt ? new Date(createdAt).toISOString().split('T')[0] : '2026-05-01';

          resultMap.set(key, {
            id: uid,
            user_id: uid,
            name: fullName,
            full_name: fullName,
            email: email,
            phone: phone,
            password: '',
            membership_level: rank,
            rank: rank,
            points: pts,
            rewardPoints: pts,
            registerDate: regDate,
            createdAtFull: createdAt,
            status: 'Active',
            verification_status: isVerified ? 'ยืนยันตัวตนแล้ว (Verified)' : 'ลงทะเบียนแล้ว (Active)',
            is_verified: isVerified,
            source: 'profiles'
          });
        }
      }
    } catch (e: any) {
      console.warn('Could not query profiles from Supabase:', e?.message || e);
    }

    // 2. Fetch from 'customers' table in Supabase
    try {
      const { data: customers, error: cErr } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!cErr && Array.isArray(customers)) {
        for (const c of customers) {
          const cid = String(c.id || '').trim();
          const email = String(c.email || '').toLowerCase().trim();
          
          let matchedKey: string | undefined = undefined;
          if (cid && resultMap.has(cid)) matchedKey = cid;
          else if (email && resultMap.has(email)) matchedKey = email;
          else {
            for (const [k, v] of resultMap.entries()) {
              if (email && v.email === email) {
                matchedKey = k;
                break;
              }
            }
          }

          const fullName = c.name || c.full_name || 'ผู้ใช้งาน';
          const phone = c.phone || 'ไม่ระบุ';
          const pts = Number(c.points || 0);
          const rank = c.membership_level || 'Standard';
          const createdAt = c.created_at || new Date().toISOString();
          const regDate = createdAt ? new Date(createdAt).toISOString().split('T')[0] : '2026-05-01';

          if (matchedKey) {
            const existing = resultMap.get(matchedKey)!;
            resultMap.set(matchedKey, {
              ...existing,
              id: existing.id || cid,
              user_id: existing.user_id || cid,
              password: c.password || existing.password,
              points: existing.points || pts,
              rewardPoints: existing.rewardPoints || pts,
              phone: existing.phone && existing.phone !== 'ไม่ระบุ' ? existing.phone : phone,
              name: existing.name && existing.name !== 'ผู้ใช้งาน Supabase' ? existing.name : fullName,
              full_name: existing.full_name && existing.full_name !== 'ผู้ใช้งาน Supabase' ? existing.full_name : fullName,
              source: 'both'
            });
          } else {
            const key = cid || email || `cust_${Date.now()}`;
            resultMap.set(key, {
              id: cid,
              user_id: cid,
              name: fullName,
              full_name: fullName,
              email: email,
              phone: phone,
              password: c.password || '',
              membership_level: rank,
              rank: rank,
              points: pts,
              rewardPoints: pts,
              registerDate: regDate,
              createdAtFull: createdAt,
              status: 'Active',
              verification_status: 'ยืนยัน OTP แล้ว (Active)',
              is_verified: true,
              source: 'customers'
            });
          }
        }
      }
    } catch (e: any) {
      console.warn('Could not query customers from Supabase:', e?.message || e);
    }

    return Array.from(resultMap.values());
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

  async updateCustomer(id: string, updates: { name?: string; email?: string; phone?: string; membership_level?: string; points?: number; password?: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email.toLowerCase().trim();
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.membership_level !== undefined) payload.membership_level = updates.membership_level;
    if (updates.points !== undefined) payload.points = updates.points;
    if (updates.password !== undefined) payload.password = updates.password;

    const { error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw error;
    }
    return true;
  },

  async resetPassword(id: string, newPassword: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase
      .from('customers')
      .update({ password: newPassword })
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
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. ตรวจสอบในตาราง customers
        const { data: custData, error: custErr } = await supabase
          .from('customers')
          .select('id, email')
          .ilike('email', cleanEmail)
          .limit(1);
        
        if (!custErr && custData && custData.length > 0) {
          return true;
        }

        // 2. ตรวจสอบในตาราง profiles
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('id, email')
          .ilike('email', cleanEmail)
          .limit(1);

        if (!profErr && profData && profData.length > 0) {
          return true;
        }
      } catch (err) {
        console.warn('Notice checking email exists in Supabase:', err);
      }
    }

    // 3. ตรวจสอบใน Local Storage Cache
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('pornpong_customers_cache');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.some((c: any) => String(c.email || '').toLowerCase().trim() === cleanEmail)) {
            return true;
          }
        }
      } catch {
        // ignore
      }
    }

    return false;
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

export interface DbProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  name?: string;
  display_name?: string;
  phone?: string;
  phone_number?: string;
  telephone?: string;
  address?: string;
  delivery_address?: string;
  shipping_address?: string;
  email?: string;
  points?: number;
  reward_points?: number;
  membership_level?: string;
  rank?: string;
  role?: string;
  status?: string;
  is_verified?: boolean;
  verified?: boolean;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const supabaseProfiles = {
  async listAll(): Promise<DbProfile[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.warn('Could not select from profiles table in Supabase:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Profiles listAll caught error:', e?.message || e);
      return [];
    }
  },

  /**
   * Fetch single user profile by Primary Key 'id'
   * - ตรวจสอบ Safety Check: ต้องมี userId ที่ถูกต้อง (ผู้ใช้ล็อกอินเรียบร้อย) ก่อนเรียก query
   * - ใช้ .eq('id', userId) ให้ตรงตาม Primary Key ของตาราง profiles เท่านั้น
   * - ยกเลิกการ query ด้วย user_id หรือ email โดยค้นด้วย id เพียงอย่างเดียวเพื่อป้องกัน Error 400
   */
  async getProfile(userId?: string): Promise<DbProfile | null> {
    // Safety check 1: Supabase client ตรวจสอบว่าพร้อมใช้งาน
    if (!supabase) return null;

    // Safety check 2: ตรวจสอบว่าผู้ใช้ล็อกอินเรียบร้อย (มี user.id ที่ถูกต้อง) ก่อนค่อยเรียก query
    if (!userId || typeof userId !== 'string') return null;
    const cleanUserId = userId.trim();
    if (!cleanUserId || cleanUserId === 'undefined' || cleanUserId === 'null' || cleanUserId === 'guest') {
      return null;
    }

    try {
      // Query ตาราง profiles ด้วยเงื่อนไข 'id' (Primary Key) เพียงอย่างเดียว
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', cleanUserId)
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch from profiles table in Supabase (eq id):', error.message);
        return null;
      }

      return data || null;
    } catch (e: any) {
      console.warn('Profiles getProfile caught exception:', e?.message || e);
      return null;
    }
  },

  async upsertProfile(profile: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    email?: string;
  }): Promise<{ success: boolean; data?: any; error?: any }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }

    // Safety check: ต้องมี id ที่ถูกต้อง (ตรงตาม Primary Key ของ profiles)
    if (!profile?.id || typeof profile.id !== 'string') {
      return { success: false, error: 'Valid user ID is required' };
    }
    const cleanId = profile.id.trim();
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null' || cleanId === 'guest') {
      return { success: false, error: 'Valid user ID is required' };
    }

    try {
      const payload: any = {
        id: cleanId,
        full_name: profile.fullName.trim(),
        name: profile.fullName.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        updated_at: new Date().toISOString()
      };
      if (profile.email) {
        payload.email = profile.email.toLowerCase().trim();
      }

      // Upsert ตรงเข้าสู่ id ซึ่งเป็น Primary Key ของตาราง profiles โดยตรง
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.warn('Profiles upsert error on id:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (e: any) {
      console.error('Failed to upsert profile in Supabase:', e);
      return { success: false, error: e.message || String(e) };
    }
  }
};

export const supabaseUserAddresses = {
  async listByUser(userId?: string, userEmail?: string): Promise<UserAddress[]> {
    const localKey = `pornpong_addresses_${userId || userEmail || 'guest'}`;
    let cached: UserAddress[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) cached = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (!supabase || (!userId && !userEmail)) {
      return cached;
    }

    try {
      // 1. Fetch from user_addresses table by user_id
      let dbRows: any[] | null = null;
      if (userId) {
        const { data, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          dbRows = data;
        }
      }

      // 2. If no data yet and userEmail exists, try email column
      if ((!dbRows || dbRows.length === 0) && userEmail) {
        const { data: byEmail, error: emailErr } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('email', userEmail.toLowerCase().trim())
          .order('is_default', { ascending: false });

        if (!emailErr && byEmail && byEmail.length > 0) {
          dbRows = byEmail;
        }
      }

      if (dbRows && dbRows.length > 0) {
        const mapped: UserAddress[] = dbRows.map((r: any) => ({
          id: String(r.id),
          user_id: r.user_id || userId || '',
          title: r.title || r.label || 'ที่อยู่จัดส่ง',
          recipient_name: r.recipient_name || r.name || r.full_name || '',
          phone: r.phone || r.phone_number || r.telephone || '',
          address: r.address || r.delivery_address || '',
          is_default: !!r.is_default,
          created_at: r.created_at,
          updated_at: r.updated_at
        })).filter(a => a.address && a.address.trim().length > 0);

        // Merge with local cache to preserve any offline or newly added addresses
        const combined = [...mapped];
        for (const c of cached) {
          if (!combined.some(item => item.id === c.id || item.address.trim() === c.address.trim())) {
            combined.push(c);
          }
        }
        try {
          localStorage.setItem(localKey, JSON.stringify(combined));
        } catch {
          // ignore
        }
        return combined;
      }

      return cached;
    } catch (e) {
      console.warn('Could not load user_addresses from Supabase:', e);
      return cached;
    }
  },

  async create(addressData: {
    user_id: string;
    title?: string;
    recipient_name?: string;
    phone?: string;
    address: string;
    is_default?: boolean;
    email?: string;
  }): Promise<{ success: boolean; data?: UserAddress; error?: any }> {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newAddress: UserAddress = {
      id: newId,
      user_id: addressData.user_id,
      title: addressData.title?.trim() || 'ที่อยู่จัดส่ง',
      recipient_name: addressData.recipient_name?.trim() || '',
      phone: addressData.phone?.trim() || '',
      address: addressData.address.trim(),
      is_default: addressData.is_default ?? false,
      created_at: new Date().toISOString()
    };

    // Save to local cache first for instant UI response and resilient backup
    const localKey = `pornpong_addresses_${addressData.user_id}`;
    try {
      const raw = localStorage.getItem(localKey);
      const list: UserAddress[] = raw ? JSON.parse(raw) : [];
      if (newAddress.is_default) {
        list.forEach(item => { item.is_default = false; });
      }
      list.unshift(newAddress);
      localStorage.setItem(localKey, JSON.stringify(list));
      if (addressData.email) {
        localStorage.setItem(`pornpong_addresses_${addressData.email}`, JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Local address cache error:', err);
    }

    if (!supabase) {
      return { success: true, data: newAddress };
    }

    try {
      const payload: any = {
        id: newId,
        user_id: addressData.user_id,
        title: newAddress.title,
        recipient_name: newAddress.recipient_name,
        name: newAddress.recipient_name,
        phone: newAddress.phone,
        address: newAddress.address,
        is_default: newAddress.is_default,
        created_at: newAddress.created_at
      };
      if (addressData.email) {
        payload.email = addressData.email.toLowerCase().trim();
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert([payload])
        .select();

      if (error) {
        console.warn('Failed insert into user_addresses with full payload, trying minimal payload:', error.message);
        // Fallback with minimal standard columns if table has different column naming
        const minimalPayload: any = {
          user_id: addressData.user_id,
          address: newAddress.address,
          recipient_name: newAddress.recipient_name,
          phone: newAddress.phone
        };
        const { data: minData, error: minErr } = await supabase
          .from('user_addresses')
          .insert([minimalPayload])
          .select();

        if (minErr) {
          console.warn('Could not insert to user_addresses table in Supabase:', minErr.message);
          return { success: true, data: newAddress, error: minErr.message };
        }
        return { success: true, data: (minData && minData[0]) ? { ...newAddress, ...minData[0] } : newAddress };
      }

      return { success: true, data: (data && data[0]) ? { ...newAddress, ...data[0] } : newAddress };
    } catch (e: any) {
      console.warn('Error saving to user_addresses in Supabase:', e);
      return { success: true, data: newAddress, error: e.message || String(e) };
    }
  },

  async delete(addressId: string, userId?: string, userEmail?: string): Promise<boolean> {
    const localKey = `pornpong_addresses_${userId || userEmail || 'guest'}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const list: UserAddress[] = JSON.parse(raw);
        const filtered = list.filter(item => item.id !== addressId);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }

    if (!supabase) return true;
    try {
      await supabase.from('user_addresses').delete().eq('id', addressId);
      return true;
    } catch (err) {
      console.warn('Could not delete address from Supabase:', err);
      return false;
    }
  },

  async update(addressId: string, updates: Partial<UserAddress>, userId?: string, userEmail?: string): Promise<boolean> {
    const localKey = `pornpong_addresses_${userId || userEmail || 'guest'}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const list: UserAddress[] = JSON.parse(raw);
        const idx = list.findIndex(item => item.id === addressId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
          if (updates.is_default) {
            list.forEach((item, i) => {
              if (i !== idx) item.is_default = false;
            });
          }
          localStorage.setItem(localKey, JSON.stringify(list));
        }
      }
    } catch {
      // ignore
    }

    if (!supabase) return true;
    try {
      const dbPayload: any = {};
      if (updates.title !== undefined) dbPayload.title = updates.title;
      if (updates.recipient_name !== undefined) {
        dbPayload.recipient_name = updates.recipient_name;
        dbPayload.name = updates.recipient_name;
      }
      if (updates.phone !== undefined) dbPayload.phone = updates.phone;
      if (updates.address !== undefined) dbPayload.address = updates.address;
      if (updates.is_default !== undefined) dbPayload.is_default = updates.is_default;
      dbPayload.updated_at = new Date().toISOString();

      if (updates.is_default && userId) {
        // Reset previous defaults
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId);
      }
      await supabase.from('user_addresses').update(dbPayload).eq('id', addressId);
      return true;
    } catch (err) {
      console.warn('Could not update address in Supabase:', err);
      return false;
    }
  },

  async setDefault(addressId: string, userId?: string, userEmail?: string): Promise<boolean> {
    return this.update(addressId, { is_default: true }, userId, userEmail);
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

  async listByUserId(userId?: string, email?: string, phone?: string): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const cleanUserId = userId?.trim() || '';
      const cleanEmail = email?.toLowerCase().trim() || '';
      const cleanPhone = phone && phone !== 'ไม่ระบุ' ? phone.replace(/\D/g, '') : '';

      let matchedRows: any[] = [];

      // 1. Direct query by customer_id
      if (cleanUserId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', cleanUserId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          matchedRows = data;
        }
      }

      // 2. Query user_id column if distinct or no matches yet
      if (matchedRows.length === 0 && cleanUserId) {
        try {
          const { data: byUid, error: errUid } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', cleanUserId)
            .order('created_at', { ascending: false });

          if (!errUid && byUid && byUid.length > 0) {
            matchedRows = byUid;
          }
        } catch {
          // column may not exist, safe fallback
        }
      }

      // 3. Query customer_email if still no matches
      if (matchedRows.length === 0 && cleanEmail) {
        const { data: byEmail, error: errEmail } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', cleanEmail)
          .order('created_at', { ascending: false });

        if (!errEmail && byEmail && byEmail.length > 0) {
          matchedRows = byEmail;
        }
      }

      // 4. Fallback filter
      if (matchedRows.length === 0) {
        const all = await this.list();
        matchedRows = all.filter((o: any) => {
          if (cleanUserId && (String(o.customer_id) === cleanUserId || String(o.user_id) === cleanUserId)) return true;
          if (cleanEmail && o.customer_email && o.customer_email.toLowerCase() === cleanEmail) return true;
          if (cleanPhone && o.customer_phone && o.customer_phone.replace(/\D/g, '').includes(cleanPhone)) return true;
          return false;
        });
      }

      return matchedRows.map((row: any) => ({
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
        customer_id: row.customer_id || row.user_id || cleanUserId,
        customer_name: row.customer_name || row.customerName || '',
        customer_email: row.customer_email || cleanEmail,
        customer_phone: row.customer_phone || '',
        total_amount: Number(row.total_amount || row.amount || 0),
        payment_status: row.payment_status || row.status || 'pending',
        order_status: row.order_status || 'waiting_payment',
        created_at: row.created_at || row.date || ''
      }));
    } catch (e: any) {
      console.warn('Orders listByUserId caught error:', e.message);
      return [];
    }
  },

  async create(item: {
    customer_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    payment_status?: string;
    order_status?: string;
    created_at?: string;
    productName?: string;
    color?: string;
  }): Promise<any> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const insertPayload = {
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        total_amount: Number(item.total_amount),
        payment_status: 'pending',
        order_status: 'waiting_payment'
      };

      console.log('ORDER PAYLOAD', insertPayload);

      const { data, error } = await supabase
        .from('orders')
        .insert([insertPayload])
        .select();

      if (error) {
        console.error('Failed to insert order into Supabase:', error.message);
        throw error;
      }
      return data?.[0];
    } catch (err: any) {
      console.error('Failed to create order in Supabase:', err.message);
      throw err;
    }
  },

  async createCustomPreOrder(item: {
    customer_id?: string | null;
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    selected_color: string;
    sticker_option: string | boolean;
    custom_text: string;
    total_price: number;
    status?: string;
    deposit_amount?: number;
    quantity?: number;
    address?: string;
    notes?: string;
  }): Promise<any> {
    const orderId = 'ORD-PRE-' + Date.now().toString().slice(-6);
    const stickerText = typeof item.sticker_option === 'boolean' 
      ? (item.sticker_option ? 'ติดสติกเกอร์ลายพิเศษ (+300 บาท)' : 'ไม่ติดสติกเกอร์ (+0 บาท)')
      : String(item.sticker_option);

    const fullPayload: any = {
      id: orderId,
      customer_id: item.customer_id || null,
      customer_name: item.customer_name || 'ลูกค้าพรีออเดอร์',
      customer_email: item.customer_email || 'guest@example.com',
      customer_phone: item.customer_phone || '',
      selected_color: item.selected_color,
      sticker_option: stickerText,
      custom_text: item.custom_text || '',
      total_price: Number(item.total_price),
      status: 'pending_deposit',
      // Compatibility columns for existing orders view:
      total_amount: Number(item.total_price),
      payment_status: 'pending_deposit',
      order_status: 'pending_deposit',
      product_name: `เรือพลาสติกสั่งทำพิเศษ (สี${item.selected_color})`,
      color: item.selected_color,
      address: item.address || '',
      notes: `[Custom Pre-Order] สี: ${item.selected_color} | สติกเกอร์: ${stickerText} | ข้อความสกรีน: ${item.custom_text || '-'} | จำนวน: ${item.quantity || 1} ลำ`,
      created_at: new Date().toISOString()
    };

    let resultOrder = { ...fullPayload };

    if (isSupabaseConfigured && supabase) {
      try {
        // Attempt 1: full payload with custom columns
        const { data, error } = await supabase.from('orders').insert([fullPayload]).select();
        if (!error && data && data[0]) {
          resultOrder = data[0];
        } else if (error) {
          console.warn('First insert attempt with custom columns failed, falling back to core columns:', error.message);
          // Attempt 2: fallback to core schema if custom columns don't exist yet
          const corePayload: any = {
            customer_id: item.customer_id || null,
            customer_name: item.customer_name,
            customer_email: item.customer_email || 'guest@example.com',
            customer_phone: item.customer_phone,
            total_amount: Number(item.total_price),
            payment_status: 'pending_deposit',
            order_status: 'pending_deposit'
          };
          const { data: dataCore, error: errCore } = await supabase.from('orders').insert([corePayload]).select();
          if (!errCore && dataCore && dataCore[0]) {
            resultOrder = { ...resultOrder, ...dataCore[0] };
          }
        }
      } catch (err: any) {
        console.warn('Failed to insert custom pre-order into Supabase table orders:', err.message);
      }
    }

    // Save locally for instant reactivity in Admin Dashboard & Order History
    try {
      const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      localOrders.unshift(resultOrder);
      localStorage.setItem('admin_orders', JSON.stringify(localOrders));

      const localPreorders = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
      localPreorders.unshift({
        id: resultOrder.id || orderId,
        customerName: item.customer_name,
        phone: item.customer_phone,
        email: item.customer_email,
        date: new Date().toISOString().split('T')[0],
        productName: `เรือสั่งทำพิเศษ (สี${item.selected_color})`,
        color: item.selected_color,
        quantity: item.quantity || 1,
        deposit: item.deposit_amount || 1000,
        fullPrice: item.total_price,
        estDelivery: 'ภายใน 5-7 วันทำการ',
        status: 'pending_deposit',
        address: item.address || '',
        notes: fullPayload.notes
      });
      localStorage.setItem('admin_preorders', JSON.stringify(localPreorders));
    } catch {}

    return resultOrder;
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
    if (!isSupabaseConfigured || !supabase) return true;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.warn('Could not delete from orders table in Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to delete order from Supabase:', err.message);
      return false;
    }
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', id);
      if (error) throw error;
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
          order_status: 'confirmed'
        })
        .eq('id', id);
      if (error) throw error;
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
          order_status: 'payment_failed'
        })
        .eq('id', id);
      if (error) throw error;
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

      const updatePayload = {
        payment_slip_url: publicUrl,
        payment_status: 'waiting_verify'
      };

      console.log('ORDER ID', orderId);
      console.log('PUBLIC URL', publicUrl);
      console.log('UPDATE PAYLOAD', updatePayload);

      const result = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      console.log('UPDATE RESULT', result);

      if (result.error) {
        throw result.error;
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
    let results: any[] = [];
    
    // 1. Fetch from preorders / pre_orders in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('preorders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          results.push(...data.map(this.mapRow));
        } else {
          const { data: data2, error: error2 } = await supabase.from('pre_orders').select('*').order('created_at', { ascending: false });
          if (!error2 && data2) {
            results.push(...data2.map(this.mapRow));
          }
        }
      } catch (e: any) {
        console.warn('Pre-orders fetch caught error:', e.message);
      }

      // Also fetch custom preorders stored in orders table
      try {
        const { data: ordData, error: ordErr } = await supabase
          .from('orders')
          .select('*')
          .or('id.like.ORD-PRE-%,payment_status.eq.pending_deposit,order_status.eq.pending_deposit')
          .order('created_at', { ascending: false });
        if (!ordErr && ordData) {
          for (const ord of ordData) {
            if (!results.some(r => r.id === ord.id)) {
              results.push(this.mapRow(ord));
            }
          }
        }
      } catch (e: any) {
        console.warn('Custom preorders query from orders table caught error:', e.message);
      }
    }

    // 2. Merge local storage preorders
    try {
      const localPreorders = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
      for (const lp of localPreorders) {
        const idx = results.findIndex(r => r.id === lp.id);
        if (idx >= 0) {
          // Keep overridden prices from local if present
          if (lp.price_overridden) {
            results[idx] = { ...results[idx], ...lp, fullPrice: lp.fullPrice, deposit: lp.deposit, price_overridden: true };
          }
        } else {
          results.push(this.mapRow(lp));
        }
      }

      const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      for (const lo of localOrders) {
        if (String(lo.id).startsWith('ORD-PRE-') || lo.payment_status === 'pending_deposit' || (lo.notes && lo.notes.includes('Custom Pre-Order'))) {
          const idx = results.findIndex(r => r.id === lo.id);
          if (idx >= 0) {
            if (lo.price_overridden) {
              results[idx] = { ...results[idx], ...lo, fullPrice: Number(lo.total_price || lo.total_amount || results[idx].fullPrice), deposit: Number(lo.deposit_amount || lo.deposit || results[idx].deposit), price_overridden: true };
            }
          } else {
            results.push(this.mapRow(lo));
          }
        }
      }
    } catch {}

    return results;
  },

  mapRow(row: any) {
    // Parse custom specs if embedded in notes
    let selectedColor = row.selected_color || row.color || '';
    let stickerOption = row.sticker_option || '';
    let customText = row.custom_text || '';

    if (!selectedColor && row.notes && row.notes.includes('สี:')) {
      const match = row.notes.match(/สี:\s*([^|]+)/);
      if (match) selectedColor = match[1].trim();
    }
    if (!stickerOption && row.notes && row.notes.includes('สติกเกอร์:')) {
      const match = row.notes.match(/สติกเกอร์:\s*([^|]+)/);
      if (match) stickerOption = match[1].trim();
    }
    if (!customText && row.notes && row.notes.includes('ข้อความสกรีน:')) {
      const match = row.notes.match(/ข้อความสกรีน:\s*([^|]+)/);
      if (match && match[1].trim() !== '-') customText = match[1].trim();
    }

    const fullPrice = Number(row.fullPrice ?? row.full_price ?? row.total_price ?? row.total_amount ?? row.amount ?? 0);
    const deposit = Number(row.deposit ?? row.deposit_amount ?? Math.min(1000, fullPrice * 0.3));

    return {
      id: row.id,
      customerName: row.customerName || row.customer_name || 'ลูกค้าพรีออเดอร์',
      phone: row.phone || row.customer_phone || '',
      email: row.email || row.customer_email || '',
      date: row.date || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      productName: row.productName || row.product_name || `เรือพลาสติกสั่งทำ (${selectedColor || 'คละสี'})`,
      color: selectedColor || row.color || 'สีน้ำเงินมาตรฐาน',
      selected_color: selectedColor || row.color || 'น้ำเงิน',
      sticker_option: stickerOption || (row.sticker_option ? 'ติดสติกเกอร์' : 'ไม่ติดสติกเกอร์'),
      custom_text: customText || '',
      quantity: Number(row.quantity || 1),
      deposit: deposit,
      deposit_amount: deposit,
      fullPrice: fullPrice,
      total_price: fullPrice,
      original_price: row.original_price ? Number(row.original_price) : undefined,
      price_overridden: Boolean(row.price_overridden),
      estDelivery: row.estDelivery || row.est_delivery_date || row.est_delivery || 'ภายใน 3-5 วันทำการ',
      status: row.status || row.payment_status || 'AwaitingDeposit',
      address: row.address || '',
      notes: row.notes || ''
    };
  },

  async listByUserId(userId?: string, phone?: string, name?: string): Promise<any[]> {
    try {
      const cleanPhone = phone && phone !== 'ไม่ระบุ' ? phone.replace(/\D/g, '') : '';
      const cleanName = name?.toLowerCase().trim() || '';
      const cleanUserId = userId?.trim() || '';

      const all = await this.list();
      return all.filter((p: any) => {
        if (cleanUserId && (p.user_id === cleanUserId || p.customer_id === cleanUserId)) return true;
        if (cleanPhone && p.phone && p.phone.replace(/\D/g, '').includes(cleanPhone)) return true;
        if (cleanName && p.customerName && p.customerName.toLowerCase().trim().includes(cleanName)) return true;
        return false;
      });
    } catch (e: any) {
      console.warn('Pre-orders listByUserId caught error:', e.message);
      return [];
    }
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('preorders').update({ status }).eq('id', id);
        await supabase.from('pre_orders').update({ status }).eq('id', id);
        await supabase.from('orders').update({ payment_status: status, order_status: status }).eq('id', id);
      } catch {}
    }
    try {
      const localPreorders = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
      const idx = localPreorders.findIndex((p: any) => p.id === id);
      if (idx >= 0) {
        localPreorders[idx].status = status;
        localStorage.setItem('admin_preorders', JSON.stringify(localPreorders));
      }
    } catch {}
    window.dispatchEvent(new CustomEvent('orders_updated', { detail: { id, status } }));
    return true;
  },

  async updateOrderPrice(id: string, finalPrice: number, depositAmount?: number): Promise<boolean> {
    const numPrice = Number(finalPrice);
    const numDeposit = depositAmount !== undefined ? Number(depositAmount) : Math.round(numPrice * 0.3);

    // 1. Update in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('preorders').update({
          fullPrice: numPrice,
          full_price: numPrice,
          deposit: numDeposit,
          price_overridden: true
        }).eq('id', id);

        await supabase.from('pre_orders').update({
          fullPrice: numPrice,
          full_price: numPrice,
          deposit: numDeposit,
          price_overridden: true
        }).eq('id', id);

        await supabase.from('orders').update({
          total_price: numPrice,
          total_amount: numPrice,
          amount: numPrice,
          deposit_amount: numDeposit,
          price_overridden: true
        }).eq('id', id);
      } catch (err: any) {
        console.warn('Supabase price update error:', err.message);
      }
    }

    // 2. Update local storage preorders
    try {
      const localPreorders = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
      const idx = localPreorders.findIndex((p: any) => p.id === id);
      if (idx >= 0) {
        localPreorders[idx].original_price = localPreorders[idx].original_price || localPreorders[idx].fullPrice;
        localPreorders[idx].fullPrice = numPrice;
        localPreorders[idx].total_price = numPrice;
        localPreorders[idx].deposit = numDeposit;
        localPreorders[idx].deposit_amount = numDeposit;
        localPreorders[idx].price_overridden = true;
        localStorage.setItem('admin_preorders', JSON.stringify(localPreorders));
      }

      // Also update in admin_orders if present
      const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      const ordIdx = localOrders.findIndex((o: any) => o.id === id);
      if (ordIdx >= 0) {
        localOrders[ordIdx].original_price = localOrders[ordIdx].original_price || localOrders[ordIdx].total_price || localOrders[ordIdx].total_amount;
        localOrders[ordIdx].total_price = numPrice;
        localOrders[ordIdx].total_amount = numPrice;
        localOrders[ordIdx].amount = numPrice;
        localOrders[ordIdx].deposit_amount = numDeposit;
        localOrders[ordIdx].price_overridden = true;
        localStorage.setItem('admin_orders', JSON.stringify(localOrders));
      }
    } catch {}

    // 3. Broadcast to all open views & modals
    window.dispatchEvent(new CustomEvent('orders_updated', {
      detail: { id, finalPrice: numPrice, depositAmount: numDeposit }
    }));

    return true;
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;
    try {
      const res1 = await supabase.from('pre_orders').delete().eq('id', id);
      const res2 = await supabase.from('preorders').delete().eq('id', id);
      if (res1.error && res2.error) {
        console.warn('Could not delete from pre_orders or preorders in Supabase:', res1.error?.message || res2.error?.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to delete pre-order from Supabase:', err.message);
      return false;
    }
  },
  async insert(item: any): Promise<any> {
    const queueId = 'PRE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const preOrderItem = {
      id: queueId,
      customerName: item.customerName || '',
      phone: item.phone || '',
      email: item.email || '',
      date: new Date().toISOString().split('T')[0],
      productName: item.productName || '',
      color: item.color || '',
      quantity: Number(item.quantity || 1),
      deposit: Number(item.deposit || 2000),
      fullPrice: Number(item.fullPrice || 0),
      estDelivery: item.estDelivery || 'ภายใน 5-7 วันทำการ',
      status: 'AwaitingDeposit',
      address: item.address || '',
      notes: item.notes || ''
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('preorders').insert([preOrderItem]);
        if (error) {
          await supabase.from('pre_orders').insert([preOrderItem]);
        }
      } catch (e: any) {
        console.warn('Could not insert preorder to Supabase:', e.message);
      }
    }
    try {
      const existing = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
      existing.unshift(preOrderItem);
      localStorage.setItem('admin_preorders', JSON.stringify(existing));
    } catch {}
    return preOrderItem;
  }
};

// -------------------------------------------------------------
// PRE-ORDER SETTINGS (Prices & Color Management)
// -------------------------------------------------------------
export interface PreOrderColorConfig {
  id: string;
  name: string;
  english?: string;
  swatchHex: string;
  enabled: boolean;
}

export interface PreOrderSettings {
  basePrice: number;
  stickerPrice: number;
  customTextPrice: number;
  depositPerBoat: number;
  colors: PreOrderColorConfig[];
  updatedAt?: string;
}

export const DEFAULT_PREORDER_SETTINGS: PreOrderSettings = {
  basePrice: 3000,
  stickerPrice: 300,
  customTextPrice: 200,
  depositPerBoat: 1000,
  colors: [
    { id: 'น้ำเงิน', name: 'สีน้ำเงิน', english: 'Royal Ocean Blue', swatchHex: '#2563eb', enabled: true },
    { id: 'แดง', name: 'สีแดง', english: 'Rescue Vivid Red', swatchHex: '#dc2626', enabled: true },
    { id: 'เขียว', name: 'สีเขียว', english: 'Forest Green', swatchHex: '#16a34a', enabled: true },
    { id: 'ส้ม', name: 'สีส้ม', english: 'Hi-Vis Safety Orange', swatchHex: '#ea580c', enabled: true }
  ],
  updatedAt: new Date().toISOString()
};

export const supabasePreOrderSettings = {
  async get(): Promise<PreOrderSettings> {
    let localData: PreOrderSettings | null = null;
    try {
      const raw = localStorage.getItem('pre_order_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.basePrice === 'number') {
          localData = {
            ...DEFAULT_PREORDER_SETTINGS,
            ...parsed,
            colors: Array.isArray(parsed.colors) && parsed.colors.length > 0 ? parsed.colors : DEFAULT_PREORDER_SETTINGS.colors
          };
        }
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Try pre_order_settings table
        const { data: posData, error: posErr } = await supabase
          .from('pre_order_settings')
          .select('*')
          .limit(1);

        if (!posErr && posData && posData.length > 0) {
          const row = posData[0];
          const settings: PreOrderSettings = {
            basePrice: Number(row.base_price ?? row.basePrice ?? DEFAULT_PREORDER_SETTINGS.basePrice),
            stickerPrice: Number(row.sticker_price ?? row.stickerPrice ?? DEFAULT_PREORDER_SETTINGS.stickerPrice),
            customTextPrice: Number(row.custom_text_price ?? row.customTextPrice ?? DEFAULT_PREORDER_SETTINGS.customTextPrice),
            depositPerBoat: Number(row.deposit_per_boat ?? row.depositPerBoat ?? DEFAULT_PREORDER_SETTINGS.depositPerBoat),
            colors: Array.isArray(row.colors) ? row.colors : (typeof row.colors === 'string' ? JSON.parse(row.colors) : DEFAULT_PREORDER_SETTINGS.colors),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
          };
          try {
            localStorage.setItem('pre_order_settings', JSON.stringify(settings));
          } catch {}
          return settings;
        }

        // 2. Try app_config table fallback
        const { data: cfgData, error: cfgErr } = await supabase
          .from('app_config')
          .select('*')
          .eq('key', 'pre_order_settings')
          .limit(1);

        if (!cfgErr && cfgData && cfgData.length > 0) {
          const row = cfgData[0];
          const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          const settings: PreOrderSettings = {
            ...DEFAULT_PREORDER_SETTINGS,
            ...val
          };
          try {
            localStorage.setItem('pre_order_settings', JSON.stringify(settings));
          } catch {}
          return settings;
        }
      } catch (err) {
        console.warn('Could not fetch pre_order_settings from Supabase:', err);
      }
    }

    return localData || DEFAULT_PREORDER_SETTINGS;
  },

  async save(settings: PreOrderSettings): Promise<boolean> {
    const updatedSettings: PreOrderSettings = {
      ...settings,
      basePrice: Number(settings.basePrice || 3000),
      stickerPrice: Number(settings.stickerPrice || 0),
      customTextPrice: Number(settings.customTextPrice || 0),
      depositPerBoat: Number(settings.depositPerBoat || 1000),
      updatedAt: new Date().toISOString()
    };

    // 1. Save locally and dispatch event
    try {
      localStorage.setItem('pre_order_settings', JSON.stringify(updatedSettings));
      window.dispatchEvent(new CustomEvent('preorder_settings_changed', { detail: updatedSettings }));
    } catch {}

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        // Try table pre_order_settings
        const payloadA = {
          id: 'default',
          base_price: Number(updatedSettings.basePrice),
          sticker_price: Number(updatedSettings.stickerPrice),
          custom_text_price: Number(updatedSettings.customTextPrice),
          deposit_per_boat: Number(updatedSettings.depositPerBoat),
          colors: updatedSettings.colors,
          updated_at: updatedSettings.updatedAt
        };
        const { error: errA } = await supabase.from('pre_order_settings').upsert([payloadA]);
        if (!errA) return true;

        // Try table app_config
        const payloadB = {
          key: 'pre_order_settings',
          value: updatedSettings,
          updated_at: updatedSettings.updatedAt
        };
        const { error: errB } = await supabase.from('app_config').upsert([payloadB]);
        if (!errB) return true;
      } catch (err) {
        console.warn('Failed to persist pre_order_settings to Supabase:', err);
      }
    }

    return true;
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

