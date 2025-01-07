import {api} from "../../api/api.ts";
import store from "../../store";

export class WebSocketClass{
    ws: WebSocket | null = null;

    url: string =  api.conferenceConnectUrl;
    roomId = "";// 房间号

    onOpenCallback: () => void = () => {};// websocket开启的回调函数
    onMessageCallback: (event?: MessageEvent) => void = () => {};// websocket接收到消息的回调函数

    constructor(data: {
        url: string;
        roomId: string;
    }) {
        this.url = data.url ? data.url : this.url;
        this.roomId = data.roomId;

        this.ws = new WebSocket(this.url);
        this.ws.onclose = function (ev: CloseEvent) {
            console.log("信令客户端连接关闭，" + ev.reason);
        }
        this.ws.onerror = function (ev: any){
            console.log("信令客户端连接失败，" + ev.message);
        }
    }

    public send(message: string) {
        this.ws?.send(message);
    }

    public static send(wsc: WebSocketClass, message: string) {
        wsc.ws?.send(message);
    }

    public onOpen(callback: () => void) {
        this.onOpenCallback = callback;
        if (this.ws) {
            this.ws.onopen = () => {
                this.onOpenCallback(); // 当WebSocket打开时调用回调函数
            };
        }
    }

    public onMessage(callback: (event?: Event) => void) {
        this.onMessageCallback = callback;
        if (this.ws) {
            this.ws.onmessage = (message: MessageEvent) => {
                this.onMessageCallback(message);
            }
        }
    }

    // 更新store
    public update = () => {
        store.state.useNetworkStore.wsMap.set(this.roomId as string, { ...this });
    };

    // 手动关闭websocket连接
    public close = () => {
        console.warn('手动关闭websocket连接，房间号为：' + this.roomId);
        store.dispatch("useNetworkStore/removeWS", this.roomId).then(() => {
            this.ws?.close();
        });
    };
}
