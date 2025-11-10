import { useState, useEffect } from 'react'
import './About.css'
import { skills as defaultSkills, experience as defaultExperience, education as defaultEducation } from '../data/aboutData'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import EditableDataItem from '../components/EditableDataItem'
import logger from '../utils/logger'
import { uploadImage as uploadToStorage, deleteImage } from '../utils/storageHelper'
import { getEditableData } from '../utils/editableData'
import { 
  fetchHomeData, 
  updateHomeData, 
  uploadImage,
  fetchExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  fetchEducation,
  createEducation,
  updateEducation,
  deleteEducation
} from '../services/database'

const About = () => {
  const { isEditMode } = useEditMode()
  const [skills, setSkills] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [aboutIntro, setAboutIntro] = useState("Hello! I'm a cybersecurity student passionate about protecting digital assets and securing systems. With a focus on ethical hacking, penetration testing, and security research, I'm dedicated to making the digital world safer.")
  const [aboutDescription, setAboutDescription] = useState("When I'm not studying security vulnerabilities, I enjoy participating in CTF competitions, contributing to security tools, writing security research blog posts, and continuously learning about emerging threats and defense strategies.")
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Refresh data when component mounts or when returning to page
  useEffect(() => {
    loadSkills()
    loadExperience()
    loadEducation()
    loadProfilePhoto()
  }, [isEditMode])

  const loadSkills = async () => {
    const data = await fetchSkills()
    if (data && data.length > 0) {
      setSkills(data)
    } else {
      // Fallback to localStorage
      const localSkills = getEditableData('skills', defaultSkills)
      setSkills(localSkills)
    }
  }

  const loadExperience = async () => {
    const data = await fetchExperience()
    if (data && data.length > 0) {
      setExperience(data)
    } else {
      // Fallback to localStorage
      const localExp = getEditableData('experience', defaultExperience)
      setExperience(localExp)
    }
  }

  const loadEducation = async () => {
    const data = await fetchEducation()
    if (data && data.length > 0) {
      setEducation(data)
    } else {
      // Fallback to localStorage
      const localEdu = getEditableData('education', defaultEducation)
      setEducation(localEdu)
    }
  }

  const loadProfilePhoto = async () => {
    const data = await fetchHomeData()
    if (data) {
      if (data.profile_photo) {
        setProfilePhoto(data.profile_photo)
      }
      if (data.about_intro) {
        setAboutIntro(data.about_intro)
      }
      if (data.about_description) {
        setAboutDescription(data.about_description)
      }
    } else {
      // Fallback to localStorage
      const savedIntro = localStorage.getItem('about-intro')
      if (savedIntro) {
        setAboutIntro(savedIntro)
      }
      const savedDescription = localStorage.getItem('about-description')
      if (savedDescription) {
        setAboutDescription(savedDescription)
      }
    }
  }

  const handleAboutIntroChange = async (newValue) => {
    setAboutIntro(newValue)
    await updateHomeData({ about_intro: newValue })
  }

  const handleAboutDescriptionChange = async (newValue) => {
    setAboutDescription(newValue)
    await updateHomeData({ about_description: newValue })
  }

  const handleUpdateExperience = async (index, field, value) => {
    const exp = experience[index]
    const updatedExp = { ...exp, [field]: value }
    
    // Update local state
    const updatedExperience = [...experience]
    updatedExperience[index] = updatedExp
    setExperience(updatedExperience)
    
    // Save to Supabase
    if (exp.id) {
      await updateExperience(exp.id, { [field]: value })
    }
  }

  const handleUpdateExperienceResponsibility = async (index, respIndex, value) => {
    const exp = experience[index]
    const newResponsibilities = [...exp.responsibilities]
    newResponsibilities[respIndex] = value
    
    // Update local state
    const updatedExperience = [...experience]
    updatedExperience[index] = { ...exp, responsibilities: newResponsibilities }
    setExperience(updatedExperience)
    
    // Save to Supabase
    if (exp.id) {
      await updateExperience(exp.id, { responsibilities: newResponsibilities })
    }
  }

  const handleDeleteExperience = async (index) => {
    if (!confirm('Are you sure you want to delete this experience?')) return
    
    const exp = experience[index]
    
    // Delete from Supabase
    if (exp.id) {
      await deleteExperience(exp.id)
    }
    
    // Update local state
    const updatedExperience = experience.filter((_, i) => i !== index)
    setExperience(updatedExperience)
  }

  const handleAddExperience = async () => {
    const newExp = {
      title: 'New Position',
      company: 'Company Name',
      date: 'Month Year - Present',
      description: 'Job description',
      responsibilities: ['Responsibility 1', 'Responsibility 2'],
      display_order: experience.length
    }
    
    // Create in Supabase
    const result = await createExperience(newExp)
    
    if (result) {
      setExperience([...experience, result])
      await loadExperience() // Reload to get correct data
    }
  }

  const handleUpdateSkill = async (index, field, value) => {
    const skill = skills[index]
    const updatedSkill = { ...skill, [field]: value }
    
    // Update local state
    const updatedSkills = [...skills]
    updatedSkills[index] = updatedSkill
    setSkills(updatedSkills)
    
    // Save to Supabase
    if (skill.id) {
      await updateSkill(skill.id, { [field]: value })
    }
  }

  const handleDeleteSkill = async (index) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    
    const skill = skills[index]
    
    // Delete from Supabase
    if (skill.id) {
      await deleteSkill(skill.id)
    }
    
    // Update local state
    const updatedSkills = skills.filter((_, i) => i !== index)
    setSkills(updatedSkills)
  }

  const handleAddSkill = async () => {
    const newSkill = {
      name: 'New Skill',
      icon: '🔧',
      logo: '',
      display_order: skills.length
    }
    
    // Create in Supabase
    const result = await createSkill(newSkill)
    
    if (result) {
      setSkills([...skills, result])
      await loadSkills() // Reload to get correct data
    }
  }

  const handleUpdateEducation = async (index, field, value) => {
    const edu = education[index]
    const updatedEdu = { ...edu, [field]: value }
    
    // Update local state
    const updatedEducation = [...education]
    updatedEducation[index] = updatedEdu
    setEducation(updatedEducation)
    
    // Save to Supabase
    if (edu.id) {
      await updateEducation(edu.id, { [field]: value })
    }
  }

  const handleDeleteEducation = async (index) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return
    
    const edu = education[index]
    
    // Delete from Supabase
    if (edu.id) {
      await deleteEducation(edu.id)
    }
    
    // Update local state
    const updatedEducation = education.filter((_, i) => i !== index)
    setEducation(updatedEducation)
  }

  const handleAddEducation = async () => {
    const newEdu = {
      degree: 'Degree Name',
      institution: 'Institution Name',
      date: 'Year - Year',
      description: 'Description',
      display_order: education.length
    }
    
    // Create in Supabase
    const result = await createEducation(newEdu)
    
    if (result) {
      setEducation([...education, result])
      await loadEducation() // Reload to get correct data
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const photoUrl = await uploadImage(file, 'images')
      if (photoUrl) {
        setProfilePhoto(photoUrl)
        await updateHomeData({ profile_photo: photoUrl })
      }
    } catch (error) {
      logger.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="about-page">
      <section className="about-hero section">
        <div className="container">
          <h1 className="section-title">About Me</h1>
          <div className="about-content">
            <div className="about-text">
              <EditableText 
                value={aboutIntro}
                tag="p"
                className="about-intro"
                multiline={true}
                storageKey="about-intro"
                onChange={handleAboutIntroChange}
              />
              <EditableText 
                value={aboutDescription}
                tag="p"
                multiline={true}
                storageKey="about-description"
                onChange={handleAboutDescriptionChange}
              />
            </div>
            <div className="about-image">
              <div 
                className="profile-image-placeholder"
                style={{ 
                  position: 'relative',
                  cursor: isEditMode ? 'pointer' : 'default'
                }}
              >
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    style={{
                      width: '280px',
                      height: '280px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--primary-color)',
                      boxShadow: '0 0 40px rgba(0, 255, 65, 0.6)'
                    }}
                  />
                ) : (
                  <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
                    <circle cx="140" cy="140" r="140" fill="url(#profileGradient)"/>
                    <defs>
                      <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <text x="140" y="168" fontSize="84" fill="white" textAnchor="middle" fontFamily="Arial">YOU</text>
                  </svg>
                )}
                
                {isEditMode && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      id="about-profile-photo-upload"
                    />
                    <label
                      htmlFor="about-profile-photo-upload"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'white',
                        textAlign: 'center',
                        padding: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                        e.target.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0)';
                        e.target.style.opacity = '0';
                      }}
                    >
                      {uploading ? (
                        '⏳ Uploading...'
                      ) : (
                        <>
                          📸
                          <br />
                          {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                        </>
                      )}
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="skills-section section">
        <div className="container">
          <h2 className="section-title">Skills</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={skill.id || index} className="skill-card" style={{ position: 'relative' }}>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteSkill(index)}
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
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                )}
                <div 
                  className="skill-icon"
                  style={{ 
                    position: 'relative',
                    cursor: isEditMode ? 'pointer' : 'default'
                  }}
                  onClick={() => isEditMode && document.getElementById(`logo-upload-${index}`).click()}
                >
                  {skill.logo ? (
                    <img 
                      src={skill.logo} 
                      alt={skill.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                  ) : null}
                  <span style={skill.logo ? { display: 'none' } : { fontSize: '48px' }}>{skill.icon}</span>
                  
                  {isEditMode && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        id={`logo-upload-${index}`}
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              setUploading(true);
                              
                              // Delete old logo if exists
                              if (skill.logo) {
                                await deleteImage(skill.logo);
                              }
                              
                              // Upload new logo to Supabase Storage
                              const publicUrl = await uploadToStorage(file, 'skills');
                              
                              // Update local state
                              const updatedSkills = [...skills];
                              updatedSkills[index] = { ...skill, logo: publicUrl };
                              setSkills(updatedSkills);
                              
                              // Save to Supabase
                              if (skill.id) {
                                await updateSkill(skill.id, { logo: publicUrl });
                              }
                            } catch (error) {
                              logger.error('Error uploading skill logo:', error);
                              alert('Failed to upload logo. Please try again.');
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                      />
                      <div 
                        className="logo-overlay"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(4px)',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                      >
                        <span style={{ 
                          color: 'white', 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {skill.logo ? '📷 Change Logo' : '📷 Add Logo'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <EditableText
                  value={skill.name}
                  tag="h3"
                  onChange={(newValue) => handleUpdateSkill(index, 'name', newValue)}
                />
                <EditableText
                  value={skill.description}
                  tag="p"
                  onChange={(newValue) => handleUpdateSkill(index, 'description', newValue)}
                />
              </div>
            ))}
            
            {isEditMode && (
              <div className="skill-card" style={{ border: '2px dashed var(--border-color)', cursor: 'pointer' }}>
                <button
                  onClick={handleAddSkill}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '200px',
                    padding: '2rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-color)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--bg-card)';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>+</span>
                  <span>Add New Skill</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="experience-section section">
        <div className="container">
          <h2 className="section-title">Experience</h2>
          <div className="timeline">
            {experience.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content" style={{ position: 'relative' }}>
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteExperience(index)}
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
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}
                  <EditableText
                    value={exp.title}
                    tag="h3"
                    onChange={(newValue) => handleUpdateExperience(index, 'title', newValue)}
                  />
                  <EditableText
                    value={exp.company}
                    tag="h4"
                    onChange={(newValue) => handleUpdateExperience(index, 'company', newValue)}
                  />
                  <EditableText
                    value={exp.date}
                    tag="span"
                    className="timeline-date"
                    onChange={(newValue) => handleUpdateExperience(index, 'date', newValue)}
                  />
                  <EditableText
                    value={exp.description}
                    tag="p"
                    multiline={true}
                    onChange={(newValue) => handleUpdateExperience(index, 'description', newValue)}
                  />
                  <ul>
                    {exp.responsibilities && exp.responsibilities.map((responsibility, i) => (
                      <li key={i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <EditableText
                          value={responsibility}
                          onChange={(newValue) => handleUpdateExperienceResponsibility(index, i, newValue)}
                        />
                        {isEditMode && (
                          <button
                            onClick={async () => {
                              const newResponsibilities = exp.responsibilities.filter((_, idx) => idx !== i)
                              const updatedExp = { ...exp, responsibilities: newResponsibilities }
                              const updatedExperience = [...experience]
                              updatedExperience[index] = updatedExp
                              setExperience(updatedExperience)
                              if (exp.id) {
                                await updateExperience(exp.id, { responsibilities: newResponsibilities })
                              }
                            }}
                            style={{
                              background: 'rgba(255, 0, 0, 0.2)',
                              border: '1px solid #ff4444',
                              color: '#ff4444',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                            title="Delete responsibility"
                          >
                            ×
                          </button>
                        )}
                      </li>
                    ))}
                    {isEditMode && (
                      <li style={{ listStyle: 'none' }}>
                        <button
                          onClick={async () => {
                            const newResponsibilities = [...(exp.responsibilities || []), 'New responsibility']
                            const updatedExp = { ...exp, responsibilities: newResponsibilities }
                            const updatedExperience = [...experience]
                            updatedExperience[index] = updatedExp
                            setExperience(updatedExperience)
                            if (exp.id) {
                              await updateExperience(exp.id, { responsibilities: newResponsibilities })
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px dashed var(--border-color)',
                            color: 'var(--primary-color)',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            marginTop: '0.5rem'
                          }}
                        >
                          + Add Responsibility
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
            
            {isEditMode && (
              <div className="timeline-item timeline-add">
                <div className="timeline-marker" style={{ background: 'var(--secondary-color)' }}></div>
                <div className="timeline-content">
                  <button
                    onClick={handleAddExperience}
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: 'transparent',
                      border: '2px dashed var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--primary-color)',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--bg-card)';
                      e.target.style.borderColor = 'var(--primary-color)';
                      e.target.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>+</span>
                    <span>Add New Experience</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="education-section section">
        <div className="container">
          <h2 className="section-title">Education</h2>
          <div className="education-grid">
            {education.map((edu, index) => (
              <div key={index} className="education-card" style={{ position: 'relative' }}>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteEducation(index)}
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
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                )}
                <div className="education-icon">🎓</div>
                <EditableText
                  value={edu.degree}
                  tag="h3"
                  onChange={(newValue) => handleUpdateEducation(index, 'degree', newValue)}
                />
                <EditableText
                  value={edu.institution}
                  tag="h4"
                  onChange={(newValue) => handleUpdateEducation(index, 'institution', newValue)}
                />
                <EditableText
                  value={edu.date}
                  tag="span"
                  className="education-date"
                  onChange={(newValue) => handleUpdateEducation(index, 'date', newValue)}
                />
                <EditableText
                  value={edu.description}
                  tag="p"
                  multiline={true}
                  onChange={(newValue) => handleUpdateEducation(index, 'description', newValue)}
                />
              </div>
            ))}
            
            {isEditMode && (
              <div className="education-card" style={{ border: '2px dashed var(--border-color)' }}>
                <button
                  onClick={handleAddEducation}
                  style={{
                    width: '100%',
                    padding: '40px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-color)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--bg-card)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>+</span>
                  <span>Add New Education</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About


