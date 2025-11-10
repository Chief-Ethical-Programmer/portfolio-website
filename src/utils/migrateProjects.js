import { supabase } from '../config/supabase.js'

// Default projects data with categories
const projectsToMigrate = [
  {
    title: 'Network Scanner Tool',
    description: 'A Python-based network scanning tool for discovering hosts, open ports, and services on a network. Features include port scanning, service detection, and vulnerability assessment.',
    categories: ['Pentesting', 'Network'],
    technologies: ['Python', 'Scapy', 'Nmap', 'Linux'],
    github: 'https://github.com/example'
  },
  {
    title: 'Password Security Analyzer',
    description: 'A security tool that analyzes password strength, checks for common vulnerabilities, and tests against known password dictionaries. Helps identify weak passwords in systems.',
    categories: ['Security', 'Pentesting'],
    technologies: ['Python', 'Hashcat', 'Cryptography', 'CLI'],
    github: 'https://github.com/Chief-Ethical-Programmer/Detectify'
  },
  {
    title: 'Web Vulnerability Scanner',
    description: 'An automated web application security scanner that detects common vulnerabilities like SQL injection, XSS, CSRF, and other OWASP Top 10 issues.',
    categories: ['Web Security', 'Pentesting'],
    technologies: ['Python', 'Requests', 'BeautifulSoup', 'OWASP'],
    github: 'https://github.com/example'
  },
  {
    title: 'Network Packet Analyzer',
    description: 'A custom network packet analyzer built with Python and Scapy for capturing, analyzing, and inspecting network traffic in real-time.',
    categories: ['Network', 'Forensics'],
    technologies: ['Python', 'Scapy', 'Wireshark', 'Network Analysis'],
    github: 'https://github.com/example'
  },
  {
    title: 'Malware Detection System',
    description: 'A machine learning-based malware detection system that analyzes file signatures and behavioral patterns to identify potentially malicious software.',
    categories: ['Malware Analysis', 'Machine Learning'],
    technologies: ['Python', 'Machine Learning', 'YARA', 'Forensics'],
    github: 'https://github.com/example'
  },
  {
    title: 'CTF Challenge Platform',
    description: 'A Capture The Flag platform for hosting security challenges, including crypto, web, forensics, and reverse engineering challenges.',
    categories: ['CTF', 'Web Development'],
    technologies: ['Docker', 'Python', 'Flask', 'Linux'],
    github: 'https://github.com/example'
  }
]

async function migrateProjects() {
  logger.log('Starting projects migration...')
  
  try {
    // Check if projects already exist
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
    
    if (fetchError) {
      logger.error('Error checking existing projects:', fetchError)
      return
    }
    
    logger.log(`Found ${existingProjects.length} existing projects`)
    
    if (existingProjects.length > 0) {
      logger.log('Projects already exist. Skipping migration.')
      logger.log('If you want to re-migrate, delete existing projects first.')
      return
    }
    
    // Insert projects one by one
    let successCount = 0
    let errorCount = 0
    
    for (const project of projectsToMigrate) {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
      
      if (error) {
        logger.error(`Error inserting project "${project.title}":`, error)
        errorCount++
      } else {
        logger.log(`✓ Successfully inserted: ${project.title}`)
        successCount++
      }
    }
    
    logger.log('\n=== Migration Complete ===')
    logger.log(`Success: ${successCount}`)
    logger.log(`Errors: ${errorCount}`)
    logger.log('==========================')
    
    // Verify
    const { data: finalProjects } = await supabase
      .from('projects')
      .select('*')
    
    logger.log(`\nTotal projects in database: ${finalProjects.length}`)
    
  } catch (error) {
    logger.error('Migration failed:', error)
  }
}

// Run migration
migrateProjects()
