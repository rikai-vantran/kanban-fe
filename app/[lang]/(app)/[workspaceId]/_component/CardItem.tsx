import LabelContainer from '@/components/common/LabelContainer/LabelContainer';
import RenderIf from '@/components/common/RenderIf/RenderIf';
import DueDateTag from '@/components/DueDateTag/DueDateTag';
import { useI18n } from '@/contexts/i18n/i18nProvider';
import { CardType } from '@/types/WorkSpaceType';
import { Avatar, Row, Space, Tooltip, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';

interface CardItemProps {
    card: CardType;
    onClick?: () => void;
}
function CardItem({ card, onClick }: CardItemProps) {
    const token = useToken()
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);

    console.log(card)
    return (
        <motion.div whileHover={'hover'}>
            <motion.div className='py-2 px-3 overflow-x-hidden cursor-pointer'
                style={{
                    backgroundColor: token[3].colorBgElevated,
                }}
                initial={{
                    borderRadius: 8,
                    border: '2px solid transparent',
                }}
                whileHover={{
                    border: `2px solid ${token[3].colorPrimary}`,
                }}
                whileTap={{
                    scale: 0.96,
                }}
            >
                <Space direction="vertical" className='w-full' onClick={onClick}>
                    <RenderIf condition={Boolean(card.image)}>
                        <motion.div className='-ml-3 -mr-3 -mt-2'
                            variants={{
                                'hover': { scale: 1.05, transition: { duration: 0.5 } },
                            }}
                        >
                            <Image
                                src={card.image}
                                alt="image"
                                width={0} height={0}
                                sizes="100vw"
                                style={{ width: '100%', maxHeight: '142px', objectFit: 'cover' }}
                            />
                        </motion.div>
                    </RenderIf>
                    <LabelContainer labels={card.labels} type='compact' />
                    <div className='w-full'>
                        <Typography.Title className='w-full text-wrap' style={{
                            marginBottom: '0px',
                        }} level={5}>
                            {card.name}
                        </Typography.Title>
                        <Typography.Paragraph
                            style={{ marginBottom: '0px' }}
                            type='secondary'
                            className='w-full text-wrap'
                            ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                        >{card.short_description}
                        </Typography.Paragraph>
                    </div>
                    <Row justify={'space-between'} align={'middle'} className='w-full'>
                        <DueDateTag
                            value={card.due_date ? dayjs(card.due_date, 'YYYY-MM-DDTHH:mm:ss[Z]') : null}
                            isDone={
                                card.tasks.length > 0 && card.tasks.filter((task) => task.status).length === card.tasks.length
                            }
                        />
                        <div className="flex">
                            <Avatar.Group size={'default'} max={{
                                count: 3,
                                style: { backgroundColor: token[3].colorPrimaryBorderHover, color: token[3].colorWhite },
                            }}>
                                {
                                    card.assigns.map((member, key) => (
                                        <Tooltip title={member.name} key={key}>
                                            <Avatar
                                                src={member.profile_pic.avatar === '' ? '/images/no_avatar.png' : member.profile_pic.avatar}
                                                alt={member.name}
                                            >
                                                {member.name}
                                            </Avatar>
                                        </Tooltip>
                                    ))
                                }
                            </Avatar.Group>
                        </div>
                    </Row>
                </Space>
            </motion.div>
        </motion.div>
    )
}

export default React.memo(CardItem, (prevProps, nextProps) => {
    // # Compare the props of the component exclude column fieldset
    const prev = { ...prevProps.card }
    const next = { ...nextProps.card }
    delete prev.column
    delete next.column
    return JSON.stringify(prev) === JSON.stringify(next)
})