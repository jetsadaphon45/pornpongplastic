import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// 1. ตั้งค่า Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. ตั้งค่า Nodemailer Transporter ด้วย Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '666051000345@mail.rmutk.ac.th',
    pass: process.env.GMAIL_APP_PASSWORD || 'ppqyxuqfnrmlerzr',
  },
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // 1. สุ่ม OTP 6 หลัก
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 2. บันทึกลงตาราง 'otp_requests' ใน Supabase
    await supabase.from('otp_requests').insert([{ email, otp_code: otpCode, expires_at: expiresAt }]);

    // 3. ส่งอีเมลด้วย Nodemailer
    await transporter.sendMail({
      from: `"พรพงศ์พลาสติก" <${process.env.GMAIL_USER || '666051000345@mail.rmutk.ac.th'}>`,
      to: email,
      subject: 'รหัส OTP ยืนยันตัวตน - พรพงศ์พลาสติก',
      html: `<h2>รหัส OTP ของคุณคือ: <span style="color:#0088cc;">${otpCode}</span></h2><p>รหัสมีอายุ 5 นาที</p>`,
    });

    return NextResponse.json({ success: true, message: 'ส่ง OTP เรียบร้อย' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

