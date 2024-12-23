import { Tooltip } from 'antd';

interface TagComponentProps {
    tagname: string;
    color: string;
}
function TagComponent({
    tagname,
    color
}: TagComponentProps) {
    return (
        <Tooltip title={tagname}>
            <div
                style={{
                    backgroundColor: color,
                    color: '#fff',
                    height: 0,
                    borderRadius: '4px',
                    padding: '4px 0px',
                    cursor: 'pointer',
                    width: '52px',
                    overflow: 'hidden',
                }}
            />
        </Tooltip>
    )
}

export default TagComponent