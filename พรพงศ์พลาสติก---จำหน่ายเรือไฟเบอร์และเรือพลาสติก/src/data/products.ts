import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'f1',
    name: 'เรือไฟเบอร์ 10 ฟุต (ท้อง V)',
    category: 'fiberglass',
    price: 18500,
    description: 'เรือไฟเบอร์กลาสคุณภาพสูง แข็งแรง ทนทาน ไม่รั่วซึม เหมาะสำหรับใช้ในแม่น้ำและทะเลชายฝั่ง',
    specs: {
      size: 'กว้าง 1.2 ม. x ยาว 3.0 ม.',
      material: 'ไฟเบอร์กลาสเสริมแรง',
      capacity: '2-3 คน',
    },
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'f2',
    name: 'เรือไฟเบอร์ 14 ฟุต (เรือประมงเล็ก)',
    category: 'fiberglass',
    price: 32000,
    description: 'เรือประมงขนาดเล็กยอดนิยม น้ำหนักเบา ขนย้ายสะดวก รองรับการติดตั้งเครื่องยนต์ท้ายเรือ',
    specs: {
      size: 'กว้าง 1.4 ม. x ยาว 4.2 ม.',
      material: 'ไฟเบอร์กลาสคุณภาพสูง',
      capacity: '4-5 คน',
    },
    image: 'https://images.unsplash.com/photo-1517315003714-a071486bd9ea?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'p1',
    name: 'เรือพลาสติก 2 ที่นั่ง (PE)',
    category: 'plastic',
    price: 7500,
    description: 'ผลิตจากพลาสติก PE เกรด A ทนแดด ทนฝน ไม่กรอบแตกง่าย สีสันสดใส',
    specs: {
      size: 'กว้าง 1.1 ม. x ยาว 2.5 ม.',
      material: 'พลาสติกพอลิเอทิลีน (PE)',
      capacity: '2 คน',
    },
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'p2',
    name: 'เรือพลาสติก 3 ที่นั่ง (ทรงกว้าง)',
    category: 'plastic',
    price: 9800,
    description: 'เรือพลาสติกแบบฉีดขึ้นรูปชิ้นเดียว ไร้รอยต่อ มีความเสถียรสูง พลิกคว่ำยาก',
    specs: {
      size: 'กว้าง 1.3 ม. x ยาว 3.2 ม.',
      material: 'พลาสติกพอลิเอทิลีนความหนาแน่นสูง',
      capacity: '3-4 คน',
    },
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'r1',
    name: 'เรือพายไม้สักจำลอง (ไฟเบอร์)',
    category: 'rowboat',
    price: 15000,
    description: 'เรือพายรูปทรงคลาสสิก ทำจากไฟเบอร์ลายไม้เสมือนจริง ดูแลรักษาง่ายกว่าไม้จริง',
    specs: {
      size: 'กว้าง 0.9 ม. x ยาว 3.5 ม.',
      material: 'ไฟเบอร์กลาสลายไม้',
      capacity: '1-2 คน',
    },
    image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
  {
    id: 'a1',
    name: 'ไม้พายอลูมิเนียม',
    category: 'accessory',
    price: 850,
    description: 'ไม้พายน้ำหนักเบา แข็งแรงทนทาน ใบพายพลาสติกเหนียวพิเศษ',
    specs: {
      size: 'ยาว 1.5 ม.',
      material: 'อลูมิเนียม + พลาสติก',
      capacity: 'N/A',
    },
    image: 'https://images.unsplash.com/photo-1596484552834-695d3a58b99c?auto=format&fit=crop&q=80&w=800',
    status: 'available'
  },
];
