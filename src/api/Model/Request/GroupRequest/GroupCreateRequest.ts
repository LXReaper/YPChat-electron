export type GroupCreateRequest = {
    group_name?: string;
    group_member_max?: number;
    group_owner_id?: number;
    join_type?: number;
    initMembers?: Array<number>;
}
