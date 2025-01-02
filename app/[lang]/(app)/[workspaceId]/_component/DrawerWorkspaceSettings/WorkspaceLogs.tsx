import { useI18n } from "@/contexts/i18n/i18nProvider";
import { WorkSpaceType } from "@/types/WorkSpaceType";
import {Button, DatePicker, Divider, Dropdown, List, message, Space, Tag, Typography} from "antd";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import VirtualList from "rc-virtual-list";
import { filterByDate, logspaginationWorkspace } from "@/api/workSpace";

interface WorkspaceLogsProps { workspace: WorkSpaceType }
function WorkspaceLogs({ workspace }: WorkspaceLogsProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const [data, setData] = useState<any>([]);
    const [value, setValue] = useState("all");
    const ContainerHeight = 400;
    const [size, setSize] = useState(0);
    const [page_current, setPageCurrent] = useState(1);
    const limit = 10;
    const [dateRange, setDateRange] = useState(null);


    const appendData = async (showMessage = true) => {
        const rs = (await logspaginationWorkspace(workspace.id, page_current, limit, value )) as { size: number; data: any[] };
        if (page_current > rs.size / limit + 1) return;
        console.log(rs.size, size);
        setPageCurrent(page_current + 1);
        setData(data.concat(rs.data));
        showMessage && message.success(`${rs.data.length} more items loaded!`);
    };

    
    const getSize = async () => {
        const rs = (await logspaginationWorkspace(workspace.id, 1, 10,value)) as {
            size: number;
            data: any[];
        };
        setSize(rs.size as any);
    };

    async function filterBydate(
        id: string,
        start_date: string,
        end_date: string,
    ) {
        if (start_date === "" || end_date === "") {
            return;
        }
        if (start_date > end_date) {
            message.error("Start date must be less than end date");
            return;
        }

        if (start_date === end_date) {
            message.error("Start date must be different from end date");
            return;
        }
        const rs = await filterByDate(id, start_date, end_date);
        setData(rs);
    }


    useEffect(() => { getSize();}, [value]);
    useEffect(() => {appendData(false);}, [value]);

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (Math.abs( e.currentTarget.scrollHeight - e.currentTarget.scrollTop - ContainerHeight ) <= 1
            && page_current*limit < size+limit)
            appendData();
    };
    return (
        <Space direction="vertical" className="w-full">
            <Typography.Text strong>{i18n.Common["Filter"]}</Typography.Text>
            <Dropdown
                menu={{
                    items: [
                        { key: "all", label: "all" },
                        { key: "create", label: "create" },
                        { key: "delete", label: "delete" },
                        { key: "move", label: "move" },
                    ],
                    onClick: (e) => {
                        setValue(e.key);
                        setData([]);
                        setPageCurrent(1);
                        setDateRange(null);
                    }
                }}
            >
                <Button>
                    <Space>
                        {value}
                        <DownOutlined />
                    </Space>
                </Button>
            </Dropdown>

            <DatePicker.RangePicker
                value={dateRange}
                onChange={(date, dateString) => {
                    setDateRange(date);
                    setData([]);
                    filterBydate(workspace.id, dateString[0], dateString[1]);
                }}
            />

            <Divider type="horizontal" />
            {data?.length === 0 && (
                <Typography.Title type="secondary" level={5} className="text-center">
                    Data not found
                 </Typography.Title>
            )}
            <List>
                <VirtualList
                    data={data}
                    height={ContainerHeight}
                    itemHeight={47}
                    itemKey="id"
                    onScroll={onScroll}
                >
                    {(item: any, index: number) => (
                        <List.Item>
                            <List.Item.Meta
                                className="mr-4"
                                description={dayjs(item.date).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                )}
                                title={
                                    <Space className="text-md">
                                        <Typography.Text>
                                            {index + 1}. {item.log}
                                        </Typography.Text>
                                        <Tag
                                            color={
                                                item.type === "delete"
                                                    ? "orange"
                                                    : item.type === "create"
                                                    ? "green"
                                                    : "red"
                                            }
                                        >
                                            {item.type}
                                        </Tag>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                </VirtualList>
            </List>

        </Space>
    );
}

export default WorkspaceLogs;
