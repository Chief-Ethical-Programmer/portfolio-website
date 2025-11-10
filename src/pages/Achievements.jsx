import { useState, useEffect } from 'react'
import './Achievements.css'
import { achievements as defaultAchievements } from '../data/achievementsData'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import { 
  fetchAchievements, 
  createAchievement, 
  updateAchievement as updateAchievementDB, 
  deleteAchievement as deleteAchievementDB 
} from '../services/database'
import { migrateAchievementsToSupabase } from '../utils/dataMigration'

const Achievements = () => {
  const { isEditMode } = useEditMode()
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    const initializeData = async () => {
      // Migrate localStorage data to Supabase if needed
      await migrateAchievementsToSupabase()
      
      // Load achievements from Supabase
      await loadAchievements()
    }
    
    initializeData()
  }, [])

  const loadAchievements = async () => {
    const data = await fetchAchievements()
    if (data && data.length > 0) {
      setAchievements(data)
    } else {
      // Use default data if Supabase is empty
      setAchievements(defaultAchievements)
    }
  }

  const handleUpdateAchievement = async (index, field, value) => {
    const updatedAchievements = [...achievements]
    updatedAchievements[index] = { ...updatedAchievements[index], [field]: value }
    setAchievements(updatedAchievements)
    
    // Update in Supabase
    const achievement = updatedAchievements[index]
    if (achievement.id) {
      await updateAchievementDB(achievement.id, { [field]: value })
    }
  }

  const handleAddAchievement = async () => {
    const newAchievement = {
      title: 'New Achievement',
      date: 'New Date',
      description: 'Achievement description goes here.',
      link: '',
      display_order: achievements.length
    }
    
    // Create in Supabase
    const created = await createAchievement(newAchievement)
    if (created) {
      // Reload from Supabase
      await loadAchievements()
    }
  }

  const handleDeleteAchievement = async (index) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      const achievement = achievements[index]
      if (achievement.id) {
        await deleteAchievementDB(achievement.id)
        // Reload from Supabase
        await loadAchievements()
      }
    }
  }

  return (
    <div className="achievements-page">
      <section className="achievements-hero section">
        <div className="container">
          <h1 className="section-title">Achievements</h1>
          <EditableText 
            value="Milestones and accomplishments throughout my journey"
            tag="p"
            className="section-subtitle"
            multiline={true}
            storageKey="achievements-subtitle"
          />

          <div className="achievements-timeline">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-item" style={{ position: 'relative' }}>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteAchievement(index)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid #ff4444',
                      color: '#ff4444',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      zIndex: 10
                    }}
                  >
                    ×
                  </button>
                )}
                <div className="achievement-icon">
                  {achievement.icon || '🏆'}
                </div>
                <div className="achievement-content">
                  <EditableText
                    value={achievement.date}
                    className="achievement-date"
                    onChange={(value) => handleUpdateAchievement(index, 'date', value)}
                    storageKey={`achievement-date-${index}`}
                  />
                  <EditableText
                    value={achievement.title}
                    tag="h3"
                    onChange={(value) => handleUpdateAchievement(index, 'title', value)}
                    storageKey={`achievement-title-${index}`}
                  />
                  <EditableText
                    value={achievement.description}
                    tag="p"
                    multiline={true}
                    onChange={(value) => handleUpdateAchievement(index, 'description', value)}
                    storageKey={`achievement-description-${index}`}
                  />
                  {isEditMode && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Link (optional):</label>
                      <EditableText
                        value={achievement.link || ''}
                        onChange={(value) => handleUpdateAchievement(index, 'link', value)}
                        storageKey={`achievement-link-${index}`}
                        style={{ fontSize: '0.85rem', color: 'var(--secondary-color)' }}
                      />
                    </div>
                  )}
                  {!isEditMode && achievement.link && (
                    <a
                      href={achievement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="achievement-link"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isEditMode && (
              <div className="achievement-item" style={{ border: '2px dashed var(--border-color)', cursor: 'pointer' }} onClick={handleAddAchievement}>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
                  <span style={{ fontSize: '3rem' }}>+</span>
                  <p>Add New Achievement</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Achievements


