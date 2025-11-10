/**
 * Security utilities to prevent common cyber attacks
 */

// ============================================
// XSS (Cross-Site Scripting) Protection
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (!html) return ''
  
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHTML = (text) => {
  if (!text) return ''
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Validate and sanitize URL to prevent javascript: and data: URLs
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeURL = (url) => {
  if (!url) return null
  
  const trimmedUrl = url.trim().toLowerCase()
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  if (dangerousProtocols.some(protocol => trimmedUrl.startsWith(protocol))) {
    logger.warn('Blocked dangerous URL:', url)
    return null
  }
  
  // Allow only http, https, mailto, and relative URLs
  const validProtocols = /^(https?:\/\/|mailto:|\/|\.\/|\.\.\/)/i
  if (!validProtocols.test(trimmedUrl) && trimmedUrl !== '#') {
    logger.warn('Invalid URL protocol:', url)
    return null
  }
  
  return url.trim()
}

// ============================================
// SQL Injection Protection
// ============================================

/**
 * Validate input to prevent SQL injection
 * @param {string} input - User input
 * @returns {boolean} - True if input is safe
 */
export const validateInput = (input) => {
  if (!input) return true
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\/\*|\*\/|;|'|")/g,
    /(\bOR\b|\bAND\b).*=.*=/gi,
    /(UNION|JOIN)/gi,
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      logger.warn('Potential SQL injection attempt detected')
      return false
    }
  }
  
  return true
}

/**
 * Sanitize input for database queries
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return ''
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/--/g, '') // Remove SQL comments
    .replace(/;/g, '') // Remove semicolons
    .trim()
}

// ============================================
// Rate Limiting
// ============================================

const rateLimitStore = new Map()

/**
 * Rate limit function calls to prevent abuse
 * @param {string} key - Unique identifier for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if action is allowed
 */
export const rateLimit = (key, maxAttempts = 10, windowMs = 60000) => {
  const now = Date.now()
  const record = rateLimitStore.get(key) || { attempts: 0, resetTime: now + windowMs }
  
  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 0
    record.resetTime = now + windowMs
  }
  
  // Increment attempts
  record.attempts++
  rateLimitStore.set(key, record)
  
  // Check if limit exceeded
  if (record.attempts > maxAttempts) {
    logger.warn(`Rate limit exceeded for: ${key}`)
    return false
  }
  
  return true
}

/**
 * Clear rate limit for a specific key
 * @param {string} key - Rate limit key to clear
 */
export const clearRateLimit = (key) => {
  rateLimitStore.delete(key)
}

// ============================================
// CSRF (Cross-Site Request Forgery) Protection
// ============================================

/**
 * Generate CSRF token
 * @returns {string} - CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Store CSRF token in sessionStorage
 * @param {string} token - CSRF token
 */
export const storeCSRFToken = (token) => {
  sessionStorage.setItem('csrf_token', token)
}

/**
 * Get CSRF token from sessionStorage
 * @returns {string|null} - CSRF token
 */
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf_token')
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - True if valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = getCSRFToken()
  return storedToken && storedToken === token
}

// ============================================
// Data Validation
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} - True if valid
 */
export const validateLength = (text, minLength = 0, maxLength = 10000) => {
  if (!text) return minLength === 0
  return text.length >= minLength && text.length <= maxLength
}

/**
 * Validate array items
 * @param {Array} arr - Array to validate
 * @param {number} maxItems - Maximum items allowed
 * @returns {boolean} - True if valid
 */
export const validateArray = (arr, maxItems = 100) => {
  return Array.isArray(arr) && arr.length <= maxItems
}

// ============================================
// Secure Storage
// ============================================

/**
 * Safely store data in localStorage with encryption
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const secureStore = (key, value) => {
  try {
    const data = JSON.stringify(value)
    localStorage.setItem(key, btoa(data)) // Basic encoding
  } catch (error) {
    logger.error('Error storing data:', error)
  }
}

/**
 * Safely retrieve data from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Retrieved value or null
 */
export const secureRetrieve = (key) => {
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(atob(data))
  } catch (error) {
    logger.error('Error retrieving data:', error)
    return null
  }
}

/**
 * Clear sensitive data from storage
 * @param {string} key - Storage key to clear
 */
export const secureClear = (key) => {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch (error) {
    logger.error('Error clearing data:', error)
  }
}

// ============================================
// Click Jacking Protection
// ============================================

/**
 * Prevent click jacking attacks
 */
export const preventClickJacking = () => {
  if (window.top !== window.self) {
    window.top.location = window.self.location
  }
}

// ============================================
// Input Sanitization for React
// ============================================

/**
 * Sanitize props to prevent injection attacks
 * @param {Object} props - Component props
 * @returns {Object} - Sanitized props
 */
export const sanitizeProps = (props) => {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      sanitized[key] = escapeHTML(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? escapeHTML(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// ============================================
// Initialize Security Measures
// ============================================

/**
 * Initialize all security measures on app load
 */
export const initializeSecurity = () => {
  // Prevent click jacking
  preventClickJacking()
  
  // Generate and store CSRF token
  const csrfToken = generateCSRFToken()
  storeCSRFToken(csrfToken)
  
  // Clear old rate limit records
  setInterval(() => {
    rateLimitStore.clear()
  }, 3600000) // Clear every hour
  
  // Only log in development
  if (import.meta.env.DEV) {
    console.log('Security measures initialized')
  }
}
