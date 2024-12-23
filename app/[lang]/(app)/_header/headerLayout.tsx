"use client";
import { getProfile } from "@/api/profile";
import { acceptRequest, deleteRequest, getRequests, rejectRequest } from "@/api/request";
import RenderIf from "@/components/common/RenderIf/RenderIf";
import { useAuth } from "@/contexts/Auth/AuthProvider";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { useTheme } from "@/contexts/Theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { RequestType } from "@/types/ProfileType";
import {
    BellOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    LogoutOutlined,
    MinusCircleOutlined,
    NotificationOutlined, PullRequestOutlined
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Badge,
    Button,
    Divider,
    List,
    Popover,
    Row,
    Space,
    Tabs,
    Tag,
    Typography
} from "antd";
import { Header } from "antd/es/layout/layout";
import useToken from "antd/es/theme/useToken";
import { Emoji } from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

function HeaderLayout() {
    const pathName = usePathname();
    const lang = pathName.split("/")[1];
    const i18n = useI18n(lang);
    const token = useToken();
    const { signOut } = useAuth();
    const { themeApp } = useTheme()
    const queryClient = useQueryClient()

    // control state
    const userData = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            return getProfile();
        },
    })
    const requestQuery = useQuery({
        queryKey: ["request", userData.data?.id],
        queryFn: async () => {
            return getRequests();
        }
    })
    const declineRequestMutation = useMutation({
        mutationKey: ['declineRequest'],
        mutationFn: async (requestId: string) => {
            return rejectRequest(requestId)
        },
        onSuccess: () => {
            requestQuery.refetch()
        }
    })
    const acceptRequestMutation = useMutation({
        mutationKey: ['acceptRequest'],
        mutationFn: async (requestId: string) => {
            return acceptRequest(requestId)
        },
        onSuccess: () => {
            requestQuery.refetch()
            queryClient.invalidateQueries({
                queryKey: ["workspacesMember"]
            })
        }
    })
    const deleteRequestMutation = useMutation({
        mutationKey: ['deleteRequest'],
        mutationFn: async (requestId: string) => {
            return deleteRequest(requestId)
        },
        onSuccess: () => {
            requestQuery.refetch()
        }
    })
    const notificationContent = useMemo(() => {
        return (
            <Space direction="vertical" className="w-[338px] -mr-3 -mt-3">
                <Tabs
                    items={[
                        {
                            key: "1",
                            label: i18n.Common["Requests"],
                            icon: <PullRequestOutlined />,
                            children: (
                                <List
                                    className={cn("max-h-[338px] overflow-y-auto", {
                                        scrollbar: themeApp === "light",
                                        scrollbarDark: themeApp === "dark",
                                    })}
                                    itemLayout="horizontal"
                                    dataSource={requestQuery.data}
                                    renderItem={(item: RequestType, index) => (
                                        <AnimatePresence key={item.id} mode="popLayout">
                                            <motion.li
                                                layout
                                                whileHover={{
                                                }}
                                                style={{
                                                    borderTop: index === 0 ? "none" : `1px solid ${token[1].colorBorder}`,
                                                    marginRight: 12,
                                                    position: "relative",
                                                }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                transition={{ type: "spring" }}
                                            >
                                                <List.Item className="mr-3">
                                                    <Space
                                                        direction="vertical"
                                                        style={{
                                                            maxWidth: 360,
                                                        }}
                                                    >
                                                        <Space>
                                                            <div className="h-9 w-9 mr-2">
                                                                <Image
                                                                    src={item.user_sender.profile_pic.avatar === '' ? "/images/no_avatar.png" : item.user_sender.profile_pic.avatar}
                                                                    alt={item.user_sender.name}
                                                                    width={36}
                                                                    height={36}
                                                                    style={{
                                                                        borderRadius: "50%",
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="mr-4">
                                                                <Typography.Text type="secondary">
                                                                    <Typography.Text>
                                                                        {" "}
                                                                        {item.user_sender.name}{" "}
                                                                    </Typography.Text>
                                                                    {i18n.Common["inviteYouToJoin"]}{" "}
                                                                    <Popover
                                                                        trigger={'hover'}
                                                                        content={
                                                                            <Space>
                                                                                <Emoji unified={item.workspace.icon_unified} size={20} />
                                                                                <Typography.Text
                                                                                    style={{
                                                                                        marginLeft: 8,
                                                                                    }}
                                                                                >
                                                                                    {item.workspace.name}
                                                                                </Typography.Text>
                                                                            </Space>
                                                                        }
                                                                    >
                                                                        <Typography.Text>
                                                                            {i18n.Common["theirWorkspace"]}
                                                                        </Typography.Text>
                                                                    </Popover>
                                                                    {". "}
                                                                    {i18n.Common["doYouWantToJoin?"]}
                                                                </Typography.Text>
                                                            </div>
                                                        </Space>
                                                        <Row justify={"space-between"} align={"middle"}>
                                                            <Typography.Text type="secondary">
                                                                {new Date(item.created_at).toLocaleDateString()}
                                                            </Typography.Text>
                                                            <RenderIf condition={item.status === "pending"}>
                                                                <Space size={"small"}>
                                                                    <Button
                                                                        variant="text"
                                                                        color="danger"
                                                                        loading={
                                                                            declineRequestMutation.isPending
                                                                        }
                                                                        onClick={() =>
                                                                            declineRequestMutation.mutate(item.id!)
                                                                        }
                                                                    >
                                                                        {i18n.Common["Decline"]}
                                                                    </Button>
                                                                    <Button
                                                                        variant="text"
                                                                        color="primary"
                                                                        loading={
                                                                            acceptRequestMutation.isPending
                                                                        }
                                                                        onClick={() =>
                                                                            acceptRequestMutation.mutate(item.id!)
                                                                        }
                                                                    >
                                                                        {i18n.Common["Accept"]}
                                                                    </Button>
                                                                </Space>
                                                            </RenderIf>
                                                            <RenderIf condition={item.status === "accepted" || item.status === "rejected"}>
                                                                <Tag bordered={false} icon={
                                                                    item.status === "accepted" ? <CheckCircleOutlined /> : <MinusCircleOutlined />
                                                                } color={item.status === "accepted" ? "success" : "error"}>
                                                                    {
                                                                        item.status === "accepted" ? i18n.Common["Accepted"] : i18n.Common["Rejected"]
                                                                    }
                                                                </Tag>
                                                            </RenderIf>
                                                        </Row>
                                                    </Space>
                                                    <RenderIf condition={item.status === "accepted" || item.status === "rejected"} style={{
                                                        position: "absolute",
                                                        right: 0,
                                                        top: 4,
                                                    }}>
                                                        <Button type="text" icon={<CloseOutlined size={8} />} loading={deleteRequestMutation.isPending}
                                                            onClick={() => deleteRequestMutation.mutate(item.id!)}
                                                        />
                                                    </RenderIf>
                                                </List.Item>
                                            </motion.li>
                                        </AnimatePresence>
                                    )}
                                />
                            )
                        },
                        {
                            key: "2",
                            label: i18n.Common["Notifications"],
                            icon: <NotificationOutlined />,
                            children: null
                        },
                    ]}
                />
            </Space>
        );
    }, [i18n.Common, requestQuery.data, themeApp])
    const settingContent = useMemo(() => {
        if (userData.data === undefined) {
            return null;
        }
        return (
            <Space direction="vertical" className="w-72">
                <List>
                    <List.Item>
                        <List.Item.Meta
                            title={userData.data.name}
                            description={userData.data.email}
                            avatar={
                                <Image
                                    height={36} width={36}
                                    src={(userData.data === undefined || userData.data.profile_pic.avatar === '') ? "/images/no_avatar.png" : userData.data.profile_pic.avatar}
                                    alt={userData.data.name}
                                    className="rounded-full"
                                />
                            }
                        />
                    </List.Item>
                </List>
                <Divider style={{ margin: 0 }} />
                <Button
                    type="text" className="w-full" icon={<LogoutOutlined />}
                    onClick={() => {
                        signOut()
                    }}
                >
                    {i18n.Common["Logout"]}
                </Button>
            </Space>
        );
    }, [userData.data, lang]);

    if (userData.isLoading || requestQuery.isLoading) {
        return (
            <Header style={{ background: token[1].colorBgElevated }}>
            </Header>
        );
    }

    return (
        <Header style={{ background: token[1].colorBgElevated }}>
            <Row justify={"end"} align={"middle"} className="h-full">
                <Popover
                    content={notificationContent}
                    trigger={"click"}
                    placement="bottomRight"
                >
                    <Badge count={requestQuery.data?.filter(i => i.status === 'pending').length}>
                        <Button type="text" icon={<BellOutlined />} />
                    </Badge>
                </Popover>
                <Popover
                    content={settingContent}
                    trigger={"click"}
                    placement="bottomRight"
                >
                    <Button type="link" className="flex items-center">
                        <Image
                            src={(userData.data === undefined || userData.data.profile_pic.avatar === '') ? "/images/no_avatar.png" : userData.data.profile_pic.avatar}
                            alt="User avatar" width={36} height={36}
                            className="rounded-full"
                        />
                    </Button>
                </Popover>
            </Row>
        </Header>
    );
}

export default HeaderLayout;
