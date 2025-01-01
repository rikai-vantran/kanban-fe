import { Reorder } from 'framer-motion';
import React from 'react'

interface ReorderProps<T> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    styles?: React.CSSProperties;
    itemStyles?: React.CSSProperties;
    className?: string;
}

function ReorderComponent<T extends {
    key: string
}>({
    items,
    onReorder,
    renderItem,
    itemStyles,
    styles,
    className=''
}: ReorderProps<T>) {
    return (
        <Reorder.Group<T> axis="y" values={items} onReorder={onReorder} style={styles} className={className} onDragEnd={(event) => {
            console.log(event)
        }}>
            {items.map((item, index) => (
                <Reorder.Item key={item.key} value={item} style={itemStyles}>
                    {renderItem(item, index)}
                </Reorder.Item>
            ))}
        </Reorder.Group>
    )
}

export default ReorderComponent