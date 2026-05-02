'use client'

import { useState, useRef, useEffect } from 'react'
import { Student } from '@/types'

interface SearchableDropdownProps {
  students: Student[]
  value: string
  onChange: (studentId: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function SearchableDropdown({ 
  students, 
  value, 
  onChange, 
  placeholder = "Select a student...",
  disabled = false 
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get selected student info
  const selectedStudent = students.find(s => s.id === value)

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.rollNumber?.toLowerCase().includes(searchLower)
    )
  })

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredStudents.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0) {
            onChange(filteredStudents[highlightedIndex].id)
            setIsOpen(false)
            setSearchTerm('')
            setHighlightedIndex(-1)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredStudents, onChange])

  const handleSelect = (student: Student) => {
    onChange(student.id)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedStudent ? `${selectedStudent.rollNumber} - ${selectedStudent.name}` : '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors appearance-none cursor-pointer ${
            disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-white border-gray-200 hover:border-primary-300 focus:border-primary-400'
          }`}
        />
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Selected Student Checkmark */}
        {selectedStudent && !isOpen && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <span className="text-green-500">✓</span>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                onClick={() => handleSelect(student)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-100'
                } ${value === student.id ? 'bg-primary-50 text-primary-600 font-medium' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {student.rollNumber && `${student.rollNumber} - `}{student.name}
                  </span>
                </div>
                {value === student.id && (
                  <div className="text-xs text-primary-600 mt-1">✓ Selected</div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No students found</p>
              <p className="text-sm mt-1">Try searching by name or roll number</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
