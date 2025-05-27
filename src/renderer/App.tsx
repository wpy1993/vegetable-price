import React from 'react'
import { Outlet } from 'react-router-dom'
import NavigationBar from './components/NavigationBar.tsx'



const App: React.FC = () => {
  return (
    <div className="app">
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App 