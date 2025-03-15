"use strict";
const {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  Tray,
  globalShortcut,
  // 全局的快捷键
  nativeImage,
  Menu,
  desktopCapturer,
  screen
} = require("electron");
const { getLocalIPAddress, getLocalPort } = require("./platform.js");
const Screenshots = require("electron-screenshots");
require("fs");
require("tmp");
const path = require("node:path");
const { ref } = require("vue");
require("element-plus");
const packageJson = require("../package.json");
const { electronApp, optimizer, is } = require("@electron-toolkit/utils");
const { saveImageByBuffer, saveImageByBase64 } = require("./FileHandle.js");
require("./sqlite3/DataBase");
let baseURL = `http://${getLocalIPAddress()}:${getLocalPort()}/`;
let win;
let childWindows = {};
let screenshots;
let screenShotWindowId;
let isMainWindowFocusedWhenStartScreenshot = false;
const contextMenu = Menu.buildFromTemplate([
  { label: "关于", type: "normal" },
  {
    label: "退出",
    type: "normal",
    click: () => {
      win.show();
      app.quit();
    }
  }
]);
const defaultOption = ref({
  //窗口的默认配置
  x: 550,
  y: 250,
  width: 850,
  height: 550,
  icon: path.join(__dirname, "icon/favicon.ico"),
  autoHideMenuBar: true,
  titleBarStyle: "hidden",
  //隐藏窗口上方默认菜单栏
  show: false,
  frame: false,
  // 无边框窗口
  maximizable: false,
  // 是否可以放大
  transparent: false,
  // 设置是否有背景
  resizable: false,
  // 设置窗口不能拉伸
  webPreferences: {
    nodeIntegration: true,
    // 允许node的集成环境，渲染进程也能使用nodejs
    enableRemoteModule: true,
    // 是否允许开启远程模块
    contextIsolation: true,
    // 开启上下文隔离，则渲染进程无法使用require
    preload: path.join(__dirname, "preload.js"),
    //传入预加载js脚本文件
    // devTools: false,
    sandbox: true,
    webSecurity: false
    // 允许跨域请求
  }
});
function createWindow() {
  win = new BrowserWindow(defaultOption.value);
  let isDevProcess = process.env.VITE_DEV_SERVER_URL;
  if (isDevProcess) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  }
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && !isDevProcess) {
      if (input.key === "F12" || input.control && input.key === "i" || input.control && input.key === "r") {
        event.preventDefault();
      }
    }
  });
  win.on("ready-to-show", () => {
    win.show();
  });
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  win.on("will-resize", (event, newBounds) => {
    if (newBounds.height < 840 || newBounds.width < 1170) {
      event.preventDefault();
      win.setBounds({
        ...newBounds,
        height: newBounds.height < 840 ? 840 : newBounds.height,
        // 规定最小窗口高度为 840
        width: newBounds.width < 1170 ? 1170 : newBounds.width
      });
    }
  });
  win.on("resize", () => {
    const [width, height] = win.getSize();
    setTimeout(() => {
      win.webContents.send("window-size-update", {
        width,
        height
      });
    }, 10);
  });
  win.on("close", (e) => {
    app.quit();
  });
  win.hookWindowMessage && win.hookWindowMessage(278, function() {
    win.setEnabled(false);
    let timer = setTimeout(() => {
      win.setEnabled(true);
      clearTimeout(timer);
    }, 100);
    return true;
  });
}
function createChildWindow(data = defaultOption.value) {
  if (childWindows[data.winName]) {
    childWindows[data.winName].show();
    return;
  }
  let childWin = new BrowserWindow({
    width: data.width,
    height: data.height,
    icon: data.icon,
    autoHideMenuBar: data.autoHideMenuBar,
    titleBarStyle: data.titleBarStyle,
    show: data.show,
    frame: data.frame,
    // 有无边框窗口
    maximizable: data.maximizable,
    // 是否可以放大
    transparent: data.transparent,
    // 设置是否有背景
    resizable: data.resizable,
    // 设置窗口能否拉伸
    webPreferences: {
      nodeIntegration: data.webPreferences.nodeIntegration,
      // 允许node的集成环境，渲染进程也能使用nodejs
      enableRemoteModule: data.webPreferences.enableRemoteModule,
      // 是否允许开启远程模块
      contextIsolation: data.webPreferences.contextIsolation,
      // 关闭上下文隔离
      preload: data.webPreferences.preload,
      //传入预加载js脚本文件
      // devTools: false,
      sandbox: data.webPreferences.sandbox,
      webSecurity: data.webPreferences.webSecurity
      // 是否不允许跨域请求
    }
  });
  childWin.loadURL(baseURL + "#" + data.path).then(() => {
    if (data.transportObj) {
      const transportObj = data.transportObj;
      childWin.webContents.send("fromMain", transportObj);
    }
  });
  childWin.on("ready-to-show", () => {
    childWin.show();
  });
  childWin.on("closed", () => {
    delete childWindows[data.winName];
  });
  childWindows[data.winName] = childWin;
}
function closeAllChildWindows() {
  for (const winName in childWindows) {
    if (childWindows[winName]) {
      childWindows[winName].close();
    }
  }
  childWindows = {};
}
function regShortcut() {
  globalShortcut.register("Control+F5", () => {
    win.webContents.reload();
  });
  globalShortcut.register("CommandOrControl+shift+a", () => {
    isMainWindowFocusedWhenStartScreenshot = win.isFocused();
    console.log("isMainWindowFocusedWhenStartScreenshot", win.isFocused());
    screenshots.startCapture();
  });
  globalShortcut.register("ctrl+shift+i", () => {
    let windows = BrowserWindow.getAllWindows();
    windows.forEach((win2) => win2.openDevTools({ mode: "detach" }));
  });
}
app.on("browser-window-created", (_, window) => {
  optimizer.watchWindowShortcuts(window);
});
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  createWindow();
  regShortcut();
  screenshots = new Screenshots({
    // logger: console.log
    singleWindow: true
  });
  const onScreenShotEnd = (result) => {
    console.log("onScreenShotEnd", isMainWindowFocusedWhenStartScreenshot, screenShotWindowId);
    if (isMainWindowFocusedWhenStartScreenshot) {
      if (result) {
        win.webContents.send("screenshots-ok", result);
      }
      win.show();
      isMainWindowFocusedWhenStartScreenshot = false;
    } else if (screenShotWindowId) {
      let windows = BrowserWindow.getAllWindows();
      let tms = windows.filter((win1) => win1.webContents.id === screenShotWindowId);
      if (tms.length > 0) {
        if (result) {
          tms[0].webContents.send("screenshots-ok", result);
        }
        tms[0].show();
      }
      screenShotWindowId = 0;
    }
  };
  screenshots.on("ok", (e, buffer, bounds) => {
    saveImageByBuffer(buffer).then((filePath) => {
      console.log("screenshots ok", e);
      onScreenShotEnd({
        filePath,
        // 图片保存在本地的路径
        base64: "data:image/png;base64," + btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        // 转成base64数据
      });
    });
  });
  screenshots.on("cancel", (e) => {
    console.log("screenshots cancel", e);
    onScreenShotEnd();
  });
  screenshots.on("save", (e, { viewer }) => {
    console.log("screenshots save", e);
    onScreenShotEnd();
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  const tray = new Tray(nativeImage.createFromPath("static/favicon.ico"));
  tray.setToolTip(packageJson.name);
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    win.show();
  });
});
app.on("before-quit", () => {
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
const additionalData = { myKey: "MineChat" };
const gotTheLock = app.requestSingleInstanceLock(additionalData);
if (!gotTheLock && false) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory, additionalData2) => {
    console.log(additionalData2);
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      if (!win.isVisible()) {
        win.show();
        win.setSkipTaskbar(true);
      }
    }
  });
}
ipcMain.on("closeWin", (event, message) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  if (curWin === win)
    curWin.hide();
  else curWin.close();
});
ipcMain.on("openChildWindow", (event, message) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  createChildWindow({
    parent: curWin,
    ...defaultOption.value,
    ...message
  });
});
ipcMain.on("switchPage", (event, args) => {
  win.hide();
  let width = args.width, height = args.height;
  let x = args.x, y = args.y;
  let enableResizable = args.enableResizable;
  win.setSize(width, height);
  win.setPosition(x, y);
  win.setMaximizable(args.maximizable);
  win.setResizable(enableResizable);
});
ipcMain.on("completeLogin", (event, userData) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  curWin.show();
});
ipcMain.on("reLogin", (event, args) => {
  event.reply("reLoginResponse", {
    // 当前主进程响应内容给渲染进程，
    // 渲染进程需要ipcRenderer.on('reLoginResponse',(event)=>{})监听
    status: "OK"
  });
  closeAllChildWindows();
  win.show();
});
ipcMain.on("minimize-window", (event, args) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  curWin.minimize();
});
ipcMain.on("maximize-window", (event, args) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  if (curWin.isMaximized()) {
    curWin.restore();
  } else {
    curWin.maximize();
  }
});
ipcMain.on("desktop-capture", async (event, args) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  return desktopCapturer.getSources({
    types: [
      "window",
      "screen"
    ],
    // thumbnailSize: {
    //     width: 1728,
    //     height: 1117
    // },
    fetchWindowIcons: true
  }).then(async (sources) => {
    console.log(sources, "主进程获取到可以调用的所有屏幕信息");
    curWin.webContents.send("screenShot-sources", sources);
    return sources;
  });
});
ipcMain.on("screenshots-start", (event, args) => {
  screenShotWindowId = event.sender.id;
  screenshots.startCapture();
});
ipcMain.on("saveImage", (event, args) => {
  const sender = event.sender;
  const curWin = BrowserWindow.fromWebContents(sender);
  saveImageByBase64(args).then((filePath) => {
    curWin.webContents.send("saveImage-ok", filePath);
  });
});
