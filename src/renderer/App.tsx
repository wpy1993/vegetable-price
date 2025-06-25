import React from 'react'
import { Outlet } from 'react-router-dom'
import NavigationBar from './components/NavigationBar.tsx'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <NavigationBar />
        <main>
          <Outlet />
        </main>
      </div>
    </ConfigProvider>
  )
}

export default App 