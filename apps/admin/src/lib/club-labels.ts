type ClubKindSource = {
  isPlatform?: boolean;
  isOwnClub?: boolean;
};

/** 俱乐部类型短标签：自营 / 入驻 */
export function clubKindLabel(source: ClubKindSource) {
  const isPlatform = source.isPlatform ?? source.isOwnClub ?? false;
  return isPlatform ? "自营" : "入驻";
}

export function formatClubTag(source: ClubKindSource & { name: string }) {
  return `${clubKindLabel(source)} · ${source.name}`;
}

export function formatClubOptionLabel(club: ClubKindSource & { name: string; enabled?: boolean }) {
  return formatClubTag(club);
}

export function formatHandlerOptionLabel(handler: ClubKindSource & { name: string; clubName: string }) {
  return `${handler.name} · ${formatClubTag({ ...handler, name: handler.clubName })}`;
}
