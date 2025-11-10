import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { EditModeProvider } from './context/EditModeContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import Achievements from './pages/Achievements'
import Certifications from './pages/Certifications'
import { runAllMigrations } from './utils/dataMigration'
import { initializeSecurity } from './utils/security'
import './App.css'

function App() {
  // Initialize security measures and run migrations
  useEffect(() => {
    initializeSecurity()
    runAllMigrations()
  }, [])

  return (
    <ErrorBoundary>
      <EditModeProvider>
        <Router>
          <div className="App">
            <Navigation />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/certifications" element={<Certifications />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </Router>
      </EditModeProvider>
    </ErrorBoundary>
  )
}

export default App


