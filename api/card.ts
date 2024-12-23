import http from "@/lib/http";
import { CardType } from "@/types/WorkSpaceType";

export const getCards = async (workspaceId: string, columnId?: string) => {
    if (columnId !== undefined) {
        const rs = await http.get<CardType[]>(
            `api/workspaces/${workspaceId}/columns/${columnId}/cards/`,
        );
        return rs.payload;
    } else {
        const rs = await http.get<CardType[]>(`api/workspaces/${workspaceId}/cards/`);
        return rs.payload;
    }
};

export const addCard = async (
    workspaceId: string,
    columnId: string,
    name: string,
    description: string,
    due_date: string,
) => {
    const rs = await http.post<{
        message: string;
        data: CardType;
    }>(`api/workspaces/${workspaceId}/columns/${columnId}/cards/`, {
        name,
        description,
        due_date,
    });
    return rs.payload.data;
};

export const updateCard = async (
    workspaceId: string,
    columnId: string,
    cardId: string,
    name?: string,
    description?: string,
    due_date?: string,
    column?: string,
    assigns?: number[],
) => {
    const rs = await http.put(`api/workspaces/${workspaceId}/columns/${columnId}/cards/${cardId}/`, {
        name,
        description,
        due_date,
        column,
        assigns,
    })
    return rs.payload;
}

export const deleteCard = async (workspaceId: string, columnId: string, cardId: string) => {
    const rs = await http.delete(`api/workspaces/${workspaceId}/columns/${columnId}/cards/${cardId}/`);
    return rs.payload;
}