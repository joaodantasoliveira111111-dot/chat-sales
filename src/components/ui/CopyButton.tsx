'use client'

import { useState, useCallback } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-[rgba(22,163,74,0.08)] text-[#16A34A] border border-[rgba(22,163,74,0.2)]'
          : 'bg-[#F3F7FB] text-[#35516B] border border-[rgba(8,24,39,0.08)] hover:bg-[#EAF1F8]'
      } ${className}`}
    >
      {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
      {label && <span>{copied ? 'Copiado!' : label}</span>}
    </button>
  )
}
