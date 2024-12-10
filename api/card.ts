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
    console.log('api_createCard', columnId, content_Card)
    const res = await http.post<CardType>(`/api/kanban_board/kanban_card/`, {
        column_id: columnId,
        content: content_Card
    })
    return res
}

export const api_updateCard = async (
    cardId: string,
    title: string
) => {
    const res = await http.put<WorkSpaceType>(`/api/kanban_board/kanban_card/${cardId}`, {
        title: title
    })
    return res
}

export const api_deleteCard = async (
    cardId: string
) => {
    const res = await http.delete<WorkSpaceType>(`/api/kanban_board/kanban_card/${cardId}`)
    return res
}

export const api_moveCard = async (
    cardId: string,
    columnId: string
) => {
    const res = await http.put<WorkSpaceType>(`/api/kanban_board/kanban_card/${cardId}`, {
        column_id: columnId
    })
    return res
}


