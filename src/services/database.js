import { supabase } from '../config/supabase'
import { sanitizeInput, validateInput, validateLength, validateArray, rateLimit } from '../utils/security'
import logger from '../utils/logger'

// ============================================
// PROJECTS
// ============================================

export const fetchProjects = async () => {
  // Rate limiting
  if (!rateLimit('fetchProjects', 30, 60000)) {
    throw new Error('Too many requests. Please try again later.')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    logger.error('Error fetching projects:', error)
    return []
  }
  return data
}

export const createProject = async (project) => {
  // Rate limiting
  if (!rateLimit('createProject', 5, 60000)) {
    throw new Error('Too many create requests. Please wait a moment.')
  }

  // Validate inputs
  if (!validateInput(project.title) || !validateInput(project.description)) {
    throw new Error('Invalid input detected')
  }

  if (!validateLength(project.title, 1, 200)) {
    throw new Error('Title must be between 1 and 200 characters')
  }

  if (!validateLength(project.description, 0, 5000)) {
    throw new Error('Description must be less than 5000 characters')
  }

  if (!validateArray(project.categories, 20)) {
    throw new Error('Too many categories')
  }

  if (!validateArray(project.technologies, 50)) {
    throw new Error('Too many technologies')
  }

  // Sanitize inputs
  const sanitizedProject = {
    ...project,
    title: sanitizeInput(project.title),
    description: sanitizeInput(project.description),
    github: project.github ? sanitizeInput(project.github) : null,
    categories: project.categories?.map(c => sanitizeInput(c)) || [],
    technologies: project.technologies?.map(t => sanitizeInput(t)) || []
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([sanitizedProject])
    .select()
  
  if (error) {
    logger.error('Error creating project:', error)
    return null
  }
  return data[0]
}

export const updateProject = async (id, updates) => {
  // Rate limiting
  if (!rateLimit(`updateProject-${id}`, 10, 60000)) {
    throw new Error('Too many update requests. Please wait a moment.')
  }

  // Validate ID
  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Invalid project ID')
  }

  // Validate inputs
  if (updates.title && !validateInput(updates.title)) {
    throw new Error('Invalid title input')
  }

  if (updates.description && !validateInput(updates.description)) {
    throw new Error('Invalid description input')
  }

  if (updates.title && !validateLength(updates.title, 1, 200)) {
    throw new Error('Title must be between 1 and 200 characters')
  }

  if (updates.description && !validateLength(updates.description, 0, 5000)) {
    throw new Error('Description must be less than 5000 characters')
  }

  if (updates.categories && !validateArray(updates.categories, 20)) {
    throw new Error('Too many categories')
  }

  if (updates.technologies && !validateArray(updates.technologies, 50)) {
    throw new Error('Too many technologies')
  }

  // Sanitize inputs
  const sanitizedUpdates = {}
  if (updates.title) sanitizedUpdates.title = sanitizeInput(updates.title)
  if (updates.description) sanitizedUpdates.description = sanitizeInput(updates.description)
  if (updates.github !== undefined) sanitizedUpdates.github = updates.github ? sanitizeInput(updates.github) : null
  if (updates.categories) sanitizedUpdates.categories = updates.categories.map(c => sanitizeInput(c))
  if (updates.technologies) sanitizedUpdates.technologies = updates.technologies.map(t => sanitizeInput(t))

  const { data, error } = await supabase
    .from('projects')
    .update(sanitizedUpdates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating project:', error)
    return null
  }
  return data[0]
}

export const deleteProject = async (id) => {
  // Rate limiting
  if (!rateLimit('deleteProject', 5, 60000)) {
    throw new Error('Too many delete requests. Please wait a moment.')
  }

  // Validate ID
  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Invalid project ID')
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting project:', error)
    return false
  }
  return true
}

// ============================================
// SKILLS
// ============================================

export const fetchSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    logger.error('Error fetching skills:', error)
    return []
  }
  return data
}

export const createSkill = async (skill) => {
  const { data, error } = await supabase
    .from('skills')
    .insert([skill])
    .select()
  
  if (error) {
    logger.error('Error creating skill:', error)
    return null
  }
  return data[0]
}

export const updateSkill = async (id, updates) => {
  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating skill:', error)
    return null
  }
  return data[0]
}

export const deleteSkill = async (id) => {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting skill:', error)
    return false
  }
  return true
}

// ============================================
// EXPERIENCE
// ============================================

export const fetchExperience = async () => {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    logger.error('Error fetching experience:', error)
    return []
  }
  return data
}

export const createExperience = async (experience) => {
  const { data, error } = await supabase
    .from('experience')
    .insert([experience])
    .select()
  
  if (error) {
    logger.error('Error creating experience:', error)
    return null
  }
  return data[0]
}

export const updateExperience = async (id, updates) => {
  const { data, error } = await supabase
    .from('experience')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating experience:', error)
    return null
  }
  return data[0]
}

export const deleteExperience = async (id) => {
  const { error } = await supabase
    .from('experience')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting experience:', error)
    return false
  }
  return true
}

// ============================================
// EDUCATION
// ============================================

