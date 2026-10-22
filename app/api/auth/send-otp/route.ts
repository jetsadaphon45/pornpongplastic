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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // 3. สุ่มรหัส OTP 6 หลัก
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // หมดอายุใน 5 นาที

    // 4. บันทึกลงตาราง otp_requests ใน Supabase
    const { error: dbError } = await supabase
      .from('otp_requests')
      .insert([{ email, otp_code: otpCode, expires_at: expiresAt }]);

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
      return NextResponse.json({ success: false, error: 'บันทึก OTP ไม่สำเร็จ' }, { status: 500 });
    }

    // 5. ส่งอีเมลผ่าน Gmail SMTP
    const mailOptions = {
      from: `"Pornpong Plastic" <${process.env.GMAIL_USER || '666051000345@mail.rmutk.ac.th'}>`,
      to: email,
      subject: 'รหัส OTP สำหรับยืนยันตัวตน - พรพงศ์พลาสติก',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #0088cc; text-align: center;">พรพงศ์พลาสติก</h2>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p>สวัสดีครับ,</p>
          <p>รหัสยืนยันตัวตน (OTP) สำหรับการทำรายการของคุณคือ:</p>
          <div style="background-color: #f4f6f9; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0088cc;">${otpCode}</span>
          </div>
          <p style="color: #666; font-size: 14px;">รหัสนี้มีอายุการใช้งาน 5 นาที</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">หากคุณไม่ได้ร้องขอรหัสนี้ สามารถเพิกเฉยต่ออีเมลนี้ได้ทันที</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'ส่ง OTP สำเร็จ' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
