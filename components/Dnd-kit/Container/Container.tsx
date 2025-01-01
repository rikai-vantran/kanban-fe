import React, { CSSProperties, forwardRef, useState } from 'react';

import { DeleteOutlined, MoreOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { cn } from '@/lib/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Popover, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export function DroppableContainer({
  children,
  disabled,
  id,
  items,
  style,
  ...props
}: Props & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
    items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      id={id}
      {...props}
    >
      {children}
    </Container>
  );
}

export interface Props {
  id: UniqueIdentifier;
  children: React.ReactNode;
  wrapperStyle?: (isDraggingOver: boolean) => React.CSSProperties;
  style?: React.CSSProperties;
  label?: string;
  renderContainerOptions?: (containerId: UniqueIdentifier) => React.ReactNode;
  onRemoveContainer?: (containerId: UniqueIdentifier) => Promise<void>
  onCreateItem?: (containerId: UniqueIdentifier) => Promise<UniqueIdentifier>;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  dragging?: boolean;
  placeholder?: boolean;
  onClick?(): void;
  onEditContainer?: (containerId: UniqueIdentifier, name: string) => Promise<void>;
}
// eslint-disable-next-line react/display-name
export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      id,
      children,
      handleProps,
      hover,
      renderContainerOptions,
      onRemoveContainer,
      onCreateItem,
      onClick,
      label,
      wrapperStyle,
      style,
      placeholder,
      dragging,
      onEditContainer,
      ...props
    }: Props,
    ref
  ) => {
    const token = useToken()

    const placeholderStyle: CSSProperties = {
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: token[3].colorBorder,
      backgroundColor: token[3].colorBgElevated
    }
    const draggingStyle: CSSProperties = {
      padding: 8,
      height: 'fit-content',
      scale: 1.05,
      boxShadow: '0 0 0 calc(1px / 1.05) rgba(63, 63, 68, 0.05), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
      transition: 'all 0.2s ease-in-out',
    }

    const [isCreatingItem, setIsCreatingItem] = useState(false);
    const Component = onClick ? 'button' : 'div';
    return (
      <Component
        {...props}
        ref={ref as React.Ref<HTMLDivElement & HTMLButtonElement>}
        style={
          {
            borderRadius: 8,
            backgroundColor: token[3].colorBgLayout,
            padding: 8,
            boxShadow: '0 0 0 calc(1px / 1) rgba(63, 63, 68, 0.05), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
            maxHeight: '100%',
            ...style,
            ...placeholder && placeholderStyle,
            ...dragging && draggingStyle,
            ...wrapperStyle?.(hover || false),
          } as React.CSSProperties
        }
        className={cn(`flex flex-col h-fit grid-auto-rows-max-content overflow-hidden w-[360px] transition-colors duration-350 ease-in-out
        `, {})}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label && (
          <div className='rounded-md' style={{
            backgroundColor: token[3].colorBgElevated,
            width: '100%',
          }}>
            <div className='flex px-2 py-2 items-center w-full justify-between' {...handleProps}>
              <Typography.Text strong className='pl-2 flex-1'
                editable={{
                  onChange: (value) => {
                    onEditContainer?.(id, value)
                  },
                  icon: <></>,
                  triggerType: ['text']
                }}
              >{label}</Typography.Text>
              {renderContainerOptions ? (
                <Popover
                  style={{
                    cursor: "pointer",
                  }}
                  trigger={"click"}
                  placement="rightBottom"
                  content={renderContainerOptions(id)}
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
              ) : (
                <Button variant='filled' icon={<DeleteOutlined />} danger
                  onClick={async () => {
                    onRemoveContainer?.(id)
                  }}
                />
              )}
            </div>
          </div>
        )}
        <div style={{
          // boxShadow: `rgba(99, 99, 99, 0.2) 0px 2px 8px 0px`
          marginTop: 8,
        }}
          className={cn('overflow-y-auto m-h-[calc(100% - 172px)] scrollbar dark::scrollbarDark', {
            'flex items-center justify-center min-h-64': placeholder,
          })}>
          {placeholder ? children : <ul className='grid grid-flow-row gap-3'>{children}</ul>}
        </div>
        {!placeholder && (
          <div className='flex flex-col items-center justify-center mt-4 mb-2'>
            <Button onClick={async () => {
              setIsCreatingItem(true);
              await onCreateItem?.(id);
              setIsCreatingItem(false);
            }} loading={isCreatingItem} type='primary' className='w-full' style={{
              backgroundColor: hover ? token[3].colorPrimaryActive : token[3].colorPrimary,
            }}
            >
              <PlusCircleOutlined />
            </Button>
          </div>
        )}
      </Component>
    );
  }
);