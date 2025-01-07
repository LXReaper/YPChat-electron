import store from "../../store";
import {api} from "../../api/api";
import {getUserInfoStorage} from "../storageUtil";
import {ref} from "vue";
import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import {ElNotification} from "element-plus";
import {useNetworkStore} from "../../store/network";
import {WebSocketClass} from "./WebSocket";
import {getSnowflake} from "../StringUtils.js";
import {WebRTCClass} from "./WebRTC";

let signallingSocket = null;// 信令服务器websocket连接实例
let webRtc = null;// webRtc实例
let curUserId = getUserInfoStorage() && getUserInfoStorage().id ? getUserInfoStorage().id : "";
let roomData = "";// 当前房 间号
let peers = {}; // 存储所有连接的用户 对方userId => peerConnection
const localStream = ref("");// 记录当前的音视频流
const configuration = {
    iceServers: [
        {
            urls: [
                'turn:129.204.197.215:3478?transport=udp',
                'turn:129.204.197.215:3478?transport=tcp',
            ], // 示例 TURN 服务器，填自己的
            username: 'yourUsername',
            credential: 'yourCredential'
        },
        {
            urls: 'stun:stun.l.google.com:19302' // Google STUN 服务器
        },
        {
            urls: 'turn:turn.example.com', // 示例 TURN 服务器
            username: 'yourUsername',
            credential: 'yourCredential'
        }
    ]
};

export const setLocalStream = (stream) => {
    localStream.value = stream;
}

export const initPeerConnect = (roomInfo, stream = "") => {
    let roomID = roomInfo.roomId;
    let to = roomInfo.to;
    curUserId = roomInfo.userId;

    signallingSocket = new WebSocketClass({
        roomId: roomID,
        url: api.conferenceConnectUrl,
    });

    signallingSocket.onOpen(function (){
        console.log("信令客户端连接成功");

        roomID = roomID || getSnowflake();//如果没有房 间号就随机生成

        signallingSocket.send(MsgTypeConstant.HEARTBEAT);// 发送心跳

        joinRoom(roomID, to);// (0)加入一个房间

        localStream.value = stream;// 记录当前的音视频流
        roomData = roomID;// 记录房 间号
    });
    // 接收后端信令服务器的消息
    signallingSocket.onMessage(async (message) => {
        const data = JSON.parse(message.data);
        console.log("接收到消息：" + message.data);
        const fromUserID = data.from;// 来源用户id
        const meg = data.message;// 消息内容
        const room = data.room;// room号
        roomData = room;// 记录房 间号
        switch (data.type) {
            // 媒体协商、媒体解析协商
            case MsgTypeConstant.OFFER: // (2)接收远端的offer
                console.log(fromUserID + "的peerConnection对象：" + peers[fromUserID]);

                await handleOffer(peers[fromUserID], room, meg, fromUserID);
                break;
            case MsgTypeConstant.ANSWER: // (3)接收远端的answer
                await handleAnswer(peers[fromUserID], room, meg, fromUserID);
                break;
            // 接收远端的candidate(远端的网络环境,网络协商)
            case MsgTypeConstant.ICE_CANDIDATE: // (4)
                await handleIceCandidate(peers[fromUserID], meg, fromUserID,  null);
                break;
            // 用户事件
            case MsgTypeConstant.JOIN_ROOM: // (1)
                // 处理新用户加入
                webRtc = new WebRTCClass({
                    roomId: room,
                    sender: curUserId,
                    receiver: fromUserID,
                    localStream: localStream,
                });
                // createPeerConnection(fromUserID, room);
                break;
            case MsgTypeConstant.LEAVE_ROOM:
                // 处理用户离开
                const peerConnection = peers[fromUserID];
                if (peerConnection) {
                    peerConnection.close();
                    delete peers[fromUserID];
                }
                break;
        }
    });
}

