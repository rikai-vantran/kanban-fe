import { ColumnType } from '@/types/WorkSpaceType';
import {
    CollisionDetection,
    DndContext,
    DragOverlay,
    DropAnimation,
    MeasuringStrategy,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    closestCenter,
    defaultDropAnimationSideEffects,
    getFirstCollision,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Container, DroppableContainer } from '../Container/Container';
import { Item, SortableItem } from '../Item/Item';

// dnd kit config
const PLACEHOLDER_ID = 'placeholder';
const empty: UniqueIdentifier[] = [];
const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
    items: Items;
    columns: ColumnType[];
    renderContainerOptions?: (containerId: UniqueIdentifier) => React.ReactNode;
    itemWrapperStyle?: (isDragging: boolean) => React.CSSProperties;
    renderItem?: (
        containerId: UniqueIdentifier,
        itemId: UniqueIdentifier,
    ) => React.ReactNode;
    renderPlaceholder?: (isDraggingOver: boolean) => React.ReactNode;
    placeholderWrapperStyle?: (isDraggingOver: boolean) => React.CSSProperties;
    renderItemDragOverlay?: (id: UniqueIdentifier) => React.ReactNode;
    onContainerOrdersChange?: (containers: UniqueIdentifier[]) => Promise<void>;
    onCreateContainer?: () => Promise<UniqueIdentifier>;
    onRemoveContainer?: (containerId: UniqueIdentifier) => Promise<void>;
    onCreateItem?: (containerId: UniqueIdentifier) => Promise<UniqueIdentifier>;
    onItemOrdersChangeInSameContainer?: (containerId: UniqueIdentifier, items: UniqueIdentifier[]) => Promise<void>;
    onItemOrdersChangeCrossContainer?: (
        cardId: UniqueIdentifier,
        activeColumnId: UniqueIdentifier,
        cardOrdersActiveColumn: UniqueIdentifier[],
        overColumnId: UniqueIdentifier,
        cardOrdersOverColumn: UniqueIdentifier[]
    ) => Promise<void>;
}

