import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { PropsWithChildren } from "react";
import HeaderLayout from "./_header/headerLayout";
import SidebarLayout from "./_sidebar/sidebarLayout";


async function AppLayout({children}: PropsWithChildren) {
    return (
        <Layout className="h-screen">
            <SidebarLayout />
            <Layout>
                <HeaderLayout />
                <Content className="h-screen overflow-x-hidden overflow-y-auto mx-2 my-2 scrollbar dark::scrollbarDark">{children}</Content>
            </Layout>
        </Layout>
    );
}

export default AppLayout;
