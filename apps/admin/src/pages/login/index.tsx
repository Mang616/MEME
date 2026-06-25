import { Alert, Button, Card, Form, Input, Message, Typography } from "@arco-design/web-react";
import { IconLock, IconUser } from "@arco-design/web-react/icon";
import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getDevCredentials, isAuthenticated, login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mock = getDevCredentials();
  const fromQuery = searchParams.get("from");
  const fromState = (location.state as { from?: string } | null)?.from;
  const from = fromQuery || fromState || "/orders";

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(values: { username: string; password: string }) {
    setLoading(true);
    setError("");
    try {
      await login(values.username.trim(), values.password);
      Message.success("登录成功");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "登录失败";
      setError(message);
      Message.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card" bordered={false}>
        <Typography.Title heading={4} style={{ marginTop: 0 }}>
          迷因电竞 · 运营后台
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          开发环境账号：{mock.username} / {mock.password}
        </Typography.Paragraph>
        {error ? (
          <Alert type="error" content={error} style={{ marginBottom: 16 }} />
        ) : null}
        <Form layout="vertical" onSubmit={handleSubmit} autoComplete="off">
          <Form.Item
            label="账号"
            field="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input prefix={<IconUser />} placeholder="admin" />
          </Form.Item>
          <Form.Item
            label="密码"
            field="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password prefix={<IconLock />} placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" long loading={loading}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
