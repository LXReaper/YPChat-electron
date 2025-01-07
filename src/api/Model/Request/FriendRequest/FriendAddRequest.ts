/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import {FriendDescription} from "../../Entity/FriendDescription.ts";

export type FriendAddRequest = {
    user_id?: number;
    friend_id?: number;
    userAvatar?: string;
    alias?: string;
    add_method?: string;
    tags?: Array<string>;
    phone_num?: Array<string>;
    description?: FriendDescription;
    auth?: number;
    isIgnore?: number;
};
