'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut 
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { createAnonymousUserId, isValidDomain, isAdmin } from '@/lib/auth'
import { AnonymousUser } from '@/types'

interface AuthContextType {
  user: FirebaseUser | null
  anonymousUser: AnonymousUser | null
  isLoading: boolean
  isAdmin: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      
      if (firebaseUser) {
        // Validate domain
        if (!isValidDomain(firebaseUser.email || '')) {
          await signOut(auth)
          setIsLoading(false)
          return
        }

        setUser(firebaseUser)
        setIsAdminUser(isAdmin(firebaseUser.email || ''))
        
        // Create anonymous user data
        const anonymousId = createAnonymousUserId(firebaseUser.email || '')
        setAnonymousUser({
          anonymousId,
          hasVoted: false, // This will be checked from Firestore
        })
      } else {
        setUser(null)
        setAnonymousUser(null)
        setIsAdminUser(false)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    anonymousUser,
    isLoading,
    isAdmin: isAdminUser,
    signIn,
    signOut: signOutUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
