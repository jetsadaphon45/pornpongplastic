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

// -------------------------------------------------------------
// END-TO-END PRODUCTION & DELIVERY QUEUE CONSTANTS & HELPERS
// -------------------------------------------------------------
export interface QueueStageInfo {
  step: 1 | 2 | 3 | 4;
  key: 'queue_received' | 'manufacturing' | 'ready_for_shipping' | 'in_transit';
  label: string;
  badgeLabel: string;
  desc: string;
  customerMsg: string;
  color: string;
}

export const QUEUE_STAGES: QueueStageInfo[] = [
  {
    step: 1,
    key: 'queue_received',
    label: 'รับคิวผลิต',
    badgeLabel: '1. รับคิวผลิต',
    desc: 'โรงงานลงทะเบียนรับคิวผลิตเข้าระบบ',
    customerMsg: 'โรงงานลงทะเบียนรับคิวผลิตของคุณเข้าระบบเรียบร้อยแล้ว',
    color: 'violet'
  },
  {
    step: 2,
    key: 'manufacturing',
    label: 'กำลังหลอม/ผลิต',
    badgeLabel: '2. กำลังหลอม/ผลิต',
    desc: 'กำลังหลอมขึ้นรูปเรซิ่นและโพลีเอทิลีนหนาพิเศษตามสเปก',
    customerMsg: 'กำลังหลอมเรือตามสเปกที่คุณออกแบบ',
    color: 'amber'
  },
  {
    step: 3,
    key: 'ready_for_shipping',
    label: 'รอขนย้าย',
    badgeLabel: '3. รอขนย้าย',
    desc: 'เรือผลิตเสร็จแล้ว - รอคิวรถโรงงาน/ขนส่งเข้ารับสินค้า',
    customerMsg: 'เรือผลิตเสร็จแล้ว - อยู่ระหว่างรอขนย้าย',
    color: 'sky'
  },
  {
    step: 4,
    key: 'in_transit',
    label: 'อยู่ระหว่างจัดส่ง',
    badgeLabel: '4. อยู่ระหว่างจัดส่ง',
    desc: 'สินค้าขึ้นรถจัดส่งแล้ว - กำลังเดินทางไปยังหน้างาน/ที่อยู่ปลายทาง',
    customerMsg: 'สินค้าอยู่ระหว่างจัดส่ง',
    color: 'emerald'
  }
];

export interface InStockStageInfo {
  step: 1 | 2 | 3 | 4;
  key: 'confirmed' | 'ready_for_shipping' | 'in_transit' | 'delivered';
  label: string;
  badgeLabel: string;
  desc: string;
  customerMsg: string;
  color: string;
}

export const IN_STOCK_STAGES: InStockStageInfo[] = [
  {
    step: 1,
    key: 'confirmed',
    label: 'ยืนยันคำสั่งซื้อ',
    badgeLabel: '1. ยืนยันคำสั่งซื้อ',
    desc: 'ระบบยืนยันคำสั่งซื้อเรียบร้อย ไม่ต้องรอคิวหลอมผลิต',
    customerMsg: 'คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว ไม่ต้องรอคิวหลอมผลิต',
    color: 'sky'
  },
  {
    step: 2,
    key: 'ready_for_shipping',
    label: 'รอจัดส่ง',
    badgeLabel: '2. รอจัดส่ง',
    desc: 'เบิกสินค้าพร้อมส่งจากคลัง ตรวจสอบ QC และรอรถขนส่ง',
    customerMsg: 'สินค้าพร้อมส่งในคลัง กำลังจัดเตรียมขึ้นรถส่งมอบ',
    color: 'amber'
  },
  {
    step: 3,
    key: 'in_transit',
    label: 'อยู่ระหว่างจัดส่ง',
    badgeLabel: '3. อยู่ระหว่างจัดส่ง',
    desc: 'สินค้าขึ้นรถจัดส่งแล้ว กำลังเดินทางไปยังปลายทาง',
    customerMsg: 'สินค้าขึ้นรถโรงงานและอยู่ระหว่างจัดส่ง',
    color: 'emerald'
  },
  {
    step: 4,
    key: 'delivered',
    label: 'จัดส่งสำเร็จ',
    badgeLabel: '4. จัดส่งสำเร็จ',
    desc: 'จัดส่งถึงหน้าสวน/หน้าบ้านของคุณเรียบร้อยแล้ว',
    customerMsg: 'จัดส่งสินค้าสำเร็จเรียบร้อยแล้ว',
    color: 'emerald'
  }
];

// Helper to determine whether an order is a Pre-Order / Made-to-Order or In-Stock / Ready to Ship
export function isOrderPreOrder(order: any): boolean {
  if (!order) return false;
  if (order.isPreOrder === true || order.is_preorder === true) return true;
  if (order.isPreOrder === false || order.is_preorder === false) return false;
  if (order.orderType === 'preorder' || order.order_type === 'preorder') return true;
  if (order.orderType === 'instock' || order.order_type === 'instock') return false;

  const idStr = String(order.id || '').toUpperCase();
  if (idStr.startsWith('ORD-PRE-') || idStr.startsWith('PRE-')) return true;

  // Check items list if present
  if (Array.isArray(order.items) && order.items.length > 0) {
    const hasPreItem = order.items.some((it: any) => {
      if (it.isPreOrder === true || it.is_preorder === true || it.orderType === 'preorder' || it.type === 'preorder') return true;
      const itName = String(it.name || it.productName || it.title || '').toLowerCase();
      return /พรีออเดอร์|สั่งผลิต|เปิดจอง|สั่งทำพิเศษ|จองล่วงหน้า|สั่งหลอม|หลอมพิเศษ|preorder|pre-order|custom|made-to-order/.test(itName);
    });
    if (hasPreItem) return true;
  }

  const pName = String(order.productName || order.product_name || '').toLowerCase();
  const notes = String(order.notes || '').toLowerCase();
  const status = String(order.status || order.order_status || '').toLowerCase();

  const preKeywords = [
    'พรีออเดอร์',
    'สั่งผลิต',
    'เปิดจอง',
    'สั่งทำพิเศษ',
    'จองล่วงหน้า',
    'สั่งหลอม',
    'หลอมพิเศษ',
    'preorder',
    'pre-order',
    'custom pre-order',
    'made-to-order',
    'pre_order'
  ];
  if (preKeywords.some(kw => pName.includes(kw) || notes.includes(kw))) {
    return true;
  }

  // If order requires deposit, it is a pre-order
  if (order.deposit || order.deposit_amount || status.includes('deposit')) {
    return true;
  }

  return false;
}

