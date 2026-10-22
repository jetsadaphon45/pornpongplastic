import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

import fs from 'fs';

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return process.env.HOST || '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

async function startServer() {
  const app = express();

  app.use(express.json());

  // CORS & Preflight OPTIONS Handler (Prevents Error 405 on browser preflight requests)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Email Transporter Configurations
  const gmailUser = process.env.GMAIL_USER?.trim() || '666051000345@mail.rmutk.ac.th';
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim() || 'ppqyxuqfnrmlerzr';

  const mailTransporter = (gmailUser && gmailPass)
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })
    : null;

  const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  // Supabase Client for Backend Database Operations
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('placeholder'))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  // In-memory store for OTP requests (resilient fallback cache with 5-minute expiry)
  interface OtpRecord {
    id: string;
    email: string;
    otp_code: string;
    expires_at: number; // Unix epoch ms
    created_at: string;
  }
  const localOtpStore = new Map<string, OtpRecord>();

  // 1. Helper: Generate random 6-digit OTP code
  function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 2. Helper: Send OTP Email HTML Card under "Pornpong Plastic" brand
  async function sendOTPEmail(toEmail: string, otpCode: string, name?: string) {
    const brandName = 'Pornpong Plastic';
    const emailSubject = 'รหัส OTP สำหรับยืนยันตัวตน - พรพงศ์พลาสติก';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #0088cc; text-align: center;">พรพงศ์พลาสติก</h2>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p>สวัสดีครับ${name ? `คุณ ${name}` : ''},</p>
        <p>รหัสยืนยันตัวตน (OTP) สำหรับการทำรายการของคุณคือ:</p>
        <div style="background-color: #f4f6f9; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0088cc;">${otpCode}</span>
        </div>
        <p style="color: #666; font-size: 14px;">รหัสนี้มีอายุการใช้งาน 5 นาที</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">หากคุณไม่ได้ร้องขอรหัสนี้ สามารถเพิกเฉยต่ออีเมลนี้ได้ทันที</p>
      </div>
    `;

    // Priority 1: Send via Gmail SMTP (Nodemailer)
    if (mailTransporter && gmailUser) {
      try {
        console.log(`[Gmail SMTP] Sending OTP ${otpCode} to ${toEmail} from ${brandName} <${gmailUser}>...`);
        const info = await mailTransporter.sendMail({
          from: `"${brandName}" <${gmailUser}>`,
          to: toEmail,
          subject: emailSubject,
          html: htmlContent,
        });
        console.log(`[Gmail SMTP Success]: Sent OTP to ${toEmail}, messageId: ${info.messageId}`);
        return { success: true, provider: 'gmail_smtp', messageId: info.messageId };
      } catch (smtpErr: any) {
        console.error('[Gmail SMTP Error]:', smtpErr.message || smtpErr);
        if (!resend) {
          return {
            success: false,
            provider: 'gmail_smtp',
            error: smtpErr.message || 'Gmail SMTP failed',
            code: smtpErr.code,
          };
        }
        console.log('[Fallback] Attempting Resend fallback...');
      }
    }

    // Priority 2: Fallback to Resend if configured
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: toEmail,
          subject: emailSubject,
          html: htmlContent,
        });
        if (error) {
          console.error('[Resend Error]:', error);
          return { success: false, provider: 'resend', error: error.message };
        }
        return { success: true, provider: 'resend', data };
      } catch (rErr: any) {
        return { success: false, provider: 'resend', error: rErr.message };
      }
    }

    // Priority 3: Simulated delivery
    console.warn(`[OTP Sim] Neither Gmail SMTP nor Resend available. Simulated delivery of OTP ${otpCode} to ${toEmail}`);
    return { success: true, simulated: true, provider: 'simulation' };
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      port: PORT,
      host: HOST,
      smtpConfigured: !!mailTransporter,
      gmailUser: gmailUser || null,
      resendConfigured: !!resend,
      supabaseConfigured: !!supabase,
    });
  });

  // SMTP Verification endpoint
  app.get('/api/verify-smtp', async (req, res) => {
    if (!mailTransporter) {
      return res.status(400).json({
        configured: false,
        message: 'GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env',
      });
    }

    try {
      await mailTransporter.verify();
      console.log(`[Gmail SMTP] Connection verified successfully for ${gmailUser}`);
      return res.json({
        configured: true,
        verified: true,
        gmailUser,
        message: 'Gmail SMTP credentials verified successfully',
      });
    } catch (err: any) {
      console.error('[Gmail SMTP Verification Failed]:', err);
      return res.status(500).json({
        configured: true,
        verified: false,
        gmailUser,
        error: err.message || 'SMTP verification failed',
      });
    }
  });

  // Middleware to enforce POST method and JSON Content-Type
  const enforcePostJson = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed. Please use POST method.`
      });
    }
    next();
  };

  // ============================================================================
  // REQUIREMENT 1: API Route / Logic สำหรับขอ OTP (POST /api/auth/send-otp, etc.)
  // Always returns Response in JSON format (success: 200, error: 400/500)
  // ============================================================================
  const handleRequestOtp = async (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Please use POST.' });
    }

    try {
      const { email, to, toEmail, name, fullName, phone, otpCode: clientOtp } = req.body || {};
      const targetEmail = (email || to || toEmail || '').trim().toLowerCase();
      const recipientName = (name || fullName || '').trim();

      if (!targetEmail) {
        return res.status(400).json({ success: false, error: 'กรุณากรอกอีเมล (Email is required)' });
      }

      // Basic email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetEmail)) {
        return res.status(400).json({ success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' });
      }

      // 1. Generate 6-digit OTP (or use client provided if specified)
      const otpCode = clientOtp && typeof clientOtp === 'string' && clientOtp.length === 6
        ? clientOtp
        : generateOTP();

      // 2. Set expiration to 5 minutes from now
      const now = Date.now();
      const expiresAtMs = now + 5 * 60 * 1000; // 5 minutes
      const expiresAtIso = new Date(expiresAtMs).toISOString();
      const createdAtIso = new Date(now).toISOString();

      // 3. Save into in-memory store for instant zero-latency resilience
      localOtpStore.set(targetEmail, {
        id: `otp_${now}_${Math.random().toString(36).slice(2, 7)}`,
        email: targetEmail,
        otp_code: otpCode,
        expires_at: expiresAtMs,
        created_at: createdAtIso,
      });

      // 4. Save into Supabase table 'otp_requests'
      let supabaseSaved = false;
      if (supabase) {
        try {
          const insertPayload: any = {
            email: targetEmail,
            otp_code: otpCode,
            otp: otpCode,
            expires_at: expiresAtIso,
            created_at: createdAtIso,
            is_verified: false,
          };
          if (recipientName) insertPayload.name = recipientName;
          if (phone) insertPayload.phone = phone;

          const { error: insertErr } = await supabase
            .from('otp_requests')
            .insert([insertPayload]);

          if (insertErr) {
            console.warn('[Supabase otp_requests insert warning]:', insertErr.message);
            // Retry with base columns if table lacks extra columns
            if (insertErr.message?.includes('column')) {
              await supabase.from('otp_requests').insert([{
                email: targetEmail,
                otp_code: otpCode,
                otp: otpCode,
                expires_at: expiresAtIso,
                created_at: createdAtIso,
                is_verified: false,
              }]);
            }
          } else {
            supabaseSaved = true;
            console.log(`[Supabase] Successfully saved OTP for ${targetEmail} in 'otp_requests'`);
          }
        } catch (sbErr: any) {
          console.warn('[Supabase Exception when saving to otp_requests]:', sbErr.message || sbErr);
        }
      }

      // 5. Send OTP Email using Nodemailer (Pornpong Plastic card)
      const emailResult = await sendOTPEmail(targetEmail, otpCode, recipientName);

      return res.status(200).json({
        success: true,
        message: 'ส่ง OTP สำเร็จ',
        email: targetEmail,
        expiresIn: 300, // seconds
        expiresAt: expiresAtIso,
        emailDelivery: emailResult,
        supabaseSaved,
        simulatedOtp: emailResult.simulated || !emailResult.success ? otpCode : undefined,
      });
    } catch (err: any) {
      console.error('[Request OTP Fatal Exception]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการส่ง OTP',
      });
    }
  };

  app.all('/api/auth/send-otp', enforcePostJson, handleRequestOtp);
  app.all('/api/otp/request', enforcePostJson, handleRequestOtp);
  app.all('/api/send-otp', enforcePostJson, handleRequestOtp);
  app.all('/api/request-otp', enforcePostJson, handleRequestOtp);

  // ============================================================================
  // REQUIREMENT 2: API Route / Logic สำหรับยืนยัน OTP (POST /api/auth/verify-otp, etc.)
  // Always returns Response in JSON format (success: 200, error: 400/500)
  // ============================================================================
  const handleVerifyOtp = async (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Please use POST.' });
    }

    try {
      const { email, to, toEmail, otpCode, otp, token } = req.body || {};
      const targetEmail = (email || to || toEmail || '').trim().toLowerCase();
      const submittedCode = String(otpCode || otp || token || '').trim();

      if (!targetEmail || !submittedCode) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุอีเมลและรหัส OTP 6 หลักที่ได้รับ',
        });
      }

      if (submittedCode.length !== 6) {
        return res.status(400).json({
          success: false,
          error: 'รหัส OTP ต้องมีความยาว 6 หลัก',
        });
      }

      let matchedRecord: { id?: string; email: string; otp_code: string; expires_at: any } | null = null;
      let matchedSource = '';

      // 1. Check in Supabase table 'otp_requests'
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('otp_requests')
            .select('*')
            .eq('email', targetEmail)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!error && Array.isArray(data) && data.length > 0) {
            matchedRecord = {
              id: data[0].id,
              email: data[0].email,
              otp_code: data[0].otp_code || data[0].otp,
              expires_at: data[0].expires_at,
            };
            matchedSource = 'supabase';
          }
        } catch (sbErr: any) {
          console.warn('[Supabase query otp_requests warning]:', sbErr.message || sbErr);
        }
      }

      // 2. Fallback to in-memory store if not found in Supabase
      if (!matchedRecord && localOtpStore.has(targetEmail)) {
        const local = localOtpStore.get(targetEmail)!;
        matchedRecord = {
          id: local.id,
          email: local.email,
          otp_code: local.otp_code,
          expires_at: local.expires_at,
        };
        matchedSource = 'memory';
      }

      // If no OTP request exists for this email
      if (!matchedRecord) {
        return res.status(400).json({
          success: false,
          error: 'ไม่พบคำขอรหัส OTP สำหรับอีเมลนี้ กรุณากดขอรหัส OTP ใหม่อีกครั้ง',
        });
      }

      // 3. Check expiration (within 5 minutes)
      const expiryTime = typeof matchedRecord.expires_at === 'number'
        ? matchedRecord.expires_at
        : new Date(matchedRecord.expires_at).getTime();

      const now = Date.now();
      if (now > expiryTime) {
        // Expired -> Clean up from store
        localOtpStore.delete(targetEmail);
        if (supabase && matchedRecord.id) {
          try {
            await supabase.from('otp_requests').delete().eq('id', matchedRecord.id);
          } catch {
            // ignore
          }
        }
        return res.status(400).json({
          success: false,
          error: 'รหัส OTP หมดอายุแล้ว (อายุการใช้งาน 5 นาที) กรุณากดขอรหัส OTP ใหม่',
          expired: true,
        });
      }

      // 4. Verify code match
      const expectedCode = String(matchedRecord.otp_code || '').trim();
      if (expectedCode !== submittedCode) {
        return res.status(400).json({
          success: false,
          error: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบรหัส 6 หลักอีกครั้ง',
        });
      }

      // 5. Verification SUCCESS: Clean up / Delete OTP record
      localOtpStore.delete(targetEmail);
      if (supabase) {
        try {
          if (matchedRecord.id) {
            await supabase.from('otp_requests').delete().eq('id', matchedRecord.id);
          } else {
            await supabase.from('otp_requests').delete().eq('email', targetEmail);
          }
          console.log(`[Supabase] Successfully deleted verified OTP for ${targetEmail}`);
        } catch (delErr: any) {
          console.warn('[Supabase delete otp warning]:', delErr.message || delErr);
        }
      }

      console.log(`[OTP Verified] Email: ${targetEmail} verified successfully via ${matchedSource}`);

      return res.status(200).json({
        success: true,
        message: 'ยืนยันรหัส OTP สำเร็จ (Verify Success)',
        email: targetEmail,
        verifiedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Verify OTP Fatal Exception]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการยืนยัน OTP',
      });
    }
  };

  app.all('/api/auth/verify-otp', enforcePostJson, handleVerifyOtp);
  app.all('/api/otp/verify', enforcePostJson, handleVerifyOtp);
  app.all('/api/verify-otp', enforcePostJson, handleVerifyOtp);

  // General email sending endpoint (Order notifications, payment confirmation, etc.)
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, text } = req.body;
      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: 'Recipient "to", "subject", and "html" or "text" content are required' });
      }

      const brandName = 'Pornpong Plastic';
      if (mailTransporter && gmailUser) {
        const info = await mailTransporter.sendMail({
          from: `"${brandName}" <${gmailUser}>`,
          to,
          subject,
          html: html || undefined,
          text: text || undefined,
        });
        return res.json({ success: true, provider: 'gmail_smtp', messageId: info.messageId });
      }

      if (resend) {
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to,
          subject,
          html: html || text || '',
        });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true, provider: 'resend', data });
      }

      return res.json({ success: true, simulated: true, message: 'Simulated email send' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to send email' });
    }
  });


  // Vite middleware for development or Static files for production
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction || !hasDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
