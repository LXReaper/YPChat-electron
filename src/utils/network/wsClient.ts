import {reLogin} from "../electronUtil.ts";
import {ElLoading} from "element-plus";
import store from "../../store";
import {api} from "../../api/api";
import {handleInvitation, handleP2PChatMessagePost} from "./wsClientMessageHandle";
import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import {ref} from "vue";

const baseURL = api.chatConnectUrl;

const ws = ref<WebSocket>();

// 最大重连次数
const maxReConnectTimes = ref(0);
// 是否需要重连
const needReconnect = ref(true);
// 是否已经在重连了，相当于加上了锁
let lockReconnect = false;

// 加载动画对象
const loading = ref();

export const initWs = (userData: any) =>{
    if (userData) console.log();
    needReconnect.value = true;//设置需要重连
    maxReConnectTimes.value = 5;//最大重连次数为5
    connectBE();//连接后端
}

// 连接服务器
const connectBE = () => {
    ws.value = new WebSocket(baseURL);
    store.dispatch("websocketMessageData/setNoticeSocket",
        ws.value);
    ws.value.onopen = function (){
        console.log("客户端连接成功");
        sendMessage(MsgTypeConstant.HEARTBEAT);// 发送心跳
        maxReConnectTimes.value = 5;//重置当前最大重连次数

        if (loading.value) {//关闭重连状态的加载动画，重连成功触发
            loading.value.close();
        }
    }

    // 接收服务器发送的消息
    ws.value.onmessage = function (ev){
        console.log("接收到服务端消息，" + ev.data)
        const msgObj = JSON.parse(ev.data);
        handleInvitation(msgObj);// 处理电话邀请
        handleP2PChatMessagePost(msgObj);// 处理聊天消息
    }

    ws.value.onclose = function (ev) {
        console.log("客户端连接关闭，" + ev.reason)
        reConnect();
    }

    ws.value.onerror = function (ev: Event){
        console.log("客户端连接失败，" + (ev as any).message)
        reConnect();
    }

    // 当客户端放到后台时，避免服务端挂掉连接，需要每隔5s发送心跳！！！！
    const heartBeat =  setInterval(() => {
        if (!needReconnect.value) clearInterval(heartBeat);
        if (ws.value != null && ws.value.readyState === 1) ws.value.send(MsgTypeConstant.HEARTBEAT);//发送心跳
    },5000);
}

// 重新连接服务器
const reConnect = () => {
    // 1、不需要重连
    if (!needReconnect.value) {
        console.log("连接已断开无法重连")
        return;
    }
    if (ws.value) ws.value.close();

    // 2、有一个事件触发后在重连了，另一个事件触发重连时就阻止重连
    if (lockReconnect) return;
    lockReconnect = true;// 上锁

    // 设置加载
    if (needReconnect.value && maxReConnectTimes.value === 5) {
        loading.value = ElLoading.service({
            lock: true,
            text: "连接断开，玩命连接服务器中...",
            background: "rgba(0, 0, 0, 0.3)",
        }); //创建加载动画
    }

    // 3、未超过重连次数
    if (maxReConnectTimes.value-- > 0){
        // 开始重新连接操作
        console.log(`正在重新连接服务器...剩余重连次数${maxReConnectTimes}`, new Date().getTime())
        setTimeout(() => {
            connectBE();
            lockReconnect = false;// 释放锁
        },5000);
    } else {
        console.log("连接超时");
        needReconnect.value = false;// 不需要重连

        if (loading.value) loading.value.close();//关闭重连状态的加载动画

        reLogin(1000, "关闭服务器连接");// 重新登录
    }
}

// 发送消息
export const sendMessage = (msg: string) => {
    if (ws.value) ws.value.send(msg);
}

// 断开连接（主动断开连接，用于退出登录操作）
export const closeConnect = (code: any, msg: any) => {
    needReconnect.value = false;// 不需要重连
    if (ws.value) ws.value.close(code, msg);
}

// 判断是否连接上后端服务器
export const isWsConnect = () => {
    return ws.value != null;
}
