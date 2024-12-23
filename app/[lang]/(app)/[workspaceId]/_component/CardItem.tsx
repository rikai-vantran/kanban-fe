import RenderIf from '@/components/common/RenderIf/RenderIf';
import TagComponent from '@/components/common/TagComponent/TagComponent';
import { CardType } from '@/types/WorkSpaceType';
import { Avatar, DatePicker, Row, Space, Tooltip, Typography } from 'antd';
import useToken from 'antd/es/theme/useToken';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import ModalEditCard from './ModalEditCard';
import { ProfileType } from '@/types/ProfileType';

interface CardItemProps {
    card: CardType;
    members: ProfileType[];
}
function CardItem({ card, members }: CardItemProps) {
    const token = useToken()

    const [openModalEditCard, setOpenModalEditCard] = React.useState(false)
    const tagType = {
        'tagname': 'To do',
        'color': '#0AAAF4'
    }
    
    return (
        <motion.div className='py-2 px-3 overflow-x-hidden cursor-pointer'>
            <Space direction="vertical" className='w-full' onClick={() => {
                setOpenModalEditCard(true)
            }}>
                <RenderIf condition={card.image !== null}>
                    <div className='w-full'>
                        <Image
                            src={card.image}
                            alt="image"
                            className="rounded-md"
                            width={0} height={0}
                            sizes="100vw"
                            style={{ width: '100%', maxHeight: '128px', objectFit: 'cover' }}
                        />
                    </div>
                </RenderIf>
                <Space direction='horizontal' wrap>
                    <TagComponent tagname={tagType.tagname} color={tagType.color} />
                </Space>
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
                    >{card.description}
                    </Typography.Paragraph>
                </div>
                {/* <Progress showInfo={false} percent={
                    Number((tasks.filter((task) => task.status === 'done').length / tasks.length * 100).toFixed(0))
                } status="active" strokeColor={{ from: token[3].colorInfo, to: token[3].colorPrimary }} /> */}
                <Row justify={'space-between'} align={'middle'} className='w-full'>
                    <div className="flex">
                        <Avatar.Group size={'small'} max={{
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
                    <DatePicker type='date' size='small' defaultValue={dayjs(card.due_date, 'YYYY-MM-DD')} />
                </Row>
            </Space>
            {/* // Modal Edit Card */}
            <ModalEditCard
                card={card}
                onCancel={() => {
                    console.log('onCancel')
                    setOpenModalEditCard(false)
                }}
                open={openModalEditCard}
            />
            {/* // Modal Edit Card */}
        </motion.div>
    )
}

export default CardItem