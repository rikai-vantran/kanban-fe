'use client';
import { SocketProvider } from "@/contexts/Socket/SocketProvider";
import { useTheme } from "@/contexts/Theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import React, { PropsWithChildren } from "react";
import { StyleProvider } from '@ant-design/cssinjs';

function ConfigProviderApp({ children }: PropsWithChildren) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 0,
                throwOnError: true
            },
            mutations: {
                throwOnError: true,
                retry: 0,
            }
        }
    });
    const { themeApp } = useTheme();
    return (
        <SocketProvider>
            <QueryClientProvider client={queryClient}>
                <StyleProvider layer>
                    <ConfigProvider
                        theme={{
                            algorithm: themeApp === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                        }}
                    >
                        {children}
                    </ConfigProvider>
                </StyleProvider>
            </QueryClientProvider>
        </SocketProvider>
    )
}

export default ConfigProviderApp;
