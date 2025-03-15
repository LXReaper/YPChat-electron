const {
    app,
    shell ,
    BrowserWindow,
    ipcMain,
    Tray,
    globalShortcut,// 全局的快捷键
    nativeImage,
    Menu,
    desktopCapturer,
    screen
} = require('electron');
const {getLocalIPAddress, getLocalPort} = require("./platform.js");
const Screenshots = require("electron-screenshots");
const fs = require('fs');
const tmp = require('tmp');
const path = require('node:path');
const {ref} = require("vue");
const {ElMessage} = require("element-plus");
const packageJson = require("../package.json");//将package.json的文件配置信息注入
const {electronApp, optimizer, is} = require("@electron-toolkit/utils");
const {saveImageByBuffer, saveImageByBase64} = require("./FileHandle.js")
const { db, dbInit } = require("./sqlite3/DataBase")


let baseURL = `http://${getLocalIPAddress()}:${getLocalPort()}/`;
let forceQuit = false
let win;//主窗口
let childWindows = {};//子窗口哈希表 ，窗口名称 => 窗口对象
let screenshots;// 截图对象
let screenShotWindowId;// 要截取的窗口id
let isMainWindowFocusedWhenStartScreenshot = false;// 是否当开始截图时主窗口聚焦

//托盘内部菜单
const contextMenu = Menu.buildFromTemplate([
    {label: '关于', type: 'normal'},
    {
        label: '退出',
        type: 'normal',
        click: () => {
            win.show();
            app.quit();
        },
    }
])

const defaultOption = ref({//窗口的默认配置
    x: 550,
    y: 250,
    width: 850,
    height: 550,
    icon: path.join(__dirname, 'icon/favicon.ico'),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',//隐藏窗口上方默认菜单栏
    show: false,
    frame: false,// 无边框窗口
    maximizable: false,// 是否可以放大
    transparent: false,// 设置是否有背景
    resizable: false,// 设置窗口不能拉伸
    webPreferences: {
        nodeIntegration: true, // 允许node的集成环境，渲染进程也能使用nodejs
        enableRemoteModule: true,// 是否允许开启远程模块
        contextIsolation: true, // 开启上下文隔离，则渲染进程无法使用require
        preload: path.join(__dirname, 'preload.js'), //传入预加载js脚本文件
        // devTools: false,
        sandbox: true,
        webSecurity: false,// 允许跨域请求
    },
})

/************************窗口定义************************/
// 1、创建主窗口
function createWindow() {
    win = new BrowserWindow(defaultOption.value);
    // win.loadFile(path.join(__dirname, "dist", "index.html"));  // 发布时使用
    // win.webContents.openDevTools({mode: 'detach'}); // 打开开发者工具
    // win.loadURL(baseURL);
    let isDevProcess = process.env.VITE_DEV_SERVER_URL;
    if (isDevProcess) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        win.webContents.openDevTools({mode: 'detach'}); // 打开开发者工具
    } else {
        // win.loadFile(path.join(__dirname, "../dist/index.html"));
        // win.loadURL(baseURL);
        // win.webContents.openDevTools({mode: 'detach'}); // 打开开发者工具
    }

    // 快捷键控制
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && !isDevProcess) {
            if (input.key === 'F12' ||
                (input.control && input.key === 'i') ||
                (input.control && input.key === 'r')) {
                event.preventDefault(); // 阻止默认行为
            }
        }
    });

    win.on('ready-to-show', () => {
        win.show()
    })

    // 处理窗口打开请求
    // detail:包含请求打开新窗口的相关信息（如 URL）
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // 窗口缩放前
    win.on('will-resize', (event, newBounds) =>{
        if (newBounds.height < 840 || newBounds.width < 1170) {
            event.preventDefault();//阻止原来默认事件触发内容
            win.setBounds({
                ...newBounds,
                height: newBounds.height < 840 ? 840 : newBounds.height, // 规定最小窗口高度为 840
                width: newBounds.width < 1170 ? 1170 : newBounds.width
            });
        }
    })

    // 监听窗口缩放事件
    win.on('resize', () => {
        // 获取到窗口的宽高
        const [width, height] = win.getSize();
        setTimeout(() => {
            win.webContents.send('window-size-update', {
                width: width,
                height: height
            })
        }, 10)
    });

    // 窗口关闭事件
    win.on('close', (e) => {
        app.quit()
    })

    // 主窗口禁止右键弹出菜单
    win.hookWindowMessage &&
    win.hookWindowMessage(278, function () {
        win.setEnabled(false) //窗口禁用
        let timer = setTimeout(() => {
            win.setEnabled(true)
            clearTimeout(timer)
        }, 100) // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
        return true
    })
}

