import type { DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { CSSProperties, useEffect, useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import styles from './Item.module.css';
import useToken from 'antd/es/theme/useToken';

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  disabled?: boolean;
  renderItem?: (
    containerId: UniqueIdentifier,
    itemId: UniqueIdentifier,
  ) => React.ReactNode;
  wrapperStyle?: (
    isDragging: boolean
  ) => CSSProperties;
}

export function SortableItem({
  disabled,
  containerId,
  id,
  index,
  wrapperStyle,
  renderItem,
}: SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      dragging={isDragging}
      sorting={isSorting}
      index={index}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      wrapperStyle={wrapperStyle?.(
        isDragging
      )}
    >
      {
        renderItem
          ? renderItem(containerId, id)
          : <div>{id}</div>
      }
    </Item>
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

export interface ItemProps {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handleProps?: any;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  children: React.ReactNode;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, ItemProps>(({
    color,
    dragOverlay,
    dragging,
    disabled,
    fadeIn,
    handleProps,
    index,
    listeners,
    sorting,
    style,
    transition,
    transform,
    children,
    wrapperStyle,
    ...props
  },
    ref
  ) => {
    const token = useToken();
    useEffect(() => {
      if (!dragOverlay) {
        return;
      }

      document.body.style.cursor = 'grabbing';

      return () => {
        document.body.style.cursor = '';
      };
    }, [dragOverlay]);

    return (
      <li
        className={classNames(
          styles.Wrapper,
          fadeIn && styles.fadeIn,
          sorting && styles.sorting,
          dragOverlay && styles.dragOverlay
        )}
        style={
          {
            ...wrapperStyle,
            transition: [transition, wrapperStyle?.transition]
              .filter(Boolean)
              .join(', '),
            '--translate-x': transform
              ? `${Math.round(transform.x)}px`
              : undefined,
            '--translate-y': transform
              ? `${Math.round(transform.y)}px`
              : undefined,
            '--scale-x': transform?.scaleX
              ? `${transform.scaleX}`
              : undefined,
            '--scale-y': transform?.scaleY
              ? `${transform.scaleY}`
              : undefined,
            '--index': index,
            '--color': color,
          } as React.CSSProperties
        }
        ref={ref}
      >
        <div
          {...listeners}
          {...handleProps}
          className={classNames(
            styles.Item,
            dragging && styles.dragging,
            dragOverlay && styles.dragOverlay,
            disabled && styles.disabled,
            color && styles.color
          )}
          style={{
            ...style,
          }}
          data-cypress="draggable-item"
          {...props}
        >
          {children}
          <span className={styles.Actions}>
          </span>
        </div>
      </li>
    );
  })
);
