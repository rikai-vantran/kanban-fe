import { WorkSpaceType } from "./WorkSpaceType";

export interface ProfileType {
    id?: number;
    name: string;
    profile_pic: AvatarType;
    email: string; 
    workspaceOwnerOrders?: string[];
    workspaceMemberOrders?: string[];
}

export interface AvatarType {
    id?: number;
    name: string;
    avatar: string;
}

export interface RequestType {
    id?: string;
    user_sender: ProfileType;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    user_receiver: ProfileType;
    workspace: WorkSpaceType;
}