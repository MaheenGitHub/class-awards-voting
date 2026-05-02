export interface Student {
  id: string
  name: string
  rollNumber?: string
}

export interface Category {
  id: string
  title: string
  description: string
  emoji: string
  icon?: string
}

export interface Vote {
  id: string
  categoryId: string
  studentId: string
  userId: string // This will be a hashed/anonymized user ID
  timestamp: Date
}

export interface UserVote {
  [categoryId: string]: string // categoryId -> studentId
}

export interface VoteResults {
  categoryId: string
  categoryTitle: string
  votes: {
    studentId: string
    studentName: string
    voteCount: number
  }[]
}

export interface AuthUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  emailVerified: boolean
}

export interface AnonymousUser {
  anonymousId: string
  hasVoted: boolean
  voteTimestamp?: Date
}
