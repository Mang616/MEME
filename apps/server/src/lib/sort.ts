/** 按 sortOrder 升序，同序按 id 字典序（Banner / 公告等 CMS 列表） */
export function sortByOrder<T extends { sortOrder: number; id: string }>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}
