import { useState } from 'react'
import { supabase } from '../config/supabase'
import './AdminLogin.css'

const AdminLogin = ({ onLoginSuccess, onClose }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@portfolio.local', // Hardcoded admin email
        password: password
      })

      if (error) throw error

      if (data.user) {
        localStorage.setItem('isAdmin', 'true')
        onLoginSuccess()
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="login-header">
          <h2>🔐 Admin Login</h2>
          <p>Enter your password to access edit mode</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="hint">First time? Set up your password in Supabase</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
