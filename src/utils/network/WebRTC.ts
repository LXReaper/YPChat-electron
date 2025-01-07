import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import store from "../../store";
import {WebSocketClass} from "./WebSocket.ts";

export class WebRTCClass {
    roomId = "";// 房间id
    sender = "";// 发送方
    receiver = "";// 接收方

    maxBitrate = 2000;// 最大码率
    maxFramerate = 60;// 最大帧率
    resolutionRatio = 1080;// 分辨率

    videoEl: HTMLVideoElement;// 对方视频标签对象

    localStream?: MediaStream | null;// 我方的音视频流对象
    remoteStream?: MediaStream | null;// 对方的音视频流对象

    localScreenStream?: MediaStream | null;// 我方屏幕流
    remoteScreenStream?: MediaStream | null;// 对方屏幕流

    isConnected: boolean = false;// 是否已经连接上对方
    isConnectedVideo: boolean = false;// 是否获取到对方的视频流
    isConnectedAudio: boolean = false;// 是否获取到对方的音频流

    peerConnection: RTCPeerConnection | null = null;
    dataChannel: RTCDataChannel | null = null;// 我方用于发送数据的数据通道
    osDataChannel: RTCDataChannel | null = null;// 对方用于发送数据的数据通道

    constructor(data: {
        roomId: string;
        sender: string;
        receiver: string;
        maxBitrate?: number;
        maxFramerate?: number;
        resolutionRatio?: number;
        videoEl: HTMLVideoElement;
        localStream?: MediaStream;
        localScreenStream?: MediaStream;
    }) {
        // 基本信息
        this.roomId = data.roomId;
        this.sender = data.sender;
        this.receiver = data.receiver;

        // 音视频参数
        this.maxBitrate = data.maxBitrate || this.maxBitrate;
        this.resolutionRatio = data.resolutionRatio || this.resolutionRatio;
        this.maxFramerate = data.maxFramerate || this.maxFramerate;

        // 音视频数据
        this.videoEl = data.videoEl;
        this.localStream = data.localStream;
        this.localScreenStream = data.localScreenStream;

        this.createPeerConnection();
    }

    prettierLog = (data: {
        msg: string;
        type?: 'log' | 'warn' | 'error' | 'success';
    }) => {
        const { msg, type } = data;
        if (type === 'success') {
            console.log(
                `%c ` +
                `【WebRTCClass】${new Date().toLocaleString()},房间id:${
                    this.roomId
                }` +
                ` %c ${msg} ` +
                `%c`,
                'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
                'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
                'background:transparent'
            );
        } else {
            console[type || 'log'](
                `【WebRTCClass】${new Date().toLocaleString()},房间id:${this.roomId}`,
                msg
            );
        }
    };

    /** 创建对等连接 */
    createPeerConnection = () => {
        if (!window.RTCPeerConnection) {
            console.error('当前环境不支持RTCPeerConnection！');
            alert('当前环境不支持RTCPeerConnection！');
            return;
        }
        if (!this.peerConnection) {
            const iceServers = [
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
                ];
            this.peerConnection = new RTCPeerConnection({
                iceServers,
            });

            // 接收对方的数据通道
            this.peerConnection.ondatachannel = (event) => {
                this.osDataChannel = event.channel;
                this.update();
            };
            // 创建我方的数据通道
            this.dataChannel = this.peerConnection.createDataChannel(
                'MessageChannel',// 数据通道名称
                {
                    // maxRetransmits，用户代理应尝试重新传输在不可靠模式下第一次失败的消息的最大次数。虽然该值是 16 位无符号数，但每个用户代理都可以将其限制为它认为合适的任何最大值。
                    maxRetransmits: 3,
                    // ordered，表示通过 RTCDataChannel 的信息的到达顺序需要和发送顺序一致 (true), 或者到达顺序不需要和发送顺序一致 (false). 默认：true
                    ordered: false,
                    // protocol: 'udp',
                }
            );
            this.dataChannel.onopen = () => {
                this.prettierLog({
                    msg: 'dataChannel连接成功！',
                    type: 'success',
                });
            };
            this.dataChannel.onerror = () => {
                this.prettierLog({
                    msg: 'dataChannel连接失败！',
                    type: 'error',
                });
                this.close();
            };

            this.handleStreamEvent();
            this.handleConnectionEvent();
            this.update();
        }
    };

