import http from "@/lib/http"
import { WorkSpaceType } from "@/types/WorkSpaceType"

export const getAllWorkSpaces = async (
    role: 'member' | 'owner'
) => {
    const res = await http.get<WorkSpaceType[]>(`api/workspaces/?role=${role}`)
    return res
}