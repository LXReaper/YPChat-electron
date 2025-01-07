import {base_request} from "../request.ts";
import {NormalChatMessageQueryRequest} from "../Model/Request/MessageRequest/NormalChatMessageQueryRequest.ts";
import {api} from "../api.ts";
import {P2PMessageAddRequest} from "../Model/Request/MessageRequest/P2PMessageAddRequest.ts";

export class MessageService{

    /**
     * 发送消息
     * @param p2PMessageAddRequest
     */
    public static postMessageUsingPost(
        p2PMessageAddRequest: P2PMessageAddRequest
    ) {
        return base_request(
            "post",
            api.MESSAGE_P2P_POST,
            p2PMessageAddRequest
        )
    }

    /**
     * 查询正常聊天的最新消息
     * @param normalChatMessageQueryRequest
     */
    public static listMessageUsingPost(
        normalChatMessageQueryRequest: NormalChatMessageQueryRequest
    ) {
        return base_request(
            "post",
            api.MESSAGE_P2P_PAGE_LIST,
            normalChatMessageQueryRequest
        );
    };

    /**
     * 查询正常聊天的最新VO消息
     * @param normalChatMessageQueryRequest
     */
    public static listMessageVOUsingPost(
        normalChatMessageQueryRequest: NormalChatMessageQueryRequest
    ) {
        return base_request(
            "post",
            api.MESSAGE_VO_P2P_PAGE_LIST,
            normalChatMessageQueryRequest
        );
    };

}
