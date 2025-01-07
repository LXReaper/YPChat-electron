import {computed, ref} from "vue";
import {WebSocketClass} from "../utils/network/WebSocket.ts";
import {api} from "../api/api.ts";
import {getSnowflake} from "../utils/StringUtils.js";
import {MsgTypeConstant} from "../constant/MsgTypeConstant.ts";
import store from "../store";
import {useWebRtcChatTwo} from "./webrtc/chatTwo.ts";
import {getLocalStream, getLocalDisplayMediaStream} from "../utils/localStreamUtil.ts";
import {createNullVideo} from "../utils/network";
import {useWebRtcRemoteDesk} from "./webrtc/remoteDesk.ts";

const screenId = ref();// 屏幕共享操作时选取的屏幕id

const msgType = ref();// 消息类型
const sender = ref();// 我方
const receiver = ref();// 对方
const roomId = ref("");// 房间号
const signallingSocket = ref();

const { updateWebRtcChatTwoConfig, webRtcChatTwo } = useWebRtcChatTwo();
const { updateWebRtcRemoteDeskConfig, webRtcRemoteDesk } = useWebRtcRemoteDesk();

export const useWebRtcHandle = () => {
    const webRtcHandle = {
        updateRtcHandle: (data: {
            screenId: string;// 屏幕共享操作时选取的屏幕id
        }) => {
            screenId.value = data.screenId;
        },
        joinRoom: (data: {
            roomId: string;
            // 默认是主动加入，也就是MsgTypeConstant.JOIN_ROOM
            // 被动加入，仅有被邀请加入，也就是MsgTypeConstant.INVITE_JOIN_ROOM
            joinReason: string;
            msgType: string;
            sender: string;
            receiver: string;
        }) => {
            roomId.value = data.roomId || getSnowflake();//如果没有房 间号就随机生成
            signallingSocket.value = new WebSocketClass({
                roomId: roomId.value,
                url: api.conferenceConnectUrl,
            });
            signallingSocket.value.onOpen(function (){
                console.log("信令客户端连接成功");

                signallingSocket.value.update();
                signallingSocket.value.send(MsgTypeConstant.HEARTBEAT);// 发送心跳

                msgType.value = data.msgType;
                sender.value = data.sender;
                receiver.value = data.receiver;// 如果有数据，则表示邀请该用户加入

                if (data.joinReason === MsgTypeConstant.JOIN_ROOM) {
                    switch (msgType.value) {
                        case MsgTypeConstant.SCREEN_CTL_TWO :
                        case MsgTypeConstant.SCREEN_SHARE_TWO:
                            // 屏幕控制和屏幕共享（目前只支持双人）
                            getLocalDisplayMediaStream({
                                audio: {
                                    mediaSource: 'screen',
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        chromeMediaSourceId: screenId.value,
                                    },
                                },
                                video: {
                                    mediaSource: 'screen',
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        chromeMediaSourceId: screenId.value,
                                    },
                                },
                            }).then((stream: any) => {
                                updateWebRtcRemoteDeskConfig({
                                    roomId: roomId.value,
                                    sharerStream: stream,
                                });
                                webRtcRemoteDesk.newWebRtc({
                                    sender: sender.value,// 我本人
                                    receiver: receiver.value,// 当前加入房间的用户
                                    videoEl: createNullVideo(),
                                });

                                signallingSocket.value.send(JSON.stringify({
                                    type: MsgTypeConstant.JOIN_ROOM,
                                    message: msgType.value === MsgTypeConstant.SCREEN_CTL_TWO ?
                                        MsgTypeConstant.INVITE_JOIN_SCREEN_CTL_TWO_ROOM : MsgTypeConstant.INVITE_JOIN_SCREEN_SHARE_TWO_ROOM,
                                    room: roomId.value,// 如果room为空则后端要自动生成一个房间，并将这个用户加入房间
                                    from: sender.value, // 实际用户标识符
                                    to: receiver.value,// 如果是加入邀请用户的房间,填的是对方id
                                }))// (0)加入一个房间
                            })
                            break;
                        case MsgTypeConstant.CHAT_TWO_WEBRTC:
                        case MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC:
                            // 音视频聊天
                            getLocalStream({
                                video: msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC,
                                audio: true,
                            }).then((stream: any) => {
                                updateWebRtcChatTwoConfig({
                                    roomId: roomId.value,
                                    localStream: stream,
                                })
                                webRtcChatTwo.newWebRtc({
                                    sender: sender.value,// 我本人
                                    receiver: receiver.value,// 当前加入房间的用户
                                    videoEl: createNullVideo(),
                                });
                                signallingSocket.value.send(JSON.stringify({
                                    type: MsgTypeConstant.JOIN_ROOM,
                                    message: msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC ?
                                        MsgTypeConstant.INVITE_JOIN_CHAT_VIDEO_TWO_ROOM : MsgTypeConstant.INVITE_JOIN_CHAT_TWO_ROOM,
                                    room: roomId.value,// 如果room为空则后端要自动生成一个房间，并将这个用户加入房间
                                    from: sender.value, // 实际用户标识符
                                    to: receiver.value,// 如果是加入邀请用户的房间,填的是对方id
                                }))// (0)加入一个房间
                            })
                            break;
                    }
                }else if (data.joinReason === MsgTypeConstant.INVITE_JOIN_ROOM) {
                    switch (msgType.value) {
                        case MsgTypeConstant.SCREEN_CTL_TWO :
                        case MsgTypeConstant.SCREEN_SHARE_TWO:
                            // 屏幕控制和屏幕共享（目前只支持双人）
                            console.log("被" + receiver.value + "邀请加入屏幕共享房间");
                        //     getLocalDisplayMediaStream({
                        //         audio: true,
                        //         video: true,
                        //     }).then((stream) => {
                        //         console.log(stream);
                        //     })
                            updateWebRtcRemoteDeskConfig({
                                roomId: roomId.value,
                            });
                            webRtcRemoteDesk.newWebRtc({
                                sender: sender.value,// 我本人
                                receiver: receiver.value,// 当前加入房间的用户
                                videoEl: createNullVideo(),
                            });
                            break;
                        case MsgTypeConstant.CHAT_TWO_WEBRTC:
                        case MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC:
                            console.log("被" + receiver.value + "邀请加入音视频聊天房间");
                            // 音视频聊天
                            getLocalStream({
                                video: msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC,
                                audio: true,
                            }).then((stream) => {
                                updateWebRtcChatTwoConfig({
                                    roomId: roomId.value,
                                    localStream: stream,
                                })
                                webRtcChatTwo.newWebRtc({
                                    sender: sender.value,// 我本人
                                    receiver: receiver.value,//
                                    videoEl: createNullVideo(),
                                });
                            })
                            break;
                    }
                }

            });
            // 接收后端信令服务器的消息
            signallingSocket.value.onMessage((message: any) => {
                const data = JSON.parse(message.data);
                console.log("接收到消息：" + message.data);
                const fromUserID = data.from;// 来源用户id
                const meg = data.message;// 消息内容
                const room = data.room as string;// room号

                const rtc = computed(() => store.state.useNetworkStore.rtcMap.get(fromUserID));

                let electron = (window as any).electronAPI;
                switch (data.type) {
                    // 媒体协商、媒体解析协商
                    case MsgTypeConstant.OFFER: // (2)接收远端的offer
                        // console.log(fromUserID + "的peerConnection对象：", rtc.value.peerConnection);

                        /*P2P的音频聊天*/
                        if (msgType.value === MsgTypeConstant.CHAT_TWO_WEBRTC ||
                            msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC) {
                            // 给对方一个answer
                            webRtcChatTwo.sendAnswer({
                                sdp: JSON.parse(meg),
                                sender: sender.value,
                                receiver: fromUserID,
                            })
                        }else if (msgType.value === MsgTypeConstant.SCREEN_SHARE_TWO ||
                            msgType.value === MsgTypeConstant.SCREEN_CTL_TWO) {
                            // 接收方给分享方一个answer
                            webRtcRemoteDesk.sendAnswer({
                                sdp: JSON.parse(meg),
                                sender: sender.value,
                                receiver: fromUserID,
                            });
                        }
                        break;
                    case MsgTypeConstant.ANSWER: // (3)接收远端的answer
                        if (rtc.value && sender.value === data.to) {
                            rtc.value.setRemoteDescription(JSON.parse(meg));
                        }
                        break;
                    // 接收远端的candidate(远端的网络环境,网络协商)
                    case MsgTypeConstant.ICE_CANDIDATE: // (4)
                        if (rtc.value && sender.value === data.to) {
                            rtc?.value.addIceCandidate(JSON.parse(meg));
                        }
                        break;
                    // 用户事件
                    case MsgTypeConstant.JOIN_ROOM: // (1)
                        // 处理新用户加入
                        console.log("有人加入房间" + room)
                        /*P2P的音频聊天*/
                        if (msgType.value === MsgTypeConstant.CHAT_TWO_WEBRTC ||
                            msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC){
                            // 给对方一个offer
                            webRtcChatTwo.sendOffer({
                                sender: sender.value,
                                receiver: fromUserID,
                            });
                        }else if (msgType.value === MsgTypeConstant.SCREEN_SHARE_TWO ||
                            msgType.value === MsgTypeConstant.SCREEN_CTL_TWO) {
                            // 分享方给对方一个offer
                            webRtcRemoteDesk.sendOffer({
                                sender: sender.value,
                                receiver: fromUserID,
                            });
                        }
                        break;
                    case MsgTypeConstant.LEAVE_ROOM:
                        // 处理用户离开 todo
                        // const peerConnection = rtc.peerConnection;
                        // if (peerConnection) {
                        //     peerConnection.close();
                        //     delete rtc.peerConnection;
                        // }
                        break;
                    case MsgTypeConstant.HANGUP :
                        electron.sendMessage('closeWin', "关闭窗口");
                        break;
                    case MsgTypeConstant.REJECT_JOIN_ROOM :
                        electron.sendMessage('closeWin', "关闭窗口");
                        break;
                }
            });
        },

        /**
         * 接受对方邀请
         * @param data
         */
        call:(data: {
            roomId: string;
            msgType: string;
            sender: string;
            receiver: string;
        }) => {
            roomId.value = data.roomId;
            msgType.value = data.msgType;
            sender.value = data.sender;
            receiver.value = data.receiver;// 如果有数据，则表示邀请该用户加入
            if (store.state.useNetworkStore.wsMap.get(roomId.value)) {
                signallingSocket.value = store.state.useNetworkStore.wsMap.get(roomId.value);
                switch (msgType.value) {
                    case MsgTypeConstant.SCREEN_CTL_TWO :
                    case MsgTypeConstant.SCREEN_SHARE_TWO:
                        // 屏幕控制和屏幕共享（目前只支持双人）
                        receiver.value = "";// 对方设置为空
                        WebSocketClass.send(signallingSocket.value, JSON.stringify({
                            type: MsgTypeConstant.JOIN_ROOM,
                            message: msgType.value === MsgTypeConstant.SCREEN_CTL_TWO ?
                                MsgTypeConstant.INVITE_JOIN_SCREEN_CTL_TWO_ROOM : MsgTypeConstant.INVITE_JOIN_SCREEN_SHARE_TWO_ROOM,
                            room: roomId.value,// 如果room为空则后端要自动生成一个房间，并将这个用户加入房间
                            from: sender.value, // 我方id
                            to: receiver.value,
                        }))// (0)加入一个房间
                        break;
                    case MsgTypeConstant.CHAT_TWO_WEBRTC:
                    case MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC:
                        // 音视频聊天
                        // 被邀请的用户真正加入房间
                        receiver.value = "";// 对方设置为空
                        WebSocketClass.send(signallingSocket.value, JSON.stringify({
                            type: MsgTypeConstant.JOIN_ROOM,
                            message: msgType.value === MsgTypeConstant.CHAT_VIDEO_TWO_WEBRTC ?
                                MsgTypeConstant.INVITE_JOIN_CHAT_VIDEO_TWO_ROOM : MsgTypeConstant.INVITE_JOIN_CHAT_TWO_ROOM,
                            room: roomId.value,// 如果room为空则后端要自动生成一个房间，并将这个用户加入房间
                            from: sender.value, // 我方id
                            to: receiver.value,
                        }))// (0)加入一个房间
                        break;
                }
            }
        },
        /**
         * 挂断
         * 目前针对
         * @param data
         */
        hangup: (data: {
            roomId: string;
            receiver: string;
        }) => {
            roomId.value = data.roomId;
            receiver.value = data.receiver;// 如果有数据，则表示邀请该用户加入
            if (store.state.useNetworkStore.wsMap.get(roomId.value))
                store.state.useNetworkStore.wsMap.get(roomId.value).close();
            if (store.state.useNetworkStore.rtcMap.get(receiver.value))
                store.state.useNetworkStore.rtcMap.get(receiver.value).close();
        }

    }

    return { webRtcHandle };
}