export function formatQueueId(seed?: any, index?: number): string {
  if (typeof seed === 'string') {
    const trimmed = seed.trim().toUpperCase();
    if (/^Q-\d{4}-\d{3}$/.test(trimmed)) {
      return trimmed;
    }
  }
  if (seed && typeof seed === 'object') {
    if (seed.queue_id && /^Q-\d{4}-\d{3}$/i.test(String(seed.queue_id).trim())) {
      return String(seed.queue_id).trim().toUpperCase();
    }
    if (seed.queue_number && /^Q-\d{4}-\d{3}$/i.test(String(seed.queue_number).trim())) {
      return String(seed.queue_number).trim().toUpperCase();
    }
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  let num = 1;
  if (typeof index === 'number' && index >= 0) {
    num = index + 1;
  } else if (typeof seed === 'number' && !isNaN(seed)) {
    num = Math.max(1, Math.floor(seed));
  } else if (seed && typeof seed === 'object' && seed.id) {
    const digits = String(seed.id).replace(/\D/g, '');
    num = digits.length > 0 ? (parseInt(digits.slice(-4), 10) % 899) + 1 : 1;
  } else if (typeof seed === 'string') {
    const digits = seed.replace(/\D/g, '');
    num = digits.length > 0 ? (parseInt(digits.slice(-4), 10) % 899) + 1 : 1;
  }

  return `Q-${yy}${mm}-${String(num).padStart(3, '0')}`;
}

export function parseQueueNumber(queueId?: string): number {
  if (!queueId) return 0;
  const match = String(queueId).match(/Q-\d{4}-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export function getActiveProductionQueue(orders?: any[]): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pornpong_active_production_queue_id');
    if (saved && /^Q-\d{4}-\d{3}$/i.test(saved.trim())) {
      return saved.trim().toUpperCase();
    }
  }
  if (orders && orders.length > 0) {
    const stage2 = orders.find((o: any) => o.queue_stage === 2 || o.order_status === 'manufacturing');
    if (stage2) {
      return formatQueueId(stage2);
    }
    const firstActive = orders.find((o: any) => o.queue_stage !== 4 && o.order_status !== 'completed' && o.order_status !== 'delivered');
    if (firstActive) {
      return formatQueueId(firstActive);
    }
  }
  return 'Q-2610-012';
}

export function setActiveProductionQueue(queueId: string): void {
  if (typeof window !== 'undefined') {
    const clean = queueId.trim().toUpperCase();
    localStorage.setItem('pornpong_active_production_queue_id', clean);
    window.dispatchEvent(new CustomEvent('pornpong-queue-updated', {
      detail: { activeQueueId: clean }
    }));
  }
}

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

// -------------------------------------------------------------
// SEPARATE DELIVERIES TABLE ARCHITECTURE (Supabase deliveries table)
// -------------------------------------------------------------
export interface DeliveryRecord {
  id?: string;
  order_id: string;
  queue_number?: string;
  shipping_carrier?: string;
  driver_phone?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  delivery_status?: 'queue_received' | 'manufacturing' | 'ready_for_shipping' | 'in_transit' | 'delivered' | string;
  created_at?: string;
  updated_at?: string;
}

export const supabaseDeliveries = {
  async getByOrderId(orderId: string): Promise<DeliveryRecord | null> {
    const cleanId = String(orderId).trim();
    if (!cleanId) return null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('order_id', cleanId)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) return data[0];
      } catch (err: any) {
        console.warn('Could not query delivery by order_id from Supabase:', err?.message);
      }
    }
    // Fallback to local storage (latest 1 item)
    try {
      const stored: DeliveryRecord[] = JSON.parse(localStorage.getItem('admin_deliveries') || '[]');
      return stored.find(d => String(d.order_id).trim() === cleanId) || null;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<Record<string, DeliveryRecord>> {
    const map: Record<string, DeliveryRecord> = {};
    if (isSupabaseConfigured && supabase) {
      try {
        // Order by updated_at descending so the most recent delivery record comes first
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          data.forEach((row: any) => {
            const key = String(row.order_id || '').trim();
            // Keep strictly only 1 latest record per order_id
            if (key && !map[key]) {
              map[key] = row;
            }
          });
        }
      } catch (err: any) {
        console.warn('Could not fetch deliveries from Supabase:', err?.message);
      }
    }

    // Merge from local storage, keeping strictly only 1 latest record per order_id
    try {
      const stored: DeliveryRecord[] = JSON.parse(localStorage.getItem('admin_deliveries') || '[]');
      stored.forEach(d => {
        const key = String(d.order_id || '').trim();
        if (key && !map[key]) {
          map[key] = d;
        }
      });
    } catch {}

    return map;
  },

  async upsert(delivery: {
    order_id: string;
    queue_number?: string;
    shipping_carrier?: string;
    driver_phone?: string;
    tracking_number?: string;
    estimated_delivery_date?: string;
    delivery_status?: string;
  }): Promise<boolean> {
    const orderId = String(delivery.order_id).trim();
    if (!orderId) return false;

    const payload: any = {
      order_id: orderId,
      updated_at: new Date().toISOString()
    };
    if (delivery.queue_number !== undefined) payload.queue_number = delivery.queue_number;
    if (delivery.shipping_carrier !== undefined) payload.shipping_carrier = delivery.shipping_carrier;
    if (delivery.driver_phone !== undefined) payload.driver_phone = delivery.driver_phone;
    if (delivery.tracking_number !== undefined) payload.tracking_number = delivery.tracking_number;
    if (delivery.estimated_delivery_date !== undefined) payload.estimated_delivery_date = delivery.estimated_delivery_date;
    if (delivery.delivery_status !== undefined) payload.delivery_status = delivery.delivery_status;

    if (isSupabaseConfigured && supabase) {
      try {
        // Step 1: Check if this order_id already exists in 'deliveries' table
        const { data: existingRows, error: checkErr } = await supabase
          .from('deliveries')
          .select('id, created_at, updated_at')
          .eq('order_id', orderId)
          .order('updated_at', { ascending: false });

        if (!checkErr && existingRows && existingRows.length > 0) {
          // If existing row found, UPDATE the existing row (avoid creating duplicate rows)
          const primaryRow = existingRows[0];
          if (primaryRow?.id) {
            await supabase
              .from('deliveries')
              .update(payload)
              .eq('id', primaryRow.id);
          } else {
            await supabase
              .from('deliveries')
              .update(payload)
              .eq('order_id', orderId);
          }

          // If duplicate rows already existed previously, clean up redundant duplicates
          if (existingRows.length > 1) {
            const duplicateIds = existingRows.slice(1).map(r => r.id).filter(Boolean);
            if (duplicateIds.length > 0) {
              try {
                await supabase
                  .from('deliveries')
                  .delete()
                  .in('id', duplicateIds);
              } catch (cleanErr) {
                console.warn('Could not clean up redundant duplicate delivery rows:', cleanErr);
              }
            }
          }
        } else {
          // If NOT existing yet, create a single new row via UPSERT or single INSERT
          const { error: upsertError } = await supabase
            .from('deliveries')
            .upsert({
              ...payload,
              created_at: new Date().toISOString()
            }, { onConflict: 'order_id' });

          if (upsertError) {
            // Check once more to prevent race-condition duplicates
            const { data: raceCheck } = await supabase
              .from('deliveries')
              .select('id')
              .eq('order_id', orderId)
              .limit(1);

            if (raceCheck && raceCheck.length > 0) {
              await supabase
                .from('deliveries')
                .update(payload)
                .eq('order_id', orderId);
            } else {
              await supabase
                .from('deliveries')
                .insert({
                  ...payload,
                  created_at: new Date().toISOString()
                });
            }
          }
        }
      } catch (err: any) {
        console.warn('Deliveries table update/upsert warning:', err?.message);
      }
    }

    // Persist immediately in local storage admin_deliveries with deduplication
    try {
      const stored: DeliveryRecord[] = JSON.parse(localStorage.getItem('admin_deliveries') || '[]');
      const filtered = stored.filter(d => String(d.order_id).trim() !== orderId);
      filtered.unshift({ ...payload, created_at: new Date().toISOString() });
      localStorage.setItem('admin_deliveries', JSON.stringify(filtered));
    } catch {}

    // Dispatch real-time events for instant UI synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pornpong-delivery-updated', {
        detail: payload
      }));
      window.dispatchEvent(new CustomEvent('pornpong-queue-updated', {
        detail: {
          orderId,
          ...payload
        }
      }));
      window.dispatchEvent(new Event('orders-updated'));
    }

    return true;
  }
};

