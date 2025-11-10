/**
 * Environment-based logging utility
 * Only logs in development mode, silent in production
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      logger.log(...args)
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      logger.error(...args)
    } else {
      // In production, only log errors (they're important)
      logger.error(...args)
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      logger.warn(...args)
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

// For backward compatibility
export default logger
