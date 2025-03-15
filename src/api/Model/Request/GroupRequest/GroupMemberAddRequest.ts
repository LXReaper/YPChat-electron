export type GroupMemberAddRequest = {
    group_id?: number;
    member_id?: number;
    alias?: string;
    role?: number;
    isTop?: number;
    isIgnore?: number;
    join_time?: string;
}
