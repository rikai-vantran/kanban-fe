import { useEffect, useState } from "react";

export const useResponsive = () => {
    // screen resolutions
    const [state, setState] = useState({
        'sm': false,
        'md': false,
        'lg': false,
        'xl': false,
        'xxl': false,
    });

    useEffect(() => {
        // update the state on the initial load
        onResizeHandler();

        // assign the event
        Setup();

        return () => {
            // remove the event
            Cleanup();
        };
    }, []);

    // update the state on window resize
    const onResizeHandler = () => {
        const sm = window.innerWidth >= 640;
        const md = window.innerWidth >= 768;
        const lg = window.innerWidth >= 1024;
        const xl = window.innerWidth >= 1280;
        const xxl = window.innerWidth >= 1536;

        console.log(sm, md, lg, xl, xxl);
        setState({
            sm,
            md,
            lg,
            xl,
            xxl,
        });
    };

    // add event listener
    const Setup = () => {
        window.addEventListener("resize", onResizeHandler, false);
    };

    // remove the listener
    const Cleanup = () => {
        window.removeEventListener("resize", onResizeHandler, false);
    };

    return state;
};
