import { useState, useEffect } from 'react'
import './Certifications.css'
import { certifications as defaultCertifications } from '../data/certificationsData'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import logger from '../utils/logger'
import { uploadImage as uploadToStorage, deleteImage } from '../utils/storageHelper'
import { fetchCredlyBadges } from '../utils/credlyService'
import { 
  fetchCertifications, 
  createCertification, 
  updateCertification as updateCertificationDB, 
  deleteCertification as deleteCertificationDB 
} from '../services/database'
import { migrateCertificationsToSupabase } from '../utils/dataMigration'

const Certifications = () => {
  const { isEditMode } = useEditMode()
  const [certifications, setCertifications] = useState([])
  const [credlyBadges, setCredlyBadges] = useState([])
  const [loadingBadges, setLoadingBadges] = useState(true)
  const [badgesError, setBadgesError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('certifications')
  
  // Replace with your actual Credly username
  const credlyUsername = 'kaushik-barman.f500d323'

  useEffect(() => {
    const initializeData = async () => {
      // Migrate localStorage data to Supabase if needed
      await migrateCertificationsToSupabase()
      
      // Load certifications from Supabase
      await loadCertifications()
      
      // Load Credly badges
      await loadCredlyBadges()
    }
    
    initializeData()
  }, [])

  const loadCertifications = async () => {
    const data = await fetchCertifications()
    if (data && data.length > 0) {
      // Transform Supabase data to component format
      const transformed = data.map(cert => ({
        id: cert.id,
        title: cert.name,
        issuer: cert.issuer || '',
        date: cert.date || '',
        description: cert.description || '', // Load from DB (after adding column)
        badgeImage: cert.image || '',
        credentialUrl: cert.url || '',
        certificateUrl: cert.url || ''
      }))
      setCertifications(transformed)
    } else {
      // Use default data if Supabase is empty
      setCertifications(defaultCertifications)
    }
  }
  
  const loadCredlyBadges = async () => {
    try {
      setLoadingBadges(true)
      const badges = await fetchCredlyBadges(credlyUsername)
      setCredlyBadges(badges)
      setBadgesError(null)
    } catch (error) {
      setBadgesError(`Failed to load Credly badges: ${error.message}`)
    } finally {
      setLoadingBadges(false)
    }
  }

  const handleUpdateCertification = async (index, field, value) => {
    const updatedCertifications = [...certifications]
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value }
    setCertifications(updatedCertifications)
    
    // Update in Supabase
    const cert = updatedCertifications[index]
    if (cert.id) {
      // Map component fields to DB fields
      const dbField = field === 'title' ? 'name' : 
                      field === 'badgeImage' ? 'image' : 
                      field === 'credentialUrl' || field === 'certificateUrl' ? 'url' : field
      await updateCertificationDB(cert.id, { [dbField]: value })
    }
  }

  const handleUrlChange = async (index, field, value) => {
    // Update immediately as user types
    const updatedCertifications = [...certifications]
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value }
    setCertifications(updatedCertifications)
    
    // Update in Supabase
    const cert = updatedCertifications[index]
    if (cert.id) {
      await updateCertificationDB(cert.id, { url: value })
    }
  }

  const handleAddCertification = async () => {
    const newCertification = {
      name: 'New Certification',
      issuer: 'Issuing Organization',
      date: 'Month Year',
      url: '',
      image: '',
      display_order: certifications.length
    }
    
    // Create in Supabase
    const created = await createCertification(newCertification)
    if (created) {
      // Reload from Supabase
      await loadCertifications()
    }
  }

  const handleDeleteCertification = async (index) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      const cert = certifications[index]
      if (cert.id) {
        await deleteCertificationDB(cert.id)
        // Reload from Supabase
        await loadCertifications()
      }
    }
  }

  const handleImageUpload = async (index, event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setUploading(true)
        
        // Delete old badge image if exists
        if (certifications[index].badgeImage) {
          await deleteImage(certifications[index].badgeImage)
        }
        
        // Upload new badge image to Supabase Storage
        const publicUrl = await uploadToStorage(file, 'certifications')
        
        await handleUpdateCertification(index, 'badgeImage', publicUrl)
      } catch (error) {
        logger.error('Error uploading certificate image:', error)
        alert('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="certifications-page">
      <section className="certifications-hero section">
        <div className="container">
          <h1 className="section-title">Certifications & Badges</h1>
          <EditableText 
            value="Professional certifications and achievements earned through learning and dedication"
            tag="p"
            className="section-subtitle"
            multiline={true}
            storageKey="certifications-subtitle"
          />

          {/* Tab Navigation */}
          <div className="cert-tabs" style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            marginBottom: '2rem',
            borderBottom: '2px solid var(--border-color)'
          }}>
            <button
              className={`cert-tab ${activeTab === 'certifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('certifications')}
              style={{
                padding: '1rem 2rem',
                background: activeTab === 'certifications' ? 'var(--secondary-color)' : 'transparent',
                color: activeTab === 'certifications' ? 'var(--bg-dark)' : 'var(--text-secondary)',
                border: 'none',
                borderBottom: activeTab === 'certifications' ? '3px solid var(--secondary-color)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              📜 Certifications ({certifications.length})
            </button>
            <button
              className={`cert-tab ${activeTab === 'credly' ? 'active' : ''}`}
              onClick={() => setActiveTab('credly')}
              style={{
                padding: '1rem 2rem',
                background: activeTab === 'credly' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'credly' ? 'var(--bg-dark)' : 'var(--text-secondary)',
                border: 'none',
                borderBottom: activeTab === 'credly' ? '3px solid var(--primary-color)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              🏆 Credly Badges {credlyBadges.length > 0 && `(${credlyBadges.length})`}
            </button>
          </div>

          {/* Credly Badges Tab Content */}
          {activeTab === 'credly' && (
            <div className="tab-content">
              {loadingBadges ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ 
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--border-color)',
                    borderTop: '3px solid var(--primary-color)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Loading Credly badges...
                  </p>
                </div>
              ) : badgesError ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
                    {badgesError}
                  </p>
                  <div style={{ 
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>💡 Why is this happening?</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Credly's API cannot be accessed directly from localhost due to browser security (CORS) restrictions.
                    </p>
                    <h4 style={{ color: 'var(--primary-color)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>✅ Solutions:</h4>
                    <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                      <li><strong>Deploy your site</strong> - This will work on your deployed website!</li>
                      <li><strong>View your badges:</strong> <a href={`https://www.credly.com/users/${credlyUsername}/badges`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>Open Credly Profile</a></li>
                      <li><strong>For testing:</strong> Add manual badge entries in the Certifications tab</li>
                    </ul>
                  </div>
                </div>
              ) : credlyBadges.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  {credlyUsername === 'your-credly-username' 
                    ? 'Please set your Credly username in Certifications.jsx' 
                    : 'No Credly badges found.'}
                </p>
              ) : (
                <div className="certifications-grid">
                  {credlyBadges.map((badge) => (
                    <div key={badge.id} className="certification-card credly-badge">
                      <div className="cert-badge">
                        <img 
                          src={badge.badgeImage} 
                          alt={badge.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                        />
                      </div>
                      <div className="certification-content">
                        <h3>{badge.title}</h3>
                        <p className="cert-issuer">{badge.issuer}</p>
                        <p className="cert-date">{badge.date}</p>
                        {badge.description && (
                          <p className="cert-description">{badge.description}</p>
                        )}
                        {badge.skills && badge.skills.length > 0 && (
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '0.5rem',
                            marginTop: '1rem'
                          }}>
                            {badge.skills.map((skill, i) => (
                              <span key={i} style={{
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="certification-actions" style={{ marginTop: '1rem' }}>
                          <a 
                            href={badge.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary"
                          >
                            View Badge on Credly
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Certifications Tab Content */}
          {activeTab === 'certifications' && (
            <div className="tab-content">
              <div className="certifications-grid">
            {certifications.map((cert, index) => (
              <div key={index} className="certification-card" style={{ position: 'relative' }}>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteCertification(index)}
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
                <div 
                  className="certification-badge" 
                  style={{ 
                    position: 'relative',
                    cursor: isEditMode ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (isEditMode) {
                      document.getElementById(`cert-image-upload-${index}`).click()
                    }
                  }}
                >
                  {cert.badgeImage ? (
                    <img src={cert.badgeImage} alt={cert.title} />
                  ) : (
                    <div className="badge-placeholder">
                      <div className="badge-icon">🎓</div>
                    </div>
                  )}
                  {isEditMode && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        style={{ display: 'none' }}
                        id={`cert-image-upload-${index}`}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                          zIndex: 2
                        }}
                        className="upload-overlay"
                      >
                        <div style={{
                          background: 'var(--primary-color)',
                          color: 'var(--bg-dark)',
                          padding: '1rem 2rem',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          border: '2px solid var(--bg-dark)'
                        }}>
                          📸 {cert.badgeImage ? 'Change' : 'Upload'} Certificate
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="certification-content">
                  <EditableText
                    value={cert.title}
                    tag="h3"
                    onChange={(value) => handleUpdateCertification(index, 'title', value)}
                    storageKey={`cert-title-${index}`}
                  />
                  <EditableText
                    value={cert.issuer}
                    tag="h4"
                    onChange={(value) => handleUpdateCertification(index, 'issuer', value)}
                    storageKey={`cert-issuer-${index}`}
                  />
                  <EditableText
                    value={cert.date}
                    className="certification-date"
                    tag="span"
                    onChange={(value) => handleUpdateCertification(index, 'date', value)}
                    storageKey={`cert-date-${index}`}
                  />
                  <EditableText
                    value={cert.description || ''}
                    tag="p"
                    multiline={true}
                    onChange={(value) => handleUpdateCertification(index, 'description', value)}
                    storageKey={`cert-description-${index}`}
                  />
                  
                  {isEditMode && (
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Credential URL:</label>
                      <input
                        type="url"
                        value={cert.credentialUrl || ''}
                        onChange={(e) => handleUrlChange(index, 'credentialUrl', e.target.value)}
                        placeholder="https://example.com/credential"
                        style={{ 
                          width: '100%',
                          fontSize: '0.85rem', 
                          padding: '0.5rem', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: '4px',
                          border: '1px solid var(--border-dim)',
                          color: 'var(--secondary-color)',
                          fontFamily: 'Courier New, monospace'
                        }}
                      />
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Certificate URL:</label>
                      <input
                        type="url"
                        value={cert.certificateUrl || ''}
                        onChange={(e) => handleUrlChange(index, 'certificateUrl', e.target.value)}
                        placeholder="https://example.com/certificate.pdf"
                        style={{ 
                          width: '100%',
                          fontSize: '0.85rem', 
                          padding: '0.5rem', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: '4px',
                          border: '1px solid var(--border-dim)',
                          color: 'var(--secondary-color)',
                          fontFamily: 'Courier New, monospace'
                        }}
                      />
                    </div>
                  )}

                  {!isEditMode && (
                    <div className="certification-actions">
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEditMode && (
              <div className="certification-card" style={{ border: '2px dashed var(--border-color)', cursor: 'pointer', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleAddCertification}>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
                  <span style={{ fontSize: '3rem', display: 'block' }}>+</span>
                  <p>Add New Certification</p>
                </div>
              </div>
            )}
          </div>
          </div>
          )}

        </div>
      </section>
    </div>
  )
}

export default Certifications


