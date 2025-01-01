import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Row, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';
import { motion } from 'framer-motion';
import React from 'react';

interface TextEditableProps {
    text: string;
    onSave: (text: string) => void;
    onDiscard: () => void;
}
function TextEditable({
    text,
    onSave,
    onDiscard
}: TextEditableProps) {
    const token = useToken()

    const [textState, setTextState] = React.useState(text)
    const [isEditing, setIsEditing] = React.useState(false)

    return (
        <div
            style={{
                flex: 1
            }}
        >
            {isEditing ? (
                <Row className='w-full gap-2'
                    onBlur={() => {
                        setTimeout(() => {
                            setIsEditing(false)
                        }, 600)
                    }}
                >
                    <Input className='flex-1' value={textState} onChange={(e) => setTextState(e.target.value)} />
                    <Button variant='filled' color='primary' onClick={() => {
                        onSave(textState)
                        setIsEditing(false)
                    }}>Save</Button>
                </Row>
            ) : (
                <motion.div
                    style={{
                        width: '100%',
                        paddingLeft: 12,
                        display: 'flex',
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: token[3].colorBgElevated
                    }}
                    whileHover={{
                        backgroundColor: token[3].colorBgLayout
                    }}
                    onClick={() => setIsEditing(true)}
                >
                    <Typography.Text style={{ flex: 1 }}>{textState}</Typography.Text>
                    <Button type='text' icon={<DeleteOutlined style={{color: token[3].colorError}}/>} color='danger'
                        onClick={(e) => {
                            e.stopPropagation()
                            onDiscard()
                        }}
                    />
                </motion.div>
            )}
        </div>
    )
}

export default TextEditable