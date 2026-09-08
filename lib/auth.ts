import { supabase } from '@/lib/supabaseClient'

export async function sendOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // สร้างบัญชีให้อัตโนมัติหากยังไม่มีในฐานข้อมูล
    },
  })

  if (error) {
    console.error('Error sending OTP:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// ฟังก์ชันสำหรับกดส่ง OTP
export async function handleSendOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      // ตั้งค่าเป็น true เพื่อให้สมัครสมาชิกใหม่อัตโนมัติหากยังไม่มีอีเมลนี้ในระบบ
      shouldCreateUser: true,
    },
  })

  if (error) {
    console.error('Error sending OTP:', error.message)
    alert(`เกิดข้อผิดพลาด: ${error.message}`)
    return
  }

  alert('ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว!')
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token, // รหัส OTP 6 หลักที่ผู้ใช้กรอก
    type: 'email',
  })

  if (error) {
    console.error('Error verifying OTP:', error.message)
    return { success: false, error: error.message }
  }

  // เมื่อสำเร็จ data จะมี session และข้อมูลผู้ใช้ (data.user)
  return { success: true, user: data.user, session: data.session }
}

