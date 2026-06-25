import sharp from "sharp";

export type ImageUploadFolder = "banners" | "products" | "avatars" | "vip-levels" | "common";

type ProcessInput = {
  folder: ImageUploadFolder;
  buffer: Buffer;
  mime: string;
};

type ProcessOutput = {
  buffer: Buffer;
  mime: string;
};

const PRESETS: Record<
  ImageUploadFolder,
  { maxWidth?: number; maxHeight?: number; size?: number; quality: number }
> = {
  banners: { maxWidth: 1920, maxHeight: 1080, quality: 80 },
  products: { maxWidth: 1200, maxHeight: 1200, quality: 80 },
  avatars: { size: 400, quality: 85 },
  "vip-levels": { size: 256, quality: 85 },
  common: { maxWidth: 1600, maxHeight: 1600, quality: 80 },
};

export function isImageUploadFolder(folder: string): folder is ImageUploadFolder {
  return folder in PRESETS;
}

/** 上传前压缩：统一转 WebP（GIF 保持原样） */
export async function processUploadImage(input: ProcessInput): Promise<ProcessOutput> {
  if (input.mime === "image/gif") {
    return { buffer: input.buffer, mime: input.mime };
  }

  const preset = PRESETS[input.folder];
  let pipeline = sharp(input.buffer, { failOn: "none" }).rotate();

  if (preset.size) {
    pipeline = pipeline.resize(preset.size, preset.size, {
      fit: "cover",
      position: "centre",
    });
  } else {
    pipeline = pipeline.resize(preset.maxWidth, preset.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const buffer = await pipeline.webp({ quality: preset.quality }).toBuffer();
  return { buffer, mime: "image/webp" };
}
