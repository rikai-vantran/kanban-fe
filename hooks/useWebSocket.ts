import { useEffect, useRef, useState } from "react";

interface UseWebsocketProps<T> {
    url: string;
    trigger?: T;
}
export const useWebsocket = <T>({url, trigger}: UseWebsocketProps<T>) => {
    const [isReady, setIsReady] = useState(false);
    const [val, setVal] = useState(null);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => setIsReady(true);
        socket.onclose = () => setIsReady(false);
        socket.onmessage = (event) => {
            console.log(event.data, 'event.data')
            setVal(event.data)
        };
        ws.current = socket;
    }, [url, trigger]);

    return {
        isReady, val, 
        send: ws.current?.send.bind(ws.current),
        close: ws.current?.close.bind(ws.current),
    };
};
