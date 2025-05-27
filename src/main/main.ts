import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import * as path from 'path'
import isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // 注册快捷键
  globalShortcut.register('Alt+Left', () => {
    mainWindow?.webContents.goBack()
  })

  globalShortcut.register('Alt+Right', () => {
    mainWindow?.webContents.goForward()
  })

  // 监听渲染进程的导航请求
  ipcMain.on('nav-back', () => {
    mainWindow?.webContents.goBack()
  })

  ipcMain.on('nav-forward', () => {
    mainWindow?.webContents.goForward()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 当应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
}) 