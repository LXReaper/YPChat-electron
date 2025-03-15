// initial state
// @ts-nocheck
/* eslint-disable */
import {StoreOptions} from "vuex";
import {NormalChatMessageQueryRequest} from "../api/Model/Request/MessageRequest/NormalChatMessageQueryRequest.ts";
import {MessageService} from "../api/Services/MessageService.ts";
import {getUserInfoStorage} from "../utils/storageUtil.ts";
import store from "./index.ts";
import {ElMessage} from "element-plus";
import moment from "moment";

export const chatPanelData = {
    namespaced: true,
    state: () => ({
        update: false,// 是否更新了chatPanelData中的数据
        isShow: 0,// 0为不显示，1为显示正常聊天页面
        curChatMessage: [],// 当前聊天的消息数据
        userInfo: {
            isFriend: false,//是否是朋友
        },//用户信息
        groupInfo: {
            isJoin: false,//是否加入
        },//群组信息
    }),
    actions: {
        async postChatMessage({ commit, state }, message) {
          commit("postChatMessage",message);
        },
        async searchCurChatMessage({ commit, state }, normalChatMessageQueryRequest){
          await commit("searchCurChatMessage", normalChatMessageQueryRequest);
        },
        async searchIfShowCurChatMessage({ commit, state }, contact_info_id){
          await commit("searchIfShowCurChatMessage", contact_info_id);
        },
        setIsShow({commit, state}, isShow) {
            commit("setIsShow", isShow);
        },
        setCurChatMessage({commit, state}, curChatMessage) {
            commit("setCurChatMessage", curChatMessage);
        },
        setUserInfo({commit, state}, userInfo) {
            commit("setUserInfo", userInfo);
        },
        clearAllData({ commit, state }){
            commit("clearAllData");
        }
    },
    // mutations,修改状态变量
    mutations: {
        // 发送消息
        postChatMessage(state, message){
            MessageService.postMessageUsingPost(message).then((res: any) => {
                if (res.code === 0) {
                    store.dispatch("basicData/addChatMessageSearchPageSize", 1);// 增加当前联系对象消息查询数据页数
                }else ElMessage.error("消息发送失败");
            }).catch((error: any) => {
                console.log("信息发送失败" + `${error ? `，${error}` : ""}`);
            })
        },
        // 查询当前的聊天消息
        async searchCurChatMessage(state, normalChatMessageQueryRequest){
            await searchMessage(state, {
                ...normalChatMessageQueryRequest,
                friend_id: state.userInfo.contact_info_id,
            });
            store.dispatch("basicData/clearCurContactorNewMessageCount");
        },
        // 如果当前显示的contact_info_id为contact_info_id时加载该联系消息
        async searchIfShowCurChatMessage(state, contact_info_id) {
            let curContactor = store.getters["basicData/getCurContactor"];
            if(curContactor.contact_info_id === contact_info_id){
                store.dispatch("basicData/addChatMessageSearchPageSize", 50).then(() => {
                    searchMessage(state, {
                        user_id: getUserInfoStorage().id,
                        friend_id: contact_info_id
                    });
                });// 加载新的消息
            }else {
                // 不是就使用babel通知 todo
            }
        },
        // 设置是否展示
        setIsShow(state, isShow) {
            state.isShow = isShow;
        },
        setCurChatMessage(state, curChatMessage) {
            state.curChatMessage = curChatMessage;
            state.update = !state.update;
        },
        //设置用户信息
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
            state.update = !state.update;
        },
        // 删除所有数据
        clearAllData(state){
            state.update = false;
            state.isShow = 0;
            state.curChatMessage = [];
            state.userInfo = {
                isFriend: false,
            };
            state.groupInfo = {
                isJoin: false,
            };
        }
    },
} as StoreOptions<any>;


const searchMessage = (state, normalChatMessageQueryRequest) => {
    const pageSize = store.getters['basicData/getChatMessageSearchPageSize'];
    if (!pageSize) return ;

    MessageService.listMessageVOUsingPost({
        ...normalChatMessageQueryRequest,
        pageSize: pageSize,
        sortField: "post_time",
        sortOrder: "descend",
    }).then((res: any) => {
        if (res.code === 0){
            const records = res.data.records;
            store.dispatch("chatPanelData/setCurChatMessage",
                records.map((record, index) => {

                    if (index === 0) {// 第一个元素肯定不相等
                        return { ...record, isOnSameTime: false };
                    }

                    // 获取前一个记录
                    const prevRecord = records[index - 1];

                    // 检查当前记录的 post_time 与前一个记录的 post_time 是否相等
                    if (prevRecord && moment(record.post_time).clone().isSame(
                     moment(prevRecord.post_time).clone(), "minute"
                    )) {
                        return { ...record, isOnSameTime: true };// 同一分钟设为true
                    } else {
                        return { ...record, isOnSameTime: false };// 不同时间设为false
                    }
                })
            );
            store.dispatch("basicData/setMessageTotal", res.data.total);
        }else ElMessage.error("联系人信息加载失败，" + res.message);
    }).catch((error: any) => {
        console.log("联系人信息加载失败" + `${error ? `，${error}` : ""}`);
    });
}
