export type GroupMessageQueryRequest = {
    group_id?: number;
    user_id?: number;
    from_id?: number;
    status?: number;
    type?: number;
    at_id?: number;
    content?: string;
    post_time?: string;
    update_time?: string;
    expire?: number;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
}
