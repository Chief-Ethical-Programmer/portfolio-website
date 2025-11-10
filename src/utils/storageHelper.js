import { supabase } from '../config/supabase'

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder in the bucket (e.g., 'skills', 'achievements')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'uploads') => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    logger.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The public URL of the image to delete
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('supabase')) return

    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/images/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    logger.error('Error deleting image:', error)
  }
}