export const supabaseOrders = {
  async list(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      // JOIN orders with separate deliveries table
      const [ordersRes, deliveriesMap] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }),
        supabaseDeliveries.getAll()
      ]);

      if (ordersRes.error) {
        console.warn('Could not select from orders table in Supabase:', ordersRes.error.message);
        return [];
      }

      const data = (ordersRes.data || []).filter((row: any) => {
        const s = String(row.status || '').toLowerCase().trim();
        const os = String(row.order_status || '').toLowerCase().trim();
        const ps = String(row.payment_status || '').toLowerCase().trim();

        // Strictly exclude pending/unapproved states
        if (['waiting_payment', 'pending_verification', 'waiting_verify', 'waiting_approval'].includes(s)) return false;
        if (['pending_verification', 'waiting_verify', 'waiting_approval', 'pending_deposit'].includes(ps)) return false;
        if (['cancelled', 'payment_rejected', 'rejected'].includes(s) || ['cancelled', 'payment_rejected', 'rejected'].includes(ps)) return false;
        if (s === 'pending' && ps !== 'verified' && ps !== 'paid') return false;

        // Must match approved statuses per requirement
        const approvedStatuses = [
          'paid',
          'ready_to_ship',
          'producing',
          'manufacturing',
          'shipped',
          'shipping',
          'in_transit',
          'ready_for_shipping',
          'completed',
          'delivered'
        ];
        return approvedStatuses.includes(s) || approvedStatuses.includes(os) || ['verified', 'paid', 'approved'].includes(ps);
      });

      return data.map((row: any, idx: number) => {
        const orderIdStr = String(row.id).trim();
        const delivery = deliveriesMap[orderIdStr] || deliveriesMap[row.id];

        const isPre = isOrderPreOrder(row);
        const orderType = isPre ? 'preorder' : 'instock';
        const queueNum = isPre
          ? (delivery?.queue_number || row.queue_number || row.queue_id || formatQueueId(row, idx))
          : (delivery?.queue_number || row.queue_number || row.queue_id || '');
        const carrier = delivery?.shipping_carrier || row.shipping_carrier || row.carrier_name || '';
        const driver = delivery?.driver_phone || row.driver_phone || '';
        const tracking = delivery?.tracking_number || row.tracking_number || row.shipmentNo || row.shipment_no || '';
        const estDeliveryDate = delivery?.estimated_delivery_date || row.estimated_delivery_date || '';
        const delivStatus = (delivery?.delivery_status || '').toLowerCase();
        const ordStatus = (row.order_status || row.status || '').toLowerCase();

        let qStage: 1 | 2 | 3 | 4 = 1;
        if (delivStatus === 'delivered' || delivStatus === 'completed' || ordStatus === 'delivered' || ordStatus === 'completed') {
          qStage = 4;
        } else if (delivStatus === 'in_transit' || ordStatus === 'in_transit' || ordStatus === 'shipped' || ordStatus === 'shipping') {
          qStage = 4;
        } else if (delivStatus === 'ready_for_shipping' || ordStatus === 'ready_for_shipping' || ordStatus === 'ready') {
          qStage = 3;
        } else if (delivStatus === 'manufacturing' || ordStatus === 'manufacturing' || ordStatus === 'processing' || ordStatus === 'paid') {
          qStage = 2;
        } else {
          qStage = 1;
        }

        const stageKey = qStage === 4 ? 'in_transit' : qStage === 3 ? 'ready_for_shipping' : qStage === 2 ? 'manufacturing' : 'queue_received';

        return {
          ...row,
          order_type: orderType,
          orderType: orderType,
          is_preorder: isPre,
          isPreOrder: isPre,
          // Joined delivery fields: In-stock items bypass production queue (no queue_number)
          queue_number: isPre ? queueNum : (queueNum || undefined),
          queue_id: isPre ? queueNum : (queueNum || ''),
          shipping_carrier: carrier,
          carrier_name: carrier,
          driver_phone: driver,
          tracking_number: tracking,
          shipmentNo: tracking,
          shipment_no: tracking,
          estimated_delivery_date: estDeliveryDate,
          delivery_status: delivStatus || ordStatus,

          // Standard order fields:
          id: row.id,
          customerName: row.customer_name || row.customerName || '',
          date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
          productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
          color: row.color || 'คละสี',
          amount: Number(row.total_amount || row.amount || 0),
          status: delivStatus === 'delivered' ? 'Delivered' : (row.status || (ordStatus === 'completed' || ordStatus === 'delivered' ? 'Delivered' : ordStatus === 'shipping' || ordStatus === 'in_transit' ? 'Shipping' : row.payment_status || 'Pending')),
          order_status: delivStatus === 'delivered' ? 'completed' : (row.order_status || (row.status === 'Delivered' ? 'completed' : row.status === 'Shipping' ? 'shipping' : 'pending')),
          status_message: row.status_message || '',
          
          // Queue System Fields:
          queue_stage: row.queue_stage || qStage,
          queue_status: row.queue_status || stageKey,

          // Exact fields:
          customer_id: row.customer_id || null,
          customer_name: row.customer_name || row.customerName || '',
          customer_email: row.customer_email || 'guest@example.com',
          total_amount: Number(row.total_amount || row.amount || 0),
          payment_status: row.payment_status || (row.status === 'Delivered' ? 'paid' : 'pending'),
          created_at: row.created_at || row.date || ''
        };
      });
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
        return all.filter((o: any) => {
          if (cleanUserId && (String(o.customer_id) === cleanUserId || String(o.user_id) === cleanUserId)) return true;
          if (cleanEmail && o.customer_email && o.customer_email.toLowerCase() === cleanEmail) return true;
          if (cleanPhone && o.customer_phone && o.customer_phone.replace(/\D/g, '').includes(cleanPhone)) return true;
          return false;
        });
      }

      // Fetch deliveries to JOIN with matched user orders
      const deliveriesMap = await supabaseDeliveries.getAll();

      return matchedRows.map((row: any, idx: number) => {
        const orderIdStr = String(row.id).trim();
        const delivery = deliveriesMap[orderIdStr] || deliveriesMap[row.id];

        const isPre = isOrderPreOrder(row);
        const orderType = isPre ? 'preorder' : 'instock';
        const queueNum = isPre
          ? (delivery?.queue_number || row.queue_number || row.queue_id || formatQueueId(row, idx))
          : (delivery?.queue_number || row.queue_number || row.queue_id || '');
        const carrier = delivery?.shipping_carrier || row.shipping_carrier || row.carrier_name || '';
        const driver = delivery?.driver_phone || row.driver_phone || '';
        const tracking = delivery?.tracking_number || row.tracking_number || row.shipmentNo || row.shipment_no || '';
        const estDeliveryDate = delivery?.estimated_delivery_date || row.estimated_delivery_date || '';
        const delivStatus = (delivery?.delivery_status || '').toLowerCase();
        const ordStatus = (row.order_status || row.status || '').toLowerCase();

        let qStage: 1 | 2 | 3 | 4 = 1;
        if (delivStatus === 'delivered' || delivStatus === 'completed' || ordStatus === 'delivered' || ordStatus === 'completed') {
          qStage = 4;
        } else if (delivStatus === 'in_transit' || ordStatus === 'in_transit' || ordStatus === 'shipped' || ordStatus === 'shipping') {
          qStage = 4;
        } else if (delivStatus === 'ready_for_shipping' || ordStatus === 'ready_for_shipping' || ordStatus === 'ready') {
          qStage = 3;
        } else if (delivStatus === 'manufacturing' || ordStatus === 'manufacturing' || ordStatus === 'processing' || ordStatus === 'paid') {
          qStage = 2;
        } else {
          qStage = 1;
        }

        const stageKey = qStage === 4 ? 'in_transit' : qStage === 3 ? 'ready_for_shipping' : qStage === 2 ? 'manufacturing' : 'queue_received';

        return {
          ...row,
          id: row.id,
          order_type: orderType,
          orderType: orderType,
          is_preorder: isPre,
          isPreOrder: isPre,
          // Joined deliveries table fields: in-stock items bypass production queue
          queue_number: isPre ? queueNum : (queueNum || undefined),
          queue_id: isPre ? queueNum : (queueNum || ''),
          shipping_carrier: carrier,
          carrier_name: carrier,
          driver_phone: driver,
          tracking_number: tracking,
          shipmentNo: tracking,
          shipment_no: tracking,
          estimated_delivery_date: estDeliveryDate,
          delivery_status: delivStatus || ordStatus,

          customerName: row.customer_name || row.customerName || '',
          date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
          productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
          color: row.color || 'คละสี',
          amount: Number(row.total_amount || row.amount || 0),
          status: delivStatus === 'delivered' ? 'Delivered' : (row.status || (ordStatus === 'completed' || ordStatus === 'delivered' ? 'Delivered' : ordStatus === 'shipping' || ordStatus === 'in_transit' ? 'Shipping' : row.payment_status || 'Pending')),
          payment_slip_url: row.payment_slip_url || '',
          status_message: row.status_message || '',
          
          // Queue fields:
          queue_stage: row.queue_stage || qStage,
          queue_status: row.queue_status || stageKey,

          customer_id: row.customer_id || row.user_id || cleanUserId,
          customer_name: row.customer_name || row.customerName || '',
          customer_email: row.customer_email || cleanEmail,
          customer_phone: row.customer_phone || '',
          total_amount: Number(row.total_amount || row.amount || 0),
          payment_status: row.payment_status || row.status || 'pending',
          order_status: delivStatus === 'delivered' ? 'completed' : (row.order_status || 'waiting_payment'),
          created_at: row.created_at || row.date || ''
        };
      });
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
        status: 'waiting_payment',
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
    boat_size?: string;
    boat_model_name?: string;
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

    const sizeName = item.boat_size || 'ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน)';
    const prodName = item.boat_model_name 
      ? `${item.boat_model_name} (สี${item.selected_color})` 
      : `เรือพลาสติกสั่งทำพิเศษ ${sizeName} (สี${item.selected_color})`;

    const fullPayload: any = {
      id: orderId,
      customer_id: item.customer_id || null,
      customer_name: item.customer_name || 'ลูกค้าพรีออเดอร์',
      customer_email: item.customer_email || 'guest@example.com',
      customer_phone: item.customer_phone || '',
      selected_color: item.selected_color,
      boat_size: sizeName,
      sticker_option: stickerText,
      custom_text: item.custom_text || '',
      total_price: Number(item.total_price),
      status: 'pending_deposit',
      // Compatibility columns for existing orders view:
      total_amount: Number(item.total_price),
      payment_status: 'pending_deposit',
      order_status: 'pending_deposit',
      product_name: prodName,
      color: item.selected_color,
      address: item.address || '',
      notes: `[Custom Pre-Order] ขนาด: ${sizeName} | สี: ${item.selected_color} | สติกเกอร์: ${stickerText} | ข้อความสกรีน: ${item.custom_text || '-'} | จำนวน: ${item.quantity || 1} ลำ`,
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
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) {
          console.warn('Could not delete from orders table in Supabase:', error.message);
        }
      }
      // Sync local storage for immediate persistence
      try {
        const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const filtered = local.filter((o: any) => o.id !== id);
        localStorage.setItem('admin_orders', JSON.stringify(filtered));
      } catch {}
      return true;
    } catch (err: any) {
      console.error('Failed to delete order from Supabase:', err.message);
      return false;
    }
  },

  async updateStatus(
    id: string, 
    status: string,
    meta?: {
      estimated_delivery_date?: string;
      shipping_carrier?: string;
      carrier_name?: string;
      driver_phone?: string;
      tracking_number?: string;
      shipment_no?: string;
      queue_number?: string;
      status_message?: string;
    }
  ): Promise<boolean> {
    const sLower = status.toLowerCase();
    const isPending = sLower === 'pending_verification' || sLower === 'waiting_payment' || sLower === 'pending' || sLower === 'waiting_verify' || sLower === 'waiting_approval' || sLower === 'pending_deposit';
    const isDeliv = sLower === 'delivered' || sLower === 'completed';
    const isShip = sLower === 'shipped' || sLower === 'shipping' || sLower === 'in_transit';
    const isReady = sLower === 'ready_for_shipping' || sLower === 'ready';
    const mappedOrderStatus = isPending ? sLower : isDeliv ? 'completed' : isShip ? 'in_transit' : isReady ? 'ready_for_shipping' : 'manufacturing';
    const trackingNo = meta?.tracking_number || meta?.shipment_no || `TH-EX-${String(id).replace(/[^0-9]/g, '').slice(-6) || '291823'}`;
    const carrier = meta?.shipping_carrier || meta?.carrier_name || '';
    const driver = meta?.driver_phone || '';
    const estDate = meta?.estimated_delivery_date || '';
    const queueNo = meta?.queue_number;

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Update orders table in Supabase
        const targetStatus = isDeliv ? 'delivered' : isShip ? 'in_transit' : status;
        try {
          await supabase.from('orders').update({
            status: targetStatus,
            order_status: mappedOrderStatus,
            ...(isPending ? {} : { delivery_status: isDeliv ? 'delivered' : mappedOrderStatus }),
            ...(isPending ? {} : {
              shipment_no: trackingNo,
              shipmentNo: trackingNo,
              tracking_number: trackingNo
            }),
            ...(carrier ? { shipping_carrier: carrier, carrier_name: carrier } : {}),
            ...(driver ? { driver_phone: driver } : {}),
            ...(estDate ? { estimated_delivery_date: estDate } : {}),
            ...(queueNo ? { queue_number: queueNo } : {})
          }).eq('id', id);
        } catch {
          await supabase.from('orders').update({
            status: targetStatus,
            order_status: mappedOrderStatus,
            ...(isPending ? {} : { delivery_status: isDeliv ? 'delivered' : mappedOrderStatus })
          }).eq('id', id);
        }
      }
    } catch (e) {
      console.warn('Supabase updateStatus caught warning:', e);
    }

    // 2. UPSERT into separate deliveries table (only if order is approved / not pending)
    if (!isPending) {
      try {
        await supabaseDeliveries.upsert({
          order_id: String(id),
          delivery_status: isDeliv ? 'delivered' : mappedOrderStatus,
          ...(queueNo ? { queue_number: queueNo } : {}),
          ...(carrier ? { shipping_carrier: carrier } : {}),
          ...(driver ? { driver_phone: driver } : {}),
          ...(trackingNo ? { tracking_number: trackingNo } : {}),
          ...(estDate ? { estimated_delivery_date: estDate } : {})
        });
      } catch (e) {
        console.warn('supabaseDeliveries.upsert caught warning in updateStatus:', e);
      }
    }

    // Persist immediately in local storage admin_orders
    try {
      const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      const updated = local.map((o: any) => 
        o.id === id ? { 
          ...o, 
          status: isDeliv ? 'delivered' : status, 
          order_status: mappedOrderStatus,
          shipmentNo: trackingNo,
          shipment_no: trackingNo,
          tracking_number: trackingNo,
          ...(carrier ? { shipping_carrier: carrier, carrier_name: carrier } : {}),
          ...(driver ? { driver_phone: driver } : {}),
          ...(estDate ? { estimated_delivery_date: estDate } : {}),
          ...(queueNo ? { queue_number: queueNo } : {}),
          delivery_status: isDeliv ? 'delivered' : mappedOrderStatus
        } : o
      );
      localStorage.setItem('admin_orders', JSON.stringify(updated));
    } catch {}

    return true;
  },

  async updateQueueStage(
    id: string,
    stage: 1 | 2 | 3 | 4,
    meta?: {
      queue_number?: string;
      shipping_carrier?: string;
      carrier_name?: string;
      driver_phone?: string;
      tracking_number?: string;
      shipment_no?: string;
      estimated_delivery_date?: string;
    }
  ): Promise<boolean> {
    const stageMap: Record<number, { status: string; orderStatus: string; label: string }> = {
      1: { status: 'processing', orderStatus: 'queue_received', label: 'รับคิวผลิต' },
      2: { status: 'manufacturing', orderStatus: 'manufacturing', label: 'กำลังหลอม/ผลิต' },
      3: { status: 'ready_for_shipping', orderStatus: 'ready_for_shipping', label: 'รอขนย้าย' },
      4: { status: 'in_transit', orderStatus: 'in_transit', label: 'อยู่ระหว่างจัดส่ง' }
    };
    const currentStageInfo = stageMap[stage] || stageMap[1];
    const trackingNo = meta?.tracking_number || meta?.shipment_no || `TH-EX-${String(id).replace(/[^0-9]/g, '').slice(-6) || '291823'}`;
    const carrier = meta?.shipping_carrier || meta?.carrier_name || '';
    const driver = meta?.driver_phone || '';
    const estDate = meta?.estimated_delivery_date || '';
    const queueNo = meta?.queue_number;

    // 1. Update orders table in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({
          queue_stage: stage,
          queue_status: currentStageInfo.orderStatus,
          order_status: currentStageInfo.orderStatus,
          status: currentStageInfo.status,
          shipment_no: trackingNo,
          shipmentNo: trackingNo,
          tracking_number: trackingNo,
          ...(queueNo ? { queue_number: queueNo } : {}),
          ...(carrier ? { shipping_carrier: carrier, carrier_name: carrier } : {}),
          ...(driver ? { driver_phone: driver } : {}),
          ...(estDate ? { estimated_delivery_date: estDate } : {})
        }).eq('id', id);
      } catch (err: any) {
        console.warn('Supabase updateQueueStage error:', err?.message);
        try {
          await supabase.from('orders').update({
            order_status: currentStageInfo.orderStatus,
            status: currentStageInfo.status
          }).eq('id', id);
        } catch {}
      }
    }

    // 2. UPSERT into separate deliveries table
    try {
      await supabaseDeliveries.upsert({
        order_id: String(id),
        delivery_status: currentStageInfo.orderStatus,
        ...(queueNo ? { queue_number: queueNo } : {}),
        ...(carrier ? { shipping_carrier: carrier } : {}),
        ...(driver ? { driver_phone: driver } : {}),
        ...(trackingNo ? { tracking_number: trackingNo } : {}),
        ...(estDate ? { estimated_delivery_date: estDate } : {})
      });
    } catch (e) {
      console.warn('supabaseDeliveries.upsert caught warning in updateQueueStage:', e);
    }

    // Persist in local storage admin_orders
    try {
      const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      const updated = local.map((o: any) =>
        o.id === id ? {
          ...o,
          queue_stage: stage,
          queue_status: currentStageInfo.orderStatus,
          order_status: currentStageInfo.orderStatus,
          status: currentStageInfo.status,
          shipment_no: trackingNo,
          shipmentNo: trackingNo,
          tracking_number: trackingNo,
          ...(queueNo ? { queue_number: queueNo } : {}),
          ...(carrier ? { shipping_carrier: carrier, carrier_name: carrier } : {}),
          ...(driver ? { driver_phone: driver } : {}),
          ...(estDate ? { estimated_delivery_date: estDate } : {}),
          delivery_status: currentStageInfo.orderStatus
        } : o
      );
      localStorage.setItem('admin_orders', JSON.stringify(updated));
    } catch {}

    // Dispatch realtime broadcast events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pornpong-queue-updated', {
        detail: {
          orderId: id,
          stage,
          queueStatus: currentStageInfo.orderStatus,
          meta: {
            ...meta,
            shipment_no: trackingNo
          }
        }
      }));
      window.dispatchEvent(new Event('orders-updated'));
    }

    return true;
  },

  async listWaitingVerify(): Promise<any[]> {
    const getApprovedIds = (): Set<string> => {
      try {
        return new Set(JSON.parse(localStorage.getItem('pornpong_approved_order_ids') || '[]').map(String));
      } catch {
        return new Set();
      }
    };
    const getRejectedIds = (): Set<string> => {
      try {
        return new Set(JSON.parse(localStorage.getItem('pornpong_rejected_order_ids') || '[]').map(String));
      } catch {
        return new Set();
      }
    };

    const isOrderExcludedFromPending = (order: any, approvedIds: Set<string>, rejectedIds: Set<string>): boolean => {
      const id = String(order.id || '');
      if (approvedIds.has(id) || rejectedIds.has(id)) return true;

      const s = String(order.status || '').toLowerCase().trim();
      const ps = String(order.payment_status || '').toLowerCase().trim();
      const os = String(order.order_status || '').toLowerCase().trim();

      // Explicitly excluded per user specification
      const EXCLUDED_STATUSES = ['paid', 'ready_to_ship', 'producing', 'completed', 'in_transit', 'shipping', 'delivered', 'cancelled', 'payment_rejected'];
      const EXCLUDED_PAYMENT_STATUSES = ['verified', 'paid', 'completed', 'approved', 'rejected', 'payment_rejected'];
      const EXCLUDED_ORDER_STATUSES = ['manufacturing', 'producing', 'ready_to_ship', 'in_transit', 'shipping', 'completed', 'delivered'];

      if (EXCLUDED_STATUSES.includes(s) || EXCLUDED_PAYMENT_STATUSES.includes(ps) || EXCLUDED_ORDER_STATUSES.includes(os)) {
        return true;
      }

      // Must be waiting verification
      const isPending = ['pending_verification', 'waiting_verify', 'waiting_approval', 'pending'].includes(ps) ||
                        ['pending_verification', 'waiting_verify', 'waiting_approval', 'pending'].includes(s);
      return !isPending;
    };

    const approvedIds = getApprovedIds();
    const rejectedIds = getRejectedIds();

    if (!isSupabaseConfigured || !supabase) {
      // Local storage fallback
      try {
        const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const preLocal = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
        const combined = [...local, ...preLocal];
        return combined
          .filter((o: any) => !isOrderExcludedFromPending(o, approvedIds, rejectedIds))
          .map((row: any) => ({
            ...row,
            id: row.id,
            customerName: row.customer_name || row.customerName || '',
            date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
            productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
            color: row.color || 'คละสี',
            amount: Number(row.total_amount || row.amount || 0),
            status: row.payment_status || row.status || 'Pending',
            shipmentNo: row.shipmentNo || row.shipment_no || '',
            payment_slip_url: row.payment_slip_url || row.slip_url || row.base64_slip || '',
            slip_url: row.slip_url || row.payment_slip_url || row.base64_slip || '',
            base64_slip: row.base64_slip || (row.payment_slip_url?.startsWith('data:') ? row.payment_slip_url : ''),
            customer_id: row.customer_id || null,
            customer_name: row.customer_name || row.customerName || '',
            customer_email: row.customer_email || 'guest@example.com',
            customer_phone: row.customer_phone || '',
            total_amount: Number(row.total_amount || row.amount || 0),
            payment_status: row.payment_status || row.status || 'pending_verification',
            order_status: row.order_status || 'waiting_payment',
            created_at: row.created_at || row.date || ''
          }));
      } catch {
        return [];
      }
    }

    try {
      // Unified query: .or('status.eq.pending_verification,status.eq.pending,payment_status.eq.pending,payment_status.eq.pending_verification')
      const { data: unifiedData, error: queryErr } = await supabase
        .from('orders')
        .select('*')
        .or('status.eq.pending_verification,status.eq.pending,payment_status.eq.pending,payment_status.eq.pending_verification')
        .order('created_at', { ascending: false });

      if (queryErr) {
        console.warn('Unified pending verification query note:', queryErr.message);
      }

      let rawCombined: any[] = (!queryErr && unifiedData) ? unifiedData : [];

      // Fallback in case of syntax or empty response if orders exist with pending status
      if (rawCombined.length === 0) {
        const { data: fallbackData } = await supabase
          .from('orders')
          .select('*')
          .in('payment_status', ['pending_verification', 'waiting_verify', 'waiting_approval', 'pending'])
          .order('created_at', { ascending: false });
        if (fallbackData && fallbackData.length > 0) {
          rawCombined = fallbackData;
        }
      }

      // De-duplicate by ID
      const seenIds = new Set<string>();
      const uniqueRaw: any[] = [];
      for (const item of rawCombined) {
        const idStr = String(item.id);
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          uniqueRaw.push(item);
        }
      }

      // 3. Strict exclusion of paid/ready_to_ship/producing/completed
      const strictlyFiltered = uniqueRaw.filter((row: any) => !isOrderExcludedFromPending(row, approvedIds, rejectedIds));

      let list: any[] = strictlyFiltered.map((row: any) => {
        let slipUrl = row.payment_slip_url || row.slip_url || row.slipUrl || row.slip || row.image_url || '';
        if (slipUrl && !slipUrl.startsWith('http') && !slipUrl.startsWith('data:')) {
          try {
            const { data: pubData } = supabase.storage.from('payment-slips').getPublicUrl(slipUrl);
            if (pubData?.publicUrl) {
              slipUrl = pubData.publicUrl;
            }
          } catch {}
        }

        return {
          ...row,
          id: row.id,
          customerName: row.customer_name || row.customerName || '',
          date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
          productName: row.productName || row.product_name || 'เรือพลาสติกและอุปกรณ์',
          color: row.color || 'คละสี',
          amount: Number(row.total_amount || row.amount || 0),
          status: row.payment_status || row.status || 'Pending',
          shipmentNo: row.shipmentNo || row.shipment_no || '',
          payment_slip_url: slipUrl || row.slip_url || row.base64_slip || '',
          slip_url: row.slip_url || slipUrl || row.base64_slip || '',
          base64_slip: row.base64_slip || (slipUrl.startsWith('data:') ? slipUrl : ''),
          customer_id: row.customer_id || null,
          customer_name: row.customer_name || row.customerName || '',
          customer_email: row.customer_email || 'guest@example.com',
          customer_phone: row.customer_phone || '',
          total_amount: Number(row.total_amount || row.amount || 0),
          payment_status: row.payment_status || row.status || 'pending_verification',
          order_status: row.order_status || 'waiting_payment',
          created_at: row.created_at || row.date || ''
        };
      });

      // Also merge with local storage admin_orders to ensure any recently attached slips are never lost
      try {
        const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const pendingLocal = local.filter((o: any) => !isOrderExcludedFromPending(o, approvedIds, rejectedIds));
        for (const loc of pendingLocal) {
          const existingIdx = list.findIndex(r => String(r.id) === String(loc.id));
          const locSlip = loc.payment_slip_url || loc.slip_url || loc.base64_slip || '';
          if (existingIdx >= 0) {
            if (!list[existingIdx].payment_slip_url && locSlip) {
              list[existingIdx].payment_slip_url = locSlip;
              list[existingIdx].slip_url = locSlip;
            }
          } else {
            list.push({
              ...loc,
              payment_slip_url: locSlip,
              slip_url: loc.slip_url || locSlip
            });
          }
        }
      } catch {}

      // Final strict filter pass
      return list.filter((item: any) => !isOrderExcludedFromPending(item, approvedIds, rejectedIds));
    } catch (e: any) {
      console.warn('Orders fetch waiting verify caught error:', e.message);
      return [];
    }
  },

  async approve(id: string): Promise<boolean> {
    try {
      const orderIdStr = String(id);

      // Immediately save to approved set in localStorage so no refresh can re-render it
      try {
        const approvedList = JSON.parse(localStorage.getItem('pornpong_approved_order_ids') || '[]');
        if (!approvedList.map(String).includes(orderIdStr)) {
          approvedList.push(orderIdStr);
          localStorage.setItem('pornpong_approved_order_ids', JSON.stringify(approvedList));
        }
        // Remove from rejected if was there
        const rejectedList = JSON.parse(localStorage.getItem('pornpong_rejected_order_ids') || '[]');
        const filteredRejected = rejectedList.filter((x: any) => String(x) !== orderIdStr);
        localStorage.setItem('pornpong_rejected_order_ids', JSON.stringify(filteredRejected));
      } catch {}

      let isPre = false;
      let orderData: any = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (data) {
            orderData = data;
            isPre = isOrderPreOrder(data);
          }
        } catch (fetchErr) {
          console.warn('Supabase fetch order in approve caught:', fetchErr);
        }
      }

      if (!orderData) {
        try {
          const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
          const found = local.find((o: any) => String(o.id) === orderIdStr);
          if (found) {
            isPre = isOrderPreOrder(found);
            orderData = found;
          }
        } catch {}
      }

      // Per Requirement 2:
      // If In-Stock item: status is 'ready_to_ship'
      // If Pre-Order item: status is 'producing'
      const nextStatus = isPre ? 'producing' : 'ready_to_ship';
      const nextOrderStatus = isPre ? 'producing' : 'ready_to_ship';
      const nextStatusMessage = isPre 
        ? 'การชำระเงินเสร็จสิ้น! คำสั่งซื้อเป็นสินค้าสั่งผลิต (Pre-Order) ลำดับคิวการผลิตเริ่มต้นแล้ว โรงงานเริ่มกระบวนการผลิตทันที'
        : 'การชำระเงินเสร็จสิ้น! คำสั่งซื้อเป็นสินค้าพร้อมส่ง (In-Stock) ชำระเงินเรียบร้อยแล้ว - ทางคลังสินค้ากำลังเตรียมบรรจุหีบห่อและส่งมอบให้ขนส่งโดยตรง';

      if (isSupabaseConfigured && supabase) {
        // 1. UPDATE orders table: status = 'producing' (pre-order) or 'ready_to_ship' (in-stock), payment_status = 'verified'
        const updatePayload: any = {
          payment_status: 'verified',
          status: nextStatus,
          order_status: nextOrderStatus,
          status_message: nextStatusMessage,
          updated_at: new Date().toISOString()
        };

        const { error: orderUpdateErr } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', id);

        if (orderUpdateErr) {
          console.warn('Supabase approve order error, continuing fallback:', orderUpdateErr.message);
        }

        // Also update preorders table if it exists
        try {
          await supabase
            .from('preorders')
            .update({
              payment_status: 'verified',
              status: nextStatus,
              order_status: nextOrderStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
        } catch {}

        // 2. UPSERT deliveries table with { onConflict: 'order_id' } to prevent constraint errors
        try {
          const deliveryStatus = isPre ? 'producing' : 'ready_to_ship';
          const { error: deliveryErr } = await supabase
            .from('deliveries')
            .upsert({
              order_id: orderIdStr,
              delivery_status: deliveryStatus,
              updated_at: new Date().toISOString()
            }, { onConflict: 'order_id' });

          if (deliveryErr) {
            console.warn('Supabase deliveries upsert error in approve:', deliveryErr.message);
          }
        } catch (delivErr) {
          console.warn('Deliveries upsert exception in approve:', delivErr);
        }
      }

      // Sync local storage for immediate persistence
      try {
        const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const updated = local.map((o: any) => 
          String(o.id) === orderIdStr ? { 
            ...o, 
            payment_status: 'verified', 
            status: nextStatus, 
            order_status: nextOrderStatus,
            status_message: nextStatusMessage,
            delivery_status: isPre ? 'producing' : 'ready_to_ship',
            updated_at: new Date().toISOString()
          } : o
        );
        localStorage.setItem('admin_orders', JSON.stringify(updated));

        const preLocal = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
        const updatedPre = preLocal.map((p: any) =>
          String(p.id) === orderIdStr ? {
            ...p,
            payment_status: 'verified',
            status: nextStatus,
            order_status: nextOrderStatus,
            status_message: nextStatusMessage,
            updated_at: new Date().toISOString()
          } : p
        );
        localStorage.setItem('admin_preorders', JSON.stringify(updatedPre));
      } catch {}

      return true;
    } catch (err: any) {
      console.error('Failed to approve order:', err.message);
      return false;
    }
  },

  async reject(id: string): Promise<boolean> {
    try {
      const orderIdStr = String(id);

      // Immediately save to rejected set in localStorage so no refresh can re-render it
      try {
        const rejectedList = JSON.parse(localStorage.getItem('pornpong_rejected_order_ids') || '[]');
        if (!rejectedList.map(String).includes(orderIdStr)) {
          rejectedList.push(orderIdStr);
          localStorage.setItem('pornpong_rejected_order_ids', JSON.stringify(rejectedList));
        }
      } catch {}

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_status: 'payment_rejected',
            order_status: 'cancelled',
            status_message: 'หลักฐานการชำระเงินไม่ถูกต้องหรือถูกปฏิเสธ กรุณาติดต่อแอดมินหรืออัปโหลดสลิปใหม่',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) {
          console.warn('Supabase reject warning:', error.message);
        }
      }

      // Sync local storage
      try {
        const local = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const updated = local.map((o: any) => 
          String(o.id) === orderIdStr ? { 
            ...o, 
            status: 'cancelled',
            payment_status: 'payment_rejected', 
            order_status: 'cancelled',
            status_message: 'หลักฐานการชำระเงินไม่ถูกต้องหรือถูกปฏิเสธ กรุณาติดต่อแอดมินหรืออัปโหลดสลิปใหม่',
            updated_at: new Date().toISOString()
          } : o
        );
        localStorage.setItem('admin_orders', JSON.stringify(updated));

        const preLocal = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
        const updatedPre = preLocal.map((p: any) =>
          String(p.id) === orderIdStr ? {
            ...p,
            status: 'cancelled',
            payment_status: 'payment_rejected',
            order_status: 'cancelled',
            updated_at: new Date().toISOString()
          } : p
        );
        localStorage.setItem('admin_preorders', JSON.stringify(updatedPre));
      } catch {}

      return true;
    } catch (err: any) {
      console.error('Failed to reject order:', err.message);
      return false;
    }
  },

  async uploadSlip(orderId: string, file: File): Promise<string | null> {
    try {
      // Create a unique clean path name
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `slip_${orderId}_${Date.now()}.${fileExt}`;
      let finalSlipUrl = '';

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment-slips')
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (!uploadError && uploadData) {
            // Retrieve public URL from 'payment-slips'
            const { data: { publicUrl } } = supabase.storage
              .from('payment-slips')
              .getPublicUrl(cleanFileName);
            finalSlipUrl = publicUrl;
          } else {
            console.warn('Storage upload error in payment-slips, will use base64 fallback:', uploadError?.message);
          }
        } catch (stErr) {
          console.warn('Storage bucket upload exception:', stErr);
        }
      }

      // If storage upload didn't succeed, create Base64 string fallback
      if (!finalSlipUrl) {
        finalSlipUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      const updatePayload = {
        payment_slip_url: finalSlipUrl,
        slip_url: finalSlipUrl,
        status: 'pending_verification',
        payment_status: 'pending',
        order_status: 'pending_verification',
        updated_at: new Date().toISOString()
      };

      // Update orders table
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId);
        } catch (e) {
          console.warn('Supabase orders update error in uploadSlip:', e);
        }
      }

      // Try updating preorders / pre_orders table if applicable
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('preorders')
            .update({ 
              payment_slip_url: finalSlipUrl, 
              slip_url: finalSlipUrl, 
              status: 'pending_verification',
              payment_status: 'pending',
              order_status: 'pending_verification'
            })
            .eq('id', orderId);
        } catch {}

        try {
          await supabase
            .from('pre_orders')
            .update({ 
              payment_slip_url: finalSlipUrl, 
              slip_url: finalSlipUrl, 
              status: 'pending_verification',
              payment_status: 'pending',
              order_status: 'pending_verification'
            })
            .eq('id', orderId);
        } catch {}
      }

      // Update local storage for immediate reactivity
      try {
        const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const updatedOrders = localOrders.map((o: any) => 
          o.id === orderId 
            ? { 
                ...o, 
                payment_slip_url: finalSlipUrl, 
                slip_url: finalSlipUrl, 
                status: 'pending_verification',
                payment_status: 'pending',
                order_status: 'pending_verification'
              } 
            : o
        );
        localStorage.setItem('admin_orders', JSON.stringify(updatedOrders));

        const localPre = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
        const updatedPre = localPre.map((p: any) =>
          p.id === orderId
            ? { 
                ...p, 
                payment_slip_url: finalSlipUrl, 
                slip_url: finalSlipUrl, 
                status: 'pending_verification',
                payment_status: 'pending',
                order_status: 'pending_verification'
              }
            : p
        );
        localStorage.setItem('admin_preorders', JSON.stringify(updatedPre));

        window.dispatchEvent(new CustomEvent('orders-updated'));
      } catch {}

      return finalSlipUrl;
    } catch (err: any) {
      console.error('Failed to upload slip:', err);
      return null;
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
    let boatSize = row.boat_size || row.boat_model_name || '';

    if (!boatSize && row.notes && row.notes.includes('[ขนาด:')) {
      const match = row.notes.match(/\[ขนาด:\s*([^\]]+)\]/);
      if (match) boatSize = match[1].trim();
    }
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
      productName: row.productName || row.product_name || (boatSize ? `${boatSize} (${selectedColor || 'คละสี'})` : `เรือพลาสติกสั่งทำ (${selectedColor || 'คละสี'})`),
      boat_size: boatSize || 'ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน)',
      boat_model_name: row.boat_model_name || boatSize || 'รุ่นมาตรฐาน 2 ที่นั่ง',
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
      notes: row.notes || '',
      payment_slip_url: row.payment_slip_url || row.slip_url || ''
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
  extraPrice?: number;
  enabled: boolean;
}

