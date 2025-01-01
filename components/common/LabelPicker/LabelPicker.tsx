import { useI18n } from '@/contexts/i18n/i18nProvider';
import useDebounce from '@/hooks/useDebounce';
import { LabelType } from '@/types/WorkSpaceType';
import { EditOutlined } from '@ant-design/icons';
import { Button, ColorPicker, Input, Popover, Row, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';

interface ColorPickerProps {
    value?: LabelType;
    children?: React.ReactNode;
    onSave?: (item: LabelType) => void;
    onDelete?: (labelId: number) => void;
    initItems?: LabelType[];
    style?: React.CSSProperties;
}
function LabelPicker({
    value,
    children,
    onSave,
    onDelete,
    initItems,
    style
}: ColorPickerProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);

    initItems = initItems || [
        {
            name: '',
            color: '#B1F0F7'
        },
        {
            name: '',
            color: '#81BFDA'
        },
        {
            name: '',
            color: '#F5F0CD'
        },
        {
            name: '',
            color: '#F29F58'
        },
        {
            name: '',
            color: '#FF748B'
        },
        {
            name: '',
            color: '#F0BB78'
        },
        {
            name: '',
            color: '#FCFFC1'
        },
        {
            name: '',
            color: '#E3F0AF'
        },
        {
            name: '',
            color: '#FF8383'
        },
        {
            name: '',
            color: '#A1D6CB'
        },
        {
            name: '',
            color: '#FFF574'
        },
        {
            name: '',
            color: '#AB4459'
        },
        {
            name: '',
            color: '#A59D84'
        },
        {
            name: '',
            color: '#7E5CAD'
        },
        {
            name: '',
            color: '#D39D55'
        },
        {
            name: '',
            color: '#343131'
        },
    ];

    // control state
    const [open, setOpen] = React.useState<boolean>(false);

    const [name, setName] = React.useState<string>(value?.name ?? '');
    const nameDebounce = useDebounce(name, 500);
    const [color, setColor] = React.useState<string>(value?.color ?? initItems[0].color);

    const popoverContent = useMemo(() => (
        <Space direction='vertical' className='w-64'>
            <Row justify={'center'}>
                <Typography.Text>
                    {i18n.Common['Label']}
                </Typography.Text>
            </Row>
            <Row justify={'center'}>
                <ColorPickerItem
                    item={{
                        name: nameDebounce,
                        color: color
                    }}
                    style={{ width: '100%' }}
                    type='compact'
                />
            </Row>
            <Space direction='vertical' className='w-full'>
                <Typography.Text>
                    {i18n.Common['Title']}
                </Typography.Text>
                <Input
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
            </Space>
            <Space direction='vertical' className='w-full'>
                <Row justify={'space-between'} className='w-full'>
                    <Typography.Text>
                        {i18n.Common['Pick a color']}
                    </Typography.Text>
                    <ColorPicker
                        onChange={(color) => {
                            setColor(color.toHexString())
                        }}
                        value={color}
                        showText
                        size='small'
                    />
                </Row>
                <div className='flex gap-2 flex-wrap'>
                    {initItems.map((item) => (
                        <motion.div
                            key={item.color}
                            onClick={() => {
                                setColor(item.color)
                            }}
                            style={{
                                backgroundColor: item.color,
                                width: 58,
                                height: 32,
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                            whileHover={{
                                opacity: 0.85,
                                scale: 1.05,
                                transition: {
                                    duration: 0.2
                                }
                            }}
                            whileTap={{
                                scale: 0.95
                            }}
                        />
                    ))}
                </div>
                <Row justify={'space-between'} className='w-full'>
                    <Button variant='filled' color='danger'
                        onClick={() => {
                            onDelete?.(value.id)
                            setOpen(false)
                        }}
                    >
                        {i18n.Common['Delete']}
                    </Button>
                    <Button variant='filled' color='primary'
                        onClick={() => {
                            onSave?.({
                                id: value?.id,
                                name: nameDebounce,
                                color: color
                            })
                            setOpen(false)
                        }}
                    >
                        {i18n.Common['Save']}
                    </Button>
                </Row>
            </Space>
        </Space>
    ), [initItems, value, nameDebounce, color])

    return (
        <Popover
            content={popoverContent}
            trigger='click'
            placement='bottom'
            open={open}
            onOpenChange={setOpen}
        >
            <div className='w-full'>
                {
                    children ? children : (
                        <ColorPickerItem
                            item={value}
                            style={style}
                        />
                    )
                }
            </div>
        </Popover>
    )
}

export default LabelPicker;

interface ColorPickerItemProps {
    item: LabelType;
    type?: 'default' | 'compact';
    style?: React.CSSProperties;
}
const ColorPickerItem = ({ item, style, type = 'default' }: ColorPickerItemProps) => {
    return (
        <motion.div style={{
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
            backgroundColor: item.color,
            width: '100%',
            padding: '0px 8px',
            minHeight: 32,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            ...style
        }}
            whileHover={{
                opacity: 0.85,
                transition: {
                    duration: 0.2
                }
            }}
            whileTap={{
                scale: 0.99
            }}
        >
            <div className='w-full flex justify-between items-center'>
                <Typography.Text style={{ 
                        color: 'white', 
                        textShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)'
                    }}>
                    {item.name}
                </Typography.Text>
                {
                    type === 'default' && (
                        <EditOutlined style={{ color: 'white', textShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)' }} />
                    )
                }
            </div>
        </motion.div>
    )
}