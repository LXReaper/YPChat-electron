import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import store from "../../store";
import {getUserInfoStorage} from "../storageUtil.js";
import {UserService} from "../../api/Services/UserService";


/**
 * 处理各种邀请请求
 * @param message
 */
export const handleInvitation = (message: any) => {
    // todo 先判断是否在通话中，如果在通话中就忽视邀请信息

    // 处理电话邀请信息
    let userId = message.from;// 来源用户
    let roomId = message.room;// 房 间号
    let type = message.type;
    let msg = message.message;// 加入消息内容，有加入的是哪种房间，比如双人音视频聊天、多人音视频聊天

    let winName = "phone_chat";
    let path = "/phone/chat";

    let initX = 300;
    let initY = 150;
    let initWidth = 400;
    let initHeight = 760;

    switch (msg) {
        case MsgTypeConstant.INVITE_JOIN_CHAT_TWO_ROOM:
            winName = "phone_chat";
            path = "/phone/chat";
            break;
        case MsgTypeConstant.INVITE_JOIN_CHAT_VIDEO_TWO_ROOM:
            winName = "video_chat";
            path = "/video/chat";
            break;
        case MsgTypeConstant.INVITE_JOIN_SCREEN_CTL_TWO_ROOM:

            break;
        case MsgTypeConstant.INVITE_JOIN_SCREEN_SHARE_TWO_ROOM:
            winName = "desk_share";
            path = "/desk/share";
            initX = 200;
            initY = 150;
            initWidth = 1300;
            initHeight = 850;

            break;
    }

    if (type) {
        switch (type){
            case MsgTypeConstant.INVITE_JOIN_ROOM: //处理加入房间
                console.log("用户：" + userId + " 邀请加入房间：" + roomId);
                UserService.getContactor({
                    user_id: getUserInfoStorage().id,
                    type: 0,
                    contact_info_id: userId,
                }).then((res: any) => {
                    if (res.code === 0) {
                        //获取自定义electronAPI上下文
                        let electron = (window as any).electronAPI;
                        electron.sendMessage('openChildWindow',{
                            winName: winName,
                            path: path,
                            resizable: false,
                            x: initX,
                            y: initY,
                            width: initWidth,
                            height: initHeight,
                            maximizable: false, //不允许放大
                            transportObj: JSON.stringify({
                                ...res.data,
                                roomId: roomId,
                                msgType: MsgTypeConstant.INVITE_JOIN_ROOM,
                                user_id: getUserInfoStorage().id,// 加入房间的用户
                            }),
                        })
                    }else {
                        console.error("对方用户信息获取请求失败，" + res.message);
                    }
                }).catch(() => {
                    console.error("对方用户信息获取请求失败")
                })
                // 邀请后要显示一个对话框点击是否要接受邀请
                break
        }
    }
}


/**
 * 处理P2P消息
 * @param message
 */
export const handleP2PChatMessagePost = (message: any) => {
    switch (message.message) {
        case MsgTypeConstant.CHAT_MESSAGE_RECEIVE:// 收到消息
            handleReceiveMessageP2P(message);
            break;
        case MsgTypeConstant.CHAT_MESSAGE_POST_SUCCESS: // 消息成功发送
            handleSuccessMessageP2P();
            break;
    }
}
const handleReceiveMessageP2P = (message: any) => {
    const from = message.from;
    // const type = message.type;
    store.dispatch("basicData/searchContactor");// 加载新的联系人list

    // 如果当前正在联系的联系对象id是当前接受到消息的from，则查询
    store.dispatch("chatPanelData/searchIfShowCurChatMessage", from);
}
const handleSuccessMessageP2P = () => {
    // 异步执行
    setTimeout(() => {
        store.dispatch("basicData/searchContactor");// 查询联系对象信息
        store.dispatch("chatPanelData/searchCurChatMessage", {
            user_id: getUserInfoStorage().id,
            friend_id: store.state.chatPanelData.userInfo.contact_info_id
        });
    },100);
}
