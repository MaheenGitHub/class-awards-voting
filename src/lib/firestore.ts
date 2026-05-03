import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { Student, Category, Vote, UserVote, VoteResults } from '@/types'
import crypto from 'crypto'

// Collections
const STUDENTS_COLLECTION = 'students'
const CATEGORIES_COLLECTION = 'categories'
const VOTES_COLLECTION = 'votes'
const USER_VOTES_COLLECTION = 'userVotes'

// Hash function for user ID anonymization
const hashUserId = (userId: string): string => {
  // Use SHA-256 with a secret salt for hashing
  const secretSalt = 'bitf22-voting-secret-2024'
  return crypto.createHash('sha256').update(userId + secretSalt).digest('hex')
}

// Students
export const getStudents = async (): Promise<Student[]> => {
  const studentsRef = collection(db, STUDENTS_COLLECTION)
  const snapshot = await getDocs(studentsRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Student[]
}

export const addStudent = async (student: Omit<Student, 'id'>) => {
  const studentsRef = collection(db, STUDENTS_COLLECTION)
  const docRef = doc(studentsRef)
  await setDoc(docRef, student)
  return docRef.id
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION)
  const snapshot = await getDocs(categoriesRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[]
}

export const addCategory = async (category: Omit<Category, 'id'>) => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION)
  const docRef = doc(categoriesRef)
  await setDoc(docRef, category)
  return docRef.id
}

// Votes - Transaction-based for atomic operations
export const submitVote = async (userId: string, categoryId: string, studentId: string) => {
  // Hash the user ID for true anonymity
  const hashedUserId = hashUserId(userId)
  
  // Use writeBatch for atomic operations
  const batch = writeBatch(db)
  
  // Add vote to votes collection with auto-generated ID
  const votesRef = collection(db, VOTES_COLLECTION)
  const voteDocRef = doc(votesRef)
  batch.set(voteDocRef, {
    categoryId,
    studentId,
    anonymousUserId: hashedUserId, // Store hashed ID, not plain UID
    timestamp: Timestamp.now(),
  })

  // Update user votes atomically using hashed ID
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, hashedUserId)
  const userVoteDoc = await getDoc(userVoteRef)
  
  if (userVoteDoc.exists()) {
    batch.update(userVoteRef, {
      [categoryId]: studentId,
      lastUpdated: Timestamp.now(),
    })
  } else {
    batch.set(userVoteRef, {
      [categoryId]: studentId,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    })
  }
  
  // Commit the batch atomically
  await batch.commit()
}

export const getUserVotes = async (userId: string): Promise<UserVote> => {
  // Hash the user ID for lookup
  const hashedUserId = hashUserId(userId)
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, hashedUserId)
  const docSnap = await getDoc(userVoteRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    // Remove metadata fields
    const { createdAt, lastUpdated, ...votes } = data
    return votes as UserVote
  }
  
  return {}
}

export const hasUserVoted = async (userId: string): Promise<boolean> => {
  // Hash the user ID for lookup
  const hashedUserId = hashUserId(userId)
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, hashedUserId)
  const docSnap = await getDoc(userVoteRef)
  return docSnap.exists()
}

export const getVoteResults = async (): Promise<VoteResults[]> => {
  const categories = await getCategories()
  const students = await getStudents()
  
  const results: VoteResults[] = []
  
  for (const category of categories) {
    const votesQuery = query(
      collection(db, VOTES_COLLECTION),
      where('categoryId', '==', category.id)
    )
    const votesSnapshot = await getDocs(votesQuery)
    
    // Count votes per student
    const voteCounts: { [key: string]: number } = {}
    votesSnapshot.docs.forEach(doc => {
      const vote = doc.data()
      const studentId = vote.studentId
      voteCounts[studentId] = (voteCounts[studentId] || 0) + 1
    })
    
    // Create results array
    const votes = Object.entries(voteCounts)
      .map(([studentId, voteCount]) => {
        const student = students.find(s => s.id === studentId)
        return {
          studentId,
          studentName: student?.name || 'Unknown',
          voteCount,
        }
      })
      .sort((a, b) => b.voteCount - a.voteCount)
    
    results.push({
      categoryId: category.id,
      categoryTitle: category.title,
      votes,
    })
  }
  
  return results
}

// Initialize sample data
export const initializeSampleData = async () => {
  // Sample students
  const sampleStudents: Omit<Student, 'id'>[] = [
    { name: 'Ali Ahmed', rollNumber: 'BITF22M001' },
    { name: 'Sara Khan', rollNumber: 'BITF22M002' },
    { name: 'Muhammad Usman', rollNumber: 'BITF22M003' },
    { name: 'Fatima Sheikh', rollNumber: 'BITF22M004' },
    { name: 'Ahmed Raza', rollNumber: 'BITF22M005' },
  ]

  // Sample categories
  const sampleCategories: Omit<Category, 'id'>[] = [
    { title: 'Most Funny', description: 'The person who always makes everyone laugh', emoji: '😂' },
    { title: 'Most Late', description: 'Always fashionably late to class', emoji: '⏰' },
    { title: 'Theeta', description: 'The academic genius of the class', emoji: '🎓' },
    { title: 'Most Helpful', description: 'Always ready to help classmates', emoji: '🤝' },
    { title: 'Best Dressed', description: 'Fashion icon of the class', emoji: '👔' },
  ]

  // Add students if they don't exist
  for (const student of sampleStudents) {
    await addStudent(student)
  }

  // Add categories if they don't exist
  for (const category of sampleCategories) {
    await addCategory(category)
  }
}