    /** 创建offer */
    createOffer = async () => {
        if (!this.peerConnection) return;
        this.prettierLog({ msg: 'createOffer开始', type: 'warn' });
        try {
            const sdp = await this.peerConnection.createOffer();
            this.prettierLog({ msg: 'createOffer成功', type: 'warn' });
            return sdp;
        } catch (error) {
            this.prettierLog({ msg: 'createOffer失败', type: 'error' });
            console.error(error);
        }
    };

    /** 创建answer */
    createAnswer = async () => {
        if (!this.peerConnection) return;
        this.prettierLog({ msg: 'createAnswer开始', type: 'warn' });
        try {
            const sdp = await this.peerConnection.createAnswer();
            this.prettierLog({ msg: 'createAnswer成功', type: 'warn' });
            return sdp;
        } catch (error) {
            this.prettierLog({ msg: 'createAnswer失败', type: 'error' });
            console.error(error);
        }
    };

    /** 处理candidate */
    addIceCandidate = async (candidate: RTCIceCandidateInit) => {
        this.prettierLog({ msg: 'addIceCandidate开始', type: 'warn' });
        try {
            await this.peerConnection?.addIceCandidate(candidate);
            this.prettierLog({ msg: 'addIceCandidate成功', type: 'warn' });
        } catch (error) {
            this.prettierLog({ msg: 'addIceCandidate错误', type: 'error' });
            console.error(error);
        }
    };

    /** 设置本地描述 */
    setLocalDescription = async (sdp: RTCLocalSessionDescriptionInit) => {
        if (!this.peerConnection) return;
        this.prettierLog({ msg: 'setLocalDescription开始', type: 'warn' });
        try {
            await this.peerConnection.setLocalDescription(sdp);
            this.prettierLog({ msg: 'setLocalDescription成功', type: 'warn' });
        } catch (error) {
            this.prettierLog({ msg: 'setLocalDescription失败', type: 'error' });
            console.error(error);
        }
    };

    /** 设置远端描述 */
    setRemoteDescription = async (sdp: RTCSessionDescriptionInit) => {
        if (!this.peerConnection) return;
        this.prettierLog({ msg: 'setRemoteDescription开始', type: 'warn' });
        try {
            await this.peerConnection.setRemoteDescription(sdp);
            this.prettierLog({ msg: 'setRemoteDescription成功', type: 'warn' });
        } catch (error) {
            this.prettierLog({ msg: 'setRemoteDescription失败', type: 'error' });
            console.error(error);
        }
    };

    handleStreamEvent = () => {
        if (!this.peerConnection) return;
        this.prettierLog({ msg: '开始监听pc的track事件', type: 'warn' });
        this.peerConnection.addEventListener('track', (event) => {
            this.prettierLog({ msg: 'pc收到track事件', type: 'warn' });
            console.log('track事件的event', event);
            console.log('track事件的stream', event.streams[0]);
            console.log('track事件的视频轨', event.streams[0].getVideoTracks());
            console.log('track事件的音频轨', event.streams[0].getAudioTracks());
            const stream = event.streams[0];
            stream.onremovetrack = () => {
                this.prettierLog({ msg: 'onremovetrack事件', type: 'warn' });
            };
            this.remoteStream = stream;
            this.videoEl.srcObject = event.streams[0];

            console.log("track：" + event.track);
            console.log("track的kind：" + event.track.kind);
            console.log("track的label：" + event.track.label);

            if (event.track.kind === 'video' && event.track.label.includes('Screen')) {
                this.remoteScreenStream = event.streams[0]; // 屏幕共享流
            }

            this.isConnectedAudio = stream.getAudioTracks().length > 0;
            this.isConnectedVideo = stream.getVideoTracks().length > 0;

            console.log("对方音频获取，" + this.isConnectedAudio);
            console.log("对方视频获取，" + this.isConnectedVideo);
        });
    };

