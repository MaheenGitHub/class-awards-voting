'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCategories, getStudents, submitVote, getUserVotes, hasUserVoted } from '@/lib/firestore'
import { Category, Student, UserVote } from '@/types'
import SearchableDropdown from './SearchableDropdown'

export default function VotingInterface() {
  const { user, anonymousUser } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [userVotes, setUserVotes] = useState<UserVote>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (anonymousUser) {
      checkIfUserHasVoted()
    }
  }, [anonymousUser])

  const checkIfUserHasVoted = async () => {
    if (!anonymousUser) return
    
    try {
      const hasVotedBefore = await hasUserVoted(anonymousUser.anonymousId)
      if (hasVotedBefore) {
        setHasVoted(true)
        // Load existing votes
        const existingVotes = await getUserVotes(anonymousUser.anonymousId)
        setUserVotes(existingVotes)
      }
    } catch (error) {
      console.error('Error checking vote status:', error)
    }
  }

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
    if (hasVoted) return // Prevent changes after submission
    
    setUserVotes(prev => ({
      ...prev,
      [categoryId]: studentId,
    }))

    // Auto-scroll to next category after selection
    setTimeout(() => {
      const currentIndex = categories.findIndex(cat => cat.id === categoryId)
      if (currentIndex !== -1 && currentIndex < categories.length - 1) {
        const nextCategoryId = categories[currentIndex + 1].id
        const nextElement = document.getElementById(`category-${nextCategoryId}`)
        if (nextElement) {
          nextElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      }
    }, 300) // Small delay to allow UI update
  }

  const handleSubmit = async () => {
    if (!anonymousUser || !user) return

    // Check if user has already voted
    if (hasVoted) {
      alert('You have already submitted your votes. Each user can only vote once.')
      return
    }

    // Check if user has voted for all categories
    const unvotedCategories = categories.filter(cat => !userVotes[cat.id])
    if (unvotedCategories.length > 0) {
      alert(`Please vote for all categories before submitting. You have ${unvotedCategories.length} remaining.`)
      return
    }

    // Show review screen instead of submitting directly
    setShowReview(true)
  }

  const handleFinalSubmit = async () => {
    if (!anonymousUser) return
    
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
        <div className="text-8xl mb-6 animate-bounce-soft">🎉</div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
          Your votes have been submitted!
        </h2>
        <div className="bg-gradient-to-r from-pastel-pink to-pastel-purple rounded-2xl p-6 mb-6 max-w-md mx-auto">
          <p className="text-lg text-gray-700 mb-3">
            Results coming soon... 👀
          </p>
          <p className="text-gray-600 italic">
            Stay tuned for the reveal!
          </p>
        </div>
        <div className="flex justify-center space-x-2">
          <span className="text-2xl animate-pulse">⭐</span>
          <span className="text-2xl animate-pulse delay-100">🏆</span>
          <span className="text-2xl animate-pulse delay-200">🎊</span>
        </div>
      </div>
    )
  }

  const completedVotes = Object.keys(userVotes).length
  const totalCategories = categories.length
  const progressPercentage = (completedVotes / totalCategories) * 100

  // Review Screen Component
  if (showReview) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Review Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Review your votes 👇
          </h2>
          <p className="text-gray-600 text-center">
            Please review your selections before submitting. This action cannot be undone.
          </p>
        </div>

        {/* Review List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {categories.map((category) => {
              const selectedStudent = students.find(s => s.id === userVotes[category.id])
              return (
                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{category.title}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary-600">
                      {selectedStudent?.name || 'Not selected'}
                    </div>
                    {selectedStudent?.rollNumber && (
                      <div className="text-sm text-gray-500">
                        ({selectedStudent.rollNumber})
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Review Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowReview(false)}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit ✅
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Trust Message */}
      <div className="bg-gradient-to-r from-pastel-green to-pastel-blue rounded-2xl shadow-lg p-6 mb-8 border-2 border-green-300">
        <div className="flex items-center justify-center mb-4">
          <span className="text-3xl mr-3">🔒</span>
          <h3 className="text-xl font-bold text-gray-800">
            Your vote is anonymous.
          </h3>
        </div>
        <div className="bg-white/80 rounded-xl p-4 mb-3">
          <p className="text-lg font-semibold text-gray-700 text-center">
            Your email is NOT stored or linked to your answers.
          </p>
        </div>
        <p className="text-gray-600 text-center text-sm">
          Your email is only used once to verify you belong to the class.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-primary-600">
            {completedVotes}/{totalCategories} completed
          </span>
        </div>
        
        {/* Visual Progress Blocks */}
        <div className="flex gap-1 mb-2">
          {Array.from({ length: totalCategories }, (_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index < completedVotes
                  ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                  : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
        
        {/* Progress Text with Blocks */}
        <div className="text-center">
          <span className="text-lg font-mono text-gray-700">
            {Array.from({ length: totalCategories }, (_, index) => (
              <span
                key={index}
                className={`inline-block w-6 h-6 mx-0.5 rounded text-xs font-bold leading-6 transition-all duration-300 ${
                  index < completedVotes
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < completedVotes ? '✓' : ''}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Voting Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div
            key={category.id}
            id={`category-${category.id}`}
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
            
            <SearchableDropdown
              students={students}
              value={userVotes[category.id] || ''}
              onChange={(studentId) => handleVoteChange(category.id, studentId)}
              placeholder="Search student by name or roll number..."
              disabled={hasVoted}
            />
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
