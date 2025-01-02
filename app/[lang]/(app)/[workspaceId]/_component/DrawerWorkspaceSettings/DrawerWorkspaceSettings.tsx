import { useI18n } from '@/contexts/i18n/i18nProvider';
import { WorkSpaceType } from '@/types/WorkSpaceType';
import { AlignLeftOutlined, CarryOutOutlined, InfoCircleOutlined, RobotOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Drawer, Tabs } from 'antd';
import { usePathname } from 'next/navigation';
import WorkspaceInfo from './WorkspaceInfo';
import WorkspaceLabel from './WorkspaceLabel';
import WorkspaceLogs from './WorkspaceLogs';

interface Props {
    open: boolean;
    onClose: () => void;
    workspace: WorkSpaceType;
}
function DrawerWorkspaceSettings({
    onClose, open, workspace
}: Props) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);

    return (
        <Drawer
            width={500}
            open={open}
            onClose={onClose}
            styles={{
                header: {
                    display: 'none'
                },
                body: {
                    paddingRight: 16,
                    paddingLeft: 16,
                    paddingTop: 8,
                }
            }}
            title={i18n.Common['Menu']}
        >
            <Tabs
                items={[
                    {
                        label: i18n.Common['Activity'],
                        icon: <AlignLeftOutlined />,
                        key: 'activity',
                        children: <WorkspaceLogs workspace={workspace} />
                    },
                    {
                        key: 'label',
                        label: i18n.Common['Label'],
                        icon: <CarryOutOutlined />,
                        children: <WorkspaceLabel workspace={workspace} />
                    },
                    {
                        key: 'automation',
                        label: i18n.Common['Automation'],
                        icon: <RobotOutlined />,
                    },
                    {
                        key: 'schedule',
                        label: i18n.Common['Scheduled'],
                        icon: <ScheduleOutlined />,
                    },
                    {
                        label: i18n.Common['Info'],
                        icon: <InfoCircleOutlined />,
                        key: 'info',
                        children: <WorkspaceInfo workspace={workspace} />
                    }
                ]}
            />
        </Drawer>
    )
}

export default DrawerWorkspaceSettings