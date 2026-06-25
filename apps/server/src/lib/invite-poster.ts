import sharp from "sharp";
import { escapeXml } from "./invite-code.js";

type InvitePosterInput = {
  brandName: string;
  title: string;
  subtitle: string;
  inviteCode: string;
  nickname: string;
  posterHeadline?: string;
  posterFootnote?: string;
  qrPngBuffer: Buffer;
};

function wrapText(text: string, maxChars: number): string[] {
  const source = String(text || "").trim();
  if (!source) return [];
  const lines: string[] = [];
  let current = "";
  for (const char of source) {
    current += char;
    if (current.length >= maxChars) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function buildInvitePosterDataUrl(input: InvitePosterInput): Promise<string> {
  const width = 750;
  const height = 1200;
  const qrSize = 320;
  const headline = input.posterHeadline?.trim() || input.title;
  const footnote = input.posterFootnote?.trim() || "扫码或输入邀请码，一起领优惠券";
  const headlineLines = wrapText(headline, 12);
  const subtitleLines = wrapText(input.subtitle, 16);

  const headlineSvg = headlineLines
    .map(
      (line, index) =>
        `<text x="375" y="${170 + index * 52}" text-anchor="middle" fill="#D1FFBD" font-size="44" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  const subtitleSvg = subtitleLines
    .map(
      (line, index) =>
        `<text x="375" y="${250 + index * 34}" text-anchor="middle" fill="#B8C4B5" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a2a18"/>
          <stop offset="55%" stop-color="#243828"/>
          <stop offset="100%" stop-color="#1a2218"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="375" y="88" text-anchor="middle" fill="#8FA88A" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(input.brandName)}</text>
      ${headlineSvg}
      ${subtitleSvg}
      <rect x="175" y="360" width="400" height="400" rx="24" fill="#ffffff"/>
      <text x="375" y="820" text-anchor="middle" fill="#D1FFBD" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif">我的邀请码</text>
      <text x="375" y="880" text-anchor="middle" fill="#FFFFFF" font-size="56" font-weight="700" letter-spacing="8" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(input.inviteCode)}</text>
      <text x="375" y="930" text-anchor="middle" fill="#8FA88A" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(input.nickname)} 邀请你加入</text>
      <text x="375" y="980" text-anchor="middle" fill="#7E8F7A" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(footnote)}</text>
    </svg>
  `;

  const qrResized = await sharp(input.qrPngBuffer).resize(qrSize, qrSize).png().toBuffer();
  const png = await sharp(Buffer.from(svg))
    .composite([{ input: qrResized, top: 400, left: 215 }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${png.toString("base64")}`;
}
