import http from "@/lib/http"
import { ProfileType, RequestType } from "@/types/ProfileType"
import { WorkSpaceType } from "@/types/WorkSpaceType"

export const getAllWorkSpaces = async (
    role: 'member' | 'owner'
) => {
    const res = await http.get<WorkSpaceType[]>(`api/workspaces/?role=${role}`)
    return res
}

export const addWorkSpace = async (name: string, icon_unified: string) => {
    return http.post<{
        message: string;
        data: WorkSpaceType;
    }>("api/workspaces/", {
        name,
        icon_unified
    }) 
}

export const deleteWorkspace = async (id: string) => {
    return http.delete(`api/workspaces/${id}/owner/`)
}

export const updateWorkspace = async (id: string, name?: string, icon_unified?: string, column_orders?: string[]) => {
    return http.put(`api/workspaces/${id}/owner/`, {
        name,
        icon_unified,
        column_orders
    })
}

export const getWorkspace = async (id: string) => {
    const rs = await http.get<{
        id: string;
        name: string;
        icon_unified: string;
        column_orders: string[];
        created_at: string;
        members: ProfileType[];
    }>(`api/workspaces/${id}/`)
    return {
        id: rs.payload.id,
        name: rs.payload.name,
        icon_unified: rs.payload.icon_unified,
        created_at: rs.payload.created_at,
        members: rs.payload.members.map(member => {
            return {
                id: member.id,
                name: member.name,
                profile_pic: {
                    name: member.profile_pic?.name ?? 'No Avatar',
                    avatar: member.profile_pic?.avatar ?? '',
                },
                email: member.email,
            } as ProfileType
        }),
        columns_orders: rs.payload.column_orders,
    } as WorkSpaceType
}

export const getRequestsPending = async (id: string) => {
    const rs = await http.get<RequestType[]>(`api/workspaces/${id}/requests/`)
    return rs.payload
}

export const leaveWorkspace = async (id: string) => {
    const rs = await http.delete(`api/workspaces/${id}/members/`)
    return rs.payload
}

