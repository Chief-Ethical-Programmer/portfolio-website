import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import logger from '../utils/logger'
import { 
  fetchHomeData, 
  updateHomeData, 
  uploadImage,
  fetchQuickLinks,
  fetchSocialLinks,
  createSocialLink,
  updateQuickLink,
  updateSocialLink,
  deleteQuickLink,
  deleteSocialLink
} from '../services/database'
import { uploadImage as uploadToStorage, deleteImage } from '../utils/storageHelper'
import { migrateQuickLinksToSupabase, migrateSocialLinksToSupabase } from '../utils/dataMigration'
import './Home.css'

const Home = () => {
  const { isEditMode } = useEditMode()
  const [userName, setUserName] = useState('user')
  const [displayName, setDisplayName] = useState('Your Name')
  const [subtitle, setSubtitle] = useState('Cybersecurity Student | Ethical Hacker | Security Researcher')
  const [description, setDescription] = useState('Welcome to my security portfolio! I\'m passionate about protecting digital assets, identifying vulnerabilities, and securing systems. Explore my security projects, achievements, and certifications in the field of cybersecurity.')
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, name: 'Email', url: '', logo: '', type: 'email' },
    { id: 2, name: 'LinkedIn', url: '', logo: '', type: 'link' },
    { id: 3, name: 'GitHub', url: '', logo: '', type: 'link' },
    { id: 4, name: 'TryHackMe', url: '', logo: '', type: 'link' }
  ])
  
  const [quickLinks, setQuickLinks] = useState([
    {
      path: '/about',
      icon: '🛡️',
      logo: '',
      title: 'About Me',
      description: 'Learn about my cybersecurity background, skills, and expertise'
    },
    {
      path: '/projects',
      icon: '🔒',
      logo: '',
      title: 'Security Projects',
      description: 'Explore my security tools, penetration testing, and research projects'
    },
    {
      path: '/blog',
      icon: '📊',
      logo: '',
      title: 'Security Blog',
      description: 'Read my latest security research, tutorials, and vulnerability analyses'
    },
    {
      path: '/achievements',
      icon: '🏆',
      logo: '',
      title: 'CTF Achievements',
      description: 'Check out my Capture The Flag wins and security competition results'
    },
    {
      path: '/certifications',
      icon: '🎓',
      logo: '',
      title: 'Certifications',
      description: 'View my cybersecurity certifications and security badges'
    }
  ])

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        // Load home data (name, profile photo)
        await loadHomeData()
        
        // Migrate localStorage data to Supabase if needed
        await migrateQuickLinksToSupabase()
        await migrateSocialLinksToSupabase()
        
        // Load Quick Links from Supabase
        await loadQuickLinks()
        
        // Load Social Links from Supabase
        await loadSocialLinks()
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeData()
  }, [])

  const loadHomeData = async () => {
    const data = await fetchHomeData()
    if (data) {
      if (data.name) {
        setDisplayName(data.name)
        const terminalName = data.name.toLowerCase().replace(/\s+/g, '')
        setUserName(terminalName || 'user')
      }
      if (data.subtitle) {
        setSubtitle(data.subtitle)
      }
      if (data.description) {
        setDescription(data.description)
      }
      if (data.profile_photo) {
        setProfilePhoto(data.profile_photo)
      }
    } else {
      // Fallback to localStorage for backward compatibility
      const savedName = localStorage.getItem('home-name')
      if (savedName) {
        setDisplayName(savedName)
        const terminalName = savedName.toLowerCase().replace(/\s+/g, '')
        setUserName(terminalName || 'user')
      }
      const savedSubtitle = localStorage.getItem('home-subtitle')
      if (savedSubtitle) {
        setSubtitle(savedSubtitle)
      }
      const savedDescription = localStorage.getItem('home-description')
      if (savedDescription) {
        setDescription(savedDescription)
      }
    }
  }

  const handleNameChange = async (newValue) => {
    setDisplayName(newValue)
    const terminalName = newValue.toLowerCase().replace(/\s+/g, '')
    setUserName(terminalName || 'user')
    
    // Save to Supabase
    await updateHomeData({ name: newValue })
  }

  const handleSubtitleChange = async (newValue) => {
    setSubtitle(newValue)
    // Save to Supabase
    await updateHomeData({ subtitle: newValue })
  }

  const handleDescriptionChange = async (newValue) => {
    setDescription(newValue)
    // Save to Supabase
    await updateHomeData({ description: newValue })
  }

  const loadQuickLinks = async () => {
    const data = await fetchQuickLinks()
    if (data && data.length > 0) {
      // Transform Supabase data to component format
      const transformed = data.map(item => ({
        path: item.link,
        icon: '🔗', // Default icon
        logo: item.logo || '',
        title: item.title,
        description: item.description
      }))
      setQuickLinks(transformed)
    }
  }

  const loadSocialLinks = async () => {
    const data = await fetchSocialLinks()
    if (data && data.length > 0) {
      // Transform Supabase data to component format
      const transformed = data.map(item => ({
        id: item.id,
        name: item.platform,
        url: item.link,
        logo: item.logo || '',
        type: item.platform === 'Email' ? 'email' : 'link'
      }))
      setSocialLinks(transformed)
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

  const handleQuickLinkUpdate = async (index, field, value) => {
    const updatedLinks = [...quickLinks]
    updatedLinks[index][field] = value
    setQuickLinks(updatedLinks)
    
    // Get all Quick Links from Supabase to find the ID
    const dbLinks = await fetchQuickLinks()
    if (dbLinks && dbLinks[index]) {
      // Update in Supabase
      const linkData = updatedLinks[index]
      await updateQuickLink(dbLinks[index].id, {
        title: linkData.title,
        description: linkData.description,
        link: linkData.path,
        logo: linkData.logo
      })
    }
  }

  const handleLogoUpload = async (index, e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Delete old logo if exists
      if (quickLinks[index].logo) {
        await deleteImage(quickLinks[index].logo)
      }
      
      // Upload new logo to Supabase Storage
      const publicUrl = await uploadToStorage(file, 'quick-links')
      
      const updatedLinks = [...quickLinks]
      updatedLinks[index].logo = publicUrl
      setQuickLinks(updatedLinks)
      
      // Update in Supabase
      const dbLinks = await fetchQuickLinks()
      if (dbLinks && dbLinks[index]) {
        await updateQuickLink(dbLinks[index].id, { logo: publicUrl })
      }
    } catch (error) {
      logger.error('Error uploading logo:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSocialLinkUpdate = async (index, field, value) => {
    const updatedLinks = [...socialLinks]
    updatedLinks[index][field] = value
    setSocialLinks(updatedLinks)
    
    // Get all Social Links from Supabase to find the ID
    const dbLinks = await fetchSocialLinks()
    if (dbLinks && dbLinks[index]) {
      // Update in Supabase
      const linkData = updatedLinks[index]
      await updateSocialLink(dbLinks[index].id, {
        platform: linkData.name,
        link: linkData.url,
        logo: linkData.logo
      })
    }
  }

  const handleSocialLogoUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Delete old logo if exists
      if (socialLinks[index].logo) {
        await deleteImage(socialLinks[index].logo)
      }
      
      // Upload new logo to Supabase Storage
      const publicUrl = await uploadToStorage(file, 'social-links')
      
      await handleSocialLinkUpdate(index, 'logo', publicUrl)
    } catch (error) {
      logger.error('Error uploading social logo:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const addSocialLink = async () => {
    const newLink = { 
      platform: 'New Platform', 
      link: '', 
      logo: '', 
      display_order: socialLinks.length
    }
    
    // Create in Supabase
    const created = await createSocialLink(newLink)
    if (created) {
      // Reload from Supabase
      await loadSocialLinks()
    }
  }

  const handleDeleteSocialLink = async (index) => {
    if (socialLinks.length <= 1) {
      alert('You must have at least one social link')
      return
    }
    
    // Get all Social Links from Supabase to find the ID
    const dbLinks = await fetchSocialLinks()
    if (dbLinks && dbLinks[index]) {
      await deleteSocialLink(dbLinks[index].id)
      // Reload from Supabase
      await loadSocialLinks()
    }
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="home" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '60px',
          height: '60px',
          border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading your portfolio...</p>
      </div>
    )
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in-up">
            <h1 className="hero-title">
              &gt; Hello, I'm <EditableText 
                value={displayName} 
                tag="span"
                className="highlight"
                storageKey="home-name"
                onChange={handleNameChange}
              />
            </h1>
            <EditableText 
              value={subtitle}
              tag="p"
              className="hero-subtitle"
              storageKey="home-subtitle"
              onChange={handleSubtitleChange}
            />
            <EditableText 
              value={description}
              tag="p"
              className="hero-description"
              multiline={true}
              storageKey="home-description"
              onChange={handleDescriptionChange}
            />
            <div className="terminal-prompt">
              <span className="prompt-user">{userName}@cyber-portfolio</span>
              <span className="prompt-symbol">:~$</span>
              <span className="prompt-cursor">_</span>
            </div>
            <div className="hero-buttons">
              <Link to="/projects" className="btn btn-primary">
                View Projects
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-avatar">
              <div 
                className="avatar-placeholder"
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
                    <circle cx="140" cy="140" r="140" fill="url(#gradient)"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    {/* Animated loading spinner */}
                    <circle 
                      cx="140" 
                      cy="140" 
                      r="50" 
                      stroke="white" 
                      strokeWidth="6" 
                      fill="none"
                      strokeDasharray="157 157"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                    <circle 
                      cx="140" 
                      cy="140" 
                      r="50" 
                      stroke="white" 
                      strokeWidth="6" 
                      fill="none"
                      strokeDasharray="78.5 157"
                      strokeLinecap="round"
                      opacity="0.9"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 140 140"
                        to="360 140 140"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text 
                      x="140" 
                      y="220" 
                      fontSize="16" 
                      fill="white" 
                      textAnchor="middle" 
                      fontFamily="Arial"
                      opacity="0.8"
                    >
                      Loading...
                    </text>
                  </svg>
                )}
                
                {isEditMode && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      id="profile-photo-upload"
                    />
                    <label
                      htmlFor="profile-photo-upload"
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

      <section className="quick-links section">
        <div className="container">
          <h2 className="section-title">Quick Links</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <div 
                key={index} 
                className="link-card" 
                onClick={() => {
                  if (!isEditMode) {
                    window.location.href = link.path;
                  }
                }}
                style={{ cursor: isEditMode ? 'default' : 'pointer' }}
              >
                <div 
                  className="link-icon" 
                  style={{ position: 'relative' }}
                  onClick={(e) => {
                    if (isEditMode) {
                      e.stopPropagation();
                      document.getElementById(`quicklink-logo-${index}`).click();
                    }
                  }}
                >
                  {link.logo ? (
                    <img 
                      src={link.logo} 
                      alt={link.title}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain' 
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>{link.icon}</span>
                  )}
                  
                  {isEditMode && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        id={`quicklink-logo-${index}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleLogoUpload(index, e)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0, 0, 0, 0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: 'white',
                          textAlign: 'center',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          pointerEvents: 'none'
                        }}
                        className="quicklink-overlay-text"
                      >
                        📸
                        <br />
                        {link.logo ? 'Change Logo' : 'Upload Logo'}
                      </div>
                    </>
                  )}
                </div>
                <EditableText
                  value={link.title}
                  tag="h3"
                  onChange={(value) => handleQuickLinkUpdate(index, 'title', value)}
                  storageKey={`quicklink-title-${index}`}
                />
                <EditableText
                  value={link.description}
                  tag="p"
                  multiline={true}
                  onChange={(value) => handleQuickLinkUpdate(index, 'description', value)}
                  storageKey={`quicklink-description-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section section">
        <div className="container">
          <h2 className="section-title neon-pulse">Connect With Me</h2>
          <div className="social-links">
            {Array.isArray(socialLinks) && socialLinks.map((link, index) => (
              <div key={link.id} className="social-icon-wrapper">
                <div className="social-icon-container">
                  <a 
                    href={link.type === 'email' ? (link.url ? `mailto:${link.url}` : '#') : (link.url ? `https://${link.url.replace('https://', '')}` : '#')}
                    target={link.type === 'email' ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="social-icon"
                    title={link.name}
                    onClick={(e) => {
                      if (!link.url) {
                        e.preventDefault()
                        if (!isEditMode) {
                          alert(`Please enter your ${link.name} in edit mode (Ctrl+Shift+A)`)
                        }
                      }
                    }}
                  >
                    {link.logo ? (
                      <img 
                        src={link.logo} 
                        alt={link.name}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {link.type === 'email' ? (
                          <>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </>
                        ) : (
                          <>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </>
                        )}
                      </svg>
                    )}
                  </a>
                  
                  {isEditMode && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        id={`social-logo-${index}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleSocialLogoUpload(index, e)}
                      />
                      <label
                        htmlFor={`social-logo-${index}`}
                        className="social-logo-upload"
                        title="Click to upload logo"
                      >
                        📸
                      </label>
                      
                      <button
                        className="delete-social-btn"
                        onClick={() => handleDeleteSocialLink(index)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
                
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      className="social-input social-name-input"
                      placeholder="Platform Name"
                      value={link.name || ''}
                      onChange={(e) => handleSocialLinkUpdate(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="social-input"
                      placeholder={link.type === 'email' ? 'your.email@example.com' : 'profile-url.com'}
                      value={link.url || ''}
                      onChange={(e) => handleSocialLinkUpdate(index, 'url', e.target.value)}
                    />
                  </>
                ) : (
                  <span className="social-tooltip">{link.name}</span>
                )}
              </div>
            ))}
            
            {isEditMode && (
              <div className="social-icon-wrapper">
                <button 
                  className="add-social-btn"
                  onClick={addSocialLink}
                  title="Add New Platform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span className="social-add-label">Add New</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p className="copyright">
              © {new Date().getFullYear()} <EditableText
                value={displayName}
                tag="span"
                storageKey="footer-name"
                onChange={handleNameChange}
              />. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home


