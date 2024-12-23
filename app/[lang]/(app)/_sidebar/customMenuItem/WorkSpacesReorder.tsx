'use client'
import ReorderComponent from '@/components/Reorder/Reorder'
import { useI18n } from '@/contexts/i18n/i18nProvider'
import { WorkSpaceType } from '@/types/WorkSpaceType'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddNewWorkspaceModal } from './modal/AddNewWorkspaceModal'
import WorkSpaceItem from './WorkSpaceItem'

export interface WorkSpaceReorderItem {
    key: string;
    name: string,
    icon_unified: string,
}

interface WorkSpaceReorderProps {
    inlineCollapsed?: boolean;
    workSpaces: WorkSpaceType[];
    workSpacesOrder: string[];
    onWorkSpaceOrderChange: (workSpacesOrder: string[]) => void;
    isFooter?: boolean;
    isEditable?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

function WorkSpaceReorder({ inlineCollapsed, workSpaces, onWorkSpaceOrderChange, workSpacesOrder, isFooter = true, isEditable = true, style, className='' }: WorkSpaceReorderProps) {
    const router = useRouter()
    const pathname = usePathname();
    const lang = pathname.split('/')[1];
    const i18n = useI18n(lang);

    const [openModalAddNewWorkspace, setOpenModalAddNewWorkspace] =
        useState(false);
    const [order, setOrder] = useState<string[]>(workSpacesOrder);
    useEffect(() => {
        setOrder(workSpacesOrder)
    }, [workSpacesOrder])

    const workSpaceSorted = workSpaces.sort((a, b) => {
        return order.indexOf(a.id!) - order.indexOf(b.id!)
    })

    return (
        <Space direction='vertical' className={`w-full ${className}`} style={style}>
            <ReorderComponent<WorkSpaceReorderItem>
                className='scrollbar dark::scrollbarDark max-h-64 overflow-y-auto -mr-2 overflow-x-hidden'
                items={workSpaceSorted.map(item => {
                    return {
                        icon_unified: item.icon_unified,
                        key: item.id!,
                        name: item.name
                    }
                })}
                onReorder={(items) => {
                    const newWorkSpaceOrder = items.map(item => item.key)
                    setOrder(newWorkSpaceOrder)
                    onWorkSpaceOrderChange(newWorkSpaceOrder)
                }}
                renderItem={(item, index) => (
                    <WorkSpaceItem item={item}
                        active={(pathname.split('/')[2] ?? '') === `${item.key}`}
                        inlineCollapsed={inlineCollapsed}
                        onPress={(key) => {
                            router.push(`/${lang}/${key}`)
                        }}
                        isEditable={isEditable}
                        styles={{
                            marginBottom: index === workSpaces.length - 1 ? 0 : 4,
                            marginRight: 8
                        }}
                    />
                )}
            />
            {isFooter && (
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    className='w-full'
                    onClick={() => {
                        setOpenModalAddNewWorkspace(true);
                    }}
                >
                    {i18n.Common.Add}
                </Button>
            )}
            <AddNewWorkspaceModal
                open={openModalAddNewWorkspace}
                onCancel={() => {
                    setOpenModalAddNewWorkspace(false);
                }}
            />
        </Space>
    )
}

export default WorkSpaceReorder