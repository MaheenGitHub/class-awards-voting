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
  placeholder = "Search student by name or roll number...",
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
    <div ref={dropdownRef} className="professional-dropdown">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedStudent ? `${selectedStudent.rollNumber} - ${selectedStudent.name}` : '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="professional-input"
        />
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Selected Student Indicator */}
        {selectedStudent && !isOpen && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="professional-dropdown-list">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                onClick={() => handleSelect(student)}
                className={`professional-dropdown-item ${
                  index === highlightedIndex ? 'highlighted' : ''
                } ${value === student.id ? 'selected' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {student.rollNumber && `${student.rollNumber} - `}{student.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="description-text text-gray-500">No students found</p>
              <p className="small-text text-gray-400 mt-1">Try searching by name or roll number</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
