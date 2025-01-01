import http from "@/lib/http"
import { ProfileType, RequestType } from "@/types/ProfileType"
import { LabelType, WorkSpaceMemberType, WorkSpaceType } from "@/types/WorkSpaceType"

export const getAllWorkSpaces = async (
    role: 'member' | 'owner'
) => {
    const res = await http.get<WorkSpaceType[]>(`api/workspaces/?role=${role}`)
    return res
}

export const addWorkSpace = async (name: string, icon_unified: string) => {
    const rs = await http.post<{
        message: string;
        data: WorkSpaceType;
    }>("api/workspaces/", {
        name,
        icon_unified
    }) 
    return rs
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
        create_at: string;
        members: WorkSpaceMemberType[];
        labels: LabelType[];
    }>(`api/workspaces/${id}/`)
    return {
        id: rs.payload.id,
        name: rs.payload.name,
        icon_unified: rs.payload.icon_unified,
        create_at: rs.payload.create_at,
        members: rs.payload.members.map(member => ({
            role: member.role,
            profile: {
                id: member.profile.id,
                name: member.profile.name,
                email: member.profile.email,
                profile_pic: {
                    id: member.profile.profile_pic.id,
                    name: member.profile.profile_pic.name,
                    avatar: member.profile.profile_pic.avatar
                }
            } as ProfileType
        })),
        columns_orders: rs.payload.column_orders,
        labels: rs.payload.labels
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

export const deleteLabel = async (id: string, label_id: number) => {
    const rs = await http.delete(`api/workspaces/${id}/labels/${label_id}/`)
    return rs.payload
}

export const addLabel = async (id: string, name: string, color: string) => {
    const rs = await http.post(`api/workspaces/${id}/labels/`, {
        name,
        color
    })
    return rs.payload
}

export const updateLabel = async (id: string, label_id: number, name: string, color: string) => {
    const rs = await http.put(`api/workspaces/${id}/labels/${label_id}/`, {
        name,
        color
    })
    return rs.payload
}

export const moveCardInTheSameColumn = async (id: string, column_id: string, card_orders: string[]) => {
    const rs = await http.post(`api/workspaces/${id}/move-card-same-column/`, {
        column_id,
        card_orders
    })
    return rs.payload
}

export const moveCardCrossColumn = async (id: string,
    pre_column_id: string,
    next_column_id: string,
    pre_card_orders: string[],
    next_card_orders: string[],
    card_id: string
) => {
    const rs = await http.post(`api/workspaces/${id}/move-card-cross-column/`, {
        pre_column_id,
        next_column_id,
        pre_card_orders,
        next_card_orders,
        card_id,
    })
    return rs.payload
}