'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCategories, getStudents, submitVote, getUserVotes, hasUserVoted } from '@/lib/firestore'
import { Category, Student } from '@/types'
import SearchableDropdown from './SearchableDropdown'

// Category types for pagination
const CATEGORY_TYPES = {
  ACADEMIC: 'Academic Awards',
  PERSONALITY: 'Personality Awards', 
  FUNNY: 'Funny Awards',
  SPECIAL: 'Special Recognition'
} as const

export default function VotingInterface() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(CATEGORY_TYPES.ACADEMIC)
  const [currentPage, setCurrentPage] = useState(0)
  const categoriesPerPage = 8

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [categoriesData, studentsData, votesData, votedStatus] = await Promise.all([
          getCategories(),
          getStudents(),
          getUserVotes(user.email || ''),
          hasUserVoted(user.email || '')
        ])

        setCategories(categoriesData)
        setStudents(studentsData)
        setUserVotes(votesData)
        setHasVoted(votedStatus)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Categorize categories for pagination
  const categorizeCategories = (): Record<string, Category[]> => {
    const academic = categories.filter(cat => 
      cat.title.toLowerCase().includes('academic') || 
      cat.title.toLowerCase().includes('study') ||
      cat.title.toLowerCase().includes('grade') ||
      cat.title.toLowerCase().includes('project')
    )
    
    const personality = categories.filter(cat => 
      cat.title.toLowerCase().includes('friendly') || 
      cat.title.toLowerCase().includes('helpful') ||
      cat.title.toLowerCase().includes('leader') ||
      cat.title.toLowerCase().includes('creative')
    )
    
    const funny = categories.filter(cat => 
      cat.title.toLowerCase().includes('funny') || 
      cat.title.toLowerCase().includes('meme') ||
      cat.title.toLowerCase().includes('joke') ||
      cat.title.toLowerCase().includes('late')
    )
    
    const special = categories.filter(cat => 
      !academic.includes(cat) && !personality.includes(cat) && !funny.includes(cat)
    )

    return {
      [CATEGORY_TYPES.ACADEMIC]: academic,
      [CATEGORY_TYPES.PERSONALITY]: personality,
      [CATEGORY_TYPES.FUNNY]: funny,
      [CATEGORY_TYPES.SPECIAL]: special
    }
  }

  const categorizedCategories = categorizeCategories()
  const currentCategories = categorizedCategories[activeTab] || []
  const totalPages = Math.ceil(currentCategories.length / categoriesPerPage)
  const startIndex = currentPage * categoriesPerPage
  const endIndex = startIndex + categoriesPerPage
  const paginatedCategories = currentCategories.slice(startIndex, endIndex)

  const handleVoteChange = (categoryId: string, studentId: string) => {
    setUserVotes((prev: Record<string, string>) => ({
      ...prev,
      [categoryId]: studentId
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    const completedVotes = Object.keys(userVotes).length
    const totalCategories = categories.length

    if (completedVotes !== totalCategories) {
      alert(`Please vote for all ${totalCategories} categories before submitting.`)
      return
    }

    setIsSubmitting(true)
    try {
      // Submit votes for each category
      for (const [categoryId, studentId] of Object.entries(userVotes)) {
        await submitVote(user.email || '', categoryId, studentId)
      }
      setHasVoted(true)
    } catch (error) {
      console.error('Error submitting votes:', error)
      alert('Error submitting votes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(0)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="floating-shapes"></div>
        <div className="text-center fade-in relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-pink-300 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl bounce-cute">🌟</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3" style={{ fontFamily: 'Comfortaa, cursive' }}>
            Loading voting data...
          </p>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">
            Getting your categories ready 🎊
          </p>
        </div>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="floating-shapes"></div>
        <div className="max-w-lg w-full text-center relative z-10">
          <div className="card-cute shadow-2xl fade-in p-12">
            <div className="text-9xl mb-8 scale-in wiggle">🎉</div>
            <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-6" style={{ fontFamily: 'Comfortaa, cursive' }}>
              Your votes have been submitted!
            </h2>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-3xl opacity-20">👀</div>
              <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4 font-bold">
                Results coming soon... 👀
              </p>
              <p className="text-gray-600 dark:text-gray-400 italic">
                Stay tuned for the reveal!
              </p>
            </div>
            <h2 className="title-text text-2xl mb-4">Voting Complete!</h2>
            <p className="description-text mb-6">
              Your votes have been successfully submitted. Results will be announced soon.
            </p>
            <div className="professional-badge mx-auto">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Thank you for participating</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const completedVotes = Object.keys(userVotes).length
  const totalCategories = categories.length
  const progressPercentage = (completedVotes / totalCategories) * 100

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sticky Progress Header */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h1 className="title-text text-xl">Class Voting Awards</h1>
              <div className="professional-badge">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Logged in as {user?.email?.split('@')[0]}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="title-text text-lg">{completedVotes}/{totalCategories}</div>
              <div className="small-text">categories completed</div>
            </div>
          </div>
          
          <div className="professional-progress">
            <div 
              className="professional-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="professional-tabs mb-8">
          {Object.values(CATEGORY_TYPES).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`professional-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
              <span className="ml-2 small-text">
                ({categorizedCategories[tab]?.length || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Category Cards */}
        <div className="professional-grid mb-8">
          {paginatedCategories.map((category: Category, index: number) => (
            <div
              key={category.id}
              className="professional-card p-6 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start mb-4">
                <div className="text-2xl mr-3">{category.emoji}</div>
                <div className="flex-1">
                  <h3 className="title-text mb-2">{category.title}</h3>
                  <p className="description-text">{category.description}</p>
                </div>
              </div>
              
              <SearchableDropdown
                students={students}
                value={userVotes[category.id] || ''}
                onChange={(studentId) => handleVoteChange(category.id, studentId)}
                placeholder="Search student by name or roll number..."
                disabled={hasVoted}
              />
              
              {userVotes[category.id] && (
                <div className="mt-4 flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="small-text font-medium">Vote selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="professional-button"
              style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    i === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="professional-button"
              style={{ opacity: currentPage === totalPages - 1 ? 0.5 : 1 }}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Submit Section */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || completedVotes !== totalCategories}
            className="professional-button text-lg px-8 py-3"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit All Votes
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
          
          {completedVotes !== totalCategories && (
            <p className="small-text mt-4">
              Please complete all {totalCategories} categories before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
