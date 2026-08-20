'use client'

import { useState, useEffect } from 'react'

interface EditableTextProps {
  value: string
  onChange: (newValue: string) => void
  isEditing: boolean
  className?: string
  multiline?: boolean
}

export const EditableText = ({ value, onChange, isEditing, className = '', multiline = false }: EditableTextProps) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  if (!isEditing) {
    return <span className={className}>{value}</span>
  }

  if (multiline) {
    return (
      <textarea
        className={`bg-transparent border-b border-gold/50 focus:border-gold outline-none w-full ${className}`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onChange(localValue)}
      />
    )
  }

  return (
    <input
      className={`bg-transparent border-b border-gold/50 focus:border-gold outline-none ${className}`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onChange(localValue)}
    />
  )
}
