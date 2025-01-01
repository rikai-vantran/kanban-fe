import { deleteCard, getCard, updateCard } from '@/api/card';
import { getProfile } from '@/api/profile';
import { getWorkspace } from '@/api/workSpace';
import LabelContainer from '@/components/common/LabelContainer/LabelContainer';
import RenderIf from '@/components/common/RenderIf/RenderIf';
import { useI18n } from '@/contexts/i18n/i18nProvider';
import { useTheme } from '@/contexts/Theme/ThemeProvider';
import { accessToken } from '@/lib/http';
import { CarryOutOutlined, DeleteOutlined, DownOutlined, LoadingOutlined, LoginOutlined, LogoutOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from '@blocknote/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, DatePicker, Input, message, Modal, Popconfirm, Popover, Row, Space, Tooltip, Typography, Upload } from 'antd';
import useToken from 'antd/es/theme/useToken';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import PopoverEditLabel from './PopoverEditLabel';
import PopoverEditMember from './PopoverEditMember';
import Tasks from './Tasks';

interface Props {
    workspaceId: string;
    cardId: string;
    columnId: string;
    open: boolean;
    onCancel: () => void;
}
function ModalEditCard({
    workspaceId,
    cardId,
    columnId,
    open,
    onCancel
}: Props) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const token = useToken()
    const { themeApp } = useTheme()
    const queryClient = useQueryClient();

    const [short_descriptionFocus, setShortDescriptionFocus] = React.useState<boolean>(false);
    const [descriptionFocus, setDescriptionFocus] = React.useState<boolean>(false);

    const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);
    const [uploadImageLoading, setUploadImageLoading] = React.useState<boolean>(false);
    const [imageCardState, setImageCardState] = React.useState<string | null>(null);
    const [short_descriptionState, setShortDescriptionState] = React.useState<string>();

    const userData = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            return getProfile();
        },
    })
    const workspace = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: async () => {
            return getWorkspace(workspaceId)
        },
    })
    const cardQuery = useQuery({
        queryKey: ['card', cardId],
        queryFn: async () => {
            const rs = await getCard(workspaceId, columnId, cardId)
            return rs
        }
    })
    const editor = useCreateBlockNote()

    useEffect(() => {
        setPopoverOpen(false);
        setUploadImageLoading(false);
        setImageCardState(cardQuery.data?.image);
        setShortDescriptionState(cardQuery.data?.short_description);
        setDescriptionFocus(false);
    }, [cardId, cardQuery.data])

    const editCardMutation = useMutation({
        mutationKey: ['editCard'],
        mutationFn: async (values: {
            name?: string;
            short_description?: string;
            description?: string;
            due_date?: string;
            assigns?: number[];
            image?: string | null;
            labels?: number[];
        }) => {
            const response = await updateCard(
                workspaceId,
                cardQuery.data?.column,
                cardQuery.data?.id,
                values.name,
                values.short_description,
                values.description,
                values.due_date,
                undefined,
                values.assigns,
                values.labels,
                values.image
            )
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId]
            })
            queryClient.invalidateQueries({
                queryKey: ['card', cardId]
            })
        },
    })
    const deleteCardMutation = useMutation({
        mutationKey: ['removeCard', workspaceId],
        mutationFn: async () => {
            await deleteCard(workspaceId, columnId, cardId);
            message.success(i18n.Message['Card deleted successfully']);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId],
            })
            queryClient.invalidateQueries({
                queryKey: ['columns', workspaceId],
            })
        }
    })

    const uploadButton = useMemo(() => (
        <Popover trigger={'click'}
            placement='top'
            open={popoverOpen}
            onOpenChange={(open) => {
                setPopoverOpen(open);
            }}
            arrow={false}
            overlayInnerStyle={{
                padding: 4,
            }}
            color='rgba(0, 0, 0, 0.2)'
            content={(
                <Space direction='vertical' className='w-full' size={'small'}>
                    <Upload
                        showUploadList={false}
                        listType='text'
                        onChange={(info) => {
                            if (info.file.status === 'uploading') {
                                setUploadImageLoading(true);
                            }
                            if (info.file.status === 'done') {
                                setUploadImageLoading(false);
                                setImageCardState(info.file.response.data);

                                queryClient.invalidateQueries({
                                    queryKey: ['cards', workspaceId],
                                })
                            }
                        }}
                        headers={{
                            Authorization: `Bearer ${accessToken.value}`
                        }}
                        action={`${process.env.NEXT_PUBLIC_BASE_URL}/api/workspaces/${workspaceId}/columns/${columnId}/cards/${cardId}/image/`}
                    >
                        <motion.div
                            initial={{
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                backdropFilter: 'blur(4px)',
                                height: 'fit-content',
                            }}
                            whileHover={{
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            }}
                            whileTap={{
                                scale: 0.95,
                            }}
                            onClick={() => {
                                setPopoverOpen(false);
                            }}
                        >
                            <Space>
                                <PictureOutlined className='text-white' />
                                <Typography.Text className='text-white'>
                                    {i18n.Common['Change image']}
                                </Typography.Text>
                            </Space>
                        </motion.div>
                    </Upload>
                    {
                        Boolean(imageCardState) && (
                            <motion.div
                                initial={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(4px)',
                                    height: 'fit-content',
                                }}
                                whileHover={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                }}
                                whileTap={{
                                    scale: 0.95,
                                }}
                                onClick={() => {
                                    editCardMutation.mutate({
                                        image: null
                                    })
                                    setImageCardState(null);
                                    setPopoverOpen(false);
                                }}
                            >
                                <Space>
                                    <Typography.Text style={{
                                        color: token[3].colorError
                                    }}>
                                        {i18n.Common['Remove image']}
                                    </Typography.Text>
                                </Space>
                            </motion.div>
                        )
                    }
                </Space>
            )}
        >
            <motion.div
                initial={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    height: 'fit-content',
                }}
                whileHover={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
                whileTap={{
                    scale: 0.95,
                }}
            >
                <Space>
                    {
                        uploadImageLoading ? (
                            <LoadingOutlined className='text-white' />
                        ) : (
                            <PictureOutlined className='text-white' />
                        )
                    }
                    <Typography.Text className='text-white'>
                        {i18n.Common['Change image']}
                    </Typography.Text>
                </Space>
            </motion.div>
        </Popover>
    ), [cardId, columnId, i18n.Common, imageCardState, token, workspaceId])

    if (workspace.isLoading || cardQuery.isLoading) {
        return null;
    }

    return (
        <Modal
            destroyOnClose={true}
            open={open}
            onCancel={() => {
                onCancel();
            }}
            footer={null}
            width={720}
            styles={{
                body: {
                    overflowY: 'auto', maxHeight: 'calc(100vh - 200px)',
                    padding: '20px 20px'
                },
                content: {
                    padding: 0,
                    overflow: 'hidden',
                },
                wrapper: {
                    borderRadius: 8
                }
            }}
        >
            <div style={{
                marginLeft: -20,
                marginRight: -20,
                marginTop: -20
            }}>
                <div className='relative'>
                    {
                        Boolean(imageCardState) ? (
                            <Image
                                src={imageCardState}
                                alt="image"
                                width={0} height={0}
                                sizes="100vw"
                                style={{
                                    width: '100%', maxHeight: '258px', objectFit: 'cover',
                                    borderTopLeftRadius: 8, borderTopRightRadius: 8,
                                    marginBottom: 24
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%', height: 258,
                                backgroundColor: token[3].colorBgLayout,
                                borderTopLeftRadius: 8, borderTopRightRadius: 8,
                                marginBottom: 24
                            }} />
                        )
                    }
                    <div className='absolute bottom-2 right-2'>{uploadButton}</div>
                </div>
            </div>
            <LabelContainer
                labels={cardQuery.data?.labels}
            />
            <Row className='w-full gap-4 mb-4 mt-2'>
                <Space direction='vertical' className='flex-1'>
                    <Typography.Text strong>{i18n.Card['Card title']}</Typography.Text>
                    <Typography.Title className='w-full' level={4} editable={{
                        onChange: (value) => {
                            if (value !== cardQuery.data.name) {
                                editCardMutation.mutate({
                                    name: value
                                })
                            }
                        },
                        triggerType: ['icon', 'text'],
                        editing: true,
                    }}
                    >
                        {cardQuery.data?.name}
                    </Typography.Title>
                    <Row className='w-full gap-4'>
                        <Space direction='vertical' size={'small'}>
                            <Typography.Text strong>{i18n.Card['Due date']}</Typography.Text>
                            <DatePicker
                                value={cardQuery.data?.due_date ? dayjs(cardQuery.data?.due_date, 'YYYY-MM-DDTHH:mm:ss[Z]') : undefined}
                                onChange={(value) => {
                                    editCardMutation.mutate({
                                        due_date: value?.format('YYYY-MM-DDTHH:mm:ss[Z]')
                                    })
                                }}
                                format={'YYYY-MM-DD HH:mm'}
                                suffixIcon={<DownOutlined />}
                                style={{ width: '100%' }}
                                showTime={{ format: 'HH:mm' }}
                            />
                        </Space>
                        <Space direction='vertical' size={'small'}>
                            <Typography.Text strong>{i18n.Card['Assign to']}</Typography.Text>
                            <Row className='gap-2'>
                                <Avatar.Group size={'default'} max={{
                                    count: 3,
                                    style: { backgroundColor: token[3].colorPrimaryBorderHover, color: token[3].colorWhite },
                                }}>
                                    {
                                        cardQuery.data?.assigns.map((member, key) => (
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
                                <Popover
                                    trigger={'click'}
                                    placement='bottom'
                                    content={<PopoverEditMember
                                        members={workspace.data.members.map((member) => member.profile)}
                                        selected={cardQuery.data?.assigns}
                                        onSaved={(items) => {
                                            editCardMutation.mutate({
                                                assigns: items.map((member) => member.id)
                                            })
                                        }}
                                    />}
                                >
                                    <Button variant='outlined' style={{
                                        borderRadius: '50%',
                                    }}
                                        icon={<PlusOutlined />}
                                    />
                                </Popover>
                            </Row>
                        </Space>
                    </Row>
                </Space>
                <Space direction='vertical' className='w-40'>
                    <RenderIf condition={
                        cardQuery.data.assigns.every((member) => member.id !== userData.data?.id)
                    }>
                        <Button color='default' variant='filled' className='w-full'
                            onClick={() => {
                                editCardMutation.mutate({
                                    assigns: [...cardQuery.data.assigns, userData.data].map((member) => member.id)
                                })
                            }}
                            style={{
                                display: 'flex',
                                justifyContent: 'start'
                            }}
                            icon={<LoginOutlined />}
                        >
                            {i18n.Common['Join']}
                        </Button>
                    </RenderIf>
                    <RenderIf condition={
                        cardQuery.data.assigns.some((member) => member.id === userData.data?.id)
                    }>
                        <Button color='default' variant='filled' className='w-full'
                            onClick={() => {
                                editCardMutation.mutate({
                                    assigns: cardQuery.data.assigns.filter((member) => member.id !== userData.data?.id).map((member) => member.id)
                                })
                            }}
                            style={{
                                display: 'flex',
                                justifyContent: 'start'
                            }}
                            icon={<LogoutOutlined />}
                        >
                            {i18n.Common['Leave']}
                        </Button>
                    </RenderIf>
                    <Popover
                        trigger={'click'}
                        placement='bottom'
                        content={<PopoverEditLabel
                            labels={workspace.data.labels}
                            selected={cardQuery.data?.labels}
                            onSaved={
                                (items) => {
                                    console.log('items', items)
                                    editCardMutation.mutate({
                                        labels: items.map((label) => label.id)
                                    })
                                }
                            }
                        />}
                    >
                        <Button color='default' variant='filled' className='w-full' style={{
                            display: 'flex',
                            justifyContent: 'start'
                        }}
                            icon={<CarryOutOutlined />}
                        >
                            {i18n.Common['Label']}
                        </Button>
                    </Popover>
                    <Popconfirm
                        trigger={'click'}
                        title={i18n.Message['Are you sure you want to delete this card?']}
                        onConfirm={() => {
                            deleteCardMutation.mutate()
                            onCancel();
                        }}
                    >
                        <Button variant='filled' className='w-full' style={{
                            display: 'flex',
                            justifyContent: 'start'
                        }}
                            color='danger'
                            icon={<DeleteOutlined />}
                        >
                            {i18n.Common['Delete']}
                        </Button>
                    </Popconfirm>
                </Space>
            </Row>
            <Space direction='vertical' className='w-full'>
                <Row justify={'space-between'}>
                    <Typography.Text strong>{i18n.Card['Short description']}</Typography.Text>
                    {
                        short_descriptionFocus && (
                            <Button color='primary' variant='filled' onClick={() => {
                                setShortDescriptionFocus(false);
                                editCardMutation.mutate({
                                    short_description: short_descriptionState
                                })
                            }}>
                                {i18n.Common['Save']}
                            </Button>
                        )
                    }
                </Row>
                <Input.TextArea
                    placeholder={i18n.Card['Short description']}
                    value={short_descriptionState}
                    onChange={(e) => {
                        setShortDescriptionState(e.target.value);
                    }}
                    onFocus={() => {
                        setShortDescriptionFocus(true);
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            setShortDescriptionFocus(false);
                        }, 400)
                    }}
                />
                <Row justify={'space-between'}>
                    <Typography.Text strong>{i18n.Card['Card description']}</Typography.Text>
                    {
                        descriptionFocus && (
                            <Space>
                                <Button color='default' variant='filled' onClick={async () => {
                                    setDescriptionFocus(false);
                                    const description = cardQuery.data?.description;
                                    if (description) {
                                        const blocks = await editor.tryParseHTMLToBlocks(description);
                                        if (blocks) {
                                            editor.replaceBlocks(editor.document, blocks);
                                        }
                                    }
                                }}>
                                    {i18n.Common['Cancel']}
                                </Button>
                                <Button color='primary' variant='filled' onClick={async () => {
                                    setDescriptionFocus(false);
                                    editCardMutation.mutate({
                                        description: await editor.blocksToFullHTML(editor.document)
                                    })
                                }}>
                                    {i18n.Common['Save']}
                                </Button>
                            </Space>
                        )
                    }
                </Row>
                {
                    descriptionFocus ? (
                        <BlockNoteView
                            style={{
                                border: `1px solid ${token[3].colorBorder}`,
                                borderRadius: 8,
                                padding: 8,
                            }}
                            theme={themeApp}
                            editor={editor}
                        />
                    ) : (
                        <motion.div
                            onClick={async () => {
                                setDescriptionFocus(true);
                                const description = cardQuery.data?.description;
                                console.log('description', description)
                                if (description) {
                                    const blocks = await editor.tryParseHTMLToBlocks(description);
                                    editor.replaceBlocks(editor.document, blocks);
                                } else {
                                    console.log('removeBlocks')
                                    editor.removeBlocks(editor.document);
                                }
                            }}
                            style={{
                                backgroundColor: token[3].colorBgLayout,
                                minHeight: 64,
                                paddingTop: 8,
                                paddingBottom: 8,
                                paddingLeft: 16,
                                paddingRight: 8,
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                            dangerouslySetInnerHTML={{
                                __html: cardQuery.data?.description ? cardQuery.data?.description :
                                    `<p style="color: ${token[3].colorText}; font-size: 14px;">${i18n.Card['Add a more detailed description']}...</p>`
                            }}
                        />
                    )
                }
                <Typography.Text strong>{i18n.Card['Tasks']}</Typography.Text>
                <Tasks
                    workspaceId={workspaceId}
                    cardId={cardId}
                    columnId={columnId}
                    tasks={cardQuery.data?.tasks}
                />
            </Space>
        </Modal>
    )
}

export default ModalEditCard;