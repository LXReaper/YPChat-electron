// initial state
// @ts-nocheck
/* eslint-disable */
import {StoreOptions} from "vuex";

export const noteBookPanelData = {
    namespaced: true,
    state: () => ({
        update: false,// 是否更新了noteBookPanelData中的数据
        isShow: 0,// 0为不显示，1为显示联系人，11为显示好友，2为显示群组，3为显示好友申请，4为显示加群申请
        userInfo: {// 查看对象信息
            isFriend: false,//是否是朋友
        },//用户信息
        groupInfo: {
            isJoin: false,//是否加入
        },//群组信息
    }),
    actions: {
        setIsShow({commit, state}, isShow) {
            commit("setIsShow", isShow);
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
        // 设置是否展示
        setIsShow(state, isShow) {
            state.isShow = isShow;
        },
        //设置用户信息
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
            state.update = !state.update;
        },
        // 删除所有数据
        clearAllData(state){
            state.update = !state.update;
            state.isShow = 0;
            state.userInfo = {
                isFriend: false,
            };
            state.groupInfo = {
                isJoin: false,
            };
        }
    },
} as StoreOptions<any>;