export interface PreOrderStickerOption {
  id: string;
  name: string;
  price: number;
  badge?: string;
  description?: string;
  imageUrl?: string;
  enabled: boolean;
}

export interface PreOrderBoatSize {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  lengthLabel: string;
  widthLabel: string;
  capacityWeight?: string;
  seatsLabel?: string;
  basePrice: number;
  description?: string;
  scaleBadge?: string;
  enabled: boolean;
}

export const DEFAULT_STICKER_OPTIONS: PreOrderStickerOption[] = [
  {
    id: 'none',
    name: 'ไม่ติดสติกเกอร์ (สีเนื้อเรือเรียบ)',
    price: 0,
    badge: 'คลาสสิก',
    description: 'เนื้อพลาสติกสีเรียบเงาแบบคลาสสิก ดูแลง่าย',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop',
    enabled: true
  },
  {
    id: 'sport_marine_3m',
    name: 'สติกเกอร์ลายสปอร์ต Marine 3M',
    price: 300,
    badge: 'POPULAR • ยอดนิยม',
    description: 'ลายคาดข้างสปอร์ตกันน้ำ ทน UV เกรด Marine 3M ลายคมชัด',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=400&auto=format&fit=crop',
    enabled: true
  },
  {
    id: 'rescue_reflective',
    name: 'สติกเกอร์แถบสะท้อนแสงกู้ภัย (Hi-Vis Safety)',
    price: 450,
    badge: 'SAFETY • กู้ภัย',
    description: 'แถบสะท้อนแสง Diamond Grade มองเห็นชัดเจนเวลากลางคืน',
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=400&auto=format&fit=crop',
    enabled: true
  }
];

