import http from "@/lib/http"
import { WorkSpaceType } from "@/types/WorkSpaceType"

export const getAllWorkSpaces = async (
    role: 'member' | 'owner'
) => {
    const res = await http.get<WorkSpaceType[]>(`api/workspaces/?role=${role}`)
    return res
}

export const api_UpdateColumnOrder = async (
    workspaceId: string,
    column_orders: string[]
) => {

    const res = await http.put(`api/workspaces/column_order/${workspaceId}/`, {
        column_orders
    })
    return res
}

export const api_getWorkSpaceById = async (
    workspaceId: string
) => {
    const res = await http.get<WorkSpaceType>(`api/workspaces/${workspaceId}/`)
    return res
}