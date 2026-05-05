'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', debounceMs = 300 }: SearchInputProps) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (next: string) => {
    setLocal(next)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71869B] pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] text-[#081827] placeholder:text-[#71869B]"
      />
    </div>
  )
}
