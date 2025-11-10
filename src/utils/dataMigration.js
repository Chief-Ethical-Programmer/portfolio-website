import logger from './logger'
import { 
  createQuickLink, 
  createSocialLink, 
  createAchievement, 
  createCertification,
  createExperience,
  createSkill,
  createEducation,
  createProject,
  fetchQuickLinks,
  fetchSocialLinks,
  fetchAchievements,
  fetchCertifications,
  fetchExperience,
  fetchSkills,
  fetchEducation,
  fetchProjects
} from '../services/database'

/**
 * Migrate localStorage data to Supabase on first load
 * This runs once per data type and marks completion in localStorage
 */

export const migrateQuickLinksToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('quickLinks_migrated')
  if (migrated === 'true') {
    return false // Already migrated
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchQuickLinks()
  if (existingData && existingData.length > 0) {
    // Data already exists in Supabase, mark as migrated
    localStorage.setItem('quickLinks_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedQuickLinks = localStorage.getItem('quickLinks')
  if (!savedQuickLinks) {
    localStorage.setItem('quickLinks_migrated', 'true')
    return false // No data to migrate
  }

  try {
    const quickLinks = JSON.parse(savedQuickLinks)
    
    // Migrate each quick link
    for (let i = 0; i < quickLinks.length; i++) {
      const link = quickLinks[i]
      await createQuickLink({
        title: link.title || '',
        description: link.description || '',
        link: link.path || '',
        logo: link.logo || '',
        display_order: i
      })
    }

    localStorage.setItem('quickLinks_migrated', 'true')
    return true // Successfully migrated
  } catch (error) {
    logger.error('Error migrating quick links:', error)
    return false
  }
}

export const migrateSocialLinksToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('socialLinks_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchSocialLinks()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('socialLinks_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedSocialLinks = localStorage.getItem('socialLinks')
  if (!savedSocialLinks) {
    localStorage.setItem('socialLinks_migrated', 'true')
    return false
  }

  try {
    const socialLinks = JSON.parse(savedSocialLinks)
    
    // Handle both old object format and new array format
    let linksArray = []
    if (Array.isArray(socialLinks)) {
      linksArray = socialLinks
    } else if (typeof socialLinks === 'object') {
      // Old format: { email, linkedin, github, tryhackme }
      linksArray = [
        { name: 'Email', url: socialLinks.email || '', logo: '', type: 'email' },
        { name: 'LinkedIn', url: socialLinks.linkedin || '', logo: '', type: 'link' },
        { name: 'GitHub', url: socialLinks.github || '', logo: '', type: 'link' },
        { name: 'TryHackMe', url: socialLinks.tryhackme || '', logo: '', type: 'link' }
      ]
    }

    // Migrate each social link
    for (let i = 0; i < linksArray.length; i++) {
      const link = linksArray[i]
      await createSocialLink({
        platform: link.name || '',
        link: link.url || '',
        logo: link.logo || '',
        display_order: i
      })
    }

    localStorage.setItem('socialLinks_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating social links:', error)
    return false
  }
}

export const migrateAchievementsToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('achievements_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchAchievements()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('achievements_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedAchievements = localStorage.getItem('achievements')
  if (!savedAchievements) {
    localStorage.setItem('achievements_migrated', 'true')
    return false
  }

  try {
    const achievements = JSON.parse(savedAchievements)
    
    // Migrate each achievement
    for (let i = 0; i < achievements.length; i++) {
      const achievement = achievements[i]
      await createAchievement({
        title: achievement.title || '',
        date: achievement.date || '',
        description: achievement.description || '',
        link: achievement.link || '',
        display_order: i
      })
    }

    localStorage.setItem('achievements_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating achievements:', error)
    return false
  }
}

export const migrateCertificationsToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('certifications_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchCertifications()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('certifications_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedCertifications = localStorage.getItem('certifications')
  if (!savedCertifications) {
    localStorage.setItem('certifications_migrated', 'true')
    return false
  }

  try {
    const certifications = JSON.parse(savedCertifications)
    
    // Migrate each certification
    for (let i = 0; i < certifications.length; i++) {
      const cert = certifications[i]
      await createCertification({
        name: cert.title || cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        url: cert.credentialUrl || cert.certificateUrl || cert.url || '',
        image: cert.badgeImage || cert.image || '',
        description: cert.description || '',
        display_order: i
      })
    }

    localStorage.setItem('certifications_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating certifications:', error)
    return false
  }
}

export const migrateExperienceToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('experience_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchExperience()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('experience_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedExperience = localStorage.getItem('experience')
  if (!savedExperience) {
    localStorage.setItem('experience_migrated', 'true')
    return false
  }

  try {
    const experience = JSON.parse(savedExperience)
    
    // Migrate each experience entry
    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i]
      await createExperience({
        title: exp.title || '',
        company: exp.company || '',
        date: exp.date || '',
        description: exp.description || '',
        responsibilities: exp.responsibilities || [],
        display_order: i
      })
    }

    localStorage.setItem('experience_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating experience:', error)
    return false
  }
}

