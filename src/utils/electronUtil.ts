// 渲染进程操作主进程工具脚本

import router from "../router";
import {closeConnect} from "./network/wsClient.js";
import store from "../store";

/**
 * 重新登陆
 * @param code
 * @param msg
 */
export const reLogin = (code: any, msg: any) => {
    let electron = (window as any).electronAPI;
    electron.sendMessage('switchPage', {
        x: 550,
        y: 250,
        width: 850,
        height: 550,
        maximizable: false,
        enableResizable: false,//登录的界面不允许窗口缩放
    });
    router.push({
        path: "/",
    }).then(() => {
        electron.sendMessage('reLogin', null);
        closeConnect(code, msg);//关闭websocket连接
        clearAllData();// 清空所有用户临时数据
    });
}

/**
 * 清空当前用户所有临时数据
 */
const clearAllData = () => {
    store.dispatch("noteBookPanelData/clearAllData");// 通讯录数据
    store.dispatch("chatPanelData/clearAllData");// 聊天数据
    store.dispatch("phoneChatData/clearAllData");// 电话通信数据
    store.dispatch("useNetworkStore/clearAllData");// webrtc通信数据
    store.dispatch("websocketMessageData/clearAllData");// 后端服务连接数据
    store.dispatch("basicData/clearAllData");// 基本数据

}

