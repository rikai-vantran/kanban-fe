import http from "@/lib/http";
import { CardType } from "@/types/KanBanType";
import { WorkSpaceType } from "@/types/WorkSpaceType";

export const api_getAllCardsOfColumn = async (
    columnId: string
) => {
    const res = await http.get<CardType[]>(`/api/kanban_board/kanban_card/?column_id=${columnId}`)
    return res
}

export const api_createCard = async (columnId: string, content_Card: string) => {
    const res = await http.post<CardType>(`/api/kanban_board/kanban_card/`, {
        column_id: columnId,
        content: content_Card,
        due_date: "2022-12-12",
        assign: "6",
    })
    return res
}

export const api_updateCard = async (
    cardId: string,
    content: string,
    due_date: string,
) => {
    const res = await http.put(`/api/kanban_board/kanban_card/${cardId}/`, {
        content: content,
        due_date: due_date
    })
    return res
}

export const api_deleteCard = async (
    cardId: string
) => {
    const res = await http.delete(`/api/kanban_board/kanban_card/${cardId}/`)
    return res
}

export const api_moveCard = async (
    cardId: string,
    columnId: string
) => {
    const res = await http.put<WorkSpaceType>(`/api/kanban_board/kanban_card/${cardId}/`, {
        column_id: columnId
    })
    return res
}


