import { CheckOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

interface DueDateTagProps {
    value: dayjs.Dayjs | null;
    format?: string;
    dueDate?: dayjs.Dayjs;
    isDone?: boolean;
}
function DueDateTag({
    value,
    format = 'MMM D, YYYY HH:mm',
    dueDate = dayjs(new Date()),
    isDone = false
}: DueDateTagProps) {
    const token = useToken()

    if (!value) return null
    const isOverDue = dueDate && value.isBefore(dueDate)

    return (
        <motion.div style={{
            backgroundColor: isDone ? token[3].colorPrimaryBg :
                isOverDue ? token[3].colorErrorBg :
                    token[3].colorBgLayout,
            padding: '2px 6px',
            borderRadius: 4,
        }}
        >
            <Space>
                {
                    isDone ? (
                        <CheckOutlined
                            style={{
                                color: token[3].colorPrimary
                            }}
                        />
                    ) : isOverDue ? (
                        <FireOutlined
                            style={{
                                color: token[3].colorError
                            }}
                        />
                    ) : (
                        <ClockCircleOutlined />
                    )
                }
                <Typography.Text style={{
                    color: isDone ? token[3].colorPrimary : isOverDue ? token[3].colorError : token[3].colorText
                }}>
                    {value.format(format)}
                </Typography.Text>
            </Space>
        </motion.div>
    )
}

export default DueDateTag