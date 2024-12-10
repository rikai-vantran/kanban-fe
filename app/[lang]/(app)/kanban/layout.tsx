import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { PropsWithChildren } from "react";


async function AppLayout({children}: PropsWithChildren) {
    return (
        <Layout className="h-screen">
            <Layout>
                <Content className="h-screen overflow-hidden mx-6 my-4">{children}</Content>
            </Layout>
        </Layout>
    );
}

export default AppLayout;
