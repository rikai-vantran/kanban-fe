import { getProfile } from "@/api/profile";
import { logsWorkspace } from "@/api/workSpace";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { WorkSpaceType } from "@/types/WorkSpaceType";
import { useQuery } from "@tanstack/react-query";
import {Drawer, Form, Input, List, Space, Tabs, Timeline, Typography} from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface DrawerWorkspaceInfoProps {
    open: boolean;
    onClose: () => void;
    workspace: WorkSpaceType;
}
async function DrawerWorkspaceInfo({
    onClose,
    open,
    workspace,
}: DrawerWorkspaceInfoProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const userData = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            return getProfile();
        },
    });

    const members = useQuery({
        queryKey: ["members", workspace.id],
        queryFn: async () => {
            return workspace.members;
        },
    });

    const requests = useQuery({
        queryKey: ["requests", workspace.id],
        queryFn: async () => {
            return [];
        },
    });
    const [data, setData] = React.useState<any>([]);

    useEffect(() => {
        const fetchdata = async () => {
            const rs = await logsWorkspace(workspace.id);

            console.log("rs", rs);
            setData(rs);
        };
        fetchdata();
    }, []);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={i18n.Workspace["Workspace information"]}
        >
            <Tabs
                items={[
                    {
                        key: "1",
                        label: i18n.Workspace["Workspace information"],
                        children: (
                            <div>
                                <Form
                                    labelCol={{
                                        span: 8,
                                    }}
                                    labelAlign="left"
                                >
                                    <Form.Item label="Name">
                                        <Input
                                            disabled
                                            value={workspace?.name}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Create at">
                                        <Input
                                            value={dayjs(
                                                workspace.created_at,
                                            ).format("YYYY-MM-DD")}
                                            disabled
                                        />
                                    </Form.Item>
                                    <Space
                                        direction="vertical"
                                        className="w-full"
                                    >
                                        <Typography.Title level={5}>
                                            {i18n.Common["Owner"]}
                                        </Typography.Title>
                                        <List>
                                            <List.Item>
                                                <List.Item.Meta
                                                    title={
                                                        workspace?.members[0]
                                                            .name
                                                    }
                                                    description={
                                                        workspace?.members[0]
                                                            .email
                                                    }
                                                    avatar={
                                                        <Image
                                                            height={36}
                                                            width={36}
                                                            src={
                                                                userData.data ===
                                                                    undefined ||
                                                                userData.data
                                                                    .profile_pic
                                                                    .avatar ===
                                                                    ""
                                                                    ? "/images/no_avatar.png"
                                                                    : userData
                                                                          .data
                                                                          .profile_pic
                                                                          .avatar
                                                            }
                                                            alt={
                                                                userData.data
                                                                    ?.name ||
                                                                "No name available"
                                                            }
                                                            className="rounded-full"
                                                        />
                                                    }
                                                    style={{
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            </List.Item>
                                        </List>
                                    </Space>
                                    <Space
                                        direction="vertical"
                                        className="w-full"
                                    >
                                        <Typography.Title level={5}>
                                            {i18n.Workspace["Members"]}
                                        </Typography.Title>
                                        <List
                                            loading={members.isLoading}
                                            dataSource={members.data}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={item.name}
                                                        description={item.email}
                                                        avatar={
                                                            <Image
                                                                height={36}
                                                                width={36}
                                                                src={
                                                                    item
                                                                        .profile_pic
                                                                        .avatar
                                                                        ? item
                                                                              .profile_pic
                                                                              .avatar
                                                                        : "/images/no_avatar.png"
                                                                }
                                                                alt={item.name}
                                                                style={{
                                                                    borderRadius:
                                                                        "50%",
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Space>
                                    <Space
                                        direction="vertical"
                                        className="w-full"
                                    >
                                        <Typography.Title level={5}>
                                            {i18n.Common["RequestingToJoin"]}
                                        </Typography.Title>
                                        <List
                                            dataSource={requests.data}
                                            loading={requests.isLoading}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                // title={item.user_sender.name?.toString()}
                                                // description={item.email}
                                                // avatar={
                                                //     <Image
                                                //         height={36}
                                                //         width={36}
                                                //         src={item.imageUri}
                                                //         alt={item.name}
                                                //         style={{
                                                //             borderRadius: "50%",
                                                //         }}
                                                //     />
                                                // }
                                            />
                                                </List.Item>
                                            )}
                                        />
                                    </Space>
                                </Form>
                            </div>
                        ),
                    },
                    {
                        key: "2",
                        label: i18n.Workspace["History"],
                        children: (
                            <div className="mt-8">
                                <Timeline

                                    items={data.map((item: { log: string; create_at: string }) => {
                                        return {
                                            color: item.log.includes("created")
                                                ? "green"
                                                : item.log.includes("updated")
                                                ? "blue"
                                                : "red",
                                            children: (
                                                <div className="flex flex-col">
                                                    <span>
                                                        <Typography.Text strong>
                                                            {item.log}
                                                        </Typography.Text>
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {dayjs(item.create_at).format("YYYY-MM-DD HH:mm:ss")}
                                                    </span>
                                                </div>
                                            ),
                                        };
                                    })}
                                />
                            </div>
                        ),
                    },
                ]}
            />
        </Drawer>
    );
}

export default DrawerWorkspaceInfo;
