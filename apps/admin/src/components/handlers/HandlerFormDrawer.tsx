import type { ReactNode } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
} from "@arco-design/web-react";
import { EscortLevelBadge } from "@/components/EscortLevelBadge";
import { ESCORT_LEVELS } from "@/constants/escort-level";
import { REGION_MAP } from "@/constants/labels";
import { formatClubOptionLabel } from "@/lib/club-labels";
import type { ClubRow, HandlerRow } from "@/lib/api";

const DRAWER_WIDTH = 520;

export type HandlerFormValues = {
  name: string;
  level: HandlerRow["level"];
  region: HandlerRow["region"];
  serviceType: HandlerRow["serviceType"];
  gender: HandlerRow["gender"];
  online: boolean;
  clubId: string;
  realName: string;
  idNumber: string;
  phone: string;
  wechat: string;
  alipay: string;
  username: string;
  password: string;
  displayName: string;
};

type HandlerFormDrawerProps = {
  visible: boolean;
  editing: HandlerRow | null;
  entityLabel: string;
  levelFieldLabel: string;
  serviceType: HandlerRow["serviceType"];
  clubs: ClubRow[];
  saving: boolean;
  form: ReturnType<typeof Form.useForm<HandlerFormValues>>[0];
  onClose: () => void;
  onSave: () => void;
};

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="handler-form-drawer__section">
      <Typography.Title heading={6} className="handler-form-drawer__section-title">
        {title}
      </Typography.Title>
      {children}
    </section>
  );
}

export function HandlerFormDrawer({
  visible,
  editing,
  entityLabel,
  levelFieldLabel,
  serviceType,
  clubs,
  saving,
  form,
  onClose,
  onSave,
}: HandlerFormDrawerProps) {
  const isCreate = !editing;

  return (
    <Drawer
      width={DRAWER_WIDTH}
      className="handler-form-drawer"
      title={editing ? `编辑${entityLabel} · ${editing.name}` : `新建${entityLabel}`}
      visible={visible}
      onCancel={onClose}
      unmountOnExit
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={onSave}>
            {isCreate ? "创建" : "保存"}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" className="handler-form-drawer__form">
        <FormSection title="接单档案">
          <Form.Item label="昵称" field="name" rules={[{ required: true, message: "请输入昵称" }]}>
            <Input placeholder="对外展示的打手昵称" />
          </Form.Item>
          <Form.Item label={levelFieldLabel} field="level" rules={[{ required: true }]}>
            <Radio.Group className="escort-level-radio-group">
              {ESCORT_LEVELS.map((level) => (
                <Radio key={level} value={level} className="escort-level-radio">
                  <EscortLevelBadge level={level} />
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="大区" field="region" rules={[{ required: true }]}>
            <Select>
              {Object.entries(REGION_MAP).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="性别" field="gender" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="所属俱乐部" field="clubId" rules={[{ required: true }]}>
            <Select
              options={clubs.map((club) => ({
                label: formatClubOptionLabel(club),
                value: club.id,
                disabled: !club.enabled,
              }))}
            />
          </Form.Item>
          <Form.Item label="在线" field="online" triggerPropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item field="serviceType" hidden>
            <Input />
          </Form.Item>
        </FormSection>

        <FormSection title="实名信息">
          <Form.Item
            label="真实姓名"
            field="realName"
            rules={[{ required: true, message: "请输入真实姓名" }]}
          >
            <Input placeholder="与身份证一致" />
          </Form.Item>
          <Form.Item
            label="身份证号"
            field="idNumber"
            rules={[
              { required: true, message: "请输入身份证号" },
              { minLength: 15, message: "身份证号格式不正确" },
            ]}
          >
            <Input placeholder="15 或 18 位" maxLength={18} />
          </Form.Item>
          <Form.Item
            label="手机号"
            field="phone"
            rules={[
              { required: true, message: "请输入手机号" },
              { minLength: 11, message: "手机号至少 11 位" },
            ]}
          >
            <Input placeholder="联系手机号" />
          </Form.Item>
        </FormSection>

        <FormSection title="结算账号">
          <Form.Item
            label="微信账号"
            field="wechat"
            rules={[{ required: true, message: "请输入微信账号" }]}
          >
            <Input placeholder="微信号或绑定手机号" />
          </Form.Item>
          <Form.Item
            label="支付宝账号"
            field="alipay"
            rules={[{ required: true, message: "请输入支付宝账号" }]}
          >
            <Input placeholder="支付宝登录账号" />
          </Form.Item>
        </FormSection>

        <FormSection title="后台登录">
          {isCreate ? (
            <>
              <Form.Item
                label="登录账号"
                field="username"
                rules={[
                  { required: true, message: "请输入后台登录账号" },
                  { minLength: 2, message: "至少 2 个字符" },
                ]}
              >
                <Input placeholder="打手登录后台使用的用户名" autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="登录密码"
                field="password"
                rules={[
                  { required: true, message: "请输入登录密码" },
                  { minLength: 6, message: "至少 6 位" },
                ]}
              >
                <Input.Password placeholder="初始密码" autoComplete="new-password" />
              </Form.Item>
              <Form.Item label="后台昵称" field="displayName">
                <Input placeholder={`默认使用接单昵称「${serviceType === "escort" ? "护航" : "陪玩"}档案中的昵称」`} />
              </Form.Item>
            </>
          ) : editing?.adminUsername ? (
            <div className="handler-form-drawer__account-readonly">
              <div className="handler-form-drawer__account-row">
                <span className="handler-form-drawer__account-label">登录账号</span>
                <span>{editing.adminUsername}</span>
              </div>
              <div className="handler-form-drawer__account-row">
                <span className="handler-form-drawer__account-label">后台昵称</span>
                <span>{editing.adminDisplayName || editing.name}</span>
              </div>
              <Typography.Paragraph type="secondary" className="handler-form-drawer__account-hint">
                后台账号在创建时绑定，如需修改请前往「系统 · 员工管理」
              </Typography.Paragraph>
            </div>
          ) : (
            <Typography.Paragraph type="secondary" className="handler-form-drawer__account-hint">
              未找到关联后台账号，请重启 API 服务完成数据迁移，或联系管理员处理。
            </Typography.Paragraph>
          )}
        </FormSection>
      </Form>
    </Drawer>
  );
}

export function emptyHandlerForm(serviceType: HandlerRow["serviceType"]): HandlerFormValues {
  return {
    name: "",
    level: "rookie",
    region: "pc",
    serviceType,
    gender: "male",
    online: false,
    clubId: "club_platform",
    realName: "",
    idNumber: "",
    phone: "",
    wechat: "",
    alipay: "",
    username: "",
    password: "",
    displayName: "",
  };
}

export function handlerRowToForm(row: HandlerRow): HandlerFormValues {
  return {
    name: row.name,
    level: row.level,
    region: row.region,
    serviceType: row.serviceType,
    gender: row.gender,
    online: row.online,
    clubId: row.clubId,
    realName: row.realName ?? "",
    idNumber: row.idNumber ?? "",
    phone: row.phone ?? "",
    wechat: row.wechat ?? "",
    alipay: row.alipay ?? "",
    username: "",
    password: "",
    displayName: "",
  };
}
