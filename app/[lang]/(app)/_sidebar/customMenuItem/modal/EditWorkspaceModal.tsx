import { getProfile, getProfiles } from "@/api/profile";
import { createRequest } from "@/api/request";
import { getRequestsPending, getWorkspace, updateWorkspace } from "@/api/workSpace";
import RenderIf from "@/components/common/RenderIf/RenderIf";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, List, message, Modal, Popover, Row, Space, Tag, Typography } from "antd";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface EditWorkspaceModalProps {
    open: boolean;
    workspaceId: string;
    onCancel: () => void;
}

export const EditWorkspaceModal = ({
    open,
    onCancel,
    workspaceId,
}: EditWorkspaceModalProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const queryClient = useQueryClient();

    const [emoji, setEmoji] = useState<string>("1f423");
    const [searchUser, setSearchUser] = useState("");
    const searchUserDebounce = useDebounce(searchUser, 500);

    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return getProfile()
        }
    })
    const workspace = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: async () => {
            return getWorkspace(workspaceId)
        }
    })
    const workspaceRequestsPending = useQuery({
        queryKey: ['workspaceRequestsPending', workspaceId],
        queryFn: async () => {
            return getRequestsPending(workspaceId)
        }
    })
    const searchUserResult = useQuery({
        queryKey: ['editWorkspaceSearchUser', searchUserDebounce],
        queryFn: async () => {
            const rs = await getProfiles(searchUserDebounce)
            return rs.filter((profile) => !workspace.data?.members.find((member) => member.profile.id === profile.id));
        },
    })
    const sendRequestMutation = useMutation({
        mutationKey: ['sendRequest'],
        mutationFn: async (values: {
            user_receiver: number
        }) => {
            await createRequest(values.user_receiver, workspaceId);
            message.success(i18n.Message['Request sent successfully']);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspaceRequestsPending', workspaceId]
            })
        }
    })
    const updateWorkspaceMutation = useMutation({
        mutationKey: ['updateWorkspace', workspaceId],
        mutationFn: async (values: { name: string, icon_unified: string }) => {
            return updateWorkspace(workspaceId, values.name, values.icon_unified);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspacesOwner']
            })
        }
    })

    useEffect(() => {
        if (workspace.data === undefined) return;
        setEmoji(workspace.data?.icon_unified);
    }, [workspace.data])

    if (workspace.data === undefined || userQuery.data === undefined) return <></>;

    return (
        <Modal
            open={open}
            onCancel={() => {
                onCancel();
            }}
            footer={null}
            destroyOnClose={true}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                    width: "100%",
                }}
            >
                <Typography.Title level={4}>{i18n.Workspace['Edit workspace']}</Typography.Title>
                <Form
                    style={{
                        width: "100%",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        scrollbarWidth: 'none',
                    }}
                    layout="vertical"
                    onFinish={async (values) => {
                        await updateWorkspaceMutation.mutate({
                            name: values.name,
                            icon_unified: emoji
                        })
                        message.success(i18n.Message['Workspace updated successfully']);
                        onCancel();
                    }}
                >
                    <div className="flex items-center space-x-2 w-full">
                        <Form.Item className="flex-1" label={i18n.Workspace['Change Workspace Name']} initialValue={workspace.data?.name} name={'name'} rules={[
                            {
                                required: true,
                                message: i18n.Message['Please enter the workspace name'],
                            },
                        ]}>
                            <Input />
                        </Form.Item>
                        <Popover
                            style={{
                                cursor: "pointer",
                            }}
                            trigger={"click"}
                            content={
                                <EmojiPicker
                                    onEmojiClick={(emoji) => {
                                        console.log(emoji);
                                        setEmoji(emoji.unified);
                                    }}
                                />
                            }
                        >
                            <Button type="text">
                                <Emoji unified={emoji} size={20} />
                            </Button>
                        </Popover>
                    </div>
                    <Row justify='end'>
                        <Button type='primary' htmlType='submit'
                            loading={updateWorkspaceMutation.isPending}
                        >
                            Save
                        </Button>
                    </Row>
                </Form>
                <div>
                    <Typography.Title level={5}>{i18n.Workspace['Members']}</Typography.Title>
                    <List
                        dataSource={workspace.data.members}
                        renderItem={(item) => {
                            return (
                                <List.Item
                                    actions={[
                                        <RenderIf key={item.profile.id} condition={item.profile.id !== userQuery.data?.id}>
                                            <Button
                                                onClick={() => {
                                                    if (item.profile.id === userQuery.data?.id) return;
                                                    // setMembers((prev) => prev.filter((member) => member.id !== item.id));
                                                }}>
                                                {i18n.Common['Remove']}
                                            </Button>
                                        </RenderIf>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Typography.Text>
                                                    {item.profile.name}
                                                </Typography.Text>
                                                {item.profile.id === userQuery.data?.id && <Tag>{`${i18n.Common['Owner']}`}</Tag>}
                                            </Space>
                                        }
                                        description={item.profile.email}
                                        avatar={
                                            <Image height={36} width={36}
                                                src={item.profile.profile_pic.avatar === '' ? '/images/no_avatar.png' : item.profile.profile_pic.avatar}
                                                alt={item.profile.name}
                                                style={{
                                                    borderRadius: "50%",
                                                }} />
                                        }
                                    />
                                </List.Item>
                            )
                        }}
                    />
                </div>
                <div>
                    <Typography.Title level={5}>{i18n.Workspace['Add members']}</Typography.Title>
                    <Input
                        placeholder={i18n.Workspace['Search by email']}
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                    <List
                        style={{
                            height: 166,
                            marginTop: 8,
                        }}
                        dataSource={searchUserResult.data}
                        loading={searchUserResult.isLoading}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        variant="filled"
                                        key={item.id}
                                        disabled={workspaceRequestsPending.data?.find((request) => request.user_receiver.id === item.id) !== undefined}
                                        onClick={() => {
                                            sendRequestMutation.mutate({
                                                user_receiver: item.id!
                                            });
                                            queryClient.setQueryData(['editWorkspaceSearchUser', searchUserDebounce], () => {
                                                return []
                                            });
                                            setSearchUser("");
                                        }}>{
                                            workspaceRequestsPending.data?.find((request) => request.user_receiver.id === item.id) !== undefined ?
                                                i18n.Common['Sended'] : i18n.Common['Send request']
                                        }</Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={item.name}
                                    description={item.email}
                                    avatar={
                                        <Image height={36} width={36} src={item.profile_pic.avatar === '' ? '/images/no_avatar.png' : item.profile_pic.avatar} alt={item.name} style={{
                                            borderRadius: "50%",
                                        }} />
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Space>
        </Modal>
    );
};
