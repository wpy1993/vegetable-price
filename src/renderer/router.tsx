import { createHashRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import PriceSettings from './pages/PriceSettings'
import ExcelSettings from './pages/ExcelSettings'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'price-settings',
        element: <PriceSettings />
      },
      {
        path: 'excel-settings',
        element: <ExcelSettings />
      }
    ]
  }
])

export default router 