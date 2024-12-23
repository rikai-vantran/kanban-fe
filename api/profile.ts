import http from "@/lib/http";
import { AvatarType, ProfileType } from "@/types/ProfileType";

export const getProfiles = async (email: string) => {
    if (email === "") {
        return [];
    }
    const rs = await http.get<
        {
            id: string;
            name: string;
            profile_pic: {
                name: string;
                avatar: string;
            } | null;
            email: string;
            workspace_owner_orders: string[];
            workspace_member_orders: string[];
        }[]
    >(`api/profiles/?email=${email}`);
    return rs.payload.map((profile) => {
        return {
            id: Number(profile.id),
            name: profile.name,
            profile_pic: {
                name: profile.profile_pic?.name ?? 'No Avatar',
                avatar: profile.profile_pic?.avatar ?? '',
            },
            email: profile.email,
        } as ProfileType;
    });
};
export const getProfile = async () => {
    const rs = await http.get<{
        id: string;
        name: string;
        profile_pic: {
            id: string;
            name: string;
            avatar: string;
        } | null;
        email: string;
        workspace_owner_orders: string[];
        workspace_member_orders: string[];
    }>(`api/profiles/me`);
    return {
        id: Number(rs.payload.id),
        name: rs.payload.name,
        profile_pic: {
            name: rs.payload.profile_pic?.name ?? 'No Avatar',
            avatar: rs.payload.profile_pic?.avatar ?? '',
        },
        email: rs.payload.email,
        workspaceOwnerOrders: rs.payload.workspace_owner_orders,
        workspaceMemberOrders: rs.payload.workspace_member_orders,
    } as ProfileType;
};

export const updateProfile = async (name?: string, profile_pic?: number) => {
    return http.put<ProfileType>("api/profiles/me/", {
        name,
        profile_pic,
    });
};

export const getAvatars = async () => {
    return http.get<AvatarType[]>("api/profiles/avatars");
};

export const updateWorkspaceOrder = async (
    workspace_owner_orders: string[],
    workspace_member_orders: string[],
) => {
    return http.put<{
        workspace_owner_orders: string[];
        workspace_member_orders: string[];
    }>("api/profiles/workspace-owner-orders/", {
        workspace_owner_orders,
        workspace_member_orders,
    });
};