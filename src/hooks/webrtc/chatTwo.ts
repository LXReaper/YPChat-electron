import {WebRTCClass} from "../../utils/network/WebRTC.ts";
import store from "../../store";
import {ref} from "vue";
import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import {WebSocketClass} from "../../utils/network/WebSocket.ts";

export const useWebRtcChatTwo = () => {

    // 房间号
    const roomId = ref("");
    // 本地的音视频流对象
    const localStream = ref<MediaStream>();

    const updateWebRtcChatTwoConfig = (data: {
        roomId: string;
        localStream: any;
    }) => {
        roomId.value = data.roomId;
        localStream.value = data.localStream;
    }

    const webRtcChatTwo = {
        newWebRtc: (data: {
            sender: string;
            receiver: string;
            videoEl: HTMLVideoElement;
        }) => {
            return new WebRTCClass({
                roomId: roomId.value,
                sender: data.sender,
                receiver: data.receiver,
                localStream: localStream.value as any,
                videoEl: data.videoEl,
            });
        },
        /**
         * 我发送offer给好友
         * @param sender
         * @param receiver
         */
        sendOffer: async ({sender, receiver}: {
            sender: string;
            receiver: string;
        }) => {
            console.log('chatTwo的sendOffer', {
                sender,
                receiver,
            });
            try {
                let wsc = store.state.useNetworkStore.wsMap.get(roomId.value);
                store.state.useNetworkStore.wsMap.forEach((value: WebSocketClass, key: any) => {
                    if (key == roomId.value)  wsc = value;
                });
                if (!wsc) {
                    console.error('roomId为' + roomId.value + '的ws不存在');
                    return;
                }
                const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
                if (rtc) {
                    if (localStream.value) {
                        localStream.value?.getTracks().forEach((track) => {
                            console.log('chatTwo的sendOffer插入track', track.kind, track);
                            rtc.peerConnection?.addTrack(track, localStream.value);
                        });
                    }
                    const offerSdp = await rtc.createOffer();
                    if (!offerSdp) {
                        console.error('chatTwo的offerSdp为空');
                        return;
                    }
                    await rtc.setLocalDescription(offerSdp);
                    WebSocketClass.send(wsc, JSON.stringify({
                        type: MsgTypeConstant.OFFER,
                        message: JSON.stringify(offerSdp),
                        room: roomId.value,
                        from: sender,
                        to: receiver,
                    }));
                } else {
                    console.error('rtc不存在');
                }
            } catch (error) {
                console.error('chatTwo的sendOffer错误');
                console.log(error);
            }
        },
        /**
         * 我发送answer给好友
         * @param sdp
         * @param sender
         * @param receiver
         */
        sendAnswer: async ({ sdp, sender, receiver }: {
            sdp: RTCSessionDescriptionInit;
            sender: string;
            receiver: string;
        }) => {
            try {
                let wsc = store.state.useNetworkStore.wsMap.get(roomId.value);
                store.state.useNetworkStore.wsMap.forEach((value: WebSocketClass, key: any) => {
                    if (key == roomId.value)  wsc = value;
                });
                if (!wsc) {
                    console.error('roomId为' + roomId.value + '的ws不存在');
                    return;
                }
                const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
                if (rtc) {
                    await rtc.setRemoteDescription(sdp);
                    if (localStream.value) {
                        localStream.value?.getTracks().forEach((track) => {
                            console.log('chatTwo的sendAnswer插入track', track);
                            rtc.peerConnection?.addTrack(track, localStream.value);
                        });
                    }
                    const answerSdp = await rtc.createAnswer();
                    if (!answerSdp) {
                        console.error('chatTwo的answerSdp为空');
                        return;
                    }
                    await rtc.setLocalDescription(answerSdp);
                    WebSocketClass.send(wsc, JSON.stringify({
                        type: MsgTypeConstant.ANSWER,
                        message: JSON.stringify(answerSdp),
                        room: roomId.value,
                        from: sender,
                        to: receiver,
                    }));
                } else {
                    console.error('rtc不存在');
                }
            } catch (error) {
                console.error('chatTwo的sendAnswer错误');
                console.log(error);
            }
        },
        /**
         * 手动将本地音视频流传给对方
         * @param stream
         * @param receiver
         */
        addTrack: ({ stream, receiver }: { stream: any; receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            stream = stream || localStream.value;
            if (rtc) {
                stream.getTracks().forEach((track: any) => {
                    console.log('chatTwo的插入track', track.kind, track);
                    rtc.peerConnection?.addTrack(track, stream);
                });
            }
        },

        /**
         * 恢复被移除的音频轨
         * @param stream
         * @param receiver
         */
        restoreAudioTrack: ({ receiver }: { receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            if (rtc) {
                rtc.peerConnection?.getSenders().forEach((sender: any) => {
                    if (sender.track && sender.track.kind === "audio") {
                        console.log('chatTwo的恢复音频track', sender.track.kind, sender.track);
                        sender.track.enabled = true;
                    }
                });
                // 修改rtc音视频流状态
            }else {
                console.log("rtc不存在，" + receiver);
            }
        },

        /**
         * 恢复被移除的视频轨
         * @param receiver
         */
        restoreVideoTrack: ({ receiver }: { receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            if (rtc) {
                rtc.peerConnection?.getSenders().forEach((sender: any) => {
                    if (sender.track && sender.track.kind === "video") {
                        console.log('chatTwo的恢复视频track', sender.track.kind, sender.track);
                        sender.track.enabled = true;
                    }
                });
                // 修改rtc音视频流状态
            }else {
                console.log("rtc不存在，" + receiver);
            }
        },

        /**
         * 手动移除本地音视频流
         * @param receiver
         */
        removeTrack: ({ receiver }: { receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            if (rtc) {
                rtc.peerConnection.getSenders().forEach((sender: any) => {
                    console.log('chatTwo的关闭所有track', sender.track.kind, sender.track);
                    sender.track.enabled = false;
                });
            }
        },
        /**
         * 手动移除本地音频流
         * @param receiver
         */
        removeAudioTrack: ({ receiver }: { receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            if (rtc) {
                rtc.peerConnection.getSenders().forEach((sender: any) => {
                    if (sender.track && sender.track.kind === "audio") {
                        console.log('chatTwo的关闭音频track', sender.track.kind, sender.track);
                        sender.track.enabled = false;
                    }
                });
            }
        },

        /**
         * 手动移除本地视频流
         * @param receiver
         */
        removeVideoTrack: ({ receiver }: { receiver: string }) => {
            const rtc = store.state.useNetworkStore.rtcMap.get(receiver);
            if (rtc) {
                rtc.peerConnection.getSenders().forEach((sender: any) => {
                    if (sender.track && sender.track.kind === "video") {
                        console.log('chatTwo的关闭音频track', sender.track.kind, sender.track);
                        sender.track.enabled = false;
                    }
                });
            }
        },
    }

    return {updateWebRtcChatTwoConfig, webRtcChatTwo};
}
