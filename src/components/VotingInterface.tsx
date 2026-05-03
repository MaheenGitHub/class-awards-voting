'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getCategories, getStudents, submitVote, getUserVotes, hasUserVoted } from '@/lib/firestore'
import { Category, Student } from '@/types'

export default function VotingInterface() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (!user || !user.uid) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [categoriesData, studentsData] = await Promise.all([
          getCategories(),
          getStudents()
        ])
        
        // Get user's votes using Firebase Auth UID
        const [votesData, votedStatus] = await Promise.all([
          getUserVotes(user.uid),
          hasUserVoted(user.uid)
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

  const currentCategory = categories[currentCategoryIndex]
  const completedVotes = Object.keys(userVotes).length
  const totalCategories = categories.length
  const progressPercentage = (completedVotes / totalCategories) * 100
  const isLastQuestion = currentCategoryIndex === totalCategories - 1
  const isCurrentCategorySelected = currentCategory && userVotes[currentCategory.id]

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleStudentSelect = (studentId: string) => {
    if (!currentCategory || hasVoted) return
    
    setUserVotes(prev => ({
      ...prev,
      [currentCategory.id]: studentId
    }))
  }

  const handleNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    }
  }

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user || !user.uid) {
      alert('Authentication error. Please log in again.')
      return
    }

    if (completedVotes !== totalCategories) {
      alert(`Please vote for all ${totalCategories} categories before submitting.`)
      return
    }
    
    setIsSubmitting(true)
    try {
      // Submit all votes with retry mechanism
      await submitAllVotesWithRetry(user.uid, userVotes)
      setHasVoted(true)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting votes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Submission failed: ${errorMessage}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Retry mechanism with exponential backoff
  const submitAllVotesWithRetry = async (userId: string, votes: Record<string, string>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Submit each vote atomically
        for (const [categoryId, studentId] of Object.entries(votes)) {
          await submitVote(userId, categoryId, studentId)
        }
        return // Success, exit retry loop
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Attempt ${attempt} failed:`, errorMessage)
        
        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. Please check your connection and try again.`)
        }
        
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="title-text">Loading...</p>
        </div>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="professional-card p-8 text-center fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Elegant Progress Header */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid var(--border-color-light)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <h1 className="title-text text-2xl font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--text-primary)' }}>Class Voting Awards</h1>
              <div className="professional-badge" style={{ backgroundColor: 'var(--accent-lavender)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color-light)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span style={{ marginLeft: '0.5rem', fontFamily: 'Quicksand, sans-serif', color: 'var(--text-primary)' }}>Logged in as {user?.email?.split('@')[0]}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="title-text text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{completedVotes}/{totalCategories}</div>
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

      {/* Split-Screen Layout with Glassmorphism */}
      <div className="flex gap-12 h-screen px-8" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Left Pane - Hero Question Stage */}
        <div className="w-1/2 flex flex-col items-center justify-center relative" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
          {/* Batch of 2026 Badge */}
          <div className="w-full max-w-3xl mb-4">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: 'rgba(196, 181, 253, 0.5)',
                opacity: '1'
              }}
            >
              <span className="text-lg">🎓</span>
              <span 
                className="text-sm font-semibold"
                style={{ 
                  color: '#6B21A8',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              >
                Batch of 2026
              </span>
            </div>
          </div>

          {currentCategory && (
            <div className="w-full max-w-3xl">
              {/* Hero Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCategory.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="hero-stage p-16 text-center mb-10"
                  style={{ 
                    boxShadow: '0 25px 50px var(--shadow-purple)',
                    position: 'relative',
                    zIndex: '10'
                  }}
                >
                  <div className="text-6xl mb-10">{currentCategory.emoji}</div>
                  <h2 
                    className="mb-8" 
                    style={{ 
                      fontSize: '2.25rem',
                      fontWeight: '700',
                      color: '#581C87',
                      fontFamily: 'Quicksand, sans-serif',
                      lineHeight: '1.3',
                      letterSpacing: '-0.025em'
                    }}
                  >
                    {currentCategory.title}
                  </h2>
                  <p 
                    style={{ 
                      fontSize: '1rem',
                      color: '#7C3AED',
                      lineHeight: '1.6',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: '500',
                      marginBottom: '2rem'
                    }}
                  >
                    {currentCategory.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Selected Student Display */}
              {userVotes[currentCategory.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hero-stage p-6 mb-8 text-center"
                  style={{ backgroundColor: 'var(--accent-pastel)' }}
                >
                  <div className="flex items-center justify-center" style={{ color: 'var(--accent-purple)' }}>
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-lg" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--text-primary)' }}>
                      Selected: {students.find(s => s.id === userVotes[currentCategory.id])?.name}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Question Counter or Submission Ready */}
              {completedVotes === totalCategories ? (
                /* Submission Ready View - Clean and Minimal */
                <div className="text-center mb-8 mt-16">
                  <div className="title-text text-4xl font-bold mb-4" style={{ color: 'var(--accent-purple)' }}>
                    🎉 Submission Ready!
                  </div>
                  <div className="title-text text-xl mb-8" style={{ color: 'var(--text-primary)' }}>
                    All {totalCategories} categories completed
                  </div>
                  
                  {/* Buttons - Side by Side */}
                  <div className="flex justify-center gap-4 mb-12">
                    {/* Previous Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePreviousCategory}
                      className="floating-button text-lg px-8 py-4"
                      style={{ 
                        backgroundColor: 'var(--accent-purple)',
                        borderRadius: '9999px',
                        cursor: 'pointer'
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </motion.button>
                    
                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="floating-button text-xl px-16 py-4"
                      style={{ 
                        backgroundColor: '#e11d48',
                        borderRadius: '9999px',
                        boxShadow: '0 10px 30px rgba(225, 29, 72, 0.5)',
                        color: 'white',
                        border: '2px solid white',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit All Votes
                          <svg className="w-5 h-5 ml-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Normal Voting View */
                <>
                  {/* Question Counter */}
                  <div className="text-center mb-8 mt-16">
                    <div className="title-text text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentCategoryIndex + 1} / {totalCategories}</div>
                    <div className="small-text">Question</div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mb-12">
                    {/* Previous Button - Always visible */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePreviousCategory}
                      disabled={currentCategoryIndex === 0}
                      className="floating-button text-lg px-8 mt-8"
                      style={{ 
                        backgroundColor: 'var(--accent-purple)',
                        borderRadius: '9999px'
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </motion.button>

                    {/* Next or Submit Button */}
                    {isLastQuestion ? (
                      /* Submit Button on Last Question */
                      isCurrentCategorySelected ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="floating-button text-lg px-8 mt-8"
                          style={{ 
                            backgroundColor: '#e11d48',
                            borderRadius: '9999px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            color: 'white'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit All Votes
                              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <div className="w-32"></div> /* Empty space to maintain layout */
                      )
                    ) : (
                      /* Next Button on Regular Questions */
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNextCategory}
                        disabled={currentCategoryIndex === categories.length - 1}
                        className="floating-button text-lg px-8 mt-8"
                        style={{ 
                          backgroundColor: 'var(--accent-purple)',
                          borderRadius: '9999px'
                        }}
                      >
                        Next
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Pane - Student Gallery with Advanced Layered Scrolling */}
        <div 
          className="w-1/2 h-[82vh] relative overflow-hidden"
          style={{ 
            backgroundImage: "url('/pics/white_dY.jpeg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}
        >
          {/* Inner Scrollable Container with Glass Effect */}
          <div className="h-full flex flex-col">
            {/* Fixed Header with Search - Lighter Background */}
            <div 
              className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200"
              style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
            >
              <div className="px-8">
                <h3 className="title-text text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--text-primary)' }}>Class Mates</h3>
                
                {/* Search Bar */}
                <div className="search-container">
                  <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Scrollable Student List with Glass Effect */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className="px-8 py-6">
                {/* Student List */}
                <div className="space-y-6">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const isSelected = userVotes[currentCategory?.id || ''] === student.id
                      
                      return (
                        <motion.div
                          key={student.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStudentSelect(student.id)}
                          className={`student-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="flex items-center">
                            <div className="flex items-center mr-6">
                              <span className="text-3xl mr-4">👤</span>
                            </div>
                            <div className="flex-1">
                              <div className="title-text font-semibold text-xl" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--text-primary)' }}>
                                {student.rollNumber}
                              </div>
                              <div className="description-text text-lg" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--text-secondary)' }}>
                                {student.name}
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="flex items-center" style={{ color: 'var(--accent-purple)' }}>
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <div>No classmate found</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <h1 style={{color: 'red', fontSize: '4rem', position: 'fixed', top: '10px', left: '10px', zIndex: 9999}}>HELLO MAHEEN</h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backgroundImage: "url('/pics/COLOURS.jpeg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ 
                padding: '2rem',
                maxWidth: '28rem',
                width: '100%',
                margin: '0 auto',
                position: 'relative',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                minHeight: '400px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Content */}
              <div style={{ 
                textAlign: 'center',
                position: 'relative',
                zIndex: 20
              }}>
                {/* Success Message */}
                <div className="mb-8">
                  <h2 
                    className="mb-4"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: 'white',
                      fontFamily: 'Quicksand, sans-serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    🎉 Thank You!
                  </h2>
                  <p 
                    style={{
                      fontSize: '1.4rem',
                      color: 'white',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: '600',
                      lineHeight: '1.6',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    Congrats BITF22! <br />
                    Memories last forever
                  </p>
                </div>
                
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="floating-button w-full"
                  style={{
                    backgroundColor: '#e11d48',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '1rem',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(225, 29, 72, 0.5)'
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

          </div>
  )
}