export function MultipleContainers({
    items: initialItems,
    columns,
    renderContainerOptions,
    renderItemDragOverlay,
    itemWrapperStyle,
    renderItem,
    onItemOrdersChangeCrossContainer,
    renderPlaceholder,
    placeholderWrapperStyle,
    onContainerOrdersChange,
    onItemOrdersChangeInSameContainer,
    onCreateContainer,
    onRemoveContainer,
    onCreateItem
}: Props) {
    const [items, setItems] = useState<Items>(() => initialItems);
    useEffect(() => {
        setItems(initialItems);
        setContainers(Object.keys(initialItems) as UniqueIdentifier[]);
    }, [initialItems]);
    const [containers, setContainers] = useState(
        Object.keys(items) as UniqueIdentifier[]
    );

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const activeContainerPreviousWhenDragItemCrossContainer = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);
    const isSortingContainer =
        activeId != null ? containers.includes(activeId) : false;

    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (activeId && activeId in items) {
                return closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) => container.id in items
                    ),
                });
            }

            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args);
            const intersections =
                pointerIntersections.length > 0
                    ? // If there are droppables intersecting with the pointer, return those
                    pointerIntersections
                    : rectIntersection(args);
            let overId = getFirstCollision(intersections, 'id');

            if (overId != null) {
                if (overId in items) {
                    const containerItems = items[overId];

                    // If a container is matched and it contains items (columns 'A', 'B', 'C')
                    if (containerItems.length > 0) {
                        // Return the closest droppable within that container
                        overId = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (container) =>
                                    container.id !== overId &&
                                    containerItems.includes(container.id)
                            ),
                        })[0]?.id;
                    }
                }

                lastOverId.current = overId;

                return [{ id: overId }];
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = activeId;
            }

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        },
        [activeId, items]
    );
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        }),
    );
    const findContainer = (id: UniqueIdentifier) => {
        if (id in items) {
            return id;
        }

        return Object.keys(items).find((key) => items[key].includes(id));
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
    }, [items]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
            onDragStart={({ active }) => {
                setActiveId(active.id);
                // find containerId of active item
                let activeContainer = findContainer(active.id);
                if (!activeContainer) {
                    activeContainer = containers.find((container) => items[container].includes(active.id));
                }
                activeContainerPreviousWhenDragItemCrossContainer.current = activeContainer ?? null
                console.log('setNull', activeContainerPreviousWhenDragItemCrossContainer.current)
            }}
            onDragOver={({ active, over }) => {
                const overId = over?.id;

                if (overId == null || active.id in items) {
                    console.log('return')
                    return;
                }

                const overContainer = findContainer(overId);
                const activeContainer = findContainer(active.id);

                if (!overContainer || !activeContainer) {
                    return;
                }

                if (activeContainer !== overContainer) {
                    setItems((items) => {
                        const activeItems = items[activeContainer];
                        const overItems = items[overContainer];
                        const overIndex = overItems.indexOf(overId);
                        const activeIndex = activeItems.indexOf(active.id);

                        let newIndex: number;
                        // ờ chắc là kéo card vào header của container khác 💀
                        // thêm card vào đầu container
                        if (overId in items) {
                            newIndex = overItems.length + 1;
                            // kéo card vào card khác khác container
                        } else {
                            const isBelowOverItem =
                                over &&
                                active.rect.current.translated &&
                                active.rect.current.translated.top >
                                over.rect.top + over.rect.height;

                            const modifier = isBelowOverItem ? 1 : 0;

                            newIndex =
                                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                        }

                        recentlyMovedToNewContainer.current = true;

                        return {
                            ...items,
                            [activeContainer]: items[activeContainer].filter(
                                (item) => item !== active.id
                            ),
                            [overContainer]: [
                                ...items[overContainer].slice(0, newIndex),
                                items[activeContainer][activeIndex],
                                ...items[overContainer].slice(
                                    newIndex,
                                    items[overContainer].length
                                ),
                            ],
                        };
                    });
                }
            }}
            onDragEnd={({ active, over }) => {
                // move container
                if (active.id in items && over?.id) {
                    setContainers((containers) => {
                        const activeIndex = containers.indexOf(active.id);
                        const overIndex = containers.indexOf(over.id);
                        const newContainers: UniqueIdentifier[] = arrayMove(containers, activeIndex, overIndex);
                        onContainerOrdersChange?.(newContainers);
                        return newContainers;
                    });
                    setActiveId(null);
                    return;
                }

                const activeContainer = findContainer(active.id);
                if (!activeContainer) {
                    setActiveId(null);
                    return;
                }
                const overId = over?.id;
                if (overId == null) {
                    setActiveId(null);
                    return;
                }
                // --------------------------------------- done ---------------------------------------
                if (overId === PLACEHOLDER_ID) {
                    // onCreateContainer?.mutateAsync().then((value) => {
                    //     const newContainerId = value;
                    //     if (!newContainerId) {
                    //         return;
                    //     }

                    // })
                    // const newContainerId = uniqueId();
                    // setContainers((containers) => [...containers, newContainerId]);
                    // setItems((items) => ({
                    //     ...items,
                    //     [activeContainer]: items[activeContainer].filter(
                    //         (id) => id !== activeId
                    //     ),
                    //     [newContainerId]: [active.id],
                    // }));
                    setActiveId(null);
                    // const newContainerId = createColumnMutation.data;
                    // console.log('newContainerId', newContainerId)
                    // if (!newContainerId) {
                    //     return;
                    // }
                    // setContainers((containers) => [...containers, newContainerId]);
                    // setItems((items) => ({
                    //     ...items,
                    //     [activeContainer]: items[activeContainer].filter(
                    //         (id) => id !== activeId
                    //     ),
                    //     [newContainerId]: [active.id],
                    // }));
                    // setActiveId(null);
                    // return;
                }
                const overContainer = findContainer(overId);
                if (overContainer) {
                    const activeIndex = items[activeContainer].indexOf(active.id);
                    const overIndex = items[overContainer].indexOf(overId);
                    console.log('activeIndex', activeIndex)
                    console.log('overIndex', overIndex)
                    if (activeIndex !== overIndex) {
                        setItems((items) => {
                            console.log('items', items)
                            const newOverItemOrder = arrayMove(
                                items[overContainer],
                                activeIndex,
                                overIndex
                            )
                            console.log(activeContainerPreviousWhenDragItemCrossContainer.current)
                            if (activeContainerPreviousWhenDragItemCrossContainer.current && activeContainerPreviousWhenDragItemCrossContainer.current !== overContainer) {
                                console.log('activeContainerPreviousWhenDragItemCrossContainer.current', activeContainerPreviousWhenDragItemCrossContainer.current)
                                onItemOrdersChangeCrossContainer?.(
                                    active.id,
                                    activeContainerPreviousWhenDragItemCrossContainer.current,
                                    items[activeContainerPreviousWhenDragItemCrossContainer.current],
                                    overContainer,
                                    newOverItemOrder
                                )
                            }
                            else {
                                onItemOrdersChangeInSameContainer?.(overContainer, newOverItemOrder)
                            }
                            return {
                                ...items,
                                [overContainer]: newOverItemOrder,
                            }
                        });
                    } else if (activeContainerPreviousWhenDragItemCrossContainer.current) {
                        if (activeContainerPreviousWhenDragItemCrossContainer.current !== overContainer) {
                            console.log('activeContainerPreviousWhenDragItemCrossContainer.current', activeContainerPreviousWhenDragItemCrossContainer.current)
                            onItemOrdersChangeCrossContainer?.(
                                active.id,
                                activeContainerPreviousWhenDragItemCrossContainer.current,
                                items[activeContainerPreviousWhenDragItemCrossContainer.current],
                                overContainer,
                                items[overContainer]
                            )
                        }
                    }
                }
                setActiveId(null);
            }}>
            <div
                style={{
                    display: 'inline-grid',
                    boxSizing: 'border-box',
                    gridAutoFlow: 'column',
                    gap: 12,
                    height: '100%',
                }}
            >
                <SortableContext
                    items={[...containers, PLACEHOLDER_ID]}
                    strategy={horizontalListSortingStrategy}
                >
                    {containers.map((containerId) => (
                        <DroppableContainer
                            key={containerId}
                            id={containerId}
                            label={`${columns.find(column => column.id === containerId)?.name}`}
                            items={items[containerId]}
                            onRemoveContainer={onRemoveContainer}
                            renderContainerOptions={renderContainerOptions}
                            onCreateItem={onCreateItem}
                        >
                            <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
                                {items[containerId].map((value, index) => {
                                    return (
                                        <SortableItem
                                            disabled={isSortingContainer}
                                            key={value}
                                            id={value}
                                            index={index}
                                            renderItem={renderItem}
                                            containerId={containerId}
                                            wrapperStyle={itemWrapperStyle}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DroppableContainer>
                    ))}
                    <DroppableContainer
                        id={PLACEHOLDER_ID}
                        disabled={isSortingContainer}
                        items={empty}
                        onClick={async () => {
                            onCreateContainer?.();
                        }}
                        wrapperStyle={placeholderWrapperStyle}
                        placeholder
                    >
                        {renderPlaceholder ? renderPlaceholder(
                            lastOverId.current === PLACEHOLDER_ID
                        ) : '+ Add Column'}
                    </DroppableContainer>
                </SortableContext>
            </div>
            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId
                        ? containers.includes(activeId)
                            ? renderContainerDragOverlay(activeId)
                            : renderSortableItemDragOverlay(activeId)
                        : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );

    function renderSortableItemDragOverlay(id: UniqueIdentifier) {
        return (
            <Item
                dragOverlay
            >
                {renderItemDragOverlay ? renderItemDragOverlay(id) : <div>{id}</div>}
            </Item>
        );
    }

    function renderContainerDragOverlay(containerId: UniqueIdentifier) {
        return (
            <Container
                label={`${columns.find(column => column.id === containerId)?.name}`}
                style={{
                    height: '100%',
                }}
                id={containerId.toString()}
                renderContainerOptions={renderContainerOptions}
                dragging
            >
                {items[containerId].map((item) => (
                    <Item
                        key={item}
                    >
                        {renderItemDragOverlay ? renderItemDragOverlay(item) : <div>{item}</div>}
                    </Item>
                ))}
            </Container>
        );
    }
}