//2、创建子窗口
function createChildWindow(data = defaultOption.value) {
    if (childWindows[data.winName]) {// 已经创建过该窗口
        childWindows[data.winName].show();// 显示创建过的窗口
        return ;
    }
    let childWin = new BrowserWindow({
        width: data.width,
        height: data.height,
        icon: data.icon,
        autoHideMenuBar: data.autoHideMenuBar,
        titleBarStyle: data.titleBarStyle,
        show: data.show,
        frame: data.frame,// 有无边框窗口
        maximizable: data.maximizable,// 是否可以放大
        transparent: data.transparent,// 设置是否有背景
        resizable: data.resizable,// 设置窗口能否拉伸
        webPreferences: {
            nodeIntegration: data.webPreferences.nodeIntegration, // 允许node的集成环境，渲染进程也能使用nodejs
            enableRemoteModule: data.webPreferences.enableRemoteModule,// 是否允许开启远程模块
            contextIsolation: data.webPreferences.contextIsolation, // 关闭上下文隔离
            preload: data.webPreferences.preload, //传入预加载js脚本文件
            // devTools: false,
            sandbox: data.webPreferences.sandbox,
            webSecurity: data.webPreferences.webSecurity // 是否不允许跨域请求
        }
    });

    // childWin.webContents.openDevTools({mode: 'detach'}); // 打开开发者工具
    childWin.loadURL(baseURL + '#' + data.path).then(() => {
        if (data.transportObj) {// 传输给当前子窗口的对象实例
            const transportObj = data.transportObj;
            childWin.webContents.send("fromMain" ,transportObj);
        }
    });

    childWin.on('ready-to-show', () => {
        childWin.show();
    })

    childWin.on('closed', () => {
        // 从数组中移除已关闭的窗口
        delete childWindows[data.winName];
    });

    // // 监听鼠标移入事件
    // childWin.webContents.sendInputEvent({
    //     type: "mouseLeave",
    //     x: 0,
    //     y: 0,
    // })
    //
    // childWin.webContents.sendInputEvent({
    //     type: "mouseEnter"
    // })
    // childWin.on('mouse-enter', (keyboardEvent, position) => {
    //     childWin.webContents.send('mouse-enter', {
    //         width: width,
    //         height: height
    //     })
    // });
    //
    // // 监听鼠标移出事件
    // childWin.on('mouse-leave', () => {
    //     childWin.webContents.send('mouse-leave', {
    //         width: width,
    //         height: height
    //     })
    // });

    //放入哈希表中
    childWindows[data.winName] = childWin;
}

// 关闭所有子窗口
function closeAllChildWindows() {
    for (const winName in childWindows) {
        if (childWindows[winName]) {
            childWindows[winName].close(); // 关闭每个子窗口
        }
    }
    childWindows = {};
}

/**************************定义快捷键**********************/
function regShortcut() {
    globalShortcut.register('Control+F5', () => {
        win.webContents.reload();
    })
    globalShortcut.register('CommandOrControl+shift+a', () => {
        isMainWindowFocusedWhenStartScreenshot = win.isFocused();
        console.log('isMainWindowFocusedWhenStartScreenshot', win.isFocused());
        screenshots.startCapture()
    });
    // 调试用，主要用于处理 windows 不能打开子窗口的控制台
    // 打开所有窗口控制台
    globalShortcut.register('ctrl+shift+i', () => {
        let windows = BrowserWindow.getAllWindows();
        windows.forEach(win => win.openDevTools({mode: 'detach'}))
    });
}

/************************程序启动************************/
app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
})
// 应用准备就绪时调用函数
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');

    createWindow();// 创建窗口

    regShortcut();// 注册快捷键

    /*截图*/
    screenshots = new Screenshots({
        // logger: console.log
        singleWindow: true,
    });// 创建截图对象
    const onScreenShotEnd = (result) => {
        console.log('onScreenShotEnd', isMainWindowFocusedWhenStartScreenshot, screenShotWindowId);
        if (isMainWindowFocusedWhenStartScreenshot) {
            if (result) {
                win.webContents.send('screenshots-ok', result);
            }
            win.show();
            isMainWindowFocusedWhenStartScreenshot = false;
        } else if (screenShotWindowId) {
            let windows = BrowserWindow.getAllWindows();
            let tms = windows.filter(win1 => win1.webContents.id === screenShotWindowId);
            if (tms.length > 0) {
                if (result) {
                    tms[0].webContents.send('screenshots-ok', result);
                }
                tms[0].show();
            }
            screenShotWindowId = 0;
        }
    }
    // 点击确定按钮回调事件
    screenshots.on('ok', (e, buffer, bounds) => {
        saveImageByBuffer(buffer).then((filePath) => {
            console.log('screenshots ok', e)
            onScreenShotEnd({
                filePath: filePath,// 图片保存在本地的路径
                base64: "data:image/png;base64," +
                    btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))),// 转成base64数据
            });
        });// 保存到本地临时文件里
    })
    // 点击取消按钮回调事件
    screenshots.on('cancel', e => {
        console.log('screenshots cancel', e)
        onScreenShotEnd()
    })
    // 点击保存按钮回调事件
    screenshots.on('save', (e, {viewer}) => {
        console.log('screenshots save', e)
        onScreenShotEnd();
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    //创建托盘对象
    const tray = new Tray(nativeImage.createFromPath("static/favicon.ico"))
    tray.setToolTip(packageJson.name);
    tray.setContextMenu(contextMenu);

    // 监听双击托盘图标事件
    tray.on('double-click', () => {
        win.show(); // 窗口显示在桌面最顶部
    });
});

