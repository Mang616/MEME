import { Image } from "@arco-design/web-react";
import { useSignedMediaUrl } from "@/hooks/useSignedMediaUrl";

type ProductCoverThumbProps = {
  cover?: string;
  coverColor?: string;
  /** 正方形边长；未传 width/height 时生效 */
  size?: number;
  width?: number;
  height?: number;
};

export function ProductCoverThumb({
  cover = "",
  coverColor = "#2a3530",
  size = 56,
  width,
  height,
}: ProductCoverThumbProps) {
  const previewUrl = useSignedMediaUrl(cover);
  const w = width ?? size;
  const h = height ?? size;

  const frameStyle = {
    width: w,
    height: h,
    borderRadius: 6,
    border: "1px solid var(--color-border-2)",
    flexShrink: 0,
  } as const;

  if (!previewUrl) {
    return (
      <div
        style={{
          ...frameStyle,
          background: coverColor || "#2a3530",
        }}
      />
    );
  }

  return (
    <Image
      src={previewUrl}
      width={w}
      height={h}
      style={{
        ...frameStyle,
        objectFit: "cover",
      }}
      preview
    />
  );
}
