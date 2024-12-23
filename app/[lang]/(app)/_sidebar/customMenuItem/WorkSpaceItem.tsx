import { useI18n } from '@/contexts/i18n/i18nProvider';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, message, Popover, Row, Space, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';
import { Emoji } from 'emoji-picker-react';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { DeleteWorkspaceModal } from './modal/DeleteWorkspaceModal';
import { EditWorkspaceModal } from './modal/EditWorkspaceModal';
import { WorkSpaceReorderItem } from './WorkSpacesReorder';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveWorkspace } from '@/api/workSpace';
import { ellipsisText } from '@/lib/utils';

interface WorkSpaceItemProps {
    item: WorkSpaceReorderItem,
    active: boolean,
    inlineCollapsed?: boolean,
    onPress?: (key: string, e: React.MouseEvent) => void,
    isEditable?: boolean,
    styles?: React.CSSProperties
}
function WorkSpaceItem({ item, active, inlineCollapsed, onPress, isEditable = true, styles }: WorkSpaceItemProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const [open, setOpen] = useState(false);
    const token = useToken();
    const queryClient = useQueryClient();
    const [hover, setHover] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);

    const leaveWorkspaceMutation = useMutation({
        mutationKey: ['leaveWorkspace'],
        mutationFn: async (workSpaceId: string) => {
            await leaveWorkspace(workSpaceId);
        },
        onSuccess: () => {
            message.success(i18n.Message['Leave workspace successfully']);
            queryClient.invalidateQueries({
                queryKey: ['workspacesMember']
            });
        }
    })

    const popoverContent = useMemo(() => {
        if (isEditable)
            return (
                <Space direction="vertical" style={{}}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            setOpenModalEdit(true);
                        }}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                        }}
                    >
                        {i18n.Workspace['Edit workspace']}
                    </Button>
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger={true}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenModalDelete(true);
                            setOpen(false);
                        }}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-start",
                        }}
                    >
                        {i18n.Workspace['Delete workspace']}
                    </Button>
                </Space>
            )
        else return (
            <Space direction="vertical" style={{}}>
                <Button
                    loading={leaveWorkspaceMutation.isPending}
                    type="text"
                    icon={<DeleteOutlined />}
                    danger={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        leaveWorkspaceMutation.mutate(item.key);
                        setOpen(false);
                    }}
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-start",
                    }}
                >
                    {i18n.Workspace['Leave workspace']}
                </Button>
            </Space>
        )
    }, [])

    return (
        <div
            title={item.name}
            key={item.key}
            style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                minHeight: 32,
                backgroundColor: active
                    ? token[3].colorPrimaryBg : hover
                        ? token[3].colorFillContentHover
                        : token[3].colorBgElevated,
                borderRadius: 4,
                justifyContent: inlineCollapsed ? "center" : "flex-start",
                ...styles
            }}
        >
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: inlineCollapsed
                        ? "center"
                        : "space-between",
                }}
                onClick={(e) => {
                    onPress?.(item.key, e);
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: 'center'
                    }}
                >
                    {inlineCollapsed ? (
                        <Typography.Text
                            style={{
                                padding: "8px 8px",
                            }}
                        >
                            <Emoji unified={item.icon_unified} size={20} />
                        </Typography.Text>
                    ) : (
                        <Row justify={'space-between'} className='w-full pl-2'>
                            <Space>
                                <Emoji unified={item.icon_unified} size={20} />
                                <Typography.Text
                                    style={{
                                        display: inlineCollapsed ? "none" : "inline",
                                        marginLeft: 8,
                                    }}
                                >
                                    {ellipsisText(item.name, 20)}
                                </Typography.Text>
                            </Space>
                            <Popover
                                style={{
                                    cursor: "pointer",
                                }}
                                trigger={"click"}
                                placement="rightBottom"
                                open={open}
                                onOpenChange={(open) => setOpen(open)}
                                content={popoverContent}
                            >
                                <Button
                                    type="text"
                                    style={{
                                        padding: "18px 8px",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {<MoreOutlined />}
                                </Button>
                            </Popover>
                        </Row>
                    )}
                </div>
            </div>
            {
                isEditable && (
                    <>
                        <DeleteWorkspaceModal
                            open={openModalDelete}
                            onCancel={() => setOpenModalDelete(false)}
                            workspaceId={item.key}
                            workspaceName={item.name}
                        />
                        <EditWorkspaceModal
                            open={openModalEdit}
                            onCancel={() => setOpenModalEdit(false)}
                            workspaceId={item.key}
                        />
                    </>
                )
            }
        </div >
    )
}

export default WorkSpaceItem