export const migrateSkillsToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('skills_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchSkills()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('skills_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedSkills = localStorage.getItem('skills')
  if (!savedSkills) {
    localStorage.setItem('skills_migrated', 'true')
    return false
  }

  try {
    const skills = JSON.parse(savedSkills)
    
    // Migrate each skill
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i]
      await createSkill({
        name: skill.name || '',
        description: skill.description || '',
        icon: skill.icon || '⚡',
        logo: skill.logo || '',
        display_order: i
      })
    }

    localStorage.setItem('skills_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating skills:', error)
    return false
  }
}

export const migrateEducationToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('education_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchEducation()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('education_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedEducation = localStorage.getItem('education')
  if (!savedEducation) {
    localStorage.setItem('education_migrated', 'true')
    return false
  }

  try {
    const education = JSON.parse(savedEducation)
    
    // Migrate each education entry
    for (let i = 0; i < education.length; i++) {
      const edu = education[i]
      await createEducation({
        degree: edu.degree || '',
        institution: edu.institution || '',
        date: edu.date || '',
        description: edu.description || '',
        display_order: i
      })
    }

    localStorage.setItem('education_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating education:', error)
    return false
  }
}

export const migrateProjectsToSupabase = async () => {
  // Check if already migrated
  const migrated = localStorage.getItem('projects_migrated')
  if (migrated === 'true') {
    return false
  }

  // Check if there's existing data in Supabase
  const existingData = await fetchProjects()
  if (existingData && existingData.length > 0) {
    localStorage.setItem('projects_migrated', 'true')
    return false
  }

  // Get localStorage data
  const savedProjects = localStorage.getItem('projects')
  if (!savedProjects) {
    localStorage.setItem('projects_migrated', 'true')
    return false
  }

  try {
    const projects = JSON.parse(savedProjects)
    
    // Migrate each project
    for (const project of projects) {
      await createProject({
        title: project.title || '',
        description: project.description || '',
        categories: project.categories || (project.category ? [project.category] : ['Uncategorized']),
        technologies: project.technologies || [],
        github: project.github || ''
      })
    }

    localStorage.setItem('projects_migrated', 'true')
    return true
  } catch (error) {
    logger.error('Error migrating projects:', error)
    return false
  }
}

/**
 * Run all migrations
 */
export const runAllMigrations = async () => {
  logger.log('🔄 Starting data migration to Supabase...')
  
  const results = {
    quickLinks: await migrateQuickLinksToSupabase(),
    socialLinks: await migrateSocialLinksToSupabase(),
    achievements: await migrateAchievementsToSupabase(),
    certifications: await migrateCertificationsToSupabase(),
    experience: await migrateExperienceToSupabase(),
    skills: await migrateSkillsToSupabase(),
    education: await migrateEducationToSupabase(),
    projects: await migrateProjectsToSupabase()
  }
  
  const migrated = Object.entries(results)
    .filter(([, success]) => success)
    .map(([key]) => key)
  
  if (migrated.length > 0) {
    logger.log('✅ Successfully migrated:', migrated.join(', '))
  } else {
    logger.log('ℹ️ No data to migrate or already migrated')
  }
  
  return results
}
