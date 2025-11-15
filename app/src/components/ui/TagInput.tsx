import React, { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

export interface TagInputProps {
  label?: string
  placeholder?: string
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  error?: string
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder = 'Type and press Enter',
  tags,
  onChange,
  maxTags,
  error,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    if (tags.includes(trimmedTag)) return
    if (maxTags && tags.length >= maxTags) return

    onChange([...tags, trimmedTag])
    setInputValue('')
  }

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={`flex flex-wrap gap-2 p-3 border-2 rounded-xl bg-white transition-all ${
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200'
            : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={maxTags ? tags.length >= maxTags : false}
          className="flex-1 min-w-[120px] outline-none text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {maxTags && (
        <p className="text-gray-500 text-xs mt-1">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  )
}
