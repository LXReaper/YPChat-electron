const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    // 除函数之外，我们也可以暴露变量
})

// electron主进程的api
contextBridge.exposeInMainWorld('electronAPI', {
    // 发送消息给主进程
    sendMessage: (channel, args) => {
        // 定义允许的通道列表，防止不安全的通道通信
        let validChannels = [
            'toMain',
            'closeWin',
            'reLogin',
            'completeLogin',
            'switchPage',
            'minimize-window',
            'maximize-window',
            'openChildWindow',
            'desktop-capture',
            'screenshots-start',
            'saveImage',// 保存图片文件
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, args);
        }
    },
    // 渲染进程接收消息
    onReceiveMessage: (channel, func) => {
        // 定义允许的通道列表，防止不安全的通道通信
        let validChannels = [
            'fromMain',
            'window-size-update',
            'screen-sources',
            'screenshots-ok',
            'saveImage-ok',// 图片文件保存成功
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    // 获取窗口大小
    getWindowSize: () => ipcRenderer.invoke('get-window-size'),
    onWindowSizeUpdate: (callback) => {
        ipcRenderer.on('window-size-update', (event, size) => {
            callback(size)
        })
    }
})
