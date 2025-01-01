import { useI18n } from '@/contexts/i18n/i18nProvider';
import useDebounce from '@/hooks/useDebounce';
import { LabelType } from '@/types/WorkSpaceType'
import { Button, Checkbox, Divider, Input, Row, Space, Typography } from 'antd';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'

interface PopoverEditLabelProps {
    labels: LabelType[];
    selected: LabelType[];
    onSaved?: (selectedLabels: LabelType[]) => void;
}
function PopoverEditLabel({
    labels,
    selected,
    onSaved
}: PopoverEditLabelProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);

    const [searchLabel, setSearchLabel] = React.useState<string>('');
    const searchLabelDebounce = useDebounce(searchLabel, 500);
    const [filteredLabels, setFilteredLabels] = React.useState<LabelType[]>(labels);
    const [selectedLabels, setSelectedLabels] = React.useState<LabelType[]>(selected);

    useEffect(() => {
        setFilteredLabels(labels.filter((label) => label.name.toLowerCase().includes(searchLabelDebounce.toLowerCase())));
    }, [searchLabelDebounce])

    return (
        <Space direction='vertical' className='w-64'>
            <Input
                placeholder={i18n.Common['Search']}
                value={searchLabel}
                onChange={(e) => setSearchLabel(e.target.value)}
            />
            <Typography.Text>{i18n.Common['Label']}</Typography.Text>
            <div className='max-h-64 overflow-y-auto flex flex-col gap-2'>
                {filteredLabels.map((label) => (
                    <Checkbox key={label.id}
                        style={{ width: '100%' }}
                        checked={selectedLabels.some((selected) => selected.id === label.id)} onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedLabels([...selectedLabels, label]);
                            } else {
                                setSelectedLabels(selectedLabels.filter((selected) => selected.id !== label.id));
                            }
                        }}
                    >
                        <div style={{
                            backgroundColor: label.color,
                            width: '100%',
                            padding: '0px 8px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: 20
                        }}>
                            <div className='w-full flex justify-between items-center'>
                                <Typography.Text style={{
                                    color: 'white',
                                    textShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)'
                                }}>
                                    {label.name}
                                </Typography.Text>
                            </div>
                        </div>
                    </Checkbox>
                ))}
            </div>
            <Divider style={{margin: 0}}/>
            <Row justify='end'>
                <Button
                    variant='filled' color='primary'
                onClick={() => {
                    onSaved?.(selectedLabels)
                }}>{i18n.Common['Save']}</Button>
            </Row>
        </Space>
    )
}

export default PopoverEditLabel