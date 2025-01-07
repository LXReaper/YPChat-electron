const {app,shell , BrowserWindow, ipcMain, Tray, nativeImage, Menu} = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const {SELECT_FRIEND, INSERT_FRIEND} = require("./constant/SelectConstant.js");
const {Friend} = require("./entity/Friend.js")

let userDBFilesPath = null;//当前用户数据库的文件夹
let dbPath = null;//基本数据库路径
let db = null;

/* 初始化数据库连接 */
const dbInit = (userData) => {
    const id = userData.id;
    const userAccount = userData.userAccount;

    //1、用户文件夹，用户id命名
    userDBFilesPath = path.join(__dirname, `database/${id}`);
    if (!fileExists(userDBFilesPath)) {
        // 文件夹不存在，创建文件夹
        fs.mkdir(userDBFilesPath, { recursive: true }, (err) => {
            if (err) {
                return console.error('创建失败:', err);
            }
            console.log('文件夹创建成功:', userDBFilesPath);
        });
    }
    //2、创建或打开数据库
    // 用户账号加id作为用户基本信息数据库的名称
    dbPath = path.join(userDBFilesPath, `/${userAccount}.db`);
    // 打开或者创建数据库文件database.sqlite
    db = new sqlite3.Database(dbPath);

    // 每隔5s检测数据库是否连接正常
    const testDBConnect =  setInterval(() => {

    },5000);
}

function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true; // 文件存在
    } catch (err) {
        // 检查是否是文件不存在的错误
        if (err.code === 'ENOENT') {
            return false; // 文件不存在
        }
        // 其他错误处理
        console.error('检查文件时出错:', err);
        return false; // 或抛出错误
    }
}

/*---------------获取查询的内容与条件*/
// 查询好友
ipcMain.on(SELECT_FRIEND, (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);

    // args = {condition: {},orderBy: ""}
    Friend.selectFriend(args.condition);
});

/*--------------插入数据*/
ipcMain.on(INSERT_FRIEND, (event, args) => {
    const sender = event.sender; // 获取到WebContents对象
    // 通过WebContents获取BrowserWindow实例，即事件发生的窗口对象
    const curWin = BrowserWindow.fromWebContents(sender);

    // args = {condition: {},orderBy: ""}
    Friend.selectFriend(args.condition);
});

module.exports = {
    db,
    dbInit
}
