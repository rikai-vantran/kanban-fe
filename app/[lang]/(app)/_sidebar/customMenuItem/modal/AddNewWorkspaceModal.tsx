import { getProfile, getProfiles } from "@/api/profile";
import { createRequest } from "@/api/request";
import { addWorkSpace } from "@/api/workSpace";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import useDebounce from "@/hooks/useDebounce";
import { ProfileType } from "@/types/ProfileType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Input,
    InputRef,
    List,
    message,
    Modal,
    Popover,
    Row,
    Space,
    Tag,
    Typography
} from "antd";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface AddNewWorkspaceModalProps {
    open: boolean;
    onCancel: () => void;
}

export const AddNewWorkspaceModal = ({
    open,
    onCancel,
}: AddNewWorkspaceModalProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const [messageApi, contextHolder] = message.useMessage();
    const workspaceInputRef = useRef<InputRef>(null);
    const queryClient = useQueryClient()

    const [workSpaceName, setWorkSpaceName] = useState<string>("");
    const [emoji, setEmoji] = useState<string>("1f423");
    const [searchUser, setSearchUser] = useState<string>("");
    const searchUserDebounce = useDebounce(searchUser, 500);

    const [members, setMembers] = useState<ProfileType[]>([]);

    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return getProfile();
        },
    })
    const searchUserResult = useQuery({
        queryKey: ['addNewWorkspaceSearchUser', searchUserDebounce],
        queryFn: async () => {
            const rs = await getProfiles(searchUserDebounce)
            return rs.filter((profile) => !members.find((member) => member.id === profile.id));
        },
    })
    const addWorkspaceMutation = useMutation({
        mutationKey: ['addWorkspace'],
        mutationFn: async ({ name, icon_unified }: { name: string; icon_unified: string }) => {
            const workspace = await addWorkSpace(name, icon_unified);
            // send request to members to join workspace
            await Promise.all(members.map(async (member) => {
                if (member.id === userQuery.data?.id) return;
                await createRequest(member.id!, workspace.payload.data.id);
            }))
            return workspace;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspacesOwner'],
            })
        }
    })

    useEffect(() => {
        if (userQuery.data)
            setMembers([userQuery.data])
    }, [userQuery.data])

    return (
        <Modal
            destroyOnClose={true}
            open={open}
            onCancel={() => {
                onCancel();
                setWorkSpaceName("");
            }}
            footer={null}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                }}
            >
                {contextHolder}
                <Typography.Title level={4}>{i18n.Workspace['Create workspace']}</Typography.Title>
                <Typography.Text type="secondary">
                    {i18n.Workspace['Workspace description']}
                </Typography.Text>

                <Row justify={"start"} align={"middle"} wrap={false}>
                    <Input
                        placeholder={i18n.Workspace['Workspace name']}
                        ref={workspaceInputRef}
                        required
                        value={workSpaceName}
                        onChange={(e) => {
                            setWorkSpaceName(e.target.value);
                        }}
                    />
                    <Space size={8} />
                    <Popover
                        style={{
                            cursor: "pointer",
                        }}
                        trigger={"click"}
                        content={
                            <EmojiPicker
                                onEmojiClick={(emoji) => {
                                    setEmoji(emoji.unified);
                                }}
                            />
                        }
                    >
                        <Button type="text" tabIndex={-1}>
                            <Emoji unified={emoji} size={20} />
                        </Button>
                    </Popover>
                </Row>

                <div>
                    <Typography.Title level={5}>{i18n.Workspace['Members']}</Typography.Title>
                    <List
                        dataSource={members}
                        renderItem={(item) => {
                            return (
                                <List.Item
                                    actions={[
                                        <Button
                                            key={item.id}
                                            disabled={item.id === userQuery.data?.id}
                                            onClick={() => {
                                                if (item.id === userQuery.data?.id) return;
                                                setMembers((prev) => prev.filter((member) => member.id !== item.id));
                                            }}>
                                            {i18n.Common['Remove']}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Typography.Text>
                                                    {item.name}
                                                </Typography.Text>
                                                {item.id === userQuery.data?.id && <Tag>{`${i18n.Common['Owner']}`}</Tag>}
                                            </Space>
                                        }
                                        description={item.email}
                                        avatar={
                                            <Image height={36} width={36}
                                                src={item.profile_pic.avatar === '' ? '/images/no_avatar.png' : item.profile_pic.avatar}
                                                alt={item.name}
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

                <Typography.Title level={5}>{i18n.Workspace['Add members']}</Typography.Title>
                <Input
                    placeholder={i18n.Workspace['Search by email']}
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                />
                <List
                    dataSource={searchUserResult.data}
                    loading={searchUserResult.isLoading}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    variant="filled"
                                    key={item.id}
                                    onClick={() => {
                                        if (members.find((member) => member.id === item.id)) {
                                            messageApi.error(i18n.Message['This user is already in the list']);
                                            return;
                                        }
                                        setMembers([...members, item]);
                                        queryClient.setQueryData(['addNewWorkspaceSearchUser', searchUserDebounce], () => {
                                            return []
                                        });
                                        setSearchUser("");
                                    }}>Add</Button>
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
                <Row justify={"end"}>
                    <Button
                        type="primary"
                        onClick={async () => {
                            if (!workSpaceName) {
                                messageApi.error(i18n.Message['Workspace name is required']);
                                return;
                            }
                            await addWorkspaceMutation.mutateAsync({
                                name: workSpaceName,
                                icon_unified: emoji,
                            });
                            setWorkSpaceName("");
                            onCancel();
                        }}
                        loading={addWorkspaceMutation.isPending}
                    >
                        {i18n.Common['Create']}
                    </Button>
                </Row>
            </Space>
        </Modal>
    );
};
