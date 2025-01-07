const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const net = require('net');

/**
 * 获取本地的IP地址
 * @return {string}
 */
function getLocalIPAddress() {
    // const interfaces = require('os').networkInterfaces();
    // for (const interface in interfaces) {
    //     for (const address of interfaces[interface]) {
    //         if (address.family === 'IPv4' && !address.internal) {
    //             return address.address;
    //         }
    //     }
    // }
    return 'localhost';
}

/**
 * 获取本地的端口号
 * @return {string|number}
 */
function getLocalPort() {
    return process.env.ELECTRON_PORT || 3000;
}

module.exports = {
    getLocalIPAddress,
    getLocalPort
}