/*--先加入一个聊天室*/
// 加入房间
const joinRoom = (room, to) => {
    signallingSocket.send(JSON.stringify({
        type: MsgTypeConstant.JOIN_ROOM,
        room: room,// 如果room为空则后端要自动生成一个房间，并将这个用户加入房间
        from: curUserId, // 实际用户标识符
        to: to,// 如果是加入邀请用户的房间,填的是对方id
    }))
}
// 离开房间
export const leaveRoom = () => {
    if (roomData){
        signallingSocket.send(JSON.stringify({
            type: MsgTypeConstant.LEAVE_ROOM,
            room: roomData,
            from: curUserId,
        }))
    }
    peers = {};// 清空peerConnection
}

/*--创建一个peerConnection，并发送Offer和Answer,以及ICECandidate*/
/**
 * 为远端的用户创建一个peerConnection
 * @param otherUser 目标用户id
 * @param room 目标用户加入的房间号
 */
const createPeerConnection = (otherUser, room) => {
    if (!window.RTCPeerConnection) {
        console.error('当前环境不支持RTCPeerConnection！');
        ElNotification.warning('当前环境不支持RTCPeerConnection！');
        return;
    }
    const peerConnection = new RTCPeerConnection(configuration);
    peers[otherUser] = peerConnection;// 将peerConnection
    console.log(otherUser + "的peerConnection对象：" + JSON.stringify(peerConnection));

    // 向PeerConnection中加入需要发送的流
    localStream.value?.getTracks().forEach(track => peerConnection.addTrack(track, localStream.value));

    // 处理相关事件
    // handleStreamEvent(peerConnection);
    // handleConnectionEvent(peerConnection);

    createOffer(peerConnection, room, otherUser).then(res => {
        console.log("创建Offer成功，" + res);
    }).catch(error => {
        console.log("创建Offer失败，" + error);
        delete peers[otherUser];// map删除userId => peerConnection这对键值
    });
};
/**
 * 处理SDP Offer/Answer
 * 创建Offer，并发送Offer
 * @param peerConnection
 * @param room 目标用户加入的房间号
 * @param otherUser 目标用户id
 * @return {Promise<void>}
 */
const createOffer = (peerConnection, room, otherUser) => {
    return new Promise(async (resolve, reject) => {
        // 1、先创建本地的offer，并将offer设置到本地会话描述
        const offer = await peerConnection.createOffer();
        peerConnection.setLocalDescription(offer).then(res => {
            // 2、再将offer发送给远端，中间通过将offer发送到信令服务器实现
            signallingSocket.send(JSON.stringify({
                type: MsgTypeConstant.OFFER,
                message: JSON.stringify(offer),
                room: room,
                from: curUserId,
                to: otherUser, // 实际用户标识符
            }));
            resolve("类型：" + offer.type + " 描述信息：" + offer.sdp);
        }).catch(error => reject(error));
    });
};
/**
 * 发送answer
 * @param peerConnection
 * @param room 目标用户加入的房间号
 * @param otherUser 目标用户id
 * @return {Promise<void>}
 */
const createAnswer = (peerConnection, room, otherUser) => {
    return new Promise(async (resolve, reject) => {
        const answer = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer).then(res => {
            // 发送Answer给信令服务器
            signallingSocket.send(JSON.stringify({
                type: MsgTypeConstant.ANSWER,
                message: JSON.stringify(answer),
                room: room,
                from: curUserId,
                to: otherUser // 回复给发起者
            }));
            resolve("类型：" + answer.type + " 描述信息：" + answer.sdp);
        }).catch(error => reject(error));
    })
}
/**
 * 创建ICECandidate
 * @param peerConnection
 * @param room 目标用户加入的房间号
 * @param otherUser 目标用户id
 * @return {Promise<void>}
 */
const createICECandidate = (peerConnection, room, otherUser) => {
    return new Promise((resolve, reject) => {
        // 发送ICE候选者
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                signallingSocket.send(JSON.stringify({
                    type: MsgTypeConstant.ICE_CANDIDATE,
                    message: event.candidate,
                    room: room,
                    from: curUserId,
                    to: otherUser
                }));
                resolve(event.candidate);
            }else reject("ICECandidate获取失败");
        };
    })
}

