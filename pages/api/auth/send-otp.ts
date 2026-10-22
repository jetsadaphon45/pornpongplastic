import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '666051000345@mail.rmutk.ac.th',
    pass: process.env.GMAIL_APP_PASSWORD || 'ppqyxuqfnrmlerzr',
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุอีเมล' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('otp_requests')
      .insert([{ email, otp_code: otpCode, expires_at: expiresAt }]);

    if (dbError) throw dbError;

    await transporter.sendMail({
      from: `"พรพงศ์พลาสติก" <${process.env.GMAIL_USER || '666051000345@mail.rmutk.ac.th'}>`,
      to: email,
      subject: 'รหัส OTP ยืนยันตัวตน - พรพงศ์พลาสติก',
      html: `<h2>รหัส OTP ของคุณคือ: <span style="color:#0088cc;">${otpCode}</span></h2><p>รหัสมีอายุ 5 นาที</p>`,
    });

    return res.status(200).json({ success: true, message: 'ส่ง OTP เรียบร้อย' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'เกิดข้อผิดพลาดในการส่ง OTP' });
  }
}

