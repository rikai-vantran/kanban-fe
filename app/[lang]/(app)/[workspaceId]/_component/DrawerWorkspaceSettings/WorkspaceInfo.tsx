import { useI18n } from '@/contexts/i18n/i18nProvider'
import { WorkSpaceType } from '@/types/WorkSpaceType'
import { Divider, List, Space, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface WorkspaceInfoProps {
    workspace: WorkSpaceType
}
function WorkspaceInfo({
    workspace
}: WorkspaceInfoProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);

    return (
        <div>
            <div className='flex justify-between items-center'>
                <Typography.Text strong>{i18n.Workspace['Workspace name'] + ': '}</Typography.Text>
                <Typography.Text>{workspace.name}</Typography.Text>
            </div>
            <div className='flex justify-between items-center'>
                <Typography.Text strong>{i18n.Workspace['Create at'] + ': '}</Typography.Text>
                <Typography.Text>{
                    dayjs(workspace.create_at).format('DD/MM/YYYY')
                }</Typography.Text>
            </div>
            <Divider type='horizontal' />
            <Typography.Text strong>{i18n.Workspace['Members']}</Typography.Text>
            <List
                dataSource={workspace.members}
                split={false}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <Space>
                                    <Typography.Text>
                                        {item.profile.name}
                                    </Typography.Text>
                                    {item.role === 'owner' && <Tag>{`${i18n.Common['Owner']}`}</Tag>}
                                </Space>
                            }
                            description={item.profile.email}
                            avatar={
                                <Image
                                    src={item.profile.profile_pic.avatar === '' ? "/images/no_avatar.png" : item.profile.profile_pic.avatar}
                                    alt={item.profile.name}
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
        </div>
    )
}

export default WorkspaceInfo