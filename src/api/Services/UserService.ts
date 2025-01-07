import {base_request} from "../request.ts";
import {UserRegisterRequest} from "../Model/Request/UserRequest/UserRegisterRequest.ts";
import {api} from "../api.ts";
import {UserLoginRequest} from "../Model/Request/UserRequest/UserLoginRequest.ts";
import {FriendAddRequest} from "../Model/Request/FriendRequest/FriendAddRequest.ts";
import {FriendApplyQueryRequest} from "../Model/Request/FriendRequest/FriendApplyQueryRequest.ts";
import {FriendsQueryRequest} from "../Model/Request/FriendRequest/FriendsQueryRequest.ts";
import {UserQueryRequest} from "../Model/Request/UserRequest/UserQueryRequest.ts";
import {FriendExamineRequest} from "../Model/Request/FriendRequest/FriendExamineRequest.ts";
import {ContactQueryRequest} from "../Model/Request/ContactRequest/ContactQueryRequest.ts";
import {ContactUpdateRequest} from "../Model/Request/ContactRequest/ContactUpdateRequest.ts";
import {UserUpdateMyRequest} from "../Model/Request/UserRequest/UserUpdateMyRequest.ts";

export class UserService{
    /*--------------------------------用户基本----------------------*/
    /**
     * 用户注册
     * @param userRegisterRequest
     */
    public static userRegisterUsingPost(
        userRegisterRequest: UserRegisterRequest
    ) {
        return base_request(
            "post",
             api.USER_REGISTER,
            userRegisterRequest,
        );
    }

    /**
     * 用户登录
     * @param userLoginRequest
     */
    public static userLoginUsingPost(
        userLoginRequest: UserLoginRequest
    ) {
        return base_request(
            "post",
            api.USER_LOGIN,
            userLoginRequest,
        );
    }

    /**
     * 退出登录
     */
    public static userLogoutUsingPost(){
        return base_request(
            "post",
            api.USER_LOGOUT
        )
    }

    /**
     * 更新个人信息
     * @param userUpdateMyRequest
     */
    public static updateMyUserOrUsingPost(
        userUpdateMyRequest: UserUpdateMyRequest
    ) {
        return base_request(
            "post",
            api.UPDATE_MY,
            userUpdateMyRequest
        )
    }

    /**
     * 根据 id 获取包装类
     * @param id
     */
    public static getUserVOByIdUsingGet(id: number) {
        return base_request(
            "get",
            api.USER_GET_BY_ID,
            id
        )
    }

    /**
     * 获取登录用户
     */
    public static getLoginUserUsingGet(){
        return base_request(
            "get",
            api.LOGIN_USER_GET,
        );
    }

    /**
     * 分页获取符合任一 条件的记录 [用户]
     */
    public static getUserPageByConditionsOrUsingPost(
        userQueryRequest: UserQueryRequest
    ) {
        return base_request(
            "post",
            api.USER_PAGE_GET_CONDITIONS_OR,
            userQueryRequest
        )
    }

    /*----------------------好友------------------*/
    /**
     * 申请添加好友
     * @param friendAddRequest
     */
    public static friendApplyUsingPost(
        friendAddRequest: FriendAddRequest
    ) {
        return base_request(
            "post",
            api.FRIEND_APPLY,
            friendAddRequest
        )
    }

    /**
     * 审核好友申请
     * @param friendExamineRequest
     */
    public static examineFriendApplyUsingGet(
        friendExamineRequest: FriendExamineRequest
    ) {
        return base_request(
            "post",
            api.EXAMINE_FRIEND_APPLY,
            friendExamineRequest
        )
    }

    /**
     * 删除好友
     * @param friendId
     */
    public static removeFriendUsingGet(
        friendId: number
    ) {
        return base_request(
            "get",
            api.REMOVE_FRIEND,
            {
                friendId: friendId
            }
        )
    }

    /**
     * 分页获取好友申请列表
     * @param friendApplyQueryRequest
     */
    public static listFriendApplyByPageUsingPost(
        friendApplyQueryRequest: FriendApplyQueryRequest
    ) {
        return base_request(
            "post",
            api.FRIENDS_APPLY_PAGE_LIST,
            friendApplyQueryRequest
        )
    }


    /**
     * 分页获取好友列表
     * @param friendsQueryRequest
     */
    public static listFriendsByPageUsingPost(
        friendsQueryRequest: FriendsQueryRequest
    ) {
        return base_request(
            "post",
            api.FRIENDS_PAGE_LIST,
            friendsQueryRequest
        )
    }


    /**
     * 分页获取符合任一 条件的记录 [好友申请]
     * @param friendApplyQueryRequest
     */
    public static listFriendApplyPageByConditionOrUsingPost(
        friendApplyQueryRequest: FriendApplyQueryRequest
    ){
        return base_request(
            "post",
            api.FRIEND_APPLY_GET_CONDITIONS_OR,
            friendApplyQueryRequest
        )
    }

    /**
     * 分页获取联系信息
     * @param contactQueryRequest
     */
    public static listContactByPageUsingPost(
        contactQueryRequest: ContactQueryRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_INFO_PAGE_LIST,
            contactQueryRequest
        )
    }

    /**
     * 分页获取联系V0信息
     * @param contactQueryRequest
     */
    public static listContactVOByPageUsingPost(
        contactQueryRequest: ContactQueryRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_VO_INFO_PAGE_LIST,
            contactQueryRequest
        )
    }

    /*----------------------联系对象------------------*/
    /**
     * 设置某个联系对象是否置顶
     * @param contactUpdateRequest
     */
    public static updateContactNameUsingPost(
        contactUpdateRequest: ContactUpdateRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_NICKNAME_CHANGE,
            contactUpdateRequest
        )
    }

    /**
     * 设置某个联系对象是否置顶
     * @param contactUpdateRequest
     */
    public static setIsTopByIdUsingPost(
        contactUpdateRequest: ContactUpdateRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_TOP_SET,
            contactUpdateRequest
        )
    }

    /**
     * 设置是否忽略某个联系对象的消息
     * @param contactUpdateRequest
     */
    public static setIsIgnoreContactorMsgUsingPost(
        contactUpdateRequest: ContactUpdateRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_IS_IGNORED,
            contactUpdateRequest
        )
    }

    /**
     * 获取联系对象VO信息
     * @param contactQueryRequest
     */
    public static getContactor(
        contactQueryRequest: ContactQueryRequest
    ) {
        return base_request(
            "post",
            api.CONTACT_VO_INFO_GET,
            contactQueryRequest
        )
    }
}
