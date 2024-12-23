"use client";
import { useAuth } from "@/contexts/Auth/AuthProvider";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import {
    loginFormSchema,
    LoginFormType,
} from "@/lib/schemaValidation/LoginFormSchema";
import { cn } from "@/lib/utils";
import {
    MailOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
    Flex,
    Form,
    Input,
    message,
    Row,
    Typography,
    Button
} from "antd";
import { createSchemaFieldRule } from "antd-zod";
import useToken from "antd/es/theme/useToken";
import Title from "antd/es/typography/Title";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LoginForm() {
    const pathName = usePathname();
    const lang = pathName.split('/')[1];
    const i18n = useI18n(lang);
    const token = useToken();
    const { Item } = Form;
    const [form] = Form.useForm();
    const rule = createSchemaFieldRule(loginFormSchema);
    const { signIn } = useAuth();

    const handleSubmit = useMutation({
        mutationFn: async (values: LoginFormType) => {
            try {
                await signIn(values.username, values.password);
                message.success(i18n.Message["Login successful"]);
            } catch (error: any) {
                message.error(error.message);
            }
        }
    })

    return (
        <div
            className={cn(
                `w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0`,
                {},
            )}
            style={{
                backgroundColor: token[3].colorBgContainer,
                borderColor: token[3].colorBorder,
                borderWidth: 1,
                borderStyle: "solid",
            }}
        >
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <Row justify={"space-between"}>
                    <Title level={2}>{i18n.Common['Sign in']}</Title>
                    <Flex vertical align="flex-start" justify="flex-start">
                        <Typography.Text type="secondary">
                            {i18n.LoginForm['No account?']}
                        </Typography.Text>
                        <Link href={`/${lang}/register`}>
                            {i18n.Common['Register']}
                        </Link>
                    </Flex>
                </Row>
                <Form form={form} layout="vertical" onFinish={(values) => {
                    handleSubmit.mutate(values);
                }}>
                    <Item label={i18n.Common['Username']} name="username" rules={[rule]}>
                        <Input
                            placeholder={i18n.Common['Username']}
                            prefix={<MailOutlined />}
                            size="large"
                        />
                    </Item>
                    <Item label={i18n.Common['Password']} name="password" rules={[rule]}>
                        <Input.Password placeholder={i18n.Common['Password']} size="large" />
                    </Item>
                    <Row justify={"end"} className="-mt-4 mb-4">
                        <Typography.Link
                            href="/auth/forgot-password"
                            type="secondary"
                        >
                            {i18n.LoginForm['Forgot password?']}
                        </Typography.Link>
                    </Row>
                    <Row justify={"end"}>
                        <Item>
                            <Button
                                variant="solid"
                                color="primary"
                                htmlType="submit"
                                loading={handleSubmit.isPending}
                            >
                                {i18n.Common['Sign in']}
                            </Button>
                        </Item>
                    </Row>
                </Form>
            </div>
        </div>
    );
}

export default LoginForm;
