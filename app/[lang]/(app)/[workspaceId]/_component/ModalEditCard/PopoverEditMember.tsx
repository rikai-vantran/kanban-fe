import { useI18n } from '@/contexts/i18n/i18nProvider';
import useDebounce from '@/hooks/useDebounce';
import { ProfileType } from '@/types/ProfileType';
import { Avatar, Button, Checkbox, Divider, Input, Row, Space, Typography } from 'antd';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'

interface PopoverEditMemberProps {
    members: ProfileType[];
    selected: ProfileType[];
    onSaved?: (items: ProfileType[]) => void;
}
function PopoverEditMember({
    members,
    selected,
    onSaved
}: PopoverEditMemberProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);

    const [searchMember, setSearchMember] = React.useState<string>('');
    const searchMemberDebounce = useDebounce(searchMember, 500);
    const [filteredMembers, setFilteredMembers] = React.useState<ProfileType[]>(members);
    const [selectedMembers, setSelectedMembers] = React.useState<ProfileType[]>(selected);

    useEffect(() => {
        setFilteredMembers(members.filter((member) => member.name.toLowerCase().includes(searchMemberDebounce.toLowerCase())));
    }, [searchMemberDebounce])

    return (
        <Space direction='vertical' className='w-64'>
            <Input
                placeholder={i18n.Common['Search']}
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
            />
            <Typography.Text>{i18n.Common['Label']}</Typography.Text>
            <div className='max-h-64 overflow-y-auto flex flex-col gap-2'>
                {filteredMembers.map((member) => (
                    <Checkbox key={member.id}
                        style={{ width: '100%' }}
                        checked={selectedMembers.some((selected) => selected.id === member.id)} onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member]);
                            } else {
                                setSelectedMembers(selectedMembers.filter((selected) => selected.id !== member.id));
                            }
                        }}
                    >
                        <Space>
                            <Avatar src={member.profile_pic.avatar === '' ? "/images/no_avatar.png" : member.profile_pic.avatar} />
                            <div className='flex flex-col'>
                                <Typography.Text style={{ marginBottom: 0 }}>{member.name}</Typography.Text>
                                <Typography.Text type='secondary'>{member.email}</Typography.Text>
                            </div>
                        </Space>
                    </Checkbox>
                ))}
            </div>
            <Divider style={{ margin: 0 }} />
            <Row justify='end'>
                <Button
                    variant='filled' color='primary'
                    onClick={() => {
                        onSaved?.(selectedMembers)
                    }}>{i18n.Common['Save']}</Button>
            </Row>
        </Space>
    )
}

export default PopoverEditMember