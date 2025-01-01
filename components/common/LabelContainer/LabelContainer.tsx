import { LabelType } from '@/types/WorkSpaceType';
import { Space, Tooltip } from 'antd';

interface LabelContainerProps {
    labels: LabelType[];
    type?: 'default' | 'compact';
    style?: React.CSSProperties;
}
function LabelContainer({
    labels,
    type = 'default',
    style
}: LabelContainerProps) {
    return (
        <Space direction='horizontal' wrap style={{
            width: '100%',
            ...style
        }}>
            {
                labels.map((label, index) => (
                    <Tooltip title={label.name} key={index}>
                        <div
                            style={{
                                backgroundColor: label.color,
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '0px 8px',
                                cursor: 'pointer',
                                minWidth: '52px',
                                minHeight: type === 'default' ? '20px' : '8px',
                                overflow: 'hidden',
                            }}
                        >
                            {
                                type === 'default' && (
                                    <div className='text-center'>
                                        {label.name}
                                    </div>
                                )
                            }
                        </div>
                    </Tooltip>
                ))
            }
        </Space>
    )
}

export default LabelContainer