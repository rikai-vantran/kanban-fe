import { addTask, deleteTask, updateTask } from '@/api/card';
import TextEditable from '@/components/common/TextEditable/TextEditable';
import { useI18n } from '@/contexts/i18n/i18nProvider';
import { TaskType } from '@/types/WorkSpaceType';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Progress, Row, Select, Space } from 'antd';
import useToken from 'antd/es/theme/useToken';
import { usePathname } from 'next/navigation';
import React from 'react';

interface TasksProps {
    tasks: TaskType[];
    cardId: string;
    workspaceId: string;
    columnId: string;
}
function Tasks({
    tasks,
    cardId,
    workspaceId,
    columnId
}: TasksProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const queryClient = useQueryClient();
    const token = useToken();

    const [taskStatus, setTaskStatus] = React.useState<boolean>(false);
    const [taskAddContent, setTaskAddContent] = React.useState('');

    const addTaskMutation = useMutation({
        mutationKey: ['addTask', cardId],
        mutationFn: async (values: {
            content: string;
            status: boolean;
        }) => {
            await addTask(workspaceId, columnId, cardId, values.content, values.status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['card', cardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId],
            })
        }
    })
    const editTaskMutation = useMutation({
        mutationKey: ['editTask', cardId],
        mutationFn: async (values: {
            content: string;
            status: boolean;
            task_id: number;
        }) => {
            await updateTask(workspaceId, columnId, cardId, values.task_id, values.content, values.status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['card', cardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId],
            })
        }
    })
    const deleteTaskMutation = useMutation({
        mutationKey: ['deleteTask', cardId],
        mutationFn: async (values: {
            task_id: number;
        }) => {
            await deleteTask(workspaceId, columnId, cardId, values.task_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['card', cardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId],
            })
        }
    })

    return (
        <Space direction='vertical' className='w-full'>
            {
                tasks.length > 0 && (
                    <Progress
                        percent={tasks.filter((task) => task.status).length / tasks.length * 100}/>
                )
            }
            <Row className='w- gap-2'>
                <Input
                    className='flex-1'
                    placeholder={i18n.Card['Task content']}
                    value={taskAddContent}
                    onChange={(e) => {
                        setTaskAddContent(e.target.value);
                    }}
                />
                <Select
                    style={{ width: 120 }}
                    defaultValue={taskStatus}
                    options={[
                        { label: i18n.Common['Done'], value: true },
                        { label: i18n.Common['Not done'], value: false }
                    ]}
                    onChange={(value) => {
                        setTaskStatus(value);
                    }}
                />
                <Button variant='filled' color='primary'
                    onClick={() => {
                        addTaskMutation.mutate({
                            content: taskAddContent,
                            status: taskStatus
                        });
                        setTaskAddContent('');
                        setTaskStatus(false);
                    }}
                >
                    {i18n.Card['Add task']}
                </Button>
            </Row>
            <div className='max-h-64 overflow-y-auto flex flex-col gap-2 ml-4'>
                {tasks.map((task) => (
                    <Row key={task.id} className='w-full gap-2'>
                        <Checkbox
                            checked={task.status}
                            onChange={(e) => {
                                editTaskMutation.mutate({
                                    content: task.content,
                                    status: e.target.checked,
                                    task_id: task.id
                                });
                            }}
                        />
                        <TextEditable
                            text={task.content}
                            onSave={(text) => {
                                console.log('save', text);
                                editTaskMutation.mutate({
                                    content: text,
                                    status: task.status,
                                    task_id: task.id
                                });
                            }}
                            onDiscard={() => { 
                                console.log('discard');
                                deleteTaskMutation.mutate({
                                    task_id: task.id
                                });
                            }}
                        />
                    </Row>
                ))}
            </div>
        </Space>
    )
}

export default Tasks