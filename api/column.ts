import http from "@/lib/http";
import { CardType, ColumnType } from "@/types/WorkSpaceType";

export const getColumns = async (workspaceId: string) => {
    const rs = http.get<ColumnType[]>(`api/workspaces/${workspaceId}/columns/`);
    return (await rs).payload;
};

export const addColumn = async (workspaceId: string, name: string) => {
    const rs = await http.post<{
        message: string;
        data: {
            id: string;
            name: string;
            card_orders: string[];
            workspace: string;
        };
    }>(`api/workspaces/${workspaceId}/columns/`, {
        name,
    });
    return rs.payload.data;
};

export const updateColumn = async (
    workspaceId: string,
    columnId: string,
    name?: string,
    card_orders?: string[],
) => {
    const rs = await http.put<{
        message: string;
        data: {
            id: string;
            name: string;
            card_orders: string[];
            workspace: string;
        };
    }>(`api/workspaces/${workspaceId}/columns/${columnId}/`, {
        name,
        card_orders,
    });
    if (rs.status === 200) 
        return rs.payload
    else throw new Error(rs.payload.message)
};

export const deleteColumn = async (workspaceId: string, columnId: string) => {
    const rs = await http.delete<{
        message: string;
    }>(`api/workspaces/${workspaceId}/columns/${columnId}/`);
    return rs.payload.message;
}

export const updateCardOrders = async (
    workspaceId: string,
    columnId: string,
    cards: CardType[],
) => {
    const rs = await http.put(`api/workspaces/${workspaceId}/columns/${columnId}/cards/`, {
        cards,
    });
    return rs.payload;
}