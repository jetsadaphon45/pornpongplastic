import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. ตั้งค่า Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otpCode, otp } = body;
    const submittedOtp = otpCode || otp;

    if (!email || !submittedOtp) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมลและรหัส OTP' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(submittedOtp).trim();

    // ค้นหารหัส OTP ใน Supabase
    const { data: record, error: findError } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('email', cleanEmail)
      .eq('otp_code', cleanOtp)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('Supabase Query Error:', findError);
      return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'รหัส OTP ไม่ถูกต้องหรือไม่มีอยู่ในระบบ' }, { status: 400 });
    }

    // ตรวจสอบเวลาหมดอายุ (5 นาที)
    const isExpired = new Date(record.expires_at).getTime() < Date.now();
    if (isExpired) {
      return NextResponse.json({ success: false, error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
    }

    // ลบ OTP ที่ใช้งานแล้วออกจากตาราง
    if (record.id) {
      await supabase.from('otp_requests').delete().eq('id', record.id);
    } else {
      await supabase.from('otp_requests').delete().eq('email', cleanEmail).eq('otp_code', cleanOtp);
    }

    return NextResponse.json({
      success: true,
      message: 'ยืนยันรหัส OTP สำเร็จ',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'ยืนยัน OTP ไม่สำเร็จ' }, { status: 500 });
  }
}