export const DEFAULT_BOAT_SIZES: PreOrderBoatSize[] = [
  {
    id: '1_seat',
    name: 'ขนาด 1 ที่นั่ง (เรือเดี่ยว / เรือเล็ก 6 ฟุต)',
    shortName: 'เรือเล็ก 1 ที่นั่ง',
    badge: 'คล่องตัวสูง • 1 ที่นั่ง',
    lengthLabel: 'ยาว 1.8 - 2.0 ม.',
    widthLabel: 'กว้าง 78 ซม.',
    capacityWeight: '90 - 140 กก.',
    seatsLabel: '1 ที่นั่ง',
    basePrice: 2500,
    description: 'เรือขนาดเล็กกะทัดรัด น้ำหนักเบา ยกคนเดียวได้ พายคล่องตัวสูงในร่องสวน คูคลองแคบ หรือสระน้ำ',
    scaleBadge: 'สเกลจริง 1.90 x 0.78 ม. • ขนาด 1 ที่นั่ง',
    enabled: true
  },
  {
    id: '2_seat',
    name: 'ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน 8 ฟุต)',
    shortName: 'รุ่นมาตรฐาน 2 ที่นั่ง',
    badge: 'รุ่นยอดนิยม • 2 ที่นั่ง',
    lengthLabel: 'ยาว 1.98 - 2.5 ม.',
    widthLabel: 'กว้าง 88 - 96 ซม.',
    capacityWeight: '180 - 220 กก.',
    seatsLabel: '2 ที่นั่ง',
    basePrice: 3000,
    description: 'เรือพลาสติกทรงท้องแบนมาตรฐานยอดนิยม เสถียรภาพสูง ไม่โคลงเคลง นั่ง 2 คนสบาย มั่นคงปลอดภัยในทุกผืนน้ำ',
    scaleBadge: 'สเกลจริง 2.50 x 0.90 ม. • รุ่นมาตรฐาน 2 ที่นั่ง',
    enabled: true
  },
  {
    id: '3_seat',
    name: 'ขนาด 3 ที่นั่งขึ้นไป (เรือใหญ่ / อีแปะเกษตร 10-12 ฟุต)',
    shortName: 'เรืออีแปะ 3 ที่นั่ง+',
    badge: 'บรรทุกหนัก • 3 ที่นั่งขึ้นไป',
    lengthLabel: 'ยาว 3.3 ม. ขึ้นไป',
    widthLabel: 'กว้าง 90 ซม. ขึ้นไป',
    capacityWeight: '300 - 380 กก.',
    seatsLabel: '3 ที่นั่งขึ้นไป',
    basePrice: 4500,
    description: 'เรือขนาดใหญ่ทรงเรืออีแปะการเกษตร ท้องแบนกว้างพิเศษ ทรงตัวดีเยี่ยม ลอยตัวสูง จุสัมภาระและผลผลิตการเกษตรได้มาก',
    scaleBadge: 'สเกลจริง 3.30 x 0.95 ม. • เรือใหญ่ 3 ที่นั่งขึ้นไป',
    enabled: true
  }
];

