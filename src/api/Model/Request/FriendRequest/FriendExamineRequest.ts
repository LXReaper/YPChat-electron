/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import {FriendDescription} from "../../Entity/FriendDescription.ts";

export type FriendExamineRequest = {
    userId?: number;
    isAccess?: number;
    alias?: string;
    auth?: number;
    isIgnore?: number;
    tags?: Array<string>;
    phone_num?: Array<string>;
    description?: FriendDescription;
};
