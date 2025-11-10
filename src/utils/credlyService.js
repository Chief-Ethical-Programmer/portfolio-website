import logger from './logger'

/**
 * Fetch badges from Credly API
 * Credly usernames typically look like: username.12345abc or just username
 * Example: https://www.credly.com/users/john-doe.a1b2c3d4/badges
 * 
 * @param {string} credlyUsername - Your full Credly username (including the alphanumeric part)
 * @returns {Promise<Array>} - Array of badge objects
 */
export const fetchCredlyBadges = async (credlyUsername) => {
  try {
    logger.log('Attempting to fetch badges from Credly...')
    logger.log('Username:', credlyUsername)
    
    const credlyUrl = `https://www.credly.com/users/${credlyUsername}/badges.json`
    logger.log('Credly URL:', credlyUrl)
    
    // Try multiple CORS proxies in order
    const proxies = [
      {
        url: `https://corsproxy.io/?${encodeURIComponent(credlyUrl)}`,
        name: 'corsproxy.io'
      },
      {
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(credlyUrl)}`,
        name: 'allorigins.win'
      },
      {
        url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(credlyUrl)}`,
        name: 'codetabs.com'
      },
      {
        url: `https://thingproxy.freeboard.io/fetch/${credlyUrl}`,
        name: 'freeboard.io'
      }
    ]
    
    let lastError = null
    
    for (const proxy of proxies) {
      try {
        logger.log(`Trying proxy: ${proxy.name}`)
        logger.log(`URL: ${proxy.url}`)
        
        const response = await fetch(proxy.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          logger.log(`${proxy.name} failed with status ${response.status}`)
          lastError = new Error(`HTTP ${response.status}`)
          continue
        }

        const data = await response.json()
        logger.log(`✅ Successfully fetched data via ${proxy.name}`)
        
        return transformCredlyData(data)
      } catch (error) {
        logger.log(`❌ ${proxy.name} failed:`, error.message)
        lastError = error
        continue
      }
    }
    
    // If all proxies failed, throw the last error
    logger.error('All CORS proxies failed')
    throw lastError || new Error('All CORS proxies failed')

  } catch (error) {
    logger.error('Error fetching Credly badges:', error)
    logger.error('Username used:', credlyUsername)
    
    // Provide more helpful error messages
    if (error.message.includes('404')) {
      throw new Error('Username not found. Please verify your Credly username.')
    } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('Unable to fetch badges due to browser security restrictions. This feature works best when deployed.')
    } else {
      throw error
    }
  }
}

/**
 * Transform Credly API data to our format
 */
function transformCredlyData(data) {
  if (!data || !data.data) {
    logger.error('Invalid Credly data format:', data)
    return []
  }

  // Transform Credly data to our format
  const badges = data.data.map(badge => {
    // Create the credential URL - use public_url or construct from badge ID
    const credentialUrl = badge.public_url || 
                         badge.url || 
                         `https://www.credly.com/badges/${badge.id}`
    
    logger.log('Badge URL:', badge.title, '->', credentialUrl)
    
    return {
      id: badge.id,
      title: badge.badge_template?.name || badge.name || 'Badge',
      issuer: badge.badge_template?.issuer?.name || badge.issuer?.name || 'Credly',
      date: new Date(badge.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      description: badge.badge_template?.description || badge.description || '',
      badgeImage: badge.badge_template?.image_url || badge.image_url || '',
      credentialUrl: credentialUrl,
      skills: badge.badge_template?.skills?.map(skill => skill.name) || [],
      expiresAt: badge.expires_at,
      state: badge.state
    }
  })

  // Filter out expired or revoked badges
  return badges.filter(badge => 
    badge.state === 'accepted' && 
    (!badge.expiresAt || new Date(badge.expiresAt) > new Date())
  )
}

/**
 * Get Credly badge count for a user
 * @param {string} credlyUsername - Your full Credly username
 * @returns {Promise<number>} - Total number of active badges
 */
export const getCredlyBadgeCount = async (credlyUsername) => {
  try {
    const badges = await fetchCredlyBadges(credlyUsername)
    return badges.length
  } catch (error) {
    logger.error('Error fetching badge count:', error)
    return 0
  }
}

/**
 * Helper function to extract username from Credly profile URL
 * Example: https://www.credly.com/users/john-doe.a1b2c3d4 → john-doe.a1b2c3d4
 * @param {string} profileUrl - Full Credly profile URL
 * @returns {string} - Username extracted from URL
 */
export const extractCredlyUsername = (profileUrl) => {
  try {
    const url = new URL(profileUrl)
    const pathParts = url.pathname.split('/')
    // Username is typically the last part of /users/username path
    const usersIndex = pathParts.indexOf('users')
    if (usersIndex !== -1 && pathParts[usersIndex + 1]) {
      return pathParts[usersIndex + 1]
    }
    return profileUrl // Return as-is if can't parse
  } catch (error) {
    // If not a valid URL, assume it's already just the username
    return profileUrl
  }
}