export interface PreOrderSettings {
  basePrice: number;
  basePrice1Seat?: number;
  basePrice2Seat?: number;
  basePrice3Seat?: number;
  boatSizes: PreOrderBoatSize[];
  stickerPrice: number;
  stickerOptions?: PreOrderStickerOption[];
  customTextPrice: number;
  depositPerBoat: number;
  colors: PreOrderColorConfig[];
  galleryPhotos?: Record<string, string>;
  updatedAt?: string;
}

export const DEFAULT_BOAT_GALLERY_PHOTOS: Record<string, string> = {
  '1_seat_น้ำเงิน': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop',
  '1_seat_แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
  '1_seat_เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
  '1_seat_ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',

  '2_seat_น้ำเงิน': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop',
  '2_seat_แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
  '2_seat_เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
  '2_seat_ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',

  '3_seat_น้ำเงิน': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=900&auto=format&fit=crop',
  '3_seat_แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
  '3_seat_เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
  '3_seat_ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',
};

export const compressImageFile = async (file: File, maxWidth = 1200, maxHeight = 800, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const normalizeBoatSizes = (sizesRaw: any, b1?: number, b2?: number, b3?: number): PreOrderBoatSize[] => {
  if (Array.isArray(sizesRaw) && sizesRaw.length > 0) {
    return sizesRaw.map((item, idx) => ({
      id: String(item.id || `size_${idx + 1}`),
      name: String(item.name || `ขนาดเรือ ${idx + 1}`),
      shortName: String(item.shortName || item.name || `เรือ ${idx + 1}`),
      badge: String(item.badge || ''),
      lengthLabel: String(item.lengthLabel || ''),
      widthLabel: String(item.widthLabel || ''),
      capacityWeight: item.capacityWeight ? String(item.capacityWeight) : undefined,
      seatsLabel: item.seatsLabel ? String(item.seatsLabel) : undefined,
      basePrice: Number(item.basePrice || 3000),
      description: item.description ? String(item.description) : undefined,
      scaleBadge: item.scaleBadge ? String(item.scaleBadge) : undefined,
      enabled: item.enabled !== false
    }));
  }
  const fallback = DEFAULT_BOAT_SIZES.map(s => ({ ...s }));
  if (typeof b1 === 'number' && fallback[0]) fallback[0].basePrice = b1;
  if (typeof b2 === 'number' && fallback[1]) fallback[1].basePrice = b2;
  if (typeof b3 === 'number' && fallback[2]) fallback[2].basePrice = b3;
  return fallback;
};

export const normalizeBoatColors = (colorsRaw: any): PreOrderColorConfig[] => {
  if (Array.isArray(colorsRaw) && colorsRaw.length > 0) {
    return colorsRaw.map((c, idx) => ({
      id: String(c.id || `color_${idx + 1}`),
      name: String(c.name || `สี ${idx + 1}`),
      english: c.english ? String(c.english) : undefined,
      swatchHex: String(c.swatchHex || c.hex || '#2563eb'),
      extraPrice: Number(c.extraPrice || 0),
      enabled: c.enabled !== false
    }));
  }
  return [
    { id: 'น้ำเงิน', name: 'สีน้ำเงิน', english: 'Royal Ocean Blue', swatchHex: '#2563eb', extraPrice: 0, enabled: true },
    { id: 'แดง', name: 'สีแดง', english: 'Rescue Vivid Red', swatchHex: '#dc2626', extraPrice: 0, enabled: true },
    { id: 'เขียว', name: 'สีเขียว', english: 'Forest Green', swatchHex: '#16a34a', extraPrice: 0, enabled: true },
    { id: 'ส้ม', name: 'สีส้ม', english: 'Hi-Vis Safety Orange', swatchHex: '#ea580c', extraPrice: 0, enabled: true }
  ];
};

export const normalizeStickerOptions = (stickersRaw: any, fallbackPrice?: number): PreOrderStickerOption[] => {
  if (Array.isArray(stickersRaw) && stickersRaw.length > 0) {
    return stickersRaw.map((s, idx) => ({
      id: String(s.id || `sticker_${idx + 1}`),
      name: String(s.name || `ลายสติกเกอร์ ${idx + 1}`),
      price: Number(s.price !== undefined ? s.price : (fallbackPrice || 300)),
      badge: s.badge ? String(s.badge) : undefined,
      description: s.description ? String(s.description) : undefined,
      imageUrl: s.imageUrl ? String(s.imageUrl) : undefined,
      enabled: s.enabled !== false
    }));
  }
  return DEFAULT_STICKER_OPTIONS.map(s => {
    if (s.id !== 'none' && typeof fallbackPrice === 'number' && fallbackPrice > 0) {
      return { ...s, price: fallbackPrice };
    }
    return { ...s };
  });
};

export const DEFAULT_PREORDER_SETTINGS: PreOrderSettings = {
  basePrice: 3000,
  basePrice1Seat: 2500,
  basePrice2Seat: 3000,
  basePrice3Seat: 4500,
  boatSizes: [...DEFAULT_BOAT_SIZES],
  stickerPrice: 300,
  stickerOptions: [...DEFAULT_STICKER_OPTIONS],
  customTextPrice: 200,
  depositPerBoat: 1000,
  colors: [
    { id: 'น้ำเงิน', name: 'สีน้ำเงิน', english: 'Royal Ocean Blue', swatchHex: '#2563eb', extraPrice: 0, enabled: true },
    { id: 'แดง', name: 'สีแดง', english: 'Rescue Vivid Red', swatchHex: '#dc2626', extraPrice: 0, enabled: true },
    { id: 'เขียว', name: 'สีเขียว', english: 'Forest Green', swatchHex: '#16a34a', extraPrice: 0, enabled: true },
    { id: 'ส้ม', name: 'สีส้ม', english: 'Hi-Vis Safety Orange', swatchHex: '#ea580c', extraPrice: 0, enabled: true }
  ],
  galleryPhotos: { ...DEFAULT_BOAT_GALLERY_PHOTOS },
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
            boatSizes: normalizeBoatSizes(parsed.boatSizes, parsed.basePrice1Seat, parsed.basePrice2Seat, parsed.basePrice3Seat),
            colors: normalizeBoatColors(parsed.colors),
            stickerOptions: normalizeStickerOptions(parsed.stickerOptions, parsed.stickerPrice),
            galleryPhotos: parsed.galleryPhotos || DEFAULT_PREORDER_SETTINGS.galleryPhotos
          };
        }
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        // 0. Try querying boat_models table directly if available
        let modelsFromBoatModelsTable: PreOrderBoatSize[] | null = null;
        try {
          const { data: bmData, error: bmErr } = await supabase
            .from('boat_models')
            .select('*')
            .order('base_price', { ascending: true });
          if (!bmErr && bmData && bmData.length > 0) {
            modelsFromBoatModelsTable = bmData.map((bm: any, idx: number) => ({
              id: String(bm.id || `model_${idx + 1}`),
              name: String(bm.name || bm.title || `ขนาด ${idx + 1} ที่นั่ง`),
              shortName: String(bm.short_name || bm.shortName || bm.name || ''),
              badge: String(bm.badge || ''),
              lengthLabel: String(bm.length_label || bm.lengthLabel || ''),
              widthLabel: String(bm.width_label || bm.widthLabel || ''),
              capacityWeight: bm.capacity_weight ? String(bm.capacity_weight) : (bm.capacityWeight ? String(bm.capacityWeight) : undefined),
              seatsLabel: bm.seats_label ? String(bm.seats_label) : (bm.seatsLabel ? String(bm.seatsLabel) : undefined),
              basePrice: Number(bm.base_price || bm.basePrice || 3000),
              description: bm.description ? String(bm.description) : undefined,
              scaleBadge: bm.scale_badge ? String(bm.scale_badge) : undefined,
              enabled: bm.enabled !== false
            }));
          }
        } catch {}

        // Query boat_colors table directly if available
        let colorsFromTable: PreOrderColorConfig[] | null = null;
        try {
          const { data: bcData, error: bcErr } = await supabase.from('boat_colors').select('*');
          if (!bcErr && bcData && bcData.length > 0) {
            colorsFromTable = bcData.map((c: any, idx: number) => ({
              id: String(c.id || c.name || `color_${idx + 1}`),
              name: String(c.name || `สี ${idx + 1}`),
              english: c.english ? String(c.english) : undefined,
              swatchHex: String(c.swatch_hex || c.swatchHex || c.hex || '#2563eb'),
              extraPrice: Number(c.extra_price ?? c.extraPrice ?? 0),
              enabled: c.enabled !== false
            }));
          }
        } catch {}

        // Query sticker_options table directly if available
        let stickersFromTable: PreOrderStickerOption[] | null = null;
        try {
          const { data: stData, error: stErr } = await supabase.from('sticker_options').select('*');
          if (!stErr && stData && stData.length > 0) {
            stickersFromTable = stData.map((s: any, idx: number) => ({
              id: String(s.id || `sticker_${idx + 1}`),
              name: String(s.name || `สติกเกอร์ ${idx + 1}`),
              price: Number(s.price ?? 300),
              badge: s.badge ? String(s.badge) : undefined,
              description: s.description ? String(s.description) : undefined,
              imageUrl: s.image_url || s.imageUrl,
              enabled: s.enabled !== false
            }));
          }
        } catch {}

        // 1. Try pre_order_settings table
        const { data: posData, error: posErr } = await supabase
          .from('pre_order_settings')
          .select('*')
          .limit(1);

        if (!posErr && posData && posData.length > 0) {
          const row = posData[0];
          let parsedPhotos = DEFAULT_PREORDER_SETTINGS.galleryPhotos;
          if (row.gallery_photos) {
            parsedPhotos = typeof row.gallery_photos === 'string' ? JSON.parse(row.gallery_photos) : row.gallery_photos;
          } else if (row.galleryPhotos) {
            parsedPhotos = row.galleryPhotos;
          }

          let rawBoatSizes = row.boat_sizes || row.boatSizes;
          if (typeof rawBoatSizes === 'string') {
            try { rawBoatSizes = JSON.parse(rawBoatSizes); } catch {}
          }

          let rawColors = row.colors;
          if (typeof rawColors === 'string') {
            try { rawColors = JSON.parse(rawColors); } catch {}
          }

          let rawStickers = row.sticker_options || row.stickerOptions;
          if (typeof rawStickers === 'string') {
            try { rawStickers = JSON.parse(rawStickers); } catch {}
          }

          const b1 = Number(row.base_price_1_seat ?? row.basePrice1Seat ?? DEFAULT_PREORDER_SETTINGS.basePrice1Seat);
          const b2 = Number(row.base_price_2_seat ?? row.basePrice2Seat ?? DEFAULT_PREORDER_SETTINGS.basePrice2Seat);
          const b3 = Number(row.base_price_3_seat ?? row.basePrice3Seat ?? DEFAULT_PREORDER_SETTINGS.basePrice3Seat);

          // Use boat_models table if present and row.boat_sizes was empty
          const chosenBoatSizes = (Array.isArray(rawBoatSizes) && rawBoatSizes.length > 0)
            ? rawBoatSizes
            : (modelsFromBoatModelsTable || rawBoatSizes);

          const chosenColors = (Array.isArray(rawColors) && rawColors.length > 0)
            ? rawColors
            : (colorsFromTable || rawColors);

          const chosenStickers = (Array.isArray(rawStickers) && rawStickers.length > 0)
            ? rawStickers
            : (stickersFromTable || rawStickers);

          const parsedStickerPrice = Number(row.sticker_price ?? row.stickerPrice ?? DEFAULT_PREORDER_SETTINGS.stickerPrice);

          const settings: PreOrderSettings = {
            basePrice: Number(row.base_price ?? row.basePrice ?? DEFAULT_PREORDER_SETTINGS.basePrice),
            basePrice1Seat: b1,
            basePrice2Seat: b2,
            basePrice3Seat: b3,
            boatSizes: normalizeBoatSizes(chosenBoatSizes, b1, b2, b3),
            stickerPrice: parsedStickerPrice,
            stickerOptions: normalizeStickerOptions(chosenStickers, parsedStickerPrice),
            customTextPrice: Number(row.custom_text_price ?? row.customTextPrice ?? DEFAULT_PREORDER_SETTINGS.customTextPrice),
            depositPerBoat: Number(row.deposit_per_boat ?? row.depositPerBoat ?? DEFAULT_PREORDER_SETTINGS.depositPerBoat),
            colors: normalizeBoatColors(chosenColors),
            galleryPhotos: parsedPhotos || DEFAULT_PREORDER_SETTINGS.galleryPhotos,
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
          const chosenBoatSizes = (Array.isArray(val.boatSizes) && val.boatSizes.length > 0)
            ? val.boatSizes
            : (modelsFromBoatModelsTable || val.boatSizes);

          const chosenColors = (Array.isArray(val.colors) && val.colors.length > 0)
            ? val.colors
            : (colorsFromTable || val.colors);

          const chosenStickers = (Array.isArray(val.stickerOptions) && val.stickerOptions.length > 0)
            ? val.stickerOptions
            : (stickersFromTable || val.stickerOptions);

          const settings: PreOrderSettings = {
            ...DEFAULT_PREORDER_SETTINGS,
            ...val,
            boatSizes: normalizeBoatSizes(chosenBoatSizes, val.basePrice1Seat, val.basePrice2Seat, val.basePrice3Seat),
            colors: normalizeBoatColors(chosenColors),
            stickerOptions: normalizeStickerOptions(chosenStickers, val.stickerPrice),
            galleryPhotos: val.galleryPhotos || DEFAULT_PREORDER_SETTINGS.galleryPhotos
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
    const boatSizes = (Array.isArray(settings.boatSizes) && settings.boatSizes.length > 0)
      ? settings.boatSizes
      : DEFAULT_BOAT_SIZES;

    const colors = (Array.isArray(settings.colors) && settings.colors.length > 0)
      ? settings.colors
      : DEFAULT_PREORDER_SETTINGS.colors;

    const stickerOptions = (Array.isArray(settings.stickerOptions) && settings.stickerOptions.length > 0)
      ? settings.stickerOptions
      : DEFAULT_STICKER_OPTIONS;

    const p1 = boatSizes.find(s => s.id === '1_seat')?.basePrice ?? boatSizes[0]?.basePrice ?? 2500;
    const p2 = boatSizes.find(s => s.id === '2_seat')?.basePrice ?? boatSizes[1]?.basePrice ?? 3000;
    const p3 = boatSizes.find(s => s.id === '3_seat')?.basePrice ?? boatSizes[2]?.basePrice ?? 4500;

    const updatedSettings: PreOrderSettings = {
      ...settings,
      boatSizes,
      colors,
      stickerOptions,
      basePrice: Number(p2),
      basePrice1Seat: Number(p1),
      basePrice2Seat: Number(p2),
      basePrice3Seat: Number(p3),
      stickerPrice: Number(settings.stickerPrice || 300),
      customTextPrice: Number(settings.customTextPrice || 200),
      depositPerBoat: Number(settings.depositPerBoat || 1000),
      galleryPhotos: settings.galleryPhotos || DEFAULT_PREORDER_SETTINGS.galleryPhotos,
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
        const payloadA: any = {
          id: 'default',
          base_price: Number(updatedSettings.basePrice),
          base_price_1_seat: Number(updatedSettings.basePrice1Seat),
          base_price_2_seat: Number(updatedSettings.basePrice2Seat),
          base_price_3_seat: Number(updatedSettings.basePrice3Seat),
          boat_sizes: updatedSettings.boatSizes,
          sticker_price: Number(updatedSettings.stickerPrice),
          sticker_options: updatedSettings.stickerOptions,
          custom_text_price: Number(updatedSettings.customTextPrice),
          deposit_per_boat: Number(updatedSettings.depositPerBoat),
          colors: updatedSettings.colors,
          gallery_photos: updatedSettings.galleryPhotos,
          updated_at: updatedSettings.updatedAt
        };
        const { error: errA } = await supabase.from('pre_order_settings').upsert([payloadA]);

        // Also sync each model into boat_models table if it exists
        try {
          for (const model of updatedSettings.boatSizes) {
            await supabase.from('boat_models').upsert([{
              id: model.id,
              name: model.name,
              short_name: model.shortName,
              badge: model.badge,
              length_label: model.lengthLabel,
              width_label: model.widthLabel,
              capacity_weight: model.capacityWeight,
              seats_label: model.seatsLabel,
              base_price: model.basePrice,
              description: model.description,
              enabled: model.enabled,
              updated_at: updatedSettings.updatedAt
            }]);
          }
        } catch {}

        // Also sync each color into boat_colors table if it exists
        try {
          for (const col of updatedSettings.colors) {
            await supabase.from('boat_colors').upsert([{
              id: col.id,
              name: col.name,
              english: col.english || '',
              swatch_hex: col.swatchHex,
              extra_price: col.extraPrice || 0,
              enabled: col.enabled,
              updated_at: updatedSettings.updatedAt
            }]);
          }
        } catch {}

        // Also sync each sticker option into sticker_options table if it exists
        try {
          for (const stk of updatedSettings.stickerOptions) {
            await supabase.from('sticker_options').upsert([{
              id: stk.id,
              name: stk.name,
              price: stk.price,
              badge: stk.badge || '',
              description: stk.description || '',
              image_url: stk.imageUrl || '',
              enabled: stk.enabled,
              updated_at: updatedSettings.updatedAt
            }]);
          }
        } catch {}

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
  },

  async uploadBoatPhoto(file: File, sizeId: string, colorId: string): Promise<string> {
    const compressed = await compressImageFile(file, 1280, 850, 0.85);

    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanFileName = `boat_gallery/${sizeId}_${Date.now()}.${fileExt}`;

        // Attempt upload to 'products' or 'payment-slips'
        const { data, error } = await supabase.storage
          .from('products')
          .upload(cleanFileName, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(cleanFileName);
          if (publicUrl) return publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback to compressed image:', err);
      }
    }

    return compressed;
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

