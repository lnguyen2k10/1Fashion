'use client'

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface StarRatingProps {
  businessId: string;
  themeColor: string;
}

export function StarRating({ businessId, themeColor }: StarRatingProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [avgRating, setAvgRating] = useState(5.0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    // check if user rated before in localStorage
    if (localStorage.getItem(`rated_${businessId}`)) {
      setHasRated(true)
    }
  }, [businessId])

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId)
    
    if (data && data.length > 0) {
      setTotalReviews(data.length)
      const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
      setAvgRating(sum / data.length)
    }
  }

  const handleRate = async (value: number) => {
    if (hasRated) return
    setRating(value)
    setHasRated(true)
    localStorage.setItem(`rated_${businessId}`, 'true')

    try {
      const { error } = await supabase.from('reviews').insert([{
        business_id: businessId,
        author_name: 'Khách hàng',
        rating: value
      }])
      
      if (error) throw error
      toast.success('Cảm ơn bạn đã đánh giá!')
      fetchStats() // refresh
    } catch (err: any) {
      toast.error('Lỗi khi gửi đánh giá: ' + err.message)
      setHasRated(false)
      localStorage.removeItem(`rated_${businessId}`)
    }
  }

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={hasRated}
            onMouseEnter={() => !hasRated && setHoverRating(star)}
            onMouseLeave={() => !hasRated && setHoverRating(0)}
            onClick={() => handleRate(star)}
            className="transition-transform hover:scale-110 focus:outline-none disabled:cursor-default"
          >
            <Star 
              size={18} 
              fill={star <= (hoverRating || (hasRated ? rating : avgRating)) ? '#FBBF24' : 'transparent'} 
              color={star <= (hoverRating || (hasRated ? rating : avgRating)) ? '#FBBF24' : 'rgba(255,255,255,0.5)'} 
            />
          </button>
        ))}
      </div>
      <div className="text-white text-xs font-medium border-l border-white/20 pl-4">
        {avgRating.toFixed(1)} <span className="opacity-60">({totalReviews} đánh giá)</span>
      </div>
    </div>
  )
}
