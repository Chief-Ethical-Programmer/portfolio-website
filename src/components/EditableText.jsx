import { useState, useEffect, useRef } from 'react'
import { useEditMode } from '../context/EditModeContext'
import './EditableText.css'

const EditableText = ({ 
  value, 
  onSave, 
  onChange, // Support both onSave and onChange
  tag: Tag = 'p', 
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  storageKey = null
}) => {
  const { isEditMode } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)
  
  // Initialize from value prop (will be from Supabase if onChange is provided)
  // Only use localStorage if no onChange handler (backward compatibility)
  const [editValue, setEditValue] = useState(() => {
    if (storageKey && !onChange && !onSave) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return saved
      }
    }
    return value
  })
  
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  // Update editValue when value prop changes
  // If onChange/onSave provided, always use value prop (from Supabase)
  // Otherwise check localStorage first (backward compatibility)
  useEffect(() => {
    // Only update if not currently editing to avoid cursor issues
    if (!isEditing) {
      if (onChange || onSave) {
        // Using Supabase - always use value prop
        setEditValue(value)
      } else if (storageKey) {
        // Using localStorage - check saved value
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          setEditValue(saved)
        } else {
          setEditValue(value)
        }
      } else {
        setEditValue(value)
      }
    }
  }, [value, storageKey, onChange, onSave, isEditing])

  const handleClick = () => {
    if (isEditMode) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    
    // Call onSave or onChange callback if provided
    const callback = onChange || onSave
    if (callback && editValue !== value) {
      callback(editValue)
    }
    
    // Only save to localStorage if no callback (backward compatibility)
    // If callback exists, Supabase handles storage
    if (storageKey && !callback) {
      localStorage.setItem(storageKey, editValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      // Revert to saved value or original value
      if (storageKey) {
        const saved = localStorage.getItem(storageKey)
        setEditValue(saved || value)
      } else {
        setEditValue(value)
      }
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline])

  // Always show editValue (which contains saved data), not the original value prop
  const displayValue = editValue || value

  if (!isEditMode) {
    // When not in edit mode, show the saved value (editValue) not the prop value
    return <Tag className={className}>{displayValue}</Tag>
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          className={`editable-input editable-textarea ${className}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
        />
      )
    } else {
      // Always use regular input instead of contentEditable to avoid cursor issues
      return (
        <input
          ref={inputRef}
          type="text"
          className={`editable-input ${className}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      )
    }
  }

  return (
    <Tag 
      className={`editable-text ${className}`}
      onClick={handleClick}
      title="Click to edit"
    >
      {displayValue}
      <span className="edit-indicator">✏️</span>
    </Tag>
  )
}

export default EditableText
