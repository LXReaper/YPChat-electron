export const api = {
    prodBaseUrl: "http://localhost:8020/api",
    devBaseUrl: "http://localhost:8020/api",
    chatConnectUrl: "ws://localhost:8020/api/ws/connect",
    conferenceConnectUrl: "ws://localhost:8020/api/signalling/connect",
    /*---------------------------用户接口---------------------------*/
    // 用户注册
    USER_REGISTER: "/user/register",
    // 用户登录
    USER_LOGIN: "/user/login",
    // 用户注销
    USER_LOGOUT: "/user/logout",

    // 更新个人信息
    UPDATE_MY: "/user/update/my",

    // 修改某个联系对象的名称
    CONTACT_NICKNAME_CHANGE: "/user/contact/nickname/change",
    // 设置某个联系对象是否置顶
    CONTACT_TOP_SET: "/user/contact/top/set",
    // 设置是否忽略某个联系对象的消息
    CONTACT_IS_IGNORED: "/user/contact/isIgnored",

    // 根据 id 获取包装类
    USER_GET_BY_ID: "/user/get/vo",
    // 获取当前登录用户
    LOGIN_USER_GET: "/user/get/login",
    // 分页获取符合任一 条件的记录
    USER_PAGE_GET_CONDITIONS_OR: "/user/get/conditions/or",

    // 申请添加好友
    FRIEND_APPLY: "/user/apply/friend",
    // 审核好友申请
    EXAMINE_FRIEND_APPLY: "/user/examine/friend",
    // 删除好友
    REMOVE_FRIEND: "/user/friend/remove",

    // 查询联系对象信息
    CONTACT_VO_INFO_GET: "/user/contact/info/vo",

    // 分页获取好友申请列表
    FRIENDS_APPLY_PAGE_LIST: "/user/list/apply/friends",
    // 分页获取好友列表
    FRIENDS_PAGE_LIST: "/user/list/friends",
    // 分页获取符合任一 条件的记录 [好友申请]
    FRIEND_APPLY_GET_CONDITIONS_OR: "/user/friend/apply/get/conditions/or",

    // 分页获取联系信息
    CONTACT_INFO_PAGE_LIST: "/user/list/contact/info",
    // 分页获取联系VO信息
    CONTACT_VO_INFO_PAGE_LIST: "/user/list/contact/vo/info",

    /*---------------------------群聊接口---------------------------*/
    // 创建群聊
    GROUP_CREATE: "/group/create",
    // 加入群聊
    GROUP_JOIN: "/group/join",
    // 离开群聊
    GROUP_LEAVE: "/group/leave",
    // 解散群聊
    GROUP_DISBAND: "/group/disband",
    // 发送群聊消息
    GROUP_MESSAGE_POST: "/group/message/post",
    // 查询群聊VO消息
    GROUP_MESSAGE_VO_LIST: "/group/message/vo/list",

    /*---------------------------p2p聊天接口---------------------------*/
    // 发送消息
    MESSAGE_P2P_POST: "/message/p2p/message/post",
    // 分页获取p2p消息
    MESSAGE_P2P_PAGE_LIST: "/message/list/P2P/message",
    // 分页获取p2p消息VO
    MESSAGE_VO_P2P_PAGE_LIST: "/message/list/P2P/message/vo",

    /*---------------------------文件接口------------------------------*/
    // 文件上传
    FILE_UPLOAD: "/file/upload",
    /*---------------------------邮箱接口------------------------------*/
    // 获取邮箱验证码
    EMAIL_GET_CODE: "/mail/getCode",
    // 邮箱登录
    EMAIL_LOGIN: "/mail/login",
    // 绑定邮箱
    EMAIL_BIND: "/mail/bind",
}
