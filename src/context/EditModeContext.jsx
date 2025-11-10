import { createContext, useContext, useState, useEffect } from 'react'

const EditModeContext = createContext()

export const useEditMode = () => {
  const context = useContext(EditModeContext)
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider')
  }
  return context
}

export const EditModeProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('editMode')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('editMode', isEditMode.toString())
  }, [isEditMode])

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev)
  }

  return (
    <EditModeContext.Provider value={{ isEditMode, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  )
}
