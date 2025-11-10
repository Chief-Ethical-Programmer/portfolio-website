import { useEditMode } from '../context/EditModeContext'
import './ExportData.css'

const ExportData = () => {
  const { isEditMode } = useEditMode()

  const handleExport = () => {
    const data = {
      skills: JSON.parse(localStorage.getItem('skills') || '[]'),
      experience: JSON.parse(localStorage.getItem('experience') || '[]'),
      education: JSON.parse(localStorage.getItem('education') || '[]'),
      homeData: {
        name: localStorage.getItem('home-name'),
        subtitle: localStorage.getItem('home-subtitle'),
        description: localStorage.getItem('home-description')
      },
      aboutData: {
        intro: localStorage.getItem('about-intro'),
        description: localStorage.getItem('about-description')
      }
    }

    // Create a formatted string to paste into aboutData.js
    const exportString = `
// Copy this and paste into your aboutData.js file
// Replace the defaultSkills, defaultExperience, and defaultEducation arrays

export const skills = ${JSON.stringify(data.skills, null, 2)};

export const experience = ${JSON.stringify(data.experience, null, 2)};

export const education = ${JSON.stringify(data.education, null, 2)};

// Also update these in your other data files:
// home-name: "${data.homeData.name}"
// home-subtitle: "${data.homeData.subtitle}"
// home-description: "${data.homeData.description}"
// about-intro: "${data.aboutData.intro}"
// about-description: "${data.aboutData.description}"
`

    // Copy to clipboard
    navigator.clipboard.writeText(exportString).then(() => {
      alert('✅ Data copied to clipboard! \n\nPaste it into your aboutData.js file, commit to git, and deploy to make it permanent for all visitors.')
    }).catch(() => {
      // Fallback: download as file
      const blob = new Blob([exportString], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'exported-data.js'
      a.click()
      URL.revokeObjectURL(url)
      alert('✅ Data downloaded as exported-data.js! \n\nCopy the content into your aboutData.js file.')
    })
  }

  if (!isEditMode) return null

  return (
    <div className="export-data-container">
      <button onClick={handleExport} className="export-btn">
        💾 Export Changes
      </button>
      <p className="export-hint">
        Click to export your edits. Then paste into aboutData.js and deploy.
      </p>
    </div>
  )
}

export default ExportData
