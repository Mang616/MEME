import * as jsonStore from "./json-store.js";
import type { AdminUser } from "../types.js";

export async function jsonListAdminUsers() {
  const db = await jsonStore.readDb();
  return [...db.adminUsers];
}

export async function jsonGetAdminUserByUsername(username: string) {
  const db = await jsonStore.readDb();
  return db.adminUsers.find((user) => user.username === username) ?? null;
}

export async function jsonGetAdminUser(id: string) {
  const db = await jsonStore.readDb();
  return db.adminUsers.find((user) => user.id === id) ?? null;
}

export async function jsonInsertAdminUser(user: AdminUser) {
  await jsonStore.updateDb((db) => {
    if (db.adminUsers.some((row) => row.id === user.id || row.username === user.username)) {
      throw new Error("ADMIN_USER_EXISTS");
    }
    db.adminUsers.push(user);
  });
  return user;
}

export async function jsonUpdateAdminUser(id: string, patch: Partial<AdminUser>) {
  let updated: AdminUser | null = null;
  await jsonStore.updateDb((db) => {
    const index = db.adminUsers.findIndex((user) => user.id === id);
    if (index < 0) return;
    if (patch.username) {
      const exists = db.adminUsers.some(
        (user) => user.username === patch.username && user.id !== id,
      );
      if (exists) throw new Error("ADMIN_USER_EXISTS");
    }
    const next = { ...db.adminUsers[index], ...patch, id };
    db.adminUsers[index] = next;
    updated = next;
  });
  return updated;
}

export async function jsonDeleteAdminUser(id: string) {
  let removed = false;
  await jsonStore.updateDb((db) => {
    const before = db.adminUsers.length;
    db.adminUsers = db.adminUsers.filter((user) => user.id !== id);
    removed = db.adminUsers.length < before;
  });
  return removed;
}
