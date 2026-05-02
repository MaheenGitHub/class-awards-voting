'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getVoteResults, getCategories } from '@/lib/firestore'
import { VoteResults } from '@/types'
import { AuthGuard } from '@/components/AuthGuard'
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  UsersIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  const [results, setResults] = useState<VoteResults[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      loadResults()
    }
  }, [isAdmin])

  const loadResults = async () => {
    try {
      const voteResults = await getVoteResults()
      setResults(voteResults)
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `voting-results-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const exportToCSV = () => {
    let csv = 'Category,Student,Votes\n'
    
    results.forEach(category => {
      category.votes.forEach(vote => {
        csv += `"${category.categoryTitle}","${vote.studentName}",${vote.voteCount}\n`
      })
    })
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    const exportFileDefaultName = `voting-results-${new Date().toISOString().split('T')[0]}.csv`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getTotalVotes = () => {
    return results.reduce((total, category) => {
      return total + category.votes.reduce((catTotal, vote) => catTotal + vote.voteCount, 0)
    }, 0)
  }

  const getTotalVoters = () => {
    // This is approximate - we'd need to track unique voters in a real implementation
    return Math.floor(getTotalVotes() / results.length) || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              View and manage voting results
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-800">{results.length}</p>
                </div>
                <TrophyIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Votes</p>
                  <p className="text-3xl font-bold text-gray-800">{getTotalVotes()}</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Estimated Voters</p>
                  <p className="text-3xl font-bold text-gray-800">{getTotalVoters()}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Results</h2>
            <div className="flex gap-4">
              <button
                onClick={exportToJSON}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export as JSON
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export as CSV
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Voting Results</h2>
            
            {results.map((category) => (
              <div key={category.categoryId} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {category.categoryTitle}
                </h3>
                
                <div className="space-y-3">
                  {category.votes.map((vote, index) => {
                    // Check if this vote is tied with the next one
                    const isTied = index < category.votes.length - 1 && 
                                 category.votes[index + 1].voteCount === vote.voteCount;
                    // Check if this vote is tied with the previous one (to avoid duplicate tie labels)
                    const isPreviousTied = index > 0 && 
                                        category.votes[index - 1].voteCount === vote.voteCount;
                    
                    return (
                      <div key={`${category.categoryId}-${vote.studentId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold mr-3">
                            {isTied && !isPreviousTied ? `T${index + 1}` : index + 1}
                          </div>
                          <span className="font-medium text-gray-800">{vote.studentName}</span>
                          {isTied && !isPreviousTied && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              TIE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="bg-primary-100 px-3 py-1 rounded-full">
                            <span className="text-primary-600 font-semibold">{vote.voteCount}</span>
                            <span className="text-primary-500 text-sm ml-1">votes</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {category.votes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No votes recorded yet for this category
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <p className="text-gray-500">No voting results available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
