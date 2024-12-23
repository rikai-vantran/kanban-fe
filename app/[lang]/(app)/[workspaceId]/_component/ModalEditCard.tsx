import { useI18n } from '@/contexts/i18n/i18nProvider';
import { CardType } from '@/types/WorkSpaceType';
import { PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, message, Modal, Row, Space, Typography, Upload } from 'antd';
import { usePathname } from 'next/navigation';
import React from 'react';

interface Props {
    card: CardType;
    open: boolean;
    onCancel: () => void;
}
function ModalEditCard({
    card,
    open,
    onCancel
}: Props) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);

    console.log('ModalEditCard', open)
    return (
        <Modal
            destroyOnClose={true}
            open={open}
            onCancel={() => {
                console.log('onCancel')
                onCancel();
            }}
            footer={null}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                    width: "100%",
                }}
            >
                <Typography.Title level={4}>{i18n.Card['Edit card']}</Typography.Title>
                <Form
                    style={{
                        width: "100%",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        scrollbarWidth: 'none',
                    }}
                    layout="vertical"
                    onFinish={async (values) => {
                        // await updateWorkspaceMutation.mutate({
                        //     name: values.name,
                        //     icon_unified: emoji
                        // })
                        message.success(i18n.Message['Workspace updated successfully']);
                        onCancel();
                    }}
                >
                    <Form.Item className="flex-1" label={i18n.Card['Edit card title']} initialValue={card.name} name={'name'} rules={[
                        {
                            required: true,
                            message: i18n.Message['Please enter the card title'],
                        },
                    ]}>
                        <Input />
                    </Form.Item>
                    <Row className='w-full'>
                        <Form.Item className="flex-1" label={i18n.Card['Edit card description']} initialValue={card.description} name={'description'} rules={[
                            {
                                required: true,
                                message: i18n.Message['Please enter the card description'],
                            },
                        ]}>
                            <Input.TextArea autoSize={false} rows={4} />
                        </Form.Item>
                        <Form.Item className="flex-0" style={{marginLeft: 16}} label={'Image'} initialValue={card.image} name={'image'}>
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                            // beforeUpload={beforeUpload}
                            // onChange={handleChange}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Row>
                    <Form.Item className="flex-1" label={i18n.Card['Assign to']} initialValue={card.assigns} name={'assigns'}>
                        <Input />
                    </Form.Item>
                    <Form.Item layout='horizontal'
                        label={i18n.Card['Edit card due date']} name={'due_date'}
                        labelAlign='left'
                    >
                        <DatePicker type='date' />
                    </Form.Item>
                    <Row justify='end'>
                        <Button type='primary' htmlType='submit'
                        // loading={updateWorkspaceMutation.isPending}
                        >
                            Save
                        </Button>
                    </Row>
                </Form>
            </Space>
        </Modal>
    )
}

export default React.memo(ModalEditCard, (prevProps, nextProps) => {
    return prevProps.open === nextProps.open;
})