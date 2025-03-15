export type GroupMessagePostRequest = {
    group_id?: number;
    from_id?: number;
    status?: number;
    type?: number;
    at_id?: number;
    content?: string;
    post_time?: string;
    update_time?: string;
    expire?: number;
}
