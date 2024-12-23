import { useI18n } from '@/contexts/i18n/i18nProvider';
import { WorkSpaceType } from '@/types/WorkSpaceType'
import { Avatar, Checkbox, Input, Row, Space, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { usePathname } from 'next/navigation';
import { FieldTimeOutlined, FireOutlined, HistoryOutlined } from '@ant-design/icons';
import useToken from 'antd/es/theme/useToken';

interface PopoverFilterProps {
    workspace: WorkSpaceType;
}
function PopoverFilter({
    workspace
}: PopoverFilterProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const token = useToken()

    return (
        <Content className='w-72'>
            <Space direction='vertical' className='w-full'>
                <Row justify={'center'} className='w-full'>
                    <Typography.Title level={5}>{i18n.Common['Filter']}</Typography.Title>
                </Row>
                <Typography.Text strong>{i18n.Card['Filter by card name']}</Typography.Text>
                <Input placeholder='Search card name' />
                {/* <Typography.Text strong>Filter by tags</Typography.Text>
                <Space direction='vertical'>
                    {workspace.tags.map((tag) => (
                        <Checkbox key={tag.id}>{tag.name}</Checkbox>
                    ))}
                </Space> */}
                <Typography.Text strong>{i18n.Card['Filter by members']}</Typography.Text>
                <Space direction='vertical'>
                    {workspace.members.map((member) => (
                        <Checkbox key={member.id}>
                            <Space>
                                <Avatar src={member.profile_pic.avatar === '' ? "/images/no_avatar.png" : member.profile_pic.avatar} />
                                <div className='flex flex-col'>
                                    <Typography.Text style={{ marginBottom: 0 }}>{member.name}</Typography.Text>
                                    <Typography.Text type='secondary'>{member.email}</Typography.Text>
                                </div>
                            </Space>
                        </Checkbox>
                    ))}
                </Space>
                <Typography.Text strong>{i18n.Card['Filter by due date']}</Typography.Text>
                <Space direction='vertical'>
                    <Checkbox>
                        <Space>
                            <FireOutlined style={{ color: token[3].colorError }} />
                            <Typography.Text style={{ color: token[3].colorError }}>{i18n.Common['Overdue']}</Typography.Text>
                        </Space>
                    </Checkbox>
                    <Checkbox>
                        <Space>
                            <HistoryOutlined style={{ color: token[3].colorWarning }} />
                            <Typography.Text style={{ color: token[3].colorWarning }}>{i18n.Common['Today']}</Typography.Text>
                        </Space>
                    </Checkbox>
                    <Checkbox>
                        <Space>
                            <FieldTimeOutlined />
                            <Typography.Text>{i18n.Common['Tomorrow']}</Typography.Text>
                        </Space>
                    </Checkbox>
                    <Checkbox>
                        <Space>
                            <FieldTimeOutlined />
                            <Typography.Text>{i18n.Common['This week']}</Typography.Text>
                        </Space>
                    </Checkbox>
                    <Checkbox>
                        <Space>
                            <FieldTimeOutlined />
                            <Typography.Text>{i18n.Common['This month']}</Typography.Text>
                        </Space>
                    </Checkbox>
                </Space>
            </Space>
        </Content>
    )
}

export default PopoverFilter