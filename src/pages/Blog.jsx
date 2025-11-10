import { useState, useEffect } from 'react'
import './Blog.css'
import { fetchMediumPosts } from '../utils/mediumService'
import { useEditMode } from '../context/EditModeContext'
import EditableText from '../components/EditableText'
import logger from '../utils/logger'
import { supabase } from '../config/supabase'

const Blog = () => {
  const { isEditMode } = useEditMode()
  const [selectedPost, setSelectedPost] = useState(null)
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hiddenPostUrls, setHiddenPostUrls] = useState(new Set())

  // Replace 'your-medium-username' with your actual Medium username
  const mediumUsername = 'chiefthinker' // e.g., 'john-doe' for @john-doe

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        logger.log('Loading blog posts for username:', mediumUsername)
        
        // Load Medium posts
        const posts = await fetchMediumPosts(mediumUsername)
        logger.log('Fetched posts:', posts.length)
        
        if (!posts || posts.length === 0) {
          logger.warn('No posts returned from Medium API')
        }
        
        setBlogPosts(posts)
        
        // Load hidden posts from Supabase (optional - table may not exist)
        try {
          const { data: hiddenBlogs, error: hiddenError } = await supabase
            .from('hidden_blogs')
            .select('post_url')
          
          if (hiddenError) {
            logger.warn('Hidden blogs table not found or error loading:', hiddenError.message)
            // Table doesn't exist yet, that's okay
          } else {
            // Store hidden post URLs in a Set for quick lookup
            const hiddenUrls = new Set(hiddenBlogs?.map(blog => blog.post_url) || [])
            setHiddenPostUrls(hiddenUrls)
          }
        } catch (hiddenError) {
          logger.warn('Could not load hidden blogs:', hiddenError)
          // Continue without hidden blogs functionality
        }
        
        setError(null)
      } catch (err) {
        setError('Failed to load blog posts. Please try again later.')
        logger.error('Error loading blog data:', err)
        logger.error('Error details:', err.message, err.stack)
      } finally {
        setLoading(false)
      }
    }

    if (mediumUsername) {
      loadData()
    } else {
      setError('Medium username not configured')
      setLoading(false)
    }
  }, [mediumUsername])

  const togglePostVisibility = async (post) => {
    const postUrl = post.mediumUrl || post.readMore
    const isCurrentlyHidden = hiddenPostUrls.has(postUrl)
    
    try {
      if (isCurrentlyHidden) {
        // Show the post - remove from hidden_blogs table
        const { error } = await supabase
          .from('hidden_blogs')
          .delete()
          .eq('post_url', postUrl)
        
        if (error) throw error
        
        // Update local state
        const newHiddenUrls = new Set(hiddenPostUrls)
        newHiddenUrls.delete(postUrl)
        setHiddenPostUrls(newHiddenUrls)
      } else {
        // Hide the post - add to hidden_blogs table
        const { error } = await supabase
          .from('hidden_blogs')
          .insert({
            post_url: postUrl,
            post_title: post.title
          })
        
        if (error) throw error
        
        // Update local state
        const newHiddenUrls = new Set(hiddenPostUrls)
        newHiddenUrls.add(postUrl)
        setHiddenPostUrls(newHiddenUrls)
      }
    } catch (err) {
      logger.error('Error toggling post visibility:', err)
      alert('Failed to update post visibility. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="blog-page">
        <section className="blog-hero section">
          <div className="container">
            <h1 className="section-title">Blog Posts</h1>
            <p className="section-subtitle">
              Loading articles from Medium...
            </p>
            <div className="loading-spinner" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid var(--border-color)',
                borderTop: '3px solid var(--primary-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-page">
        <section className="blog-hero section">
          <div className="container">
            <h1 className="section-title">Blog Posts</h1>
            <p className="section-subtitle" style={{ color: 'var(--accent-color)' }}>
              {error}
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="blog-page">
      <section className="blog-hero section">
        <div className="container">
          <h1 className="section-title">Blog Posts</h1>
          <EditableText 
            value="Security research, tutorials, and insights from Medium"
            tag="p"
            className="section-subtitle"
            multiline={true}
            storageKey="blog-subtitle"
          />

          {blogPosts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              No blog posts found.
            </p>
          ) : (
            <div className="blog-grid">
              {blogPosts.map((post, index) => {
                const postUrl = post.mediumUrl || post.readMore
                const isHidden = hiddenPostUrls.has(postUrl)
                
                // Hide post for visitors if it's marked as hidden
                if (isHidden && !isEditMode) {
                  return null
                }

                return (
                <article
                  key={index}
                  className={`blog-card ${isHidden ? 'hidden-post' : ''}`}
                  onClick={() => setSelectedPost(selectedPost === index ? null : index)}
                  style={{
                    opacity: isHidden && isEditMode ? 0.5 : 1,
                    position: 'relative'
                  }}
                >
                  <div className="blog-image">
                    <div className="blog-image-placeholder">
                      {post.image ? (
                        <img src={post.image} alt={post.title} />
                      ) : (
                        <div className="placeholder-content">📝</div>
                      )}
                    </div>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-date">{post.date}</span>
                      <span className="blog-category">{post.category}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p className="blog-excerpt">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="blog-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedPost === index && (
                      <div className="blog-full-content">
                        <div className="blog-body">
                          {post.content}
                        </div>
                        <div className="blog-actions">
                          <a
                            href={post.mediumUrl || post.readMore}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            Read on Medium
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedPost !== index && (
                      <button 
                        className="read-more-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPost(index)
                        }}
                      >
                        Read More
                      </button>
                    )}
                    
                    {isEditMode && (
                      <button
                        className="toggle-visibility-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePostVisibility(post)
                        }}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: isHidden ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                          border: `1px solid ${isHidden ? 'var(--primary-color)' : 'var(--accent-color)'}`,
                          color: isHidden ? 'var(--primary-color)' : 'var(--accent-color)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          width: '100%'
                        }}
                      >
                        {isHidden ? '👁️ Show to Visitors' : '🙈 Hide from Visitors'}
                      </button>
                    )}
                  </div>
                </article>
              )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Blog


