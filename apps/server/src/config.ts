export const PORT = Number(process.env.PORT ?? 3000);

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PRODUCTION = NODE_ENV === "production";

export const ADMIN_ACCOUNT = {
  username: process.env.ADMIN_USERNAME ?? "admin",
  password: process.env.ADMIN_PASSWORD ?? "admin123",
};

export const AUTH_SECRET = process.env.AUTH_SECRET ?? "meme-dev-secret-change-me";

if (IS_PRODUCTION) {
  const weakSecret = AUTH_SECRET === "meme-dev-secret-change-me";
  const weakPassword = ADMIN_ACCOUNT.password === "admin123";
  if (weakSecret || weakPassword) {
    console.warn(
      "[meme-server] 生产环境请设置 AUTH_SECRET、ADMIN_PASSWORD（见 apps/server/.env.example）",
    );
  }
}