    handleConnectionEvent = () => {
        if (!this.peerConnection) return;

        this.prettierLog({ msg: '开始监听pc的icecandidate事件', type: 'warn' });
        this.peerConnection.addEventListener('icecandidate', (event) => {
            this.prettierLog({ msg: 'pc收到icecandidate', type: 'warn' });
            if (event.candidate) {
                WebSocketClass.send(store.state.useNetworkStore.wsMap.get(this.roomId),
                    JSON.stringify(
                    {
                        type: MsgTypeConstant.ICE_CANDIDATE,
                        message: JSON.stringify(event.candidate),
                        room: this.roomId,
                        from: this.sender,
                        to: this.receiver,
                    }
                ));
            } else {
                console.log('没有候选者了');
            }
        });

        this.prettierLog({
            msg: '开始监听pc的iceconnectionstatechange事件',
            type: 'warn',
        });
        this.peerConnection.addEventListener(
            'iceconnectionstatechange',
            (event: any) => {
                this.prettierLog({
                    msg: 'pc收到iceconnectionstatechange:connected',
                    type: 'warn',
                });
                // https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/connectionState
                const iceConnectionState = event.currentTarget.iceConnectionState;
                if (iceConnectionState === 'connected') {
                    // ICE 代理至少对每个候选发现了一个可用的连接，此时仍然会继续测试远程候选以便发现更优的连接。同时可能在继续收集候选。
                    this.prettierLog({
                        msg: 'iceConnectionState:connected',
                        type: 'warn',
                    });
                    this.prettierLog({
                        msg: 'webrtc连接成功！',
                        type: 'success',
                    });
                    console.log('sender', this.sender, 'receiver', this.receiver);
                    this.isConnected = true;// 设置为连接成功
                    this.update();
                }
                if (iceConnectionState === 'completed') {
                    // ICE 代理已经发现了可用的连接，不再测试远程候选。
                    this.prettierLog({
                        msg: 'iceConnectionState:completed',
                        type: 'warn',
                    });
                }
                if (iceConnectionState === 'failed') {
                    // ICE 候选测试了所有远程候选没有发现匹配的候选。也可能有些候选中发现了一些可用连接。
                    this.prettierLog({
                        msg: 'iceConnectionState:failed',
                        type: 'error',
                    });
                    this.close();
                }
                if (iceConnectionState === 'disconnected') {
                    // 测试不再活跃，这可能是一个暂时的状态，可以自我恢复。
                    this.prettierLog({
                        msg: 'iceConnectionState:disconnected',
                        type: 'error',
                    });
                    this.close();
                }
                if (iceConnectionState === 'closed') {
                    // ICE 代理关闭，不再应答任何请求。
                    this.prettierLog({
                        msg: 'iceConnectionState:closed',
                        type: 'error',
                    });
                }
            }
        );

        this.prettierLog({
            msg: '开始监听pc的connectionstatechange事件',
            type: 'warn',
        });
        this.peerConnection.addEventListener(
            'connectionstatechange',
            (event: any) => {
                const connectionState = event.currentTarget.connectionState;
                this.prettierLog({
                    msg: 'pc收到connectionstatechange:connected',
                    type: 'warn',
                });
                if (connectionState === 'connected') {
                    // 表示每一个 ICE 连接要么正在使用（connected 或 completed 状态），要么已被关闭（closed 状态）；并且，至少有一个连接处于 connected 或 completed 状态。
                    this.prettierLog({
                        msg: 'connectionState:connected',
                        type: 'warn',
                    });
                    this.isConnected = true;// 设置为连接成功
                }
                if (connectionState === 'disconnected') {
                    // 表示至少有一个 ICE 连接处于 disconnected 状态，并且没有连接处于 failed、connecting 或 checking 状态。
                    this.prettierLog({
                        msg: 'connectionState:disconnected',
                        type: 'error',
                    });
                    this.close();
                }
                if (connectionState === 'closed') {
                    // 表示 RTCPeerConnection 已关闭。
                    this.prettierLog({
                        msg: 'connectionState:closed',
                        type: 'error',
                    });
                    this.isConnected = false;// 设置为关闭连接
                }
                if (connectionState === 'failed') {
                    // 表示至少有一个 ICE 连接处于 failed 的状态。
                    this.prettierLog({
                        msg: 'connectionState:failed',
                        type: 'error',
                    });
                    this.close();
                }
            }
        );

        this.prettierLog({
            msg: '开始监听pc的icecandidateerror事件',
            type: 'warn',
        });
        this.peerConnection.addEventListener('icecandidateerror', (err) => {
            this.prettierLog({
                msg: 'pc收到icecandidateerror',
                type: 'error',
            });
            console.log(err);
        });

        this.prettierLog({
            msg: '开始监听pc的negotiationneeded事件',
            type: 'warn',
        });
        this.peerConnection.addEventListener('negotiationneeded', () => {
            this.prettierLog({
                msg: 'pc收到negotiationneeded',
                type: 'warn',
            });
        });
    };

