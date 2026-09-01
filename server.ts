import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Resend OTP email sending endpoint
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email, otpCode, name } = req.body;
      if (!email || !otpCode) {
        return res.status(400).json({ error: 'Email and OTP code are required' });
      }

      if (!resend) {
        console.warn('[Resend OTP] RESEND_API_KEY is not configured in .env. Skipping real email send.');
        return res.json({ success: true, simulated: true, message: 'Simulated OTP send (RESEND_API_KEY missing)' });
      }

      console.log(`[Resend OTP] Sending OTP ${otpCode} to ${email}...`);

      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'รหัส OTP ยืนยันการสมัครสมาชิก - พรพงศ์เรือพลาสติก',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0369a1; margin: 0 0 4px 0; font-size: 20px; font-weight: 800;">พรพงศ์เรือพลาสติก</h2>
              <p style="color: #64748b; margin: 0; font-size: 12px;">ระบบยืนยันตัวตนสำหรับสมัครสมาชิกใหม่</p>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
              <p style="color: #334155; font-size: 14px; margin-top: 0; margin-bottom: 8px;">สวัสดีครับคุณ <strong>${name || 'ลูกค้า'}</strong></p>
              <p style="color: #475569; font-size: 13px; margin: 0 0 16px 0;">รหัส OTP สำหรับยืนยันการลงทะเบียนบัญชีของคุณคือ:</p>
              <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 14px 20px; margin: 0 auto 16px auto; display: inline-block;">
                <span style="font-size: 32px; font-weight: 800; color: #0284c7; letter-spacing: 6px; font-family: monospace;">${otpCode}</span>
              </div>
              <p style="color: #64748b; font-size: 11px; margin: 0;">รหัสยืนยันนี้มีอายุการใช้งาน 10 นาที เพื่อความปลอดภัยห้ามบอกรหัสนี้แก่ผู้อื่น</p>
            </div>
            <div style="text-align: center; margin-top: 16px;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">หากคุณไม่ได้ทำรายการสมัครสมาชิก สามารถละเลยอีเมลฉบับนี้ได้ทันที</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('[Resend OTP Error]:', error);
        return res.status(500).json({ error: error.message, details: error });
      }

      console.log('[Resend OTP Success]:', data);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('[Server OTP Exception]:', err);
      return res.status(500).json({ error: err.message || 'Failed to send OTP email' });
    }
  });

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