export const fetchEducation = async () => {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    logger.error('Error fetching education:', error)
    return []
  }
  return data
}

export const createEducation = async (education) => {
  const { data, error } = await supabase
    .from('education')
    .insert([education])
    .select()
  
  if (error) {
    logger.error('Error creating education:', error)
    return null
  }
  return data[0]
}

export const updateEducation = async (id, updates) => {
  const { data, error } = await supabase
    .from('education')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating education:', error)
    return null
  }
  return data[0]
}

export const deleteEducation = async (id) => {
  const { error } = await supabase
    .from('education')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting education:', error)
    return false
  }
  return true
}

// ============================================
// HOME PAGE DATA
// ============================================

export const fetchHomeData = async () => {
  const { data, error } = await supabase
    .from('home_data')
    .select('*')
    .single()
  
  if (error) {
    logger.error('Error fetching home data:', error)
    return null
  }
  return data
}

export const updateHomeData = async (updates) => {
  // First, check if home_data row exists
  const { data: existing } = await supabase
    .from('home_data')
    .select('*')
    .limit(1)
    .single()
  
  if (existing) {
    // Update existing row
    const { data, error } = await supabase
      .from('home_data')
      .update(updates)
      .eq('id', existing.id)
      .select()
    
    if (error) {
      logger.error('Error updating home data:', error)
      return null
    }
    return data[0]
  } else {
    // Insert new row
    const { data, error } = await supabase
      .from('home_data')
      .insert([updates])
      .select()
    
    if (error) {
      logger.error('Error inserting home data:', error)
      return null
    }
    return data[0]
  }
}

// ============================================
// IMAGE UPLOAD TO STORAGE
// ============================================

export const uploadImage = async (file, bucket = 'images') => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${bucket}/${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    logger.error('Error uploading image:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

export const deleteImage = async (url, bucket = 'images') => {
  // Extract file path from URL
  const filePath = url.split(`${bucket}/`)[1]
  
  if (!filePath) return false

  const { error } = await supabase.storage
    .from(bucket)
    .remove([`${bucket}/${filePath}`])

  if (error) {
    logger.error('Error deleting image:', error)
    return false
  }
  return true
}

// ============================================
// QUICK LINKS
// ============================================

export const fetchQuickLinks = async () => {
  const { data, error } = await supabase
    .from('quick_links')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    logger.error('Error fetching quick links:', error)
    return []
  }
  return data
}

export const createQuickLink = async (quickLink) => {
  const { data, error } = await supabase
    .from('quick_links')
    .insert([quickLink])
    .select()
  
  if (error) {
    logger.error('Error creating quick link:', error)
    return null
  }
  return data[0]
}

export const updateQuickLink = async (id, updates) => {
  const { data, error } = await supabase
    .from('quick_links')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating quick link:', error)
    return null
  }
  return data[0]
}

export const deleteQuickLink = async (id) => {
  const { error } = await supabase
    .from('quick_links')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting quick link:', error)
    return false
  }
  return true
}

// ============================================
// SOCIAL LINKS
// ============================================

export const fetchSocialLinks = async () => {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    logger.error('Error fetching social links:', error)
    return []
  }
  return data
}

export const createSocialLink = async (socialLink) => {
  const { data, error } = await supabase
    .from('social_links')
    .insert([socialLink])
    .select()
  
  if (error) {
    logger.error('Error creating social link:', error)
    return null
  }
  return data[0]
}

export const updateSocialLink = async (id, updates) => {
  const { data, error } = await supabase
    .from('social_links')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating social link:', error)
    return null
  }
  return data[0]
}

export const deleteSocialLink = async (id) => {
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting social link:', error)
    return false
  }
  return true
}

// ============================================
// ACHIEVEMENTS
// ============================================

export const fetchAchievements = async () => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    logger.error('Error fetching achievements:', error)
    return []
  }
  return data
}

export const createAchievement = async (achievement) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([achievement])
    .select()
  
  if (error) {
    logger.error('Error creating achievement:', error)
    return null
  }
  return data[0]
}

export const updateAchievement = async (id, updates) => {
  const { data, error } = await supabase
    .from('achievements')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating achievement:', error)
    return null
  }
  return data[0]
}

export const deleteAchievement = async (id) => {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting achievement:', error)
    return false
  }
  return true
}

// ============================================
// CERTIFICATIONS
// ============================================

export const fetchCertifications = async () => {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    logger.error('Error fetching certifications:', error)
    return []
  }
  return data
}

export const createCertification = async (certification) => {
  const { data, error } = await supabase
    .from('certifications')
    .insert([certification])
    .select()
  
  if (error) {
    logger.error('Error creating certification:', error)
    return null
  }
  return data[0]
}

export const updateCertification = async (id, updates) => {
  const { data, error } = await supabase
    .from('certifications')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    logger.error('Error updating certification:', error)
    return null
  }
  return data[0]
}

export const deleteCertification = async (id) => {
  const { error } = await supabase
    .from('certifications')
    .delete()
    .eq('id', id)
  
  if (error) {
    logger.error('Error deleting certification:', error)
    return false
  }
  return true
}
