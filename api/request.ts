import http from "@/lib/http";
import { RequestType } from "@/types/ProfileType";

export const getRequests = async () => {
    const rs = await http.get<RequestType[]>('api/notifications/requests/')
    return rs.payload;
}

export const acceptRequest = async (requestId: string) => {
    const rs = await http.put<{
        "message": string
    }>(`api/notifications/requests/${requestId}/`, {
        status: 'accepted'
    })
    return rs.payload;
}

export const rejectRequest = async (requestId: string) => {
    const rs = await http.put<{
        "message": string
    }>(`api/notifications/requests/${requestId}/`, {
        status: 'rejected'
    })
    return rs.payload;
}

export const deleteRequest = async (requestId: string) => {
    const rs = await http.delete(`api/notifications/requests/${requestId}/`)
    return rs.payload;
}

export const createRequest = async (user_receiver: number, workspace: string) => {
    const rs = await http.post<{
        'message': string,
    }>(`api/notifications/requests/`, {
        user_receiver,
        workspace
    })
    return rs.payload;
}