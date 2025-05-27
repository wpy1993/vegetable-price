import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ipcRenderer } from 'electron'

const NavigationBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      // ipcRenderer.send('nav-back')
    }
  }

  return (
    <div className="navigation-bar">
      <button
        className="nav-button"
        onClick={handleBack}
        disabled={location.pathname === '/'}
      >
        返回
      </button>
    </div>
  )
}

export default NavigationBar 