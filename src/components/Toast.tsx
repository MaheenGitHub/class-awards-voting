'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '😢'
      case 'warning':
        return '⚠️'
      case 'success':
        return '🎉'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${getToastStyles()} ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3 flex-shrink-0">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-medium text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-3 flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
