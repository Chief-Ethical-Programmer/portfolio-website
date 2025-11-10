import { useState, useEffect } from 'react'
import './Projects.css'
import { projects as defaultProjects } from '../data/projectsData'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import logger from '../utils/logger'
import { fetchProjects, createProject, updateProject as updateProjectDB, deleteProject, fetchHomeData, updateHomeData } from '../services/database'

const Projects = () => {
  const { isEditMode } = useEditMode()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [pageDescription, setPageDescription] = useState('A collection of projects I\'ve worked on, showcasing my skills and creativity')
  
  useEffect(() => {
    const initializeData = async () => {
      await loadProjects()
      await loadPageDescription()
    }
    initializeData()
  }, [])
  
  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await fetchProjects()
      logger.log('Fetched projects from database:', data)
      logger.log('Number of projects:', data.length)
      
      // Only show projects from database, don't use default projects
      if (!data || data.length === 0) {
        logger.log('No projects in database')
        setProjects([])
      } else {
        // Ensure all projects have categories array
        const projectsWithCategories = data.map(project => ({
          ...project,
          categories: project.categories && project.categories.length > 0 
            ? project.categories 
            : (project.category ? [project.category] : ['Uncategorized'])
        }))
        logger.log('Projects with categories:', projectsWithCategories)
        setProjects(projectsWithCategories)
      }
    } catch (error) {
      logger.error('Error loading projects:', error)
      // On error, show empty list
      setProjects([])
    }
    setLoading(false)
  }

  const loadPageDescription = async () => {
    const data = await fetchHomeData()
    if (data && data.projects_description) {
      setPageDescription(data.projects_description)
    }
  }

  const handlePageDescriptionChange = async (newValue) => {
    setPageDescription(newValue)
    await updateHomeData({ projects_description: newValue })
  }
  
  const updateProject = async (id, updates) => {
    const updated = await updateProjectDB(id, updates)
    if (updated) {
      // Ensure categories array exists in updated project
      const projectWithCategories = {
        ...updated,
        categories: updated.categories && updated.categories.length > 0 ? updated.categories : ['Uncategorized']
      }
      setProjects(projects.map(p => p.id === id ? projectWithCategories : p))
    }
  }
  
  const handleCreateProject = async () => {
    try {
      const newProject = {
        title: 'New Project',
        description: 'Project description goes here.',
        categories: ['Uncategorized'],
        technologies: ['Technology 1', 'Technology 2'],
        github: 'https://github.com/yourusername/project'
      }
      const created = await createProject(newProject)
      if (created) {
        // Ensure the created project has proper categories
        const projectWithCategories = {
          ...created,
          categories: created.categories || ['Uncategorized']
        }
        setProjects([...projects, projectWithCategories])
      } else {
        alert('Failed to create project. Please check console for errors.')
      }
    } catch (error) {
      logger.error('Error creating project:', error)
      alert('Failed to create project: ' + error.message)
    }
  }
  
  const handleDeleteProject = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const success = await deleteProject(id)
      if (success) {
        setProjects(projects.filter(p => p.id !== id))
      } else {
        alert('Failed to delete project from database.')
      }
    }
  }
  
  // Get all unique categories from all projects
  const allCategories = projects.flatMap(project => project.categories || []).filter(Boolean)
  const categories = ['All', ...new Set(allCategories)].sort()

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(project => {
        const projectCategories = project.categories || []
        return projectCategories.includes(filter)
      })

  if (loading) {
    return (
      <div className="projects-page" style={{ 
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="projects-page">
      <section className="projects-hero section">
        <div className="container">
          <h1 className="section-title">My Projects</h1>
          <EditableText 
            value={pageDescription}
            tag="p"
            className="section-subtitle"
            multiline={true}
            onChange={handlePageDescriptionChange}
            storageKey="projects-subtitle"
          />

          {categories.length > 1 && (
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${filter === category ? 'active' : ''}`}
                  onClick={() => setFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="projects-grid">
            {filteredProjects.map((project) => {
              return (
                <div 
                  key={project.id} 
                  className="project-card"
                  style={{ cursor: 'default', position: 'relative' }}
                >
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleDeleteProject(project.id)
                      }}
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 0.4)';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 0.2)';
                        e.target.style.transform = 'scale(1)';
                      }}
                      title="Delete this project"
                    >
                      ×
                    </button>
                  )}
                  <div className="project-content">
                    <div className="project-header">
                      {/* Display Categories */}
                      <div className="project-tags">
                        {(project.categories || []).map((category, i) => (
                          <span key={i} className="project-category" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {isEditMode ? (
                              <>
                                <EditableText
                                  value={category}
                                  tag="span"
                                  className=""
                                  onChange={(newValue) => {
                                    if (newValue && newValue.trim()) {
                                      const currentCategories = project.categories || [];
                                      const newCategories = [...currentCategories];
                                      newCategories[i] = newValue.trim();
                                      updateProject(project.id, { categories: newCategories });
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentCategories = project.categories || [];
                                    const newCategories = currentCategories.filter((_, idx) => idx !== i);
                                    updateProject(project.id, { categories: newCategories.length > 0 ? newCategories : ['Uncategorized'] });
                                  }}
                                  style={{
                                    background: 'rgba(255, 0, 0, 0.3)',
                                    border: 'none',
                                    color: '#ff4444',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    flexShrink: 0
                                  }}
                                  title="Remove category"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              category
                            )}
                          </span>
                        ))}
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              logger.log('Add category clicked for project:', project.id);
                              logger.log('Current categories:', project.categories);
                              const currentCategories = project.categories || [];
                              const newCategories = [...currentCategories, 'New Category'];
                              logger.log('New categories:', newCategories);
                              updateProject(project.id, { categories: newCategories });
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px dashed var(--primary-color)',
                              color: 'var(--primary-color)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(0, 255, 65, 0.1)';
                              e.target.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                            title="Add new category"
                          >
                            + Category
                          </button>
                        )}
                      </div>
                    </div>
                    <EditableText
                      value={project.title}
                      tag="h3"
                      onChange={(newValue) => {
                        updateProject(project.id, { title: newValue });
                      }}
                    />
                    <EditableText
                      value={project.description}
                      tag="p"
                      multiline={true}
                      onChange={(newValue) => {
                        updateProject(project.id, { description: newValue });
                      }}
                    />
                    {isEditMode && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '0.25rem'
                        }}>
                          GitHub URL:
                        </label>
                        <EditableText
                          value={project.github}
                          tag="div"
                          style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--secondary-color)',
                            padding: '0.5rem',
                            background: 'rgba(0, 255, 255, 0.05)',
                            borderRadius: '4px',
                            border: '1px solid var(--border-dim)'
                          }}
                          onChange={(newValue) => {
                            updateProject(project.id, { github: newValue });
                          }}
                        />
                      </div>
                    )}
                    <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {project.technologies.map((tech, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <EditableText
                            value={tech}
                            tag="span"
                            className="tech-tag"
                            onChange={(newValue) => {
                              if (newValue && newValue.trim()) {
                                const newTechnologies = [...project.technologies];
                                newTechnologies[i] = newValue.trim();
                                updateProject(project.id, { technologies: newTechnologies });
                              }
                            }}
                          />
                          {isEditMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTechnologies = project.technologies.filter((_, idx) => idx !== i);
                                if (newTechnologies.length > 0) {
                                  updateProject(project.id, { technologies: newTechnologies });
                                }
                              }}
                              style={{
                                background: 'rgba(255, 0, 0, 0.3)',
                                border: 'none',
                                color: '#ff4444',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '0.6rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                flexShrink: 0
                              }}
                              title="Remove technology"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTechnologies = [...project.technologies, 'New Tech'];
                            updateProject(project.id, { technologies: newTechnologies });
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px dashed var(--secondary-color)',
                            color: 'var(--secondary-color)',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                          title="Add technology"
                        >
                          + Tech
                        </button>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-dim)'
                    }}>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link-center"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(0, 255, 65, 0.1)',
                          border: '1px solid var(--primary-color)',
                          borderRadius: '8px',
                          color: 'var(--primary-color)',
                          transition: 'all 0.3s ease',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(0, 255, 65, 0.2)';
                          e.target.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.4)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(0, 255, 65, 0.1)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        View on GitHub
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isEditMode && (
              <div className="project-card" style={{ border: '2px dashed var(--border-color)' }}>
                <button
                  onClick={handleCreateProject}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '300px',
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
                  <span>Add New Project</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Projects


