import { addLabel, deleteLabel, updateLabel } from '@/api/workSpace'
import LabelPicker from '@/components/common/LabelPicker/LabelPicker'
import { useI18n } from '@/contexts/i18n/i18nProvider'
import useDebounce from '@/hooks/useDebounce'
import { WorkSpaceType } from '@/types/WorkSpaceType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Divider, Input, List, message, Space } from 'antd'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface WorkspaceLabelProps {
    workspace: WorkSpaceType
}
function WorkspaceLabel({
    workspace
}: WorkspaceLabelProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split("/")[1]);
    const queryClient = useQueryClient()

    const [labelList, setLabelList] = useState(workspace.labels)
    const [labelSearch, setLabelSearch] = useState('')
    const labelSearchDebounce = useDebounce(labelSearch, 500)

    useEffect(() => {
        if (labelSearchDebounce) {
            setLabelList(workspace.labels.filter(label => label.name.toLowerCase().includes(labelSearchDebounce.toLowerCase())))
        } else {
            setLabelList(workspace.labels)
        }
    }, [labelSearchDebounce, workspace.labels])

    const deleteLabelMutation = useMutation({
        mutationFn: async (labelId: number) => {
            await deleteLabel(workspace.id, labelId)
            message.success(i18n.Message['Label deleted successfully'])
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace', workspace.id],
            })
        }
    })

    const addLabelMutation = useMutation({
        mutationFn: async (values: {
            name: string;
            color: string;
        }) => {
            await addLabel(workspace.id, values.name, values.color)
            message.success(i18n.Message['Label added successfully'])
            return {
                name: values.name,
                color: values.color
            }
        },
        onSuccess: (data) => {
            console.log(data)
            queryClient.invalidateQueries({
                queryKey: ['workspace', workspace.id],
            })
        }
    })

    const updateLabelMutation = useMutation({
        mutationFn: async (values: {
            id: number;
            name: string;
            color: string;
        }) => {
            await updateLabel(workspace.id, values.id, values.name, values.color)
            message.success(i18n.Message['Label updated successfully'])
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace', workspace.id],
            })
        }
    })

    return (
        <Space direction='vertical' className='w-full'>
            <Input
                placeholder={i18n.Common['Search']}
                style={{ width: '100%' }}
                value={labelSearch}
                onChange={(e) => setLabelSearch(e.target.value)}
            />
            <div style={{ overflowY: "auto", overflowX: 'hidden' }} className='max-h-96'>
                <List
                    size='small'
                    dataSource={labelList}
                    split={false}
                    renderItem={item => (
                        <List.Item>
                            <LabelPicker
                                value={item}
                                onDelete={(labelId) => {
                                    deleteLabelMutation.mutate(labelId)
                                }}
                                onSave={(item) => {
                                    updateLabelMutation.mutate({
                                        id: item.id,
                                        name: item.name,
                                        color: item.color
                                    })
                                }}
                            />
                        </List.Item>
                    )}
                />
            </div>
            <Divider />
            <LabelPicker
                onSave={(item) => {
                    addLabelMutation.mutate({
                        name: item.name,
                        color: item.color
                    })
                }}
            >
                <Button variant='filled' color='default' className='w-full'
                    loading={addLabelMutation.isPending}
                >
                    {i18n.Common['Add label']}
                </Button>
            </LabelPicker>
        </Space>
    )
}

export default WorkspaceLabel