import { Image } from "@arco-design/web-react";
import { useSignedMediaUrl } from "@/hooks/useSignedMediaUrl";

type HallOrderCoverProps = {
  cover?: string;
  coverColor?: string;
  title: string;
};

export function HallOrderCover({
  cover = "",
  coverColor = "#2a3530",
  title,
}: HallOrderCoverProps) {
  const previewUrl = useSignedMediaUrl(cover);

  return (
    <div
      className="hall-order-card__cover"
      style={{ background: coverColor || "#2a3530" }}
    >
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt={title}
          className="hall-order-card__cover-img"
          preview={false}
        />
      ) : (
        <div className="hall-order-card__cover-fallback" aria-hidden>
          {title.trim().charAt(0) || "单"}
        </div>
      )}
      <div className="hall-order-card__cover-shade" aria-hidden />
    </div>
  );
}
