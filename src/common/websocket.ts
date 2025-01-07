/**
 * 消息发送同一格式
 */
export interface BasicMessageData<T> {
    /** 消息来源 */
    from: string;
    /** 发给谁 */
    to: string;
    /** 消息主体*/
    message: T;
    /** 消息类型 */
    type?: string;
    /** 消息时间戳 */
    time: number;
}

export type WsChangeMaxBitrateType = BasicMessageData<{
    roomId: number | string;
    val: number;
}>;

export type WsChangeMaxFramerateType = BasicMessageData<{
    roomId: number | string;
    val: number;
}>;

export type WsChangeResolutionRatioType = BasicMessageData<{
    roomId: number | string;
    val: number;
}>;

export type WsChangeVideoContentHintType = BasicMessageData<{
    roomId: number | string;
    val: string;
}>;

export type WsChangeAudioContentHintType = BasicMessageData<{
    roomId: number | string;
    val: string;
}>;

export type WsChangeBasicSettingsType = {
    maxBitrate: WsChangeMaxBitrateType;
    maxFramerate: WsChangeMaxFramerateType;
    resolutionRatio: WsChangeResolutionRatioType;
    videoContentHint: WsChangeVideoContentHintType;
    audioContentHint: WsChangeAudioContentHintType;
};
