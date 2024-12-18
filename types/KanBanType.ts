export type Id = string | number;
export interface Task {
    content: string;
    isDone: boolean;
}

export type ColumnType = {
    id: string;
    name: string;
    workspace_id: Id;
    card_orders: Id[];
};

export type CardType = {
    id: string;
    column_id: string;
    content: string;
    due_date?: string;
    assign: number;
};