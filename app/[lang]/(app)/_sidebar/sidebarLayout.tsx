'use client'
import { getProfile, updateWorkspaceOrder } from "@/api/profile";
import { getAllWorkSpaces } from "@/api/workSpace";
import RenderIf from "@/components/common/RenderIf/RenderIf";
import SidebarMenu, { MenuItemType } from "@/components/SidebarMenu/SidebarMenu";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { useTheme } from "@/contexts/Theme/ThemeProvider";
import {
    AlertFilled,
    AlertOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Row, Space, Typography } from 'antd';
import Sider from 'antd/es/layout/Sider';
import useToken from 'antd/es/theme/useToken';
import { motion, useAnimate } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from 'react';
import WorkSpaceReorder from "./customMenuItem/WorkSpacesReorder";

function SidebarLayout() {
    const pathName = usePathname();
    const lang = pathName.split('/')[1];
    const i18n = useI18n(lang);
    const token = useToken();
    const router = useRouter()
    const pathname = usePathname()
    const { setThemeApp, themeApp } = useTheme();

    // control state
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [scope, animate] = useAnimate()

    // state
    const [selectedKey, setSelectedKey] = useState<string>('')

    const userData = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            return getProfile();
        },
    })
    const workSpacesOwner = useQuery({
        queryKey: ['workspacesOwner'],
        queryFn: async () => {
            return getAllWorkSpaces('owner')
        }
    })
    const workSpacesMember = useQuery({
        queryKey: ['workspacesMember'],
        queryFn: async () => {
            return getAllWorkSpaces('member')
        }
    })

    // useEffect
    useEffect(() => {
        const key = pathname.split('/')[2]
        if (key) {
            setSelectedKey(key)
        } else {
            setSelectedKey('')
        }
    }, [pathname])

    // menu items
    const menuItems: MenuItemType[] = useMemo(() => [
        {
            key: '',
            type: 'item',
            label: i18n.Sidebar['Home'],
            icon: <HomeOutlined />,
            title: i18n.Sidebar['Home'],
        },
        {
            type: 'divider',
        },
        {
            type: 'custom',
            label: i18n.Sidebar['Your workspaces'],
            renderCustom: (inlineCollapsed) => <WorkSpaceReorder inlineCollapsed={inlineCollapsed}
                workSpaces={workSpacesOwner.data?.payload ?? []}
                workSpacesOrder={userData.data?.workspaceOwnerOrders ?? []}
                onWorkSpaceOrderChange={(order) => {
                    updateWorkspaceOrder(order, userData.data?.workspaceMemberOrders ?? [])
                }}
            />,
        },
        {
            type: 'divider',
        },
        {
            type: 'custom',
            label: i18n.Sidebar['Guest workspaces'],
            renderCustom: (inlineCollapsed) => <WorkSpaceReorder inlineCollapsed={inlineCollapsed}
                workSpaces={workSpacesMember.data?.payload ?? []}
                workSpacesOrder={userData.data?.workspaceMemberOrders ?? []}
                onWorkSpaceOrderChange={(order) => {
                    updateWorkspaceOrder(userData.data?.workspaceOwnerOrders ?? [], order)
                }}
                isFooter={false}
                isEditable={false}
            />,
        },
        {
            type: 'divider',
        },
        {
            key: '_appearance',
            type: 'item',
            label: themeApp === 'light' ? i18n.Sidebar['Dark mode'] : i18n.Sidebar['Light mode'],
            icon: themeApp === 'light' ? <AlertOutlined /> : <AlertFilled />,
            title: themeApp === 'light' ? i18n.Sidebar['Dark mode'] : i18n.Sidebar['Light mode'],
        },
        {
            key: 'settings',
            type: 'item',
            label: i18n.Common['Settings'],
            icon: <SettingOutlined />,
            title: i18n.Common['Settings'],
        }
    ], [lang, themeApp, userData.data, workSpacesOwner.data, workSpacesMember.data]);

    return (
        <Sider
            trigger={null}
            collapsible
            breakpoint="md"
            onBreakpoint={(broken) => {
                if (broken) {
                    setCollapsed(true)
                } else {
                    setCollapsed(false)
                }
            }}
            collapsed={collapsed}
            width={256}
            className={`rounded-lg h-screen overflow-y-auto overflow-x-hidden scrollbar dark::scrollbarDark`}
            style={{
                backgroundColor: token[3].colorBgElevated
            }}
        >
            <Row
                style={{
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    alignItems: "center",
                }}
            >
                <Space align="start">
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => {
                            if (collapsed) {
                                animate(scope.current, {
                                    opacity: 1,
                                })
                            } else {
                                animate(scope.current, {
                                    opacity: 0,
                                })
                            }
                            setCollapsed(!collapsed);
                        }}
                        style={{
                            width: 32,
                            height: 32,
                        }}
                    />
                    <motion.div
                        ref={scope}
                        style={{
                            textWrap: 'nowrap'
                        }}
                    >
                        <RenderIf condition={!collapsed}>
                            <Typography.Title level={4} type="secondary">
                                Kanban Board
                            </Typography.Title>
                        </RenderIf>
                    </motion.div>
                </Space>
            </Row>

            <SidebarMenu
                inlineCollapsed={collapsed}
                items={menuItems}
                onPress={(key) => {
                    if (key.startsWith('_')) {
                        switch (key) {
                            case '_appearance':
                                setThemeApp(themeApp === 'light' ? 'dark' : 'light')
                                break;
                        }
                    } else {
                        setSelectedKey(key)
                        router.push(`/${lang}/${key}`)
                    }
                }}
                selectedKey={selectedKey}
            />
        </Sider>
    )
}

export default SidebarLayout