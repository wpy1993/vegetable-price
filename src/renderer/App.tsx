import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App 