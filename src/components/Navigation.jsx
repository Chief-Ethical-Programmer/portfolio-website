import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'
import { useEditMode } from '../context/EditModeContext'
import AdminLogin from './AdminLogin'
import { supabase } from '../config/supabase'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminButton, setShowAdminButton] = useState(false)
  const { toggleEditMode, isEditMode } = useEditMode()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Secret key combo: Ctrl+Shift+A to show admin button
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminButton(true)
        setTimeout(() => setShowAdminButton(false), 10000) // Hide after 10 seconds
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAdmin(!!session)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    setIsAdmin(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
    if (isEditMode) {
      toggleEditMode()
    }
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/achievements', label: 'Achievements' },
    { path: '/certifications', label: 'Certifications' },
  ]

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Portfolio
        </Link>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Admin Controls */}
            {!isAdmin && showAdminButton && (
              <li>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="admin-btn"
                  style={{
                    background: 'rgba(0, 255, 65, 0.1)',
                    border: '1px solid var(--primary-color)',
                    color: 'var(--primary-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  🔐 Admin
                </button>
              </li>
            )}
            {isAdmin && (
              <>
                <li>
                  <button
                    onClick={toggleEditMode}
                    className="edit-mode-btn"
                    style={{
                      background: isEditMode ? 'var(--primary-color)' : 'rgba(0, 255, 65, 0.1)',
                      border: '1px solid var(--primary-color)',
                      color: isEditMode ? 'var(--bg-primary)' : 'var(--primary-color)',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isEditMode ? '✅ Edit Mode ON' : '✏️ Edit Mode'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: '1px solid #ff4444',
                      color: '#ff4444',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🚪 Logout
                  </button>
                </li>
              </>
            )}
          </ul>
      </div>
      
      {showLoginModal && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </nav>
  )
}

export default Navigation


