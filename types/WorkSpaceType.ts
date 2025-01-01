import { ProfileType } from "./ProfileType";

export interface WorkSpaceMemberType {
    role: "owner" | "member";
    profile: ProfileType;
}
export interface WorkSpaceType {
    id: string;
    name: string;
    icon_unified: string;
    columns_orders?: string[];
    create_at?: string;
    members: WorkSpaceMemberType[];
    labels: LabelType[];
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
    short_description: string;
    description: string;
    image: string | null;
    due_date: string;
    assigns: ProfileType[];
    labels: LabelType[];
    tasks: TaskType[];
};

export interface LabelType {
    id?: number;
    name: string;
    color: string;
}

export interface TaskType {
    id: number;
    content: string;
    status: boolean;
    card: string;
}
