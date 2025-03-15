import {base_request} from "../request.ts";
import {api} from "../api.ts";
import {GroupCreateRequest} from "../Model/Request/GroupRequest/GroupCreateRequest.ts";
import {GroupMemberAddRequest} from "../Model/Request/GroupRequest/GroupMemberAddRequest.ts";
import {GroupLeaveRequest} from "../Model/Request/GroupRequest/GroupLeaveRequest.ts";
import {GroupMessagePostRequest} from "../Model/Request/GroupRequest/GroupMessagePostRequest.ts";
import {GroupMessageQueryRequest} from "../Model/Request/GroupRequest/GroupMessageQueryRequest.ts";

export class GroupService {
    /**
     * 创建群聊
     * @param groupCreateRequest
     */
    public static createGroupUsingPost(
        groupCreateRequest: GroupCreateRequest
    ) {
        return base_request(
            "post",
            api.GROUP_CREATE,
            groupCreateRequest,
        );
    }

    /**
     * 加入群聊
     * @param groupMemberAddRequest
     */
    public static joinGroupUsingPost(
        groupMemberAddRequest: GroupMemberAddRequest
    ) {
        return base_request(
            "post",
            api.GROUP_JOIN,
            groupMemberAddRequest,
        );
    }

    /**
     * 离开群聊
     * @param groupLeaveRequest
     */
    public static leaveGroupUsingPost(
        groupLeaveRequest: GroupLeaveRequest
    ) {
        return base_request(
            "post",
            api.GROUP_LEAVE,
            groupLeaveRequest,
        );
    }

    /**
     * 解散群聊
     * @param groupId
     */
    public static disbandGroupUsingGet(
        groupId: number
    ) {
        return base_request(
            "get",
            api.GROUP_DISBAND,
            {
                groupId: groupId,
            },
        );
    }

    /**
     * 发送群聊消息
     * @param groupMessagePostRequest
     */
    public static postGroupMessageUsingPost(
        groupMessagePostRequest: GroupMessagePostRequest
    ) {
        return base_request(
            "post",
            api.GROUP_MESSAGE_POST,
            groupMessagePostRequest,
        );
    }

    /**
     * 查询群聊VO消息
     * @param groupMessageQueryRequest
     */
    public static listGroupMessageVOUsingPost(
        groupMessageQueryRequest: GroupMessageQueryRequest
    ) {
        return base_request(
            "post",
            api.GROUP_MESSAGE_VO_LIST,
            groupMessageQueryRequest,
        );
    }
}
