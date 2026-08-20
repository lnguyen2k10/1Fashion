'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'

export function AnalyticsChart({ businessId }: { businessId: string }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!businessId) return;
      try {
        const supabase = createClient();
        const { data: analytics, error } = await supabase.rpc('get_shop_analytics_with_bonus', {
          p_business_id: businessId,
          p_days: 30
        });

        if (error) {
          console.error('Error fetching analytics:', error);
          return;
        }

        if (analytics) {
          // Format data for chart
          const formattedData = analytics.map((row: any) => {
            const d = new Date(row.metric_date);
            return {
              date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
              views: row.total_views, // Use total_views (real + bonus)
              clicks: row.clicks
            };
          }).reverse(); // RPC returns newest first, reverse for chart (left to right)
          
          setData(formattedData);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      }
    }
    fetchData();
  }, [businessId])

  return (
    <div className="bg-white border border-[#D4AF37]/20 rounded-[2rem] p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] w-full h-[300px]">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Lưu lượng truy cập (30 ngày)</h3>
      <div className="w-full h-full pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A1A1AA' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 10, fill: '#A1A1AA' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
              labelStyle={{ fontWeight: 'bold', color: '#2F2F2F', marginBottom: '4px' }}
            />
            <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#D4AF37" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="clicks" name="Lượt tương tác" stroke="#D4AF37" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
