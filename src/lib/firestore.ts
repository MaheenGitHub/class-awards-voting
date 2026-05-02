import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { Student, Category, Vote, UserVote, VoteResults } from '@/types'

// Collections
const STUDENTS_COLLECTION = 'students'
const CATEGORIES_COLLECTION = 'categories'
const VOTES_COLLECTION = 'votes'
const USER_VOTES_COLLECTION = 'userVotes'

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

// Votes
export const submitVote = async (anonymousUserId: string, categoryId: string, studentId: string) => {
  const voteRef = doc(db, VOTES_COLLECTION)
  await setDoc(voteRef, {
    categoryId,
    studentId,
    anonymousUserId,
    timestamp: Timestamp.now(),
  })

  // Update user votes
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, anonymousUserId)
  const userVoteDoc = await getDoc(userVoteRef)
  
  if (userVoteDoc.exists()) {
    await updateDoc(userVoteRef, {
      [categoryId]: studentId,
      lastUpdated: Timestamp.now(),
    })
  } else {
    await setDoc(userVoteRef, {
      [categoryId]: studentId,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    })
  }
}

export const getUserVotes = async (anonymousUserId: string): Promise<UserVote> => {
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, anonymousUserId)
  const docSnap = await getDoc(userVoteRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    // Remove metadata fields
    const { createdAt, lastUpdated, ...votes } = data
    return votes as UserVote
  }
  
  return {}
}

export const hasUserVoted = async (anonymousUserId: string): Promise<boolean> => {
  const userVoteRef = doc(db, USER_VOTES_COLLECTION, anonymousUserId)
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
