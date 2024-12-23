import { deleteWorkspace } from "@/api/workSpace";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal, Space, Typography } from "antd";
import { usePathname } from "next/navigation";

interface DeleteWorkspaceModalProps {
    open: boolean;
    workspaceId: string;
    workspaceName: string;
    onCancel: () => void;
}

export const DeleteWorkspaceModal = ({
    open,
    onCancel,
    workspaceId,
    workspaceName,
}: DeleteWorkspaceModalProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const queryClient = useQueryClient();

    const handleDelete = useMutation({
        mutationFn: async () => {
            await deleteWorkspace(workspaceId);
            message.success(i18n.Message['Workspace deleted successfully']);
            onCancel();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspacesOwner'],
            })
        }
    })

    return (
        <Modal
            open={open}
            onCancel={() => {
                onCancel();
            }}
            footer={null}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                }}
            >
                <Typography.Title level={4}>{i18n.Workspace['Delete workspace']}</Typography.Title>
                <Typography.Text type="secondary">
                    {i18n.Workspace['Delete Workspace description']}{". "}
                    <Typography.Text type="danger">
                        {workspaceName}
                    </Typography.Text>
                </Typography.Text>
                <Form
                    layout="vertical"
                    onFinish={async () => {
                        handleDelete.mutate()
                    }}
                >
                    <Form.Item
                        name={'name'}
                        rules={[
                            {
                                required: true,
                                message: i18n.Message['Please enter the workspace name'],
                            },
                            {
                                validator: (rule, value) => {
                                    if (value !== workspaceName) {
                                        return Promise.reject(
                                            i18n.Message['Workspace name does not match'],
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Space>
                            <Button
                                type="default"
                                onClick={() => {
                                    onCancel();
                                }}
                            >
                                {i18n.Common['Cancel']}
                            </Button>
                            <Button type="primary" htmlType="submit" danger
                                loading={handleDelete.isPending}
                            >
                                {i18n.Common['Delete']}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    );
};
