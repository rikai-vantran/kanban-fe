import React from 'react'

interface RenderIfProps {
    condition: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
}
function RenderIf({ condition, children, style }: RenderIfProps) {
    return condition ? (
        <div style={style}>
            {children}
        </div>
    ) : null
}

export default RenderIf