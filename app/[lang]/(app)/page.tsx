"use client";
import { api_getAllCardsOfColumn, api_createCard, api_updateCard, api_deleteCard, api_moveCard } from "@/api/card";
import { api_createColumn, api_deleteColumn, api_getAllColumnsOfAWorkSpace, api_updateCardOrder, api_updateCardToNewColumn, api_updateColumn } from "@/api/column";
import KanbanColumn from "@/components/Kanban/KanBanColumn";
import KanbanCard from "@/components/Kanban/KanbanCard/KanbanCard";
import { useTheme } from "@/contexts/Theme/ThemeProvider";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { useAuth } from "@/contexts/Auth/AuthProvider";
import { cn } from "@/lib/utils";
import { CardType, ColumnType, Id } from "@/types/KanBanType";
import { KanbanType } from "@/types/enum";
import { FilterFilled, FilterOutlined, InfoCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Divider, Layout, Space, Typography } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import useToken from "antd/es/theme/useToken";
import dayjs from "dayjs";
import { Emoji } from "emoji-picker-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRef } from "react";
import { api_getWorkSpaceById, api_UpdateColumnOrder } from "@/api/workSpace";


interface Props {
    params: {
        workSpaceId: string;
    };
}
const KanbanBoard = ({ params: { workSpaceId } }: Props) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const token = useToken();
    const { themeApp } = useTheme();
    const [openSettings, setOpenSettings] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [columns, setColumns] = useState<ColumnType[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);

    const [filterAssignee, setFilterAssignee] = useState<string[]>([]);
    const [filterDueDate, setFilterDueDate] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const columnsId = useMemo(
        () => columns.map((column) => column.id),
        [columns],
    );
    const hasFetchedData = useRef(false);
    const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 30,
            },
        }),
    );
    const getData = async () => {
        const rs_col = await api_getAllColumnsOfAWorkSpace("18");
        const worspace = await api_getWorkSpaceById("18");
        const col = rs_col.payload;
        setColumns(
            worspace.payload.column_orders?.map((id) => {
                    return col.find((c) => c.id === id);
                }).filter((column): column is ColumnType => column !== undefined)
        );
        const colIds = col.map((c) => c.id);
        setCards([]);
        colIds.forEach(async (id) => {
            const rs_card = await api_getAllCardsOfColumn(id.toString());
            const idcardOder = col.find((c) => c.id === id)?.card_orders;

            const cards_Order = idcardOder?.map((id) => {
                return rs_card.payload.find((c) => c.id === id);
            }).filter((card): card is CardType => card !== undefined);

            if (cards_Order) {
                setCards((cards) => [...cards, ...cards_Order]);
            }
        });
    };

    const createColumnMutation = useMutation({
        mutationFn: async () => {
            await api_createColumn("18", "New Column");
        },
    });

    function deleteColumn(id: Id) {
        const newColumns = columns.filter((column) => column.id !== id);
        setColumns(newColumns);
        api_deleteColumn(id.toString());
    }

    function onDragStart(event: DragStartEvent) {
        if (
            event.active.data.current === null ||
            event.active.data.current === undefined
        )
            return;
        if (event.active.data.current.type === KanbanType.KanbanColumn) {
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current.type === KanbanType.KanbanCard) {
            setActiveCard(event.active.data.current.card);
            return;
        }
    }

    useEffect(() => {
        if (!hasFetchedData.current) {
            getData();
            hasFetchedData.current = true;
        }
    }, []);


    // async function onDragEnd(event: DragEndEvent) {
    //     setActiveColumn(null);
    //     setActiveCard(null);
    //     const { active, over } = event;
    //     if (!over) {
    //         return;
    //     }
    //     const activeColumnId = active.id;
    //     const overColumnId = over.id;

    //     if (activeColumnId === overColumnId) return;

    //     const activeColumnIndex = columns.findIndex(
    //         (column) => column.id === activeColumnId,
    //     );
    //     const overColumnIndex = columns.findIndex(
    //         (column) => column.id === overColumnId,
    //     );
    //     setColumns((columns) => {
    //         return arrayMove(columns, activeColumnIndex, overColumnIndex);
    //     });
        // updateColumnPositionAPI(
        //     activeColumnId,
        //     activeColumnIndex,
        //     overColumnId,
        //     overColumnIndex,
        // );
    // }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;


        if (active.data.current === null || active.data.current === undefined)
            return;
        if (over.data.current === null || over.data.current === undefined)
            return;
        if (active.id === over.id) return;

        const isActiveACard = active.data.current.type === KanbanType.KanbanCard;
        const isOverACard = over.data.current.type === KanbanType.KanbanCard;
        if(!isActiveACard) return;
        const activeIndex = cards.findIndex((card) => card.id === activeId);
        if (isOverACard) {
            setCards((cards) => {
                const overIndex = cards.findIndex((card) => card.id === overId);
                cards[activeIndex].column_id = cards[overIndex].column_id;
                //api_updateAllCard(arrayMove(cards, activeIndex, overIndex));
                //api_updateCardOrderInColumn(cards[activeIndex].column_id, arrayMove(cards, activeIndex, overIndex).map(card => card.id));
                // api_updateCardOrder(activeId.toString(), overId.toString(), cards.map(card => card.id), arrayMove(cards, activeIndex, overIndex).map(card => card.id) );
                // console.log('arrayMove', arrayMove(cards, activeIndex, overIndex));
                const overColId = cards[overIndex].column_id
                const activeCardId = cards[activeIndex].id
                const cardsfilter =  arrayMove(cards, activeIndex, overIndex).filter((card) => card.column_id === overColId)
                const ids = cardsfilter.map((card) => card.id);
                api_updateCardOrder(overColId.toString(),activeCardId, ids);
                return arrayMove(cards, activeIndex, overIndex);
            });
        } else {
                setCards((cards) => {
                    //const activeIndex = cards.findIndex((card) => card.id === activeId);
                    cards[activeIndex].column_id = overId.toString();
                    const overColId = cards[activeIndex].column_id
                    const activeCardId = cards[activeIndex].id
                    api_updateCardToNewColumn(overColId.toString(), activeCardId);

                    return arrayMove(cards, activeIndex, activeIndex );

                });
        }

        // console.log("overcolId",overIndex)
        // const ordercardIds = cards.filter((card) => card.column_id === overIndex.toString())
        //  const overColId = cards[activeIndex].column_id
        //  const cardsfilter = cards.filter((card) => card.column_id === overColId)
        //  console.log("cards filter", cardsfilter)
        //  console.log("cards", cards)
        // setHasChanged(true);
        // console.log("hasChanged", hasChanged);
        // api_updateCardOrderInColumn(overId.toString(), cards.filter((card) => card.column_id === overId).map((card) => card.id));
    }


    // function onDragOver(event: DragOverEvent) {
    //     const { active, over } = event;
    //     if (!over) return;
    //     const activeId = active.id;
    //     const overId = over.id;
    //     if (active.data.current === null || active.data.current === undefined)
    //         return;
    //     if (over.data.current === null || over.data.current === undefined)
    //         return;
    //     const isActiveACard = active.data.current.type === KanbanType.KanbanCard;
    //     const isOverACard = over.data.current.type === KanbanType.KanbanCard;
    //     if(!isActiveACard) return;
    //     if (isActiveACard && isOverACard) {
    //         console.log("activeId", activeId, "overId", overId);
    //         setCards((cards) => {
    //             const activeIndex = cards.findIndex((card) => card.id === activeId);
    //             const overIndex = cards.findIndex((card) => card.id === overId);
    //             //cards[activeIndex].columnId = cards[overIndex].columnId;
    //             //updateIndexInColumnAPI(activeId, activeIndex, overId, overIndex);
    //             const colactiveId = columns.find((col) => col.card_orders.includes(activeId))?.id;
    //             const coloverId = columns.find((col) => col.card_orders.includes(overId))?.id;
    //             if(colactiveId !== coloverId){
    //                 const colActive = columns.find((col) => col.id === colactiveId);
    //                 const activeIndex = colActive?.card_orders.indexOf(activeId);
    //                 if (activeIndex !== undefined && activeIndex !== -1) {
    //                     colActive?.card_orders.splice(activeIndex, 1);
    //                 }
    //                 columns.find((col) => col.id === coloverId)?.card_orders.push(activeId);
    //             }
    //            // api_updateCardOrder(activeId.toString(), overId.toString(), cards.map(card => card.id), arrayMove(cards, activeIndex, overIndex).map(card => card.id) );
    //             return arrayMove(cards, activeIndex, overIndex);
    //         });
    //     }
    //     const isOverAcolumn = over.data.current.type === KanbanType.KanbanColumn;
    //     if(isActiveACard && isOverAcolumn){
    //         setCards((cards) => {
    //             const activeIndex = cards.findIndex((card) => card.id === activeId);
    //             //const overIndex = cards.findIndex((card) => card.columnId === overId);
    //             //cards[activeIndex].columnId = overId;
    //             //updateIndexDiffColumnAPI(activeId, overId, overIndex);
    //            // console.log("activeIndex", activeIndex, "overIndex", overIndex, "overId", overId);
    //             return arrayMove(cards, activeIndex, activeIndex );

    //         });

    //     }
    // }

    async function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveCard(null);
        const { active, over } = event;
        if (!over) {
            return;
        }
        const activeColumnId = active.id;
        const overColumnId = over.id;

        if (activeColumnId === overColumnId) return;

        const activeColumnIndex = columns.findIndex(
            (column) => column.id === activeColumnId,
        );
        const overColumnIndex = columns.findIndex(
            (column) => column.id === overColumnId,
        );

        const colOrder = arrayMove(columns, activeColumnIndex, overColumnIndex).map((col) => col.id);
        updateColumnOrder(colOrder);
        // const idcardOder = cards.filter((card) => card.column_id === activeColumnId).map((card) => card.id);
        // if(hasChanged){
        //     console.log("hasChanged", hasChanged);
        //     console.log("idcardOder", idcardOder);
        //     console.log("overColumnId", overColumnId);
        //     setHasChanged(false);
        // }

        //api_updateCardOrderInColumn(overColumnId.toString(), idcardOder);
        setColumns((columns) => {
            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    async function updateColumnName(id: Id, name: string) {
        setColumns((columns) =>
            columns.map((column) => {
                if (column.id === id) {
                    return { ...column, name };
                }
                return column;
            }),
        );
        await api_updateColumn(id.toString(), name);
    }

    async function createCard(id: Id) {
        const rs = await api_createCard(id.toString(), "New card2");
        getData();
    }

    async function deleteCard(id: Id) {
        const newCards = cards.filter((card) => card.id !== id);
        setCards(newCards);
        const rs = await api_deleteCard(id.toString());
    }

    function updateColumnOrder(columnOrder: string[]) {
        api_UpdateColumnOrder("18", columnOrder);
    }

    async function refreshData() {
        // eslint-disable-next-line prefer-const
        // let [columns, cards] = await Promise.all([
        //     getColumnsAPI(workSpaceId),
        //     getCardOfWorkspaceAPI(workSpaceId),
        // ]);
        // if (filterAssignee.length > 0) {
        //     cards = cards.filter((card) => filterAssignee.includes(card.assigneeId));
        // }
        // if (filterDueDate) {
        //     cards = cards.filter((card) => dayjs(card.dueDate, "DD/MM/YYYY").isBefore(dayjs()));
        // }
        // if (searchValue) {
        //     cards = cards.filter((card) => card.content.toLowerCase().includes(searchValue.toLowerCase()));
        // }
        // setCards(cards);
        // setColumns(columns);
    }
    useEffect(() => {
        refreshData();
    }, [filterAssignee, filterDueDate, searchValue]);
    // useEffect(() => {
    //     const unsubscribeCards: Unsubscribe[] = [];
    //     const unsubscribe = onSnapshotColumns(() => {
    //         refreshData();
    //     }, workSpaceId);
    //     getColumnsAPI(workSpaceId).then((columns) => {
    //         columns.forEach((column) => {
    //             const unsubscribe = onSnapshotCardAPI(() => {
    //                 refreshData();
    //             }, column.id);
    //             unsubscribeCards.push(unsubscribe);
    //         });
    //     })
    //     return () => {
    //         unsubscribe?.();
    //         unsubscribeCards.forEach((unsubscribe) => {
    //             unsubscribe();
    //         });
    //     };
    // }, [workSpaceId, columns.length, cards.length]);


    return (
        <Layout className="w-full h-full">
            <Space direction="vertical">
                <Header
                    style={{
                        backgroundColor: token[3].colorBgElevated,
                    }}
                    className="rounded-lg flex flex-row items-center justify-between"
                >
                    {/* <Space direction="horizontal" size="large" align="center">
                        <Emoji
                            unified={workSpace.data?.icon_unified ?? ""}
                            size={36}
                        />
                        <Typography.Title
                            level={3}
                            style={{
                                margin: 0,
                            }}
                        >
                            {workSpace.data?.name}
                        </Typography.Title>
                    </Space> */}
                    <Space direction="horizontal" align="center">
                        <div className="flex">
                            <Avatar.Group
                                max={{
                                    count: 3,
                                }}
                            >
                                {/* {
                                    members.data?.map((member) => (
                                        <Avatar
                                            key={member.id}
                                            src={member.imageUri}
                                            alt={member.name}
                                        >
                                            {member.name}
                                        </Avatar>
                                    ))
                                } */}
                            </Avatar.Group>
                        </div>
                        <Divider type="vertical" />
                        <Button
                            type="text"
                            icon={
                                filterAssignee.length > 0 || filterDueDate ? (
                                    <FilterFilled
                                        style={{
                                            color: token[3].colorPrimary,
                                        }}
                                    />
                                ) : (
                                    <FilterOutlined />
                                )
                            }
                            onClick={() => setOpenFilter(true)}
                        >
                            {i18n.Common["Filter"]}
                        </Button>
                        <Button
                            type="text"
                            onClick={() => setOpenSettings(true)}
                            icon={<InfoCircleOutlined />}
                        />
                    </Space>
                </Header>
            </Space>
            <Content
                className={cn("mt-6 pb-6", {
                    scrollbar: themeApp === "light",
                    scrollbarDark: themeApp === "dark",
                })}
                style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                }}
            >
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={(event) => {
                        setTimeout(() => {
                            onDragOver(event);
                        }, 10);
                    }}
                >
                    <div className="mx-auto flex h-full">
                        <div className="flex gap-4 flex-row">
                            <SortableContext
                                items={columnsId}
                                strategy={verticalListSortingStrategy}
                            >
                                {columns.map((column) => (
                                    <KanbanColumn
                                        key={column.id}
                                        column={column}
                                        deleteColumn={deleteColumn}
                                        updateColumn={updateColumnName}
                                        createCard={createCard}
                                        cards={cards.filter(
                                            (card) =>
                                                card.column_id == column.id,
                                        )
                                        }
                                        deleteCard={deleteCard}
                                        workspaceId={workSpaceId}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                        <Button
                            onClick={() => {
                                createColumnMutation.mutate();
                                getData();
                            }}
                            variant="outlined"
                            icon={<PlusCircleOutlined />}
                            className="min-w-[284px]"
                            style={{
                                padding: "18px 8px",
                                marginLeft: columns.length === 0 ? 0 : 16,
                            }}
                            loading={createColumnMutation.isPending}
                        >
                            {i18n.Column["Add column"]}
                        </Button>
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <KanbanColumn
                                    column={activeColumn}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumnName}
                                    createCard={createCard}
                                    cards={cards.filter(
                                        (card) =>
                                            card.column_id == activeColumn.id,

                                    )}

                                    deleteCard={deleteCard}
                                    workspaceId={workSpaceId}
                                />
                            )}
                            {activeCard && (
                                <KanbanCard
                                    card={activeCard}
                                    deleteCard={deleteCard}
                                    workspaceId={workSpaceId}
                                />
                            )}
                        </DragOverlay>,
                        document.body,
                    )}
                </DndContext>
            </Content>
            {/* // Drawer for workspace settings */}
            {/* <WorkSpaceFilter
                members={members}
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filterAssignee={filterAssignee}
                setFilterAssignee={setFilterAssignee}
                filterDueDate={filterDueDate}
                setFilterDueDate={setFilterDueDate}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            /> */}
            {/* // Drawer for workspace settings */}
            {/* // Drawer for workspace settings */}
            {/* {workSpace.data && (
                <WorkspaceSettings
                    workSpace={workSpace.data}
                    open={openSettings}
                    onClose={() => setOpenSettings(false)}
                />
            )} */}
            {/* // Drawer for workspace settings */}


        </Layout>
    );
};

export default KanbanBoard;
