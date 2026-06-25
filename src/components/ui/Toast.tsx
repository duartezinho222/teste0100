'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={cn('toast animate-slide-up', {
      'toast-gain':   type === 'success',
      'toast-loss':   type === 'error',
      'toast-accent': type === 'info',
    })}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  )
}

// Simple hook for toast management
import { useCallback } from 'react'

interface ToastState { message: string; type: 'success' | 'error' | 'info'; id: number }

let _setToast: ((t: ToastState | null) => void) | null = null

export function useToast() {
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    _setToast?.({ message, type, id: Date.now() })
  }, [])
  return { show }
}

export function ToastProvider() {
  const [toast, setToast] = useState<ToastState | null>(null)
  useEffect(() => { _setToast = setToast; return () => { _setToast = null } }, [])
  if (!toast) return null
  return <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
}
