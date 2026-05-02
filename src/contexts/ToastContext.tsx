'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Toast from '@/components/Toast'

interface Toast {
  id: string
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showError = (message: string, duration?: number) => showToast(message, 'error', duration)
  const showWarning = (message: string, duration?: number) => showToast(message, 'warning', duration)
  const showSuccess = (message: string, duration?: number) => showToast(message, 'success', duration)
  const showInfo = (message: string, duration?: number) => showToast(message, 'info', duration)

  const value: ToastContextType = {
    showToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
