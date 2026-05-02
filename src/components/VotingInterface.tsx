'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCategories, getStudents, submitVote, getUserVotes } from '@/lib/firestore'
import { Category, Student, UserVote } from '@/types'

export default function VotingInterface() {
  const { user, anonymousUser } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [userVotes, setUserVotes] = useState<UserVote>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, studentsData] = await Promise.all([
        getCategories(),
        getStudents(),
      ])
      
      setCategories(categoriesData)
      setStudents(studentsData)
      
      if (anonymousUser) {
        const votes = await getUserVotes(anonymousUser.anonymousId)
        setUserVotes(votes)
        setHasVoted(Object.keys(votes).length > 0)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = (categoryId: string, studentId: string) => {
    setUserVotes(prev => ({
      ...prev,
      [categoryId]: studentId,
    }))
  }

  const handleSubmit = async () => {
    if (!anonymousUser || !user) return

    // Check if user has voted for all categories
    const unvotedCategories = categories.filter(cat => !userVotes[cat.id])
    if (unvotedCategories.length > 0) {
      alert(`Please vote for all categories before submitting. You have ${unvotedCategories.length} remaining.`)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Submit all votes
      for (const [categoryId, studentId] of Object.entries(userVotes)) {
        await submitVote(anonymousUser.anonymousId, categoryId, studentId)
      }
      
      setHasVoted(true)
      // Trigger confetti animation
      if (typeof window !== 'undefined') {
        const confetti = require('canvas-confetti')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } catch (error) {
      console.error('Error submitting votes:', error)
      alert('Error submitting votes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Thank you for voting!
        </h2>
        <p className="text-gray-600 mb-4">
          Your vote has been successfully submitted.
        </p>
        <p className="text-gray-500 italic">
          Results will be revealed soon 👀
        </p>
      </div>
    )
  }

  const completedVotes = Object.keys(userVotes).length
  const totalCategories = categories.length
  const progressPercentage = (completedVotes / totalCategories) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Trust Message */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-pastel-green">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🔒</span>
          <h3 className="text-lg font-semibold text-gray-800">
            Your vote is completely anonymous
          </h3>
        </div>
        <p className="text-gray-600 text-center">
          Your email is only used to verify you belong to the class. It is NOT stored or linked to your responses.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-primary-600">
            {completedVotes}/{totalCategories} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Voting Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-lg p-6 card-hover border-2 border-transparent hover:border-primary-200"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{category.emoji}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={userVotes[category.id] || ''}
                onChange={(e) => handleVoteChange(category.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-400 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                disabled={hasVoted}
              >
                <option value="">Select a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.rollNumber && `(${student.rollNumber})`}
                  </option>
                ))}
              </select>
              
              {userVotes[category.id] && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-green-500">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || completedVotes !== totalCategories}
          className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </span>
          ) : (
            'Submit Your Votes'
          )}
        </button>
        
        {completedVotes !== totalCategories && (
          <p className="text-gray-500 mt-2 text-sm">
            Please vote for all categories before submitting
          </p>
        )}
      </div>
    </div>
  )
}
