import { ProfileType } from "./ProfileType";

export interface WorkSpaceType {
    id: string,
    name: string,
    icon_unified: string,
    columns_orders?: string[],
    created_at?: string,
    members: ProfileType[]
}

export type ColumnType = {
    id: string;
    workspace: string;
    name: string;
    card_orders: string[];
};

export type CardType = {
    id: string;
    column: string;
    name: string;
    description: string;
    image: string;
    due_date: string;
    assigns: ProfileType[];
};