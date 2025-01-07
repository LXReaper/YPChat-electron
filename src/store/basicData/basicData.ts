// initial state
// @ts-nocheck
/* eslint-disable */
import {StoreOptions} from "vuex";
import {UserService} from "../../api/Services/UserService.ts";
import store from "../index.ts";
import {ElMessage, ElNotification} from "element-plus";
import {getUserInfoStorage} from "../../utils/storageUtil.js";
import {CommonConstant} from "../../constant/CommonConstant.ts";
import {FileService} from "../../api/Services/FileService.ts";
import {AxiosProgressEvent} from "axios";
import {FileUploadConstant, FileUploadResult} from "../../constant/FileUploadConstant.ts";
import {createFile, createImage, createVideo} from "../../utils/nodeCreatorUtil.ts";
import {ChatMsgTypeConstant} from "../../constant/ChatMsgTypeConstant.ts";
import {formatFileSize} from "../../utils/fileUtil.ts";

export type AddFilesUploadDataRequest = {// 新增文件上传数据请求
    contactorId: string;// 联系id，不是用户id或者群聊id
    fileUploadList: Array<any>;// 文件数组
}

export type ReUploadFileRequest = {
    contactorId: string;// 联系id，不是用户id或者群聊id
    reUploadFileIndex: number;// 重新上传的文件下标
}

export const basicData = {
    namespaced: true,
    state: () => ({
        isElectron: false,
        // 窗口相关的参数
        win: {
            width: 320,
            height: 450,
        },
        // 主菜单相关参数
        activeIndex: '/chat',
        // 联系对象相关参数
        contactorSearchPageSize: 50,// 目前最多显示50个联系信息
        selectContactorIndex: -1,// 选中的联系对象在contactorList下标
        selectContactorId: -1,// 选中的联系对象的id
        chatMessageSearchPageSize: {},// 每个联系对象聊天消息搜索分页记录数,contactorID => pageSize
        messageTotal: {},// 每个联系对象聊天消息总数,contactorID => total
        contactorList: [],// 联系对象list
        filesUploadQueues: {},// 每个联系对象的一个文件上传队列
        // 好友相关参数
        friendList: [],// 好友信息list
    }),
    actions: {
        searchContactor({ commit, state }, searchParam){
            commit("searchContactor", searchParam);
        },
        searchFriends({ commit, state }, searchFriendParam){
            commit("searchFriends", searchFriendParam);
        },
        setIsElectron({ commit, state }, isElectron) {
            commit("setIsElectron", isElectron);
        },
        setSelectContactor({ commit, state }, selectContactorObj){
            commit("setSelectContactor", selectContactorObj);
        },
        setContactorIsTop({ commit, state }, contactUpdateRequest){
          commit("setContactorIsTop", contactUpdateRequest);
        },
        setIsIgnoreContactorMsg({ commit, state }, contactUpdateRequest){
            commit("setIsIgnoreContactorMsg", contactUpdateRequest);
        },
        setChatWithCurFriend({ commit, state }, curFriendId) {
          commit("setChatWithCurFriend", curFriendId);
        },
        addChatMessageSearchPageSize({ commit, state }, addParam){
            commit("addChatMessageSearchPageSize", addParam);
        },
        addFilesUploadData({ commit, state }, addFilesUploadDataRequest){
            commit("addFilesUploadData", addFilesUploadDataRequest);
        },
        reUploadFileData({ commit, state }, reUploadFileRequest) {
            commit("reUploadFileData", reUploadFileRequest);
        },
        updateContactorNameInfo({commit, state}, updateContactorInfoRequest) {
            commit("updateContactorNameInfo", updateContactorInfoRequest);
        },
        setMessageTotal({commit, state}, total) {
            commit("setMessageTotal", total);
        },
        // actions,执行异步操作,并触发mutations的修改
        setWin({ commit, state }, payload) {
            if (!payload) {
                commit("updateWin", {
                    width: 320,
                    height: 450
                });
                return;
            }
            commit("updateWin", payload);
        },
        setContactorList({ commit, state }, payload) {
            if (!payload) {
                commit("updateContactorList", []);
                return ;
            }
            commit("updateContactorList", payload);
        },
        setFriendList({ commit, state }, payload) {
            if (!payload) {
                commit("updateFriendList", []);
                return ;
            }
            commit("updateFriendList", payload);
        },
        clearCurContactorNewMessageCount({ commit, state }, payload) {
            commit("clearCurContactorNewMessageCount");
        },
        clearAllData({ commit, state }){
            commit("clearAllData");
        }
    },
    // mutations,修改状态变量
    mutations: {
        // 查询好友
        searchFriends(state, searchFriendParam){
            UserService.listFriendsByPageUsingPost({
                ...searchFriendParam,
                user_id: getUserInfoStorage().id,
                pageSize: 50,
            })
                .then((res: any) => {
                    if (res.code === 0){
                        state.friendList = res.data.records;
                    }else ElMessage.error("好友信息加载失败，" + res.message);
                }).catch((error: any) => {
                console.error("好友信息加载失败" + `${error ? `，${error}` : ""}`);
            });
        },
        // 查询联系信息
        searchContactor(state, searchParam){
            UserService.listContactVOByPageUsingPost({
                ...searchParam,
                user_id: getUserInfoStorage().id,
                pageSize: state.contactorSearchPageSize,
                sortField: "last_contact_time",
                sortOrder: "descend",
            })
                .then((res: any) => {
                    if (res.code === 0){
                        state.contactorList = res.data.records;
                        // 更新chatMessageSearchPageSize和messageTotal
                        let i = 0;
                        for (let i = 0;i < state.contactorList.length;++i){
                            let contactorID = state.contactorList[i].id;
                            if (!state.chatMessageSearchPageSize[contactorID]) { // 检查是否已经包含该contactorID
                                state.chatMessageSearchPageSize[contactorID] = 50; // 如果没有，则添加contactorID及其对应的数值
                            }
                            if (!state.messageTotal[contactorID]) { // 检查是否已经包含该contactorID
                                state.messageTotal[contactorID] = 0; // 如果没有，则添加contactorID及其对应的数值
                            }
                            if (state.selectContactorId === contactorID){// 当前正在跟该对象聊天
                                // 更新当前联系对象下标
                                state.selectContactorIndex = i;// 设置为更新之后的下标
                            }
                        }
                    }else ElMessage.error("联系信息加载失败，" + res.message);
                }).catch((error: any) => {
                console.error("联系信息加载失败" + `${error ? `，${error}` : ""}`);
            });
        },
        setIsElectron(state, isElectron) {
            state.isElectron = isElectron;
        },
        // 设置当前选中的联系对象在ContactorList的下标，以及联系对象id
        setSelectContactor(state, selectContactorObj){
            state.selectContactorIndex = selectContactorObj.selectContactorIndex;
            state.selectContactorId = selectContactorObj.selectContactorId;
        },
        // 设置某个联系对象是否置顶
        setContactorIsTop(state, contactUpdateRequest) {
            if (!contactUpdateRequest || !contactUpdateRequest.id || contactUpdateRequest.isTop === null) {
                ElMessage.error(`${contactUpdateRequest.isTop ? "" : "取消"}置顶失败`);
                return;
            }
            UserService.setIsTopByIdUsingPost(contactUpdateRequest).then((res: any) => {
                if (res.code === 0) {
                    store.dispatch("basicData/searchContactor");// 加载新的数据
                }else {
                    ElMessage.error(`${contactUpdateRequest.isTop ? "" : "取消"}置顶失败`);
                }
            }).catch(() => {
                ElMessage.error(`${contactUpdateRequest.isTop ? "" : "取消"}置顶失败`);
            })
        },
        // 设置是否忽略某个联系对象的消息
        setIsIgnoreContactorMsg(state, contactUpdateRequest) {
            if (!contactUpdateRequest || !contactUpdateRequest.id || contactUpdateRequest.isIgnore === null) {
                ElMessage.error(`开启${contactUpdateRequest.isIgnore ? "消息免打扰" : "新消息提醒"}失败`);
                return;
            }
            UserService.setIsIgnoreContactorMsgUsingPost(contactUpdateRequest).then((res: any) => {
                if (res.code === 0) {
                    store.dispatch("basicData/searchContactor");// 加载新的数据
                }else {
                    ElMessage.error(`开启${contactUpdateRequest.isIgnore ? "消息免打扰" : "新消息提醒"}失败`);
                }
            }).catch(() => {
                ElMessage.error(`开启${contactUpdateRequest.isIgnore ? "消息免打扰" : "新消息提醒"}失败`);
            })
        },
        // 设置与当前的好友聊天， curFriendId为好友用户id
        setChatWithCurFriend(state, curFriendId) {
            if (!state.contactorList || !state.contactorList.length) return;
            for (let i = 0; i < state.contactorList.length; i++) {
                let contactor = state.contactorList[i];
                // 是联系人，且联系人的联系对象id 是 好友的用户id
                if (contactor.type === CommonConstant.CONTACTOR_PERSON_TYPE && contactor.contact_info_id === curFriendId){
                    state.selectContactorIndex = i;
                    state.selectContactorId = contactor.id;
                    break;
                }
            }
        },
        // 增加每个联系对象消息搜索页数
        addChatMessageSearchPageSize(state, addParam){
            state.chatMessageSearchPageSize[
                state.contactorList[state.selectContactorIndex].id
            ] += addParam;
        },
        // 对某个联系对象新增文件上传数据
        addFilesUploadData(state, addFilesUploadDataRequest) {
            if (!addFilesUploadDataRequest) return ;
            const { contactorId, fileUploadList } =
                addFilesUploadDataRequest as AddFilesUploadDataRequest;

            let oldFileUploadList = state.filesUploadQueues[contactorId] || [];
            state.filesUploadQueues[contactorId] = [
                ...oldFileUploadList,
                ...fileUploadList,
            ];

            let len = state.filesUploadQueues[contactorId].length;
            for (let i = 0;i < len;++i) {
                if (state.filesUploadQueues[contactorId][i].uploadResult === FileUploadResult.SUCCESS ||
                    state.filesUploadQueues[contactorId][i].uploadResult === FileUploadResult.UPLOADING ||
                    state.filesUploadQueues[contactorId][i].uploadResult === FileUploadResult.ERROR) {
                    // 上传成功、上传失败和正在上传中的文件不做处理
                    continue ;
                }
                let file = state.filesUploadQueues[contactorId][i].file;
                let fileType = file.type;
                let formData = new FormData();
                formData.append("file", file);
                if (fileType.includes("image"))
                    formData.append("biz", FileUploadConstant.MESSAGE_IMAGE);
                else if (fileType.includes("video"))
                    formData.append("biz", FileUploadConstant.MESSAGE_VIDEO);
                else
                    formData.append("biz", FileUploadConstant.MESSAGE_FILE);
                // 设置为正在上传
                state.filesUploadQueues[contactorId][i].uploadResult = FileUploadResult.UPLOADING;
                // 开始上传
                FileService.uploadFile(formData,(progressEvent: AxiosProgressEvent) => {
                    const total = progressEvent.total;
                    const current = progressEvent.loaded;
                    // 设置上传进度
                    state.filesUploadQueues[contactorId][i].uploadProgress =
                        Math.round((current * 100) / total);
                }).then((res: any) => {
                    if (res.code === 0) {
                        state.filesUploadQueues[contactorId][i].uploadResult = FileUploadResult.SUCCESS;// 上传成功

                        let iFile = state.filesUploadQueues[contactorId][i];
                        let MsgTo = iFile.MsgTo;

                        // 1、上传完成开始发送消息
                        let fileType = iFile.file?.type;
                        let messageContent = '';
                        let curNode = null;
                        let msgType = ChatMsgTypeConstant.FILE_MESSAGE;
                        if (fileType.includes("image")) {// 图片消息
                            curNode = createImage({
                                src: res.data,
                                alt: "图片已过期或被清除",// 设置图片新的alt
                            })
                            messageContent = curNode.outerHTML;
                            msgType = ChatMsgTypeConstant.IMAGE_MESSAGE;
                        } else if (fileType.includes("video")){// 视频消息
                            curNode = createVideo({
                                src: res.data,
                                autoplay: false,
                            });
                            messageContent = curNode.outerHTML;
                            msgType = ChatMsgTypeConstant.VIDEO_MESSAGE;
                        } else {// 文件消息
                            curNode = createFile({
                                fileUrl: res.data,
                                fileName: iFile.file?.name,
                                fileType: fileType,// 文件类型
                                fileSize: formatFileSize(iFile.file?.size),
                            });
                            messageContent = curNode.outerHTML;
                        }
                        // 2、发送消息 todo 这里只有发送私聊消息，如果是群聊还需要改造
                        store.dispatch("chatPanelData/postChatMessage", {
                            from_id: getUserInfoStorage().id,
                            to_id: MsgTo,
                            status: 0,
                            type: msgType,
                            content: messageContent,
                        });

                    } else {
                        ElMessage.error("文件发送失败")
                        state.filesUploadQueues[contactorId][i].uploadResult = FileUploadResult.ERROR;// 上传失败
                    }
                }).catch((reason: any) => {
                    ElNotification.error("文件发送失败");
                    console.error("文件上传失败，" + reason);
                    state.filesUploadQueues[contactorId][i].uploadResult = FileUploadResult.ERROR;// 上传失败
                })
            }
        },
        // 重新上传文件
        reUploadFileData(state, reUploadFileRequest) {
            if (!reUploadFileRequest) return ;
            const { contactorId, reUploadFileIndex } =
                reUploadFileRequest as ReUploadFileRequest;

            let oldFileUploadList = state.filesUploadQueues[contactorId] || [];
            if (!oldFileUploadList.length || reUploadFileIndex < 0 ||
                oldFileUploadList.length <= reUploadFileIndex)
                return ;// 上传列表为空 或者 重新上传的文件下标超出数组边界，直接返回

            // 1、设置为等待上传
            oldFileUploadList[reUploadFileIndex].uploadResult = FileUploadResult.LOADING;
            // 2、重新上传
            store.dispatch("basicData/addFilesUploadData", {
                contactorId: store.getters["basicData/getCurContactorId"],
                fileUploadList: [],
            });
        },
        // 更新联系对象信息
        updateContactorNameInfo(state, updateContactorInfoRequest) {
            if (!updateContactorInfoRequest.nick_name) {
                ElMessage.error("修改联系名称失败");
            }
            UserService.updateContactNameUsingPost(updateContactorInfoRequest).then(res => {
                if (res.code === 0) {
                    store.dispatch("basicData/searchContactor");// 加载新的数据
                }else {
                    ElMessage.error("修改联系名称失败");
                }
            }).catch(() => {
                ElMessage.error("修改联系名称失败");
            })
        },
        // 设置每个联系对象消息的总数
        setMessageTotal(state, total) {
            state.messageTotal[
                state.contactorList[state.selectContactorIndex].id
            ] = total;
        },
        updateWin(state, payload) {
            state.win = payload;
        },
        updateContactorList(state, payload) {
            state.contactorList = payload;
        },
        updateFriendList(state, payload) {
            state.friendList = payload;
        },
        // 清除当前聊天对象的新消息计数
        clearCurContactorNewMessageCount(state, payload) {
            if (state.selectContactorIndex === -1) return ;// 没有选中当前聊天对象
            state.contactorList[state.selectContactorIndex].newMessageCount = 0;
        },
        // 清空所有数据
        clearAllData(state){
            state.isElectron = false;
            // 窗口相关的参数
            state.win= {
                width: 320,
                height: 450,
            };
            // 主菜单相关参数
            state.activeIndex = '/chat';
            // 联系对象相关参数
            state.contactorSearchPageSize = 50;// 目前最多显示50个联系信息
            state.selectContactorIndex = -1;// 选中的联系人在contactorList下标
            state.selectContactorId = -1;// 选中的联系人的id
            state.chatMessageSearchPageSize = {};// 每个联系对象聊天消息搜索分页记录数,contactorID => pageSize
            state.messageTotal = {};// 每个联系对象聊天消息总数,contactorID => total
            state.contactorList = [];// 联系对象list
            state.filesUploadQueues = {};// 每个联系对象的一个文件上传队列
            // 好友相关参数
            state.friendList = [];// 好友信息list
        }
    },
    getters: {
        getCurContactor(state) {
            if (state.selectContactorIndex === -1) return null;
            return state.contactorList[state.selectContactorIndex];
        },
        getCurContactorId(state) {
            if (!state.contactorList[state.selectContactorIndex]) return ;
            return state.contactorList[state.selectContactorIndex].id;
        },
        // 获取当前聊天对象查询页数
        getChatMessageSearchPageSize(state) {
            if (!state.contactorList[state.selectContactorIndex]) return ;
            return state.chatMessageSearchPageSize[state.contactorList[state.selectContactorIndex].id];
        },
        // 获取当前聊天对象的消息总数
        getMessageTotal(state) {
            if (!state.contactorList[state.selectContactorIndex]) return ;
            return state.messageTotal[state.contactorList[state.selectContactorIndex].id];
        },
        // 获取上传给当前联系对象的文件上传列表
        getUploadToCurContactorFilesList(state) {
            if (!state.contactorList[state.selectContactorIndex]) return ;
            let contactorId = state.contactorList[state.selectContactorIndex].id;
            return state.filesUploadQueues[contactorId] || [];
        }
    }
} as StoreOptions<any>;
