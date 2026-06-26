/**
 * Admin API 冒烟测试：登录、Token、权限、核心 GET 接口
 * 用法: npm run smoke:admin-api --prefix apps/server
 */
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api";

type CaseResult = {
  name: string;
  ok: boolean;
  status?: number;
  detail?: string;
};

const results: CaseResult[] = [];

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
}

function fail(name: string, detail: string, status?: number) {
  results.push({ name, ok: false, detail, status });
}

async function fetchJson(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { response, payload };
}

async function login(username: string, password: string) {
  const { response, payload } = await fetchJson("/admin/auth/login", {
    method: "POST",
    body: { username, password },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${String(payload.message ?? payload.error)}`);
  }
  return payload.token as string;
}

async function expectStatus(
  name: string,
  path: string,
  expected: number,
  token?: string | null,
  method = "GET",
) {
  const { response, payload } = await fetchJson(path, { token, method });
  if (response.status === expected) {
    pass(name, `HTTP ${expected}`);
  } else {
    fail(name, `期望 ${expected}，实际 ${response.status} · ${String(payload.message ?? payload.error ?? "")}`, response.status);
  }
}

async function expectOk(name: string, path: string, token: string) {
  const { response, payload } = await fetchJson(path, { token });
  if (response.ok) {
    pass(name, `HTTP ${response.status}`);
  } else {
    fail(name, `${response.status} · ${String(payload.message ?? payload.error ?? "")}`, response.status);
  }
}

const SUPER_ADMIN_ENDPOINTS: { name: string; path: string }[] = [
  { name: "GET /admin/auth/me", path: "/admin/auth/me" },
  { name: "GET /admin/auth/session", path: "/admin/auth/session" },
  { name: "GET /admin/orders", path: "/admin/orders" },
  { name: "GET /admin/orders/dispatch", path: "/admin/orders/dispatch" },
  { name: "GET /admin/orders/hall", path: "/admin/orders/hall" },
  { name: "GET /admin/orders/after-sales", path: "/admin/orders/after-sales" },
  { name: "GET /admin/products", path: "/admin/products" },
  { name: "GET /admin/categories", path: "/admin/categories" },
  { name: "GET /admin/product-tags", path: "/admin/product-tags" },
  { name: "GET /admin/handlers", path: "/admin/handlers" },
  { name: "GET /admin/handlers/dispatchable", path: "/admin/handlers/dispatchable" },
  { name: "GET /admin/clubs", path: "/admin/clubs" },
  { name: "GET /admin/users", path: "/admin/users" },
  { name: "GET /admin/banners", path: "/admin/banners" },
  { name: "GET /admin/announcements", path: "/admin/announcements" },
  { name: "GET /admin/content-pages", path: "/admin/content-pages" },
  { name: "GET /admin/analytics/overview", path: "/admin/analytics/overview" },
  { name: "GET /admin/chats", path: "/admin/chats" },
  { name: "GET /admin/feedbacks", path: "/admin/feedbacks" },
  { name: "GET /admin/staff", path: "/admin/staff" },
  { name: "GET /admin/staff/roles", path: "/admin/staff/roles" },
  { name: "GET /admin/roles", path: "/admin/roles" },
  { name: "GET /admin/permissions", path: "/admin/permissions" },
  { name: "GET /admin/upload/status", path: "/admin/upload/status" },
  { name: "GET /admin/content-pages/vip-config", path: "/admin/content-pages/vip-config" },
  { name: "GET /admin/content-pages/vip-activity", path: "/admin/content-pages/vip-activity" },
  { name: "GET /admin/content-pages/coupons", path: "/admin/content-pages/coupons" },
  { name: "GET /admin/content-pages/register-activity", path: "/admin/content-pages/register-activity" },
  { name: "GET /admin/content-pages/invite-activity", path: "/admin/content-pages/invite-activity" },
];

const HANDLER_ENDPOINTS: { name: string; path: string; expect: number }[] = [
  { name: "打手 GET /admin/orders/mine", path: "/admin/orders/mine", expect: 200 },
  { name: "打手 GET /admin/orders/mine/watch", path: "/admin/orders/mine/watch", expect: 200 },
  { name: "打手 GET /admin/orders/hall", path: "/admin/orders/hall", expect: 200 },
  { name: "打手 GET /admin/orders（无权限）", path: "/admin/orders", expect: 403 },
  { name: "打手 GET /admin/staff（无权限）", path: "/admin/staff", expect: 403 },
  { name: "打手 GET /admin/products（无权限）", path: "/admin/products", expect: 403 },
];

async function main() {
  console.log(`[smoke-admin-api] target: ${API_BASE}`);

  try {
    await fetch(`${API_BASE}/admin/auth/session`);
  } catch {
    console.error("[smoke-admin-api] 无法连接 API，请先运行 npm run server:dev");
    process.exit(1);
  }

  // 登录错误提示
  {
    const { response, payload } = await fetchJson("/admin/auth/login", {
      method: "POST",
      body: { username: "admin", password: "wrong-password" },
    });
    if (response.status === 401 && payload.message) {
      pass("错误密码登录返回 401 + message", String(payload.message));
    } else {
      fail("错误密码登录返回 401 + message", `status=${response.status}`);
    }
  }

  {
    const { response } = await fetchJson("/admin/auth/login", {
      method: "POST",
      body: { username: "", password: "" },
    });
    if (response.status === 400) {
      pass("空账号登录返回 400");
    } else {
      fail("空账号登录返回 400", `status=${response.status}`);
    }
  }

  // 无 Token
  await expectStatus("无 Token 访问 /admin/orders → 401", "/admin/orders", 401, null);
  await expectStatus("无 Token 访问 /admin/auth/me → 401", "/admin/auth/me", 401, null);

  // 无效 Token
  await expectStatus("无效 Token → 401", "/admin/orders", 401, "meme.invalid.token");
  await expectStatus("旧版 dev-token → 401", "/admin/orders", 401, "dev-token");

  let adminToken: string;
  let handlerToken: string;

  try {
    adminToken = await login("admin", "admin123");
    pass("超管登录成功");
  } catch (err) {
    fail("超管登录成功", err instanceof Error ? err.message : String(err));
    printReport();
    process.exit(1);
  }

  try {
    handlerToken = await login("dashou", "dashou123");
    pass("打手 dashou 登录成功");
  } catch (err) {
    fail("打手 dashou 登录成功", err instanceof Error ? err.message : String(err));
    handlerToken = "";
  }

  // Token 有效性
  {
    const { response, payload } = await fetchJson("/admin/auth/me", { token: adminToken });
    if (response.ok && payload.username === "admin" && payload.token === undefined) {
      pass("超管 /me 返回 session", `roles=${JSON.stringify(payload.roles)}`);
    } else {
      fail("超管 /me 返回 session", `status=${response.status}`);
    }
  }

  {
    const { response, payload } = await fetchJson("/admin/auth/session", { token: adminToken });
    if (response.ok && payload.username) {
      pass("超管 /session 校验 Token");
    } else {
      fail("超管 /session 校验 Token", `status=${response.status}`);
    }
  }

  if (handlerToken) {
    const { response, payload } = await fetchJson("/admin/auth/me", { token: handlerToken });
    if (response.ok && payload.handlerId === "h1") {
      pass("打手 /me 含 handlerId=h1");
    } else {
      fail("打手 /me 含 handlerId=h1", `handlerId=${String(payload.handlerId)}`);
    }
  }

  // 超管核心 GET
  for (const item of SUPER_ADMIN_ENDPOINTS) {
    await expectOk(item.name, item.path, adminToken);
  }

  // 打手权限隔离
  if (handlerToken) {
    for (const item of HANDLER_ENDPOINTS) {
      await expectStatus(item.name, item.path, item.expect, handlerToken);
    }

    const { response, payload } = await fetchJson("/admin/orders/mine", { token: handlerToken });
    if (response.ok && Array.isArray(payload.items)) {
      pass("打手我的订单返回 items 数组", `total=${String(payload.total)}`);
    } else {
      fail("打手我的订单返回 items 数组", `status=${response.status}`);
    }
  }

  // 登出后 Token 失效（服务端无黑名单，但客户端应清除；此处仅验证 logout 接口）
  {
    const { response } = await fetchJson("/admin/auth/logout", {
      method: "POST",
      token: adminToken,
    });
    if (response.ok) {
      pass("POST /admin/auth/logout 成功");
    } else {
      fail("POST /admin/auth/logout 成功", `status=${response.status}`);
    }
  }

  // 重新登录供后续本地使用
  try {
    await login("admin", "admin123");
    pass("测试结束重新登录超管");
  } catch {
    fail("测试结束重新登录超管", "login failed");
  }

  printReport();
  const failed = results.filter((row) => !row.ok).length;
  process.exit(failed ? 1 : 0);
}

function printReport() {
  const passed = results.filter((row) => row.ok).length;
  const failed = results.filter((row) => !row.ok);
  console.log("\n========== Admin API 冒烟测试 ==========");
  for (const row of results) {
    const mark = row.ok ? "✓" : "✗";
    console.log(`${mark} ${row.name}${row.detail ? ` — ${row.detail}` : ""}`);
  }
  console.log(`\n合计: ${passed}/${results.length} 通过`);
  if (failed.length) {
    console.log("\n失败项:");
    for (const row of failed) {
      console.log(`  - ${row.name}: ${row.detail}`);
    }
  }
}

main().catch((err) => {
  console.error("[smoke-admin-api] fatal:", err);
  process.exit(1);
});
