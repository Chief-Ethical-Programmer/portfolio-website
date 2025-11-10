import logger from './logger'

// Fetch Medium posts from RSS feed
export const fetchMediumPosts = async (username) => {
  try {
    // Using RSS2JSON API to convert Medium RSS to JSON (bypasses CORS)
    const rssUrl = `https://medium.com/feed/@${username}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    logger.log('Fetching Medium posts for:', username);
    logger.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Medium posts');
    }
    
    const data = await response.json();
    
    logger.log('Medium API response:', data);
    
    if (data.status !== 'ok') {
      logger.error('RSS2JSON error:', data.message);
      throw new Error(data.message || 'Invalid RSS feed');
    }
    
    if (!data.items || data.items.length === 0) {
      logger.warn('No blog posts found for user:', username);
      return [];
    }
    
    // Transform Medium posts to match our blog post format
    return data.items.map((item) => {
      // Extract image from content or use default
      const imageMatch = item.content?.match(/<img[^>]+src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : null;
      
      // Extract excerpt (first paragraph or description)
      const excerpt = item.content 
        ? item.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        : item.description || '';
      
      // Parse date
      const date = new Date(item.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Extract category/tags from categories array
      const tags = item.categories || [];
      
      return {
        title: item.title,
        excerpt: excerpt,
        content: item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : excerpt,
        date: date,
        category: tags[0] || 'Article',
        tags: tags.slice(0, 4), // Limit to 4 tags
        readMore: item.link,
        image: image,
        mediumUrl: item.link
      };
    });
  } catch (error) {
    logger.error('Error fetching Medium posts:', error);
    return [];
  }
};



