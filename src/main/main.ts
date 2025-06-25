import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import * as path from "path";
import isDev from "electron-is-dev";
require("@electron/remote/main").initialize();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  require("@electron/remote/main").enable(mainWindow.webContents);

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // 注册快捷键的函数
  const registerShortcuts = () => {
    // 注册快捷键
    globalShortcut.register("Alt+Left", () => {
      mainWindow?.webContents.goBack();
    });

    globalShortcut.register("Alt+Right", () => {
      mainWindow?.webContents.goForward();
    });

    // 添加打开开发者工具的快捷键（ctrl+i）
    globalShortcut.register("CommandOrControl+I", () => {
      mainWindow?.webContents.toggleDevTools();
    });
  };

  // 注销快捷键的函数
  const unregisterShortcuts = () => {
    globalShortcut.unregister("Alt+Left");
    globalShortcut.unregister("Alt+Right");
    globalShortcut.unregister("CommandOrControl+I");
  };

  // 当窗口获得焦点时注册快捷键
  mainWindow.on("focus", registerShortcuts);

  // 当窗口失去焦点时注销快捷键
  mainWindow.on("blur", unregisterShortcuts);

  // 当窗口关闭时注销快捷键
  mainWindow.on("close", unregisterShortcuts);

  // 监听渲染进程的导航请求
  ipcMain.on("nav-back", () => {
    mainWindow?.webContents.goBack();
  });

  ipcMain.on("nav-forward", () => {
    mainWindow?.webContents.goForward();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 当应用退出时注销快捷键
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
