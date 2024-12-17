import { api_getAllCardsOfColumn, api_createCard, api_updateCard, api_deleteCard, api_moveCard} from "@/api/card";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { KanbanType } from "@/types/enum";
import { UserDataType } from "@/types/UserDataType";
import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FireOutlined,
    MoreOutlined,
    TagsOutlined
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { Button, Popover, Row, Space, Tag, Tooltip, Typography } from "antd";
import useToken from "antd/es/theme/useToken";
import cn from "classnames";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CardType, Id } from "../../../types/KanBanType";
import ModalEditCard from "./ModalEdit";
import dayjs from "dayjs";
interface CardProps {
    card: CardType;
    deleteCard: (id: Id) => void;
    containerStyle?: React.CSSProperties;
    workspaceId: string;
}
const KanbanCard = ({
    card,
    deleteCard,
    containerStyle,
    workspaceId
}: CardProps) => {
    // const { user } = useAuth();
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const token = useToken();
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: KanbanType.KanbanCard,
            card,
        },
    });

    const [openPopover, setOpenPopover] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(true);
    // useEffect(() => {
    //     const unsubscribe: Unsubscribe = onSnapshotWorkSpace(
    //         () => {
    //             workSpace.refetch()
    //         }, workspaceId
    //     )
    //     return () => {
    //         unsubscribe?.()
    //     }
    // }, [workspaceId])

    // const workSpace = useQuery({
    //     queryKey: [FireStoreCollections.WORKSPACES],
    //     queryFn: async () => {
    //         return await getWorkSpace(workspaceId);
    //     }
    // })
    // const members = useQuery({
    //     queryKey: [workSpace],
    //     queryFn: async () => {
    //         if (!workSpace.data?.members) return [];
    //         const members = await Promise.all(workSpace.data.members.map(async (member) => {
    //             return (await getUserData(member))
    //         }))
    //         members.push({
    //             id: workSpace.data.owner.id,
    //             name: workSpace.data.owner.name,
    //             imageUri: workSpace.data.owner.imageUri,
    //             email: workSpace.data.owner.email,
    //         })
    //         return members
    //     }
    // })


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    backgroundColor: token[3].colorBgLayout,
                    ...style,
                }}
                className="flex justify-between items-center h-[96px] p-2 rounded-lg mb-2 border-2 gap-2"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: token[3].colorBgLayout,
                ...style,
                ...containerStyle,
            }}
            {...attributes}
            {...listeners}
            className={cn("flex flex-col p-2 rounded-lg")}
        >
            <Row justify={"space-between"} className="h-full">
                <Typography.Title level={5}>
                    {card.content}
                </Typography.Title>
                <Popover
                    style={{
                        cursor: "pointer",
                        marginLeft: "8px",
                    }}
                    trigger="click"
                    open={openPopover}
                    onOpenChange={(open) => setOpenPopover(open)}
                    placement="rightBottom"
                    content={
                        <Space direction="vertical" style={{}}>
                            <Button
                                icon={<EditOutlined />}
                                type="text"
                                onClick={() => {
                                    setOpenModal(true);
                                    setOpenPopover(false);
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {i18n.Card["Edit card"]}
                            </Button>
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger={true}
                                onClick={() => {
                                    deleteCard(card.id);
                                    setOpenPopover(false);
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {i18n.Card["Delete card"]}
                            </Button>
                        </Space>
                    }
                >
                    <Button
                        type="text"
                        style={{
                            padding: "18px 8px",
                        }}
                    >
                        {<MoreOutlined />}
                    </Button>
                </Popover>
            </Row>
            <Space direction="vertical">
                <Row justify={'start'} className="w-full">
                    {/* <Tag color={
                        card.tasks.filter((task) => task.isDone).length === card.tasks.length ? 'green' : 'red'
                    }>
                        <TagsOutlined /> {' '}
                        {
                            `${card.tasks.filter((task) => task.isDone).length} / ${card.tasks.length}`
                        }
                    </Tag> */}
                </Row>
                <Row justify={"space-between"} className="mt-2">
                    <Space
                        style={{
                            cursor: "pointer",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Tag
                            color={
                                dayjs(card.due_date, "DD/MM/YYYY").isBefore(dayjs()) ? 'red' : 'blue'
                            }
                        >
                            {
                                dayjs(card.due_date, "DD/MM/YYYY").isBefore(dayjs()) ? (
                                    <FireOutlined />
                                ) : (
                                    <ClockCircleOutlined />
                                )
                            }
                            {' '}
                            {card.due_date}
                        </Tag>
                        {/* {
                            card.assigneeId && assignMember && (
                                <Tooltip
                                    title={assignMember.name}
                                >
                                    <Image src={assignMember.imageUri} alt={assignMember.name} width={32} height={32}
                                        style={{
                                            borderRadius: '50%'
                                        }}
                                    />
                                </Tooltip>
                            )
                        } */}
                        {/* {
                            card.assigneeId && !assignMember && (
                                <Tooltip
                                    title={i18n.Common['Unknown']}
                                >
                                    <Image src={'/images/no_avatar.png'} alt={i18n.Common['Unknown']} width={32} height={32}
                                        style={{
                                            borderRadius: '50%'
                                        }}
                                    />
                                </Tooltip>
                            )
                        } */}
                    </Space>
                </Row>
            </Space>

            {
                // workSpace.data && members.data && (
                //     <ModalEditCard
                //         open={openModal}
                //         onClose={() => setOpenModal(false)}
                //         card={card}
                //         members={members}
                //     />
                // )
                   isEdit && (
                    <ModalEditCard
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        card={card}
                        // members={members}
                    />
                )
            }
        </div>
    );
};

export default KanbanCard;