/*--处理SDP以及ICECandidate交换事件*/
const handleStreamEvent = (peerConnection) => {
    if (!peerConnection) return;
    // 废弃：https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
    // prettierLog({ msg: '开始监听pc的addstream事件', type: 'warn' });
    // peerConnection.addEventListener('addstream', (event) => {
    //   prettierLog({ msg: 'pc收到addstream事件', type: 'warn' });
    //   console.log('addstream事件的event', event);
    //   console.log('addstream事件的stream', event.stream);
    //   console.log('addstream事件的视频轨', event.stream.getVideoTracks());
    //   console.log('addstream事件的音频轨', event.stream.getAudioTracks());
    // });

    prettierLog({ msg: '开始监听pc的track事件', type: 'warn' });
    peerConnection.addEventListener('track', (event) => {
        prettierLog({ msg: 'pc收到track事件', type: 'warn' });
        console.log('track事件的event', event);
        console.log('track事件的stream', event.streams[0]);
        console.log('track事件的视频轨', event.streams[0].getVideoTracks());
        console.log('track事件的音频轨', event.streams[0].getAudioTracks());
        const stream = event.streams[0];
        stream.onremovetrack = () => {
            prettierLog({ msg: 'onremovetrack事件', type: 'warn' });
        };
        this.localStream = stream;
        this.videoEl.srcObject = event.streams[0];
    });
};

const handleConnectionEvent = (peerConnection) => {
    if (!peerConnection) return;
    const appStore = useAppStore();

    prettierLog({ msg: '开始监听pc的icecandidate事件', type: 'warn' });
    peerConnection.addEventListener('icecandidate', (event) => {
        prettierLog({ msg: 'pc收到icecandidate', type: 'warn' });
        if (event.candidate) {
            //...
        } else {
            console.log('没有候选者了');
        }
    });

    prettierLog({
        msg: '开始监听pc的iceconnectionstatechange事件',
        type: 'warn',
    });
    peerConnection.addEventListener(
        'iceconnectionstatechange',
        (event) => {
            prettierLog({
                msg: 'pc收到iceconnectionstatechange:connected',
                type: 'warn',
            });
            // https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/connectionState
            const iceConnectionState = event.currentTarget.iceConnectionState;
            if (iceConnectionState === 'connected') {
                // ICE 代理至少对每个候选发现了一个可用的连接，此时仍然会继续测试远程候选以便发现更优的连接。同时可能在继续收集候选。
                prettierLog({
                    msg: 'iceConnectionState:connected',
                    type: 'warn',
                });
                prettierLog({
                    msg: 'webrtc连接成功！',
                    type: 'success',
                });
                appStore.remoteDesk.isRemoteing = true;
                console.log('sender', this.sender, 'receiver', this.receiver);
                this.update();
            }
            if (iceConnectionState === 'completed') {
                // ICE 代理已经发现了可用的连接，不再测试远程候选。
                prettierLog({
                    msg: 'iceConnectionState:completed',
                    type: 'warn',
                });
            }
            if (iceConnectionState === 'failed') {
                // ICE 候选测试了所有远程候选没有发现匹配的候选。也可能有些候选中发现了一些可用连接。
                prettierLog({
                    msg: 'iceConnectionState:failed',
                    type: 'error',
                });
                this.close();
            }
            if (iceConnectionState === 'disconnected') {
                // 测试不再活跃，这可能是一个暂时的状态，可以自我恢复。
                prettierLog({
                    msg: 'iceConnectionState:disconnected',
                    type: 'error',
                });
                this.close();
            }
            if (iceConnectionState === 'closed') {
                // ICE 代理关闭，不再应答任何请求。
                prettierLog({
                    msg: 'iceConnectionState:closed',
                    type: 'error',
                });
            }
        }
    );

    prettierLog({
        msg: '开始监听pc的connectionstatechange事件',
        type: 'warn',
    });
    peerConnection.addEventListener(
        'connectionstatechange',
        (event) => {
            let connectionState = event.currentTarget.connectionState;
            prettierLog({
                msg: 'pc收到connectionstatechange:connected',
                type: 'warn',
            });
            if (connectionState === 'connected') {
                // 表示每一个 ICE 连接要么正在使用（connected 或 completed 状态），要么已被关闭（closed 状态）；并且，至少有一个连接处于 connected 或 completed 状态。
                prettierLog({
                    msg: 'connectionState:connected',
                    type: 'warn',
                });
                appStore.setLiveLine(LiveLineEnum.rtc);
                if (this.maxBitrate !== -1) {
                    this.setMaxBitrate(this.maxBitrate);
                }
            }
            if (connectionState === 'disconnected') {
                // 表示至少有一个 ICE 连接处于 disconnected 状态，并且没有连接处于 failed、connecting 或 checking 状态。
                prettierLog({
                    msg: 'connectionState:disconnected',
                    type: 'error',
                });
                this.close();
            }
            if (connectionState === 'closed') {
                // 表示 RTCPeerConnection 已关闭。
                prettierLog({
                    msg: 'connectionState:closed',
                    type: 'error',
                });
            }
            if (connectionState === 'failed') {
                // 表示至少有一个 ICE 连接处于 failed 的状态。
                prettierLog({
                    msg: 'connectionState:failed',
                    type: 'error',
                });
                this.close();
            }
        }
    );

    prettierLog({
        msg: '开始监听pc的icecandidateerror事件',
        type: 'warn',
    });
    peerConnection.addEventListener('icecandidateerror', (err) => {
        prettierLog({
            msg: 'pc收到icecandidateerror',
            type: 'error',
        });
        console.log(err);
    });

    prettierLog({
        msg: '开始监听pc的negotiationneeded事件',
        type: 'warn',
    });
    peerConnection.addEventListener('negotiationneeded', () => {
        prettierLog({
            msg: 'pc收到negotiationneeded',
            type: 'warn',
        });
    });
}

