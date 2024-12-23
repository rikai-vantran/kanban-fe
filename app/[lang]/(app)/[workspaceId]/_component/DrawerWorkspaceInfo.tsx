import { useI18n } from '@/contexts/i18n/i18nProvider';
import { WorkSpaceType } from '@/types/WorkSpaceType';
import { Drawer, List, Typography } from 'antd';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react'

interface DrawerWorkspaceInfoProps {
    open: boolean;
    onClose: () => void;
    workspace: WorkSpaceType;
}
function DrawerWorkspaceInfo({
    onClose, open, workspace
}: DrawerWorkspaceInfoProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={i18n.Workspace['Workspace information']}
        >
            <Typography.Title level={4}>{workspace.name}</Typography.Title>
            <Typography.Text>{workspace.created_at}</Typography.Text>
            <Typography.Title level={5}>Members</Typography.Title>
            <List
                dataSource={workspace.members}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.name}
                            description={item.email}
                            avatar={
                                <Image
                                    src={item.profile_pic.avatar === '' ? "/images/no_avatar.png" : item.profile_pic.avatar}
                                    alt={item.name}
                                    width={36}
                                    height={36}
                                    style={{
                                        borderRadius: "50%",
                                    }}
                                />
                            }
                        />
                    </List.Item>
                )}
            />
        </Drawer>
    )
}

export default DrawerWorkspaceInfo