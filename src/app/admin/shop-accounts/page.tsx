'use client'

import { ShopProvisioning } from '../users/ShopProvisioning'
export default function ShopAccountsPage() {
  return <main className="mx-auto max-w-6xl space-y-6 p-8">
    <header>
      <h1 className="text-3xl font-bold">Khởi tạo tài khoản shop</h1>
      <p className="mt-2 text-sm text-zinc-500">Tạo tài khoản riêng lẻ khi gặp khách hàng hoặc nhập danh sách hàng loạt từ CSV.</p>
    </header>
    <ShopProvisioning onCreated={() => undefined} />
  </main>
}
