-- Add page description columns to home_data table for storing page-level descriptions

-- Add columns to home_data table
ALTER TABLE home_data 
ADD COLUMN IF NOT EXISTS achievements_description TEXT DEFAULT 'Milestones and accomplishments throughout my journey',
ADD COLUMN IF NOT EXISTS certifications_description TEXT DEFAULT 'Professional certifications and achievements earned through learning and dedication',
ADD COLUMN IF NOT EXISTS projects_description TEXT DEFAULT 'A collection of projects I''ve worked on, showcasing my skills and creativity',
ADD COLUMN IF NOT EXISTS blog_description TEXT DEFAULT 'Thoughts, tutorials, and insights about technology and development';

-- Update existing row with default values if null
UPDATE home_data 
SET 
  achievements_description = COALESCE(achievements_description, 'Milestones and accomplishments throughout my journey'),
  certifications_description = COALESCE(certifications_description, 'Professional certifications and achievements earned through learning and dedication'),
  projects_description = COALESCE(projects_description, 'A collection of projects I''ve worked on, showcasing my skills and creativity'),
  blog_description = COALESCE(blog_description, 'Thoughts, tutorials, and insights about technology and development');

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'home_data' 
AND column_name IN ('achievements_description', 'certifications_description', 'projects_description', 'blog_description');
