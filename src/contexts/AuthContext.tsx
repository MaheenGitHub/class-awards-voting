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
import { getStudents } from '@/lib/firestore'
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
        // Strictly validate domain - must end with @bitf22m0--.pucit.edu.pk
        const userEmail = firebaseUser.email || ''
        if (!isValidDomain(userEmail)) {
          // Immediately sign out the unauthorized user
          await signOut(auth)
          console.error('Please use your BITF22 student email (bitf22mXXX@pucit.edu.pk) to participate!')
          setIsLoading(false)
          return
        }

        // Verify user is in the students collection (BITF22 batch verification)
        try {
          const students = await getStudents()
          const isStudentInBatch = students.some(student => 
            student.rollNumber?.toLowerCase() === userEmail.split('@')[0].toLowerCase()
          )
          
          if (!isStudentInBatch) {
            // Sign out if not in the students collection
            await signOut(auth)
            console.error('Your email is not registered in the class student list. Please contact the administrator.')
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('Error verifying student:', error)
          // Allow login but show warning if student verification fails
          console.warn('Could not verify student enrollment. Please contact the administrator if you believe this is an error.')
        }

        setUser(firebaseUser)
        setIsAdminUser(isAdmin(userEmail))
        
        // Create anonymous user data
        const anonymousId = createAnonymousUserId(userEmail)
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
      const result = await signInWithPopup(auth, googleProvider)
      
      // Additional immediate validation - double check email domain
      const userEmail = result.user.email || ''
      if (!isValidDomain(userEmail)) {
        // Sign out immediately if domain is invalid
        await signOut(auth)
        console.error('Please use your BITF22 student email (bitf22mXXX@pucit.edu.pk) to participate!')
        throw new Error('Unauthorized email domain')
      }
      
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
      throw error instanceof Error ? error : new Error('Sign out failed')
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
