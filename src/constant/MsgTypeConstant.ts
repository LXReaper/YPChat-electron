
export const MsgTypeConstant = {
    // 心跳消息
    HEARTBEAT: "Heart beat",
    // 默认聊天类型
    DEFAULT_CHAT: "default_chat",
    // 群聊类型
    GROUP_CHAT: "group_chat",

    /*实时音视频聊天*/
    /**
     * 实时音频聊天
     */
    // 电话聊天
    PHONE_CHAT: "phone_chat",
    /**
     * 实时多人视频聊天
     */
    CONFERENCE_CHAT: "conference_chat",
    // 邀请加入房间
    INVITE_JOIN_ROOM: "invite_join_room",
    // 拒接加入房间
    REJECT_JOIN_ROOM: "reject_join_room",
    // 挂断电话
    HANGUP: "hangup",
    // 加入房间
    JOIN_ROOM: "join_room",
    // 离开房间
    LEAVE_ROOM: "leave_room",
    // 删除房间
    DEL_ROOM: "delete_room",
    // 收发offer
    OFFER: "offer",
    // 收发answer
    ANSWER: "answer",
    // 收发candidate
    ICE_CANDIDATE: "ice-candidate",


    /*聊天消息*/
    // 聊天消息发送成功
    CHAT_MESSAGE_POST_SUCCESS: "chat_message_post_success",
    // 聊天消息发送失败
    CHAT_MESSAGE_POST_FAIL: "chat_message_post_fail",
    // 接收到聊天消息
    CHAT_MESSAGE_RECEIVE: "chat_message_receive",


    /*webrtc通信类型*/
    // 双人语音聊天
    CHAT_TWO_WEBRTC: "chat_two_webrtc",
    // 双人视频聊天
    CHAT_VIDEO_TWO_WEBRTC: "chat_video_two_webrtc",

    // 双人屏幕共享
    SCREEN_SHARE_TWO: "screen_share",
    // 屏幕控制（双人）
    SCREEN_CTL_TWO: "screen_ctl_two",

    // 邀请加入双人语音聊天房间
    INVITE_JOIN_CHAT_TWO_ROOM: "invite_join_chat_two_room",
    // 邀请加入双人视频聊天房间
    INVITE_JOIN_CHAT_VIDEO_TWO_ROOM: "invite_join_chat_video_two_room",

    // 邀请对方加入本人的屏幕共享
    INVITE_JOIN_SCREEN_SHARE_TWO_ROOM: "invite_join_screen_share_two_room",
    // 邀请对方加入本人的屏幕控制
    INVITE_JOIN_SCREEN_CTL_TWO_ROOM: "invite_join_screen_ctl_two_room",

    // 修改对方视频的最大码率
    changeMaxBitrate: 'changeMaxBitrate',
    // 修改对方视频的最大帧率
    changeMaxFramerate: 'changeMaxFramerate',
    // 修改对方视频的最大视频分辨率
    changeResolutionRatio: 'changeResolutionRatio',
    // 修改对方视频流的属性
    changeVideoContentHint: 'changeVideoContentHint',
    // 修改对方音频流的属性
    changeAudioContentHint: 'changeAudioContentHint',
}

// 发送的消息中链接类型
export const LinkType = {
    FILE: "file",// 文件链接
    PHONE_CHAT: "phone_chat",// 语音聊天
    PHONE_VIDEO_CHAT: "phone_video_chat",// 视频聊天
}

// rtc传输媒体类型枚举
export enum MediaTypeEnum {
    camera,
    screen,
    microphone,
    txt,
    img,
    media,
    time,
    stopwatch,
}