/*--处理接收的Offer和Answer,以及ICECandidate*/
/**
 * 处理接收的Offer
 * @param peerConnection
 * @param room 目标用户加入的房间号
 * @param offer
 * @param otherUser 目标用户id
 * @return {Promise<void>}
 */
const handleOffer = async (peerConnection, room, offer, otherUser) => {
    // 1、接收到远端的offer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));

    // 2、创建answer并将answer设置到本地会话描述
    createAnswer(peerConnection, room, otherUser).then(res => {
        console.log("创建Answer成功，" + res);
    }).catch(error => {
        console.error("创建Answer失败，" + error);
        delete peers[otherUser];// map删除from => peerConnection这对键值
    });
};
/**
 * 处理Answer
 * @param peerConnection
 * @param room 目标用户加入的房间号
 * @param answer
 * @param otherUser 目标用户id
 * @return {Promise<void>}
 */
const handleAnswer = async (peerConnection, room, answer, otherUser) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));

    createICECandidate(peerConnection, room, otherUser).then(res => {
        console.log("创建ICECandidate成功，" + res);
    }).catch(error => {
        console.error("创建ICECandidate失败，" + error);
        delete peers[otherUser];// map删除from => peerConnection这对键值
    });
};
/**
 * 处理ICE候选者
 * @param peerConnection
 * @param candidate
 * @param otherUser 目标用户id
 * @param remoteVideo 远程视频元素实例
 */
const handleIceCandidate = (peerConnection, candidate, otherUser, remoteVideo) => {
    // 处理ICE候选者
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then((res) => {
        peerConnection.ontrack = (event) => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            document.body.appendChild(remoteVideo); // 将远程视频元素添加到DOM中
            remoteVideo.play();
        };
        console.log("添加ICECandidate成功，" + res);
    }).catch(error => {
        console.error("添加ICECandidate失败，" + error);
        delete peers[otherUser];// map删除fromUserID => peerConnection这对键值
    });
};


/*---格式化输出*/
const prettierLog = (data = {
    msg: "",
    type: 'log',
}) => {
    const {msg, type} = data;
    if (type === 'success') {
        console.log(
            `%c ` +
            `【WebRTCClass】${new Date().toLocaleString()},房间id:${
                roomData
            }` +
            ` %c ${msg} ` +
            `%c`,
            'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
            'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
            'background:transparent'
        );
    } else {
        console[type || 'log'](
            `【WebRTCClass】${new Date().toLocaleString()},房间id:${roomData}`,
            msg
        );
    }
};