    // 设置最大码率
    setMaxBitrate = (maxBitrate: number) => {
        console.log('开始设置最大码率', maxBitrate);
        return new Promise<number>((resolve) => {
            this.peerConnection?.getSenders().forEach((sender) => {
                if (sender.track?.kind === 'video') {
                    const parameters = { ...sender.getParameters() };// RTCRtpSendParameters
                    if (parameters.encodings[0]) {// RTCRtpEncodingParameters
                        const val = 1000 * maxBitrate;
                        if (parameters.encodings[0].maxBitrate === val) {
                            console.log('最大码率不变，不设置');
                            resolve(1);
                            return;
                        }
                        parameters.encodings[0].maxBitrate = val;
                        sender
                            .setParameters(parameters)
                            .then(() => {
                                console.log('设置最大码率成功', maxBitrate);
                                this.maxBitrate = val;
                                resolve(1);
                            })
                            .catch((error) => {
                                console.error('设置最大码率失败', maxBitrate, error);
                                resolve(0);
                            });
                    }
                }
            });
        });
    };

    // 通过当前的数据通道发送P2P数据
    sendDataChannel = <T extends unknown>({
        msgType,
        message
    }: {
        msgType: string;
        message?: T,
    }) => {
        if (this.dataChannel?.readyState !== 'open') {
            console.error('dataChannel未连接成功，不发送消息！', msgType, message);
            return;
        }
        console.log('dataChannel发送消息', msgType);
        this.dataChannel.send(
            JSON.stringify({
                msgType,
                message,
            })
        );
    };

    /** 手动关闭webrtc连接 */
    public close = () => {
        store.dispatch("useNetworkStore/removeRTC", this.receiver).then(() => {
            try {
                this.prettierLog({ msg: '手动关闭webrtc连接', type: 'warn' });
                this.remoteStream?.getTracks().forEach((track) => {
                    track.stop();
                });
                this.remoteScreenStream?.getTracks().forEach((track) => {
                    track.stop();
                });
                this.remoteStream = null;
                this.remoteScreenStream = null;
                this.localStream = null;
                this.localScreenStream = null;
                this.peerConnection?.close();
                this.dataChannel?.close();
                this.peerConnection = null;
                this.dataChannel = null;
                this.videoEl.remove();
                this.isConnectedAudio = false;
                this.isConnectedVideo = false;
                this.isConnected = false;

            } catch (error) {
                this.prettierLog({ msg: '手动关闭webrtc连接失败', type: 'error' });
                console.error(error);
            }
        })
    };

    /** 更新store */
    public update = () => {
        store.state.useNetworkStore.rtcMap.set(this.receiver, { ...this });
    };
}
