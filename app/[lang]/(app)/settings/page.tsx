'use client'
import { getAvatars, getProfile, updateProfile } from '@/api/profile'
import { useI18n } from '@/contexts/i18n/i18nProvider'
import { useTheme } from '@/contexts/Theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Divider, Form, Input, Layout, Row, Select, Space, Spin, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'
import useToken from 'antd/es/theme/useToken'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

function Settings() {
    const pathName = usePathname();
    const lang = pathName.split("/")[1];
    const i18n = useI18n(lang);
    const token = useToken()
    const router = useRouter()
    const { themeApp, setThemeApp } = useTheme()
    const queryClient = useQueryClient()

    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return getProfile()
        }
    })
    const avatarsQuery = useQuery({
        queryKey: ['avatars'],
        queryFn: async () => {
            return getAvatars()
        }
    })

    const updateProfileMutation = useMutation({
        mutationKey: ['updateProfile'],
        mutationFn: async ({ name, profile_pic }: {
            name?: string;
            profile_pic?: number;
        }) => {
            return updateProfile(name, profile_pic)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user']
            })
        }
    })

    if (userQuery.isLoading && avatarsQuery.isLoading) {
        return (
            <div className='flex h-full w-full justify-center items-center'>
                <Spin size='large' />
            </div>
        )
    }

    return (
        <Layout style={{ background: token[1].colorBgElevated, width: '100%', paddingTop: 16, paddingBottom: 16, minHeight: '100%' }}>
            <Space direction='vertical' style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Row justify={"start"} align={"middle"} className={cn('max-w-[825px] flex-1 md:w-4/5 mx-4 md:mx-auto')}>
                    <Typography.Title level={2}>{i18n.Common['Settings']}</Typography.Title>
                </Row>
                <Content className={cn('max-w-[825px] flex-1 md:w-4/5 mx-4 md:mx-auto')}>
                    <Space direction='vertical' size={'large'} className='w-full'>
                        <div className='rounded-lg' style={{
                            borderWidth: 1,
                            borderColor: token[3].colorBorder,
                            borderStyle: 'solid',
                        }}>
                            <Space direction='vertical' className={cn('p-4  w-full')}>
                                <Typography.Title level={5}>{i18n.Common['Profile picture']}</Typography.Title>
                                <Space direction='horizontal' size={'large'} style={{
                                    alignItems: 'start',
                                }}>
                                    <div className={cn('flex-1 w-24')}>
                                        <Image
                                            src={(userQuery.data === undefined || userQuery.data.profile_pic.avatar === '') ? "/images/no_avatar.png" : userQuery.data.profile_pic.avatar}
                                            alt="User avatar" width={96} height={96}
                                            className="rounded-full"
                                        />
                                    </div>
                                    <Row wrap style={{
                                        gap: 8,
                                    }}>
                                        {
                                            avatarsQuery.data?.payload.map((avatar) => {
                                                return (
                                                    <motion.div key={avatar.id}
                                                        whileHover={{
                                                            borderColor: token[3].colorPrimary,
                                                        }}
                                                        whileTap={{ scale: 0.95 }}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderWidth: 2,
                                                            borderColor: token[3].colorBgElevated,
                                                            borderRadius: '50%',
                                                        }}
                                                        onClick={() => {
                                                            console.log(avatar.id)
                                                            updateProfileMutation.mutate({
                                                                profile_pic: avatar.id
                                                            })
                                                        }}
                                                    >
                                                        <Image
                                                            src={avatar.avatar}
                                                            alt={avatar.name} width={52} height={52}
                                                            className="rounded-full"
                                                        />
                                                    </motion.div>
                                                )
                                            })
                                        }
                                    </Row>
                                </Space>
                            </Space>
                            <Divider type='horizontal' style={{ margin: 0 }} />
                            <Space direction='vertical' className={cn('p-4  w-full')}>
                                <Typography.Title level={5}>{i18n.Common['Account']}</Typography.Title>
                                <Form labelAlign='left' labelCol={{
                                    span: 4,
                                }}
                                    onFinish={(values) => {
                                        updateProfileMutation.mutate({
                                            name: values.name,
                                        })
                                    }}
                                >
                                    <Form.Item label={i18n.Common['Name']} initialValue={userQuery.data?.name} name={'name'}>
                                        <Input />
                                    </Form.Item>
                                    <Row justify='end'>
                                        <Button type='primary' htmlType='submit' loading={updateProfileMutation.isPending}>Save</Button>
                                    </Row>
                                </Form>
                            </Space>
                        </div>
                        <div className='rounded-lg' style={{
                            borderWidth: 1,
                            borderColor: token[3].colorBorder,
                            borderStyle: 'solid',
                        }}>
                            <Space direction='vertical' className={cn('p-4  w-full')}>
                                <Typography.Title level={5}>{i18n.Common['Appearance']}</Typography.Title>
                                <Form labelAlign='left' labelCol={{
                                    span: 4,
                                }}>
                                    <Form.Item label={i18n.Common['Theme']}>
                                        <Row justify={'end'}>
                                            <Select defaultValue={themeApp}
                                                onChange={(value) => {
                                                    setThemeApp(value)
                                                }}
                                            >
                                                <Select.Option value="light">{i18n.Common['Light mode']}</Select.Option>
                                                <Select.Option value="dark">{i18n.Common['Dark mode']}</Select.Option>
                                            </Select>
                                        </Row>
                                    </Form.Item>
                                    <Form.Item label={i18n.Language['Language']}>
                                        <Row justify={'end'}>
                                            <Select defaultValue={lang}
                                                onChange={(value) => {
                                                    router.push(`/${value}/settings`)
                                                }}
                                            >
                                                <Select.Option value="vi">{i18n.Language['vi']}</Select.Option>
                                                <Select.Option value="en">{i18n.Language['en']}</Select.Option>
                                            </Select>
                                        </Row>
                                    </Form.Item>
                                </Form>
                            </Space>
                        </div>
                    </Space>
                </Content>
            </Space>
        </Layout>
    )
}

export default Settings


