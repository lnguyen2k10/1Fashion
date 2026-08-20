'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image';
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { uploadShopImage } from '@/lib/storage/shop-images'
import { Settings } from 'lucide-react'
import { useDashboard } from '../DashboardClientWrapper'

export default function BusinessDashboardSettings() {
  const { user, profile, setProfile } = useDashboard()

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') toast.success(message)
    else if (type === 'error') toast.error(message)
    else toast(message)
  }, [])

  // Personal Profile & Security States
  const [fullName, setFullName] = useState('')
  const [personalAvatar, setPersonalAvatar] = useState('')
  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [newEmailInput, setNewEmailInput] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '')
      setPersonalAvatar(user.user_metadata?.avatar_url || '')
      setNewEmailInput(user.email || '')
    }
  }, [user])

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPersonal(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: personalAvatar }
      })
      if (error) throw error
      showToast('Cập nhật hồ sơ cá nhân thành công!')
    } catch (err: any) {
      showToast('Cập nhật thất bại: ' + (err.message || err), 'error')
    } finally {
      setIsSavingPersonal(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Kích thước ảnh đại diện phải nhỏ hơn 2MB!', 'error')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const publicUrl = await uploadShopImage(file, 'avatar')
      setPersonalAvatar(publicUrl)
      showToast('Tải ảnh đại diện thành công! Vui lòng bấm Lưu.')
    } catch (err: any) {
      showToast('Tải ảnh thất bại: ' + (err.message || err), 'error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error')
      return
    }

    setIsSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      if (error) throw error
      showToast('Đổi mật khẩu thành công!')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showToast('Đổi mật khẩu thất bại: ' + (err.message || err), 'error')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newEmailInput === user?.email) {
      showToast('Email mới phải khác email hiện tại', 'error')
      return
    }

    setIsSavingEmail(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmailInput })
      if (error) throw error
      showToast('Vui lòng kiểm tra email mới và email cũ để xác nhận việc thay đổi!')
      setIsChangingEmail(false)
    } catch (err: any) {
      showToast('Đổi email thất bại: ' + (err.message || err), 'error')
    } finally {
      setIsSavingEmail(false)
    }
  }

  if (!profile || !user) return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="mx-auto max-w-xl space-y-8 p-4 sm:p-6 md:space-y-10 md:p-8">
      <div className="pt-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-1.5">
          <Settings size={12} /> Cài đặt
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold text-[#2F2F2F] sm:text-3xl">Tài Khoản</h1>
      </div>

      <div className="max-w-xl space-y-8">
        <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-white p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] sm:p-8">
          <h2 className="font-sans text-2xl text-[#2F2F2F] mb-6">Thông tin cá nhân</h2>
          <form onSubmit={handlePersonalSave} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#ffffff] border border-[#D4AF37]/30 overflow-hidden flex items-center justify-center relative group">
                {personalAvatar ? (
                  <Image src={personalAvatar} width={64} height={64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#D4AF37] font-bold text-xl">{(fullName || 'U').charAt(0)}</span>
                )}
                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Đổi</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] border border-zinc-200 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSavingPersonal || isUploadingAvatar}
              className="w-full py-3 bg-[#2F2F2F] text-white font-bold text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
            >
              {isSavingPersonal ? 'Đang lưu...' : 'Lưu hồ sơ cá nhân'}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-white p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] sm:p-8">
          <h2 className="font-sans text-2xl text-[#2F2F2F] mb-6">Bảo mật</h2>
          
          <div className="space-y-6">
            {/* Email Section */}
            <div className="p-4 bg-[#ffffff] rounded-xl border border-zinc-100">
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Email đăng nhập</p>
              {isChangingEmail ? (
                <form onSubmit={handleEmailChange} className="mt-3 flex gap-2">
                  <input 
                    type="email" 
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-[#D4AF37]"
                    required
                  />
                  <button type="submit" disabled={isSavingEmail} className="px-3 py-2 bg-[#D4AF37] text-white rounded-lg text-xs font-bold whitespace-nowrap">
                    {isSavingEmail ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                  <button type="button" onClick={() => setIsChangingEmail(false)} className="px-3 py-2 bg-zinc-200 text-zinc-600 rounded-lg text-xs font-bold">
                    Hủy
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <p className="font-medium text-[#2F2F2F]">{user?.email}</p>
                  <button onClick={() => setIsChangingEmail(true)} className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider hover:underline">
                    Thay đổi
                  </button>
                </div>
              )}
            </div>

            {/* Password Section */}
            <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t border-zinc-100">
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Đổi mật khẩu</p>
              <input 
                type="password" 
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                className="w-full px-4 py-3 bg-[#ffffff] border border-zinc-200 rounded-xl focus:border-[#D4AF37] outline-none text-sm"
                required
              />
              <input 
                type="password" 
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                className="w-full px-4 py-3 bg-[#ffffff] border border-zinc-200 rounded-xl focus:border-[#D4AF37] outline-none text-sm"
                required
              />
              <button 
                type="submit" 
                disabled={isSavingPassword || !passwordForm.newPassword}
                className="w-full py-3 bg-[#2F2F2F] text-white font-bold text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
              >
                {isSavingPassword ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