app.on('before-quit', () => {
    forceQuit = true;
})

// 关闭所有窗口时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

/**
 * 单应用启动实现
 * 在多次点击应用都是同一个时，需要阻止
 */
const additionalData = { myKey: 'MineChat' } //配置项 唯一key
const gotTheLock = app.requestSingleInstanceLock(additionalData)
if (!gotTheLock && false) {// todo 正式上线时去除&& false
// 已经有一个实例在运行，退出当前实例
    app.quit();
} else {
// 监听第二个实例被运行时
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        // 输出从第二个实例中接收到的数据
        console.log(additionalData)

        // 试图运行第二个实例，我们应该关注我们的窗口
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus()
            if (!win.isVisible()) {
                win.show();
                win.setSkipTaskbar(true);// 将应用从任务栏移出
            }
        }
    })
}


/************************监听事件************************/
                        /*窗口操作*/
// 关闭窗口
ipcMain.on('closeWin', (event, message) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);
    if (curWin === win)
        curWin.hide();//主窗口就隐藏
    else curWin.close();//子窗口直接关闭
})

// 打开新窗口
ipcMain.on("openChildWindow", (event, message) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);

    createChildWindow({
        parent: curWin,
        ...defaultOption.value,
        ...message
    });
})

// 跳转页面
ipcMain.on("switchPage", (event, args) => {
    // 隐藏主窗口
    win.hide();

    let width = args.width, height = args.height;
    let x = args.x, y = args.y;
    let enableResizable = args.enableResizable;
    win.setSize(width, height);
    win.setPosition(x, y);
    win.setMaximizable(args.maximizable);
    win.setResizable(enableResizable);//设置窗口是否可以缩放
})
//完成登录后操作
ipcMain.on('completeLogin', (event, userData) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);

    //1、显示窗口
    curWin.show();
    //2、连接数据库
    // dbInit(userData);// 初始化连接数据库
});
// 重新登录
ipcMain.on('reLogin', (event, args) => {
    event.reply("reLoginResponse", {
        // 当前主进程响应内容给渲染进程，
        // 渲染进程需要ipcRenderer.on('reLoginResponse',(event)=>{})监听
        status: 'OK',
    });
    closeAllChildWindows();// 清空所有子窗口
    win.show();
})

// 最小化窗口
ipcMain.on('minimize-window', (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);
    curWin.minimize();
})

//最大化窗口
ipcMain.on("maximize-window", (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);
    if (curWin.isMaximized()) {
        curWin.restore(); // 如果窗口已经最大化，则恢复原始大小
    } else {
        curWin.maximize(); // 否则，最大化窗口
    }
});
// 获取不同窗口的信息（包括截图信息）
ipcMain.on("desktop-capture", async (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);
    return desktopCapturer.getSources({
        types: [
            'window',
            'screen'
        ],
        // thumbnailSize: {
        //     width: 1728,
        //     height: 1117
        // },
        fetchWindowIcons: true
    })
        .then(async (sources) => {
            console.log(sources, '主进程获取到可以调用的所有屏幕信息');
            curWin.webContents.send("screenShot-sources", sources);
            return sources
            // for(const source of sources) {
            //     if (source.name === 'Entire Screen') {
            //         curWin.webContents.send('SET_SOURCE', source)
            //     }
            // }
        })
})

// 开始截图
ipcMain.on("screenshots-start", (event, args) => {
    screenShotWindowId = event.sender.id;
    screenshots.startCapture();
});
// 保存图片
ipcMain.on("saveImage", (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);
    saveImageByBase64(args).then((filePath) => {
        curWin.webContents.send("saveImage-ok", filePath);
    });
});
                    /*sqlite数据库操作*/
