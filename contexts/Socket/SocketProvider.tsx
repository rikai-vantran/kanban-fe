import { useWebsocket } from "@/hooks/useWebSocket";
import { accessToken } from "@/lib/http";
import { WorkSpaceType } from "@/types/WorkSpaceType";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

interface SocketContextValue {
    uid?: number;
    workspaceMembers: WorkSpaceType[];
    workspaceMembersOrder: number[];
}

const SocketContext = createContext<SocketContextValue | null>(null)
export const SocketProvider = ({ children }: PropsWithChildren) => {
    const [uid, setUid] = useState<number>();
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkSpaceType[]>([]);
    const [workspaceMembersOrder, setWorkspaceMembersOrder] = useState<number[]>([]);

    if (process.env.NEXT_PUBLIC_BASE_URL === undefined) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }
    const {
        val,
    } = useWebsocket({
        url: `ws://${process.env.NEXT_PUBLIC_BASE_URL.replace(/^http:\/\//, '')}/ws/user/?token=${accessToken.value}`,
    })

    useEffect(() => {
        if (!val) return;
        const data = JSON.parse(val);
        setUid(data.uid);
        setWorkspaceMembers(data.workspaceMembers);
        setWorkspaceMembersOrder(data.workspaceMembersOrder);
    }, [val])

    return (
        <SocketContext.Provider value={{
            uid,
            workspaceMembers,
            workspaceMembersOrder
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}