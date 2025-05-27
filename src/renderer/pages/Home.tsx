import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="home">
      <h1>价格管理系统</h1>
      <div className="button-container">
        <button
          className="primary-button"
          onClick={() => navigate('/price-settings')}
        >
          设置默认价格
        </button>
        <button
          className="primary-button"
          onClick={() => navigate('/excel-settings')}
        >
          一键设置Excel
        </button>
      </div>
    </div>
  )
}

export default Home 