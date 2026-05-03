'use client'

import { useAuth } from '@/contexts/AuthContext'
import VotingInterface from './VotingInterface'
import { motion } from 'framer-motion'

export default function Authentication() {
  const { user, signIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-300 border-t-purple-600 mx-auto mb-4"></div>
          <p className="title-text" style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 text-4xl opacity-60"
        >
          🎓
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-32 text-3xl opacity-50"
        >
          🏆
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-32 text-2xl opacity-40"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 text-3xl opacity-50"
        >
          🎓
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 text-2xl opacity-30"
        >
          🏆
        </motion.div>

        {/* Main Login Card */}
        <div className="max-w-lg w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="professional-card p-12"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color-light)',
              borderRadius: '2rem',
              boxShadow: '0 25px 50px var(--shadow-purple)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-5xl mb-4"
              >
                🎓
              </motion.div>
              <h1 
                className="mb-4" 
                style={{ 
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  fontFamily: 'Quicksand, sans-serif',
                  lineHeight: '1.2'
                }}
              >
                Class Voting Awards
              </h1>
              <p 
                style={{ 
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: '500'
                }}
              >
                Vote for your classmates in various award categories
              </p>
            </div>

            {/* Anonymity Notice - Lavender Alert Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-8"
              style={{ 
                backgroundColor: 'var(--accent-lavender)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}
            >
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-3" style={{ color: 'var(--accent-purple)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <h3 
                  style={{ 
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: 'Quicksand, sans-serif'
                  }}
                >
                  Your vote is anonymous
                </h3>
              </div>
              <p 
                style={{ 
                  color: 'var(--text-secondary)',
                  fontFamily: 'Quicksand, sans-serif',
                  lineHeight: '1.6'
                }}
              >
                Your email is only used once to verify you belong to the class and is not stored with your votes.
              </p>
            </motion.div>

            {/* Important Notice - Clean Badge Style */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-8"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--border-color-light)',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}
            >
              <div className="flex items-center">
                <span 
                  style={{ 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: 'Quicksand, sans-serif',
                    marginRight: '0.5rem'
                  }}
                >
                  Important:
                </span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'Quicksand, sans-serif' }}>
                  Only students with 
                </span>
                <span 
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: 'var(--accent-pastel)',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    margin: '0 0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  bitf22mXXX@pucit.edu.pk
                </span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'Quicksand, sans-serif' }}>
                  can vote.
                </span>
              </div>
            </motion.div>

            {/* Google Sign-in Button - Large with Purple Gradient */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signIn}
              className="w-full"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple-light))',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                padding: '1.25rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                fontFamily: 'Quicksand, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                boxShadow: '0 8px 25px var(--shadow-color)'
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </motion.button>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-center mt-8"
            >
              <p 
                style={{ 
                  fontSize: '0.9rem',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'Quicksand, sans-serif',
                  lineHeight: '1.5'
                }}
              >
                By signing in, you confirm you are a student of this class and agree to vote only once.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return <VotingInterface />
}
