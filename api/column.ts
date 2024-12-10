import http from "@/lib/http"
import { WorkSpaceType } from "@/types/WorkSpaceType"
import { ColumnType } from "@/types/KanBanType"

export const api_getAllColumnsOfAWorkSpace = async (workspaceId: string) => {
    const res = await http.get<ColumnType[]>(`/api/kanban_board/kanban_column/?workspace_id=${workspaceId}`)
    return res
}

export const api_createColumn = async (workspaceId: string, name: string) => {
    const res = await http.post<ColumnType>(`/api/kanban_board/kanban_column/?workspace_id=${workspaceId}`, {
        workspace_id: workspaceId,
        name: name
    })
    return res
}

export const api_updateColumn = async (
    columnId: string,
    name: string
) => {
    const res = await http.put(`/api/kanban_board/${columnId}/`, {
        name: name
    })
    return res
}

export const api_deleteColumn = async (
    columnId: string
) => {
    const res = await http.delete(`/api/kanban_board/${columnId}/`)
    return res
}

export const api_moveColumn = async (
    columnId: string,
    workspaceId: string
) => {
    const res = await http.put<WorkSpaceType>(`/api/kanban_board/kanban_column/${columnId}`, {
        workspace_id: workspaceId
    })
    return res
}

