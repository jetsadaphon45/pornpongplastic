'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function OtpLoginForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Helper to handle and alert Supabase error
  const handleSupabaseError = (error: any): string => {
    if (!error) return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Supabase'

    const isObject = typeof error === 'object' && error !== null
    let hasNestedObject = false

    if (isObject) {
      const keys = [...Object.keys(error), ...Object.getOwnPropertyNames(error)]
      hasNestedObject = keys.some((key) => {
        if (key === 'stack') return false
        const val = error[key]
        return typeof val === 'object' && val !== null && Object.keys(val).length > 0
      })
    }

    if (hasNestedObject) {
      try {
        let jsonStr = JSON.stringify(error, null, 2)
        if (!jsonStr || jsonStr === '{}') {
          const props = Object.getOwnPropertyNames(error)
          jsonStr = JSON.stringify(error, props, 2)
        }
        if (jsonStr && jsonStr !== '{}') {
          alert(jsonStr)
          return error.message || error.error_description || jsonStr
        }
      } catch {
        // ignore
      }
    }

    if (error?.message && typeof error.message === 'string' && error.message.trim()) {
      alert(error.message)
      return error.message
    }

    if (error?.error_description && typeof error.error_description === 'string' && error.error_description.trim()) {
      alert(error.error_description)
      return error.error_description
    }

    if (isObject) {
      try {
        let jsonStr = JSON.stringify(error, null, 2)
        if (!jsonStr || jsonStr === '{}') {
          const props = Object.getOwnPropertyNames(error)
          jsonStr = JSON.stringify(error, props, 2)
        }
        if (jsonStr && jsonStr !== '{}') {
          alert(jsonStr)
          return jsonStr
        }
      } catch {
        // ignore
      }
    }

    const text = typeof error === 'string' ? error : (error?.toString() || 'เกิดข้อผิดพลาดจาก Supabase')
    alert(text)
    return text
  }

  // 1. ฟังก์ชันส่ง OTP ไปยังอีเมลผู้ใช้
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // สร้างบัญชีอัตโนมัติหากยังไม่มีในฐานข้อมูล
        },
      })

      setLoading(false)

      if (error) {
        const errorMsg = handleSupabaseError(error)
        setMessage({ type: 'error', text: `ส่ง OTP ล้มเหลว: ${errorMsg}` })
      } else {
        setStep('verify')
        setMessage({
          type: 'success',
          text: 'ส่งรหัส OTP เรียบร้อยแล้ว! สามารถเช็กรหัส 6 หลักได้ใน Mailtrap Inbox',
        })
      }
    } catch (err: any) {
      setLoading(false)
      const errorMsg = handleSupabaseError(err)
      setMessage({ type: 'error', text: `ส่ง OTP ล้มเหลว: ${errorMsg}` })
    }
  }

  // 2. ฟังก์ชันยืนยันรหัส OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      setLoading(false)

      if (error) {
        const errorMsg = handleSupabaseError(error)
        setMessage({ type: 'error', text: `รหัส OTP ไม่ถูกต้อง: ${errorMsg}` })
      } else {
        setMessage({
          type: 'success',
          text: `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${data.user?.email}`,
        })
      }
    } catch (err: any) {
      setLoading(false)
      const errorMsg = handleSupabaseError(err)
      setMessage({ type: 'error', text: `รหัส OTP ไม่ถูกต้อง: ${errorMsg}` })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-md border border-gray-100 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pornpong Plastic</h2>
        <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบด้วย Email OTP</p>
      </div>

      {step === 'request' ? (
        /* Form ขอรหัส OTP */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมลของคุณ
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'กำลังส่ง...' : 'ขอรหัส OTP'}
          </button>
        </form>
      ) : (
        /* Form กรอกรหัส OTP */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2 text-center">
              กรอกรหัส OTP 6 หลักที่ส่งไปยัง <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('request')
              setMessage(null)
            }}
            className="w-full text-xs text-gray-500 hover:text-gray-700 transition py-1 text-center block"
          >
            ← เปลี่ยนอีเมล
          </button>
        </form>
      )}

      {/* กล่องแสดง ข้อความแจ้งเตือน / Error */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm text-center ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
