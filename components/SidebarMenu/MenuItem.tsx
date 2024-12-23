import React, { useState } from 'react'
import { MenuItemType } from './SidebarMenu';
import useToken from 'antd/es/theme/useToken';
import { Typography } from 'antd';
import { cn } from '@/lib/utils';

interface MenuItemProps {
    item: MenuItemType;
    onPress?: (key: string, e: React.MouseEvent) => void;
    inlineCollapsed: boolean;
    active: boolean;
}

function MenuItem({
    item,
    onPress,
    inlineCollapsed,
    active,
}: MenuItemProps) {
    const token = useToken()
    const [hover, setHover] = useState(false);
    return (
        <li
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            title={item.title as string}
            onClick={(e) => {
                if (item.disabled) {
                    return;
                }
                onPress?.(item.key!, e);
            }}
            className={`flex items-center p-2 cursor-pointer rounded mt-1 ${item.disabled ? "opacity-50" : ""
                } ${inlineCollapsed ? "justify-center" : "justify-start"} flex-nowrap`}
            style={{
                backgroundColor: active
                    ? token[3].colorPrimaryBg : hover
                        ? token[3].colorFillContentHover
                        : token[3].colorBgElevated,
            }}
        >
            {item.icon && (
                <Typography.Text className="inline-block w-6 text-center">
                    {item.icon}
                </Typography.Text>
            )}
            <Typography.Text
                className={cn('ml-2 text-nowrap transition-all', {
                    'w-0 overflow-hidden ml-0': inlineCollapsed,
                })}
                style={{
                    color: token[3].colorText,
                }}
            >
                {item.label}
            </Typography.Text>
        </li>
    )
}

export default MenuItem