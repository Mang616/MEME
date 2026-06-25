import { Button, Image, Input, Message, Space, Upload } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isStoredMediaRef } from "@/lib/media-ref";

type ImageUrlFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  folder?: "banners" | "products" | "avatars" | "vip-levels" | "common";
  entityId?: string;
  placeholder?: string;
  compact?: boolean;
  /** 表格内单行：无说明文字、预览缩略图内联 */
  minimal?: boolean;
};

export function ImageUrlField({
  value = "",
  onChange,
  folder = "common",
  entityId,
  placeholder = "点击右侧上传，或粘贴图片链接",
  compact = false,
  minimal = false,
}: ImageUrlFieldProps) {
  const [uploadReady, setUploadReady] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    void api
      .getUploadStatus()
      .then((status) => setUploadReady(status.enabled))
      .catch(() => setUploadReady(false));
  }, []);

  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }
    if (!isStoredMediaRef(value)) {
      setPreviewUrl(value);
      return;
    }
    let cancelled = false;
    void api
      .signMediaUrl(value)
      .then((result) => {
        if (!cancelled) setPreviewUrl(result.url);
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const result = await api.uploadImage(file, folder, entityId);
      onChange?.(result.storage);
      setPreviewUrl(result.url);
      Message.success("图片已上传");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "上传失败，请换一张图重试");
    } finally {
      setUploading(false);
    }
    return false;
  }

  const thumbSize = minimal ? 28 : compact ? 48 : 72;
  const thumbWidth = minimal ? 28 : compact ? 48 : 120;

  if (minimal) {
    return (
      <Space size={6} className="image-url-field--minimal">
        {previewUrl ? (
          <Image
            src={previewUrl}
            width={thumbWidth}
            height={thumbSize}
            className="image-url-field__thumb"
            preview
          />
        ) : null}
        <Input
          size="mini"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Upload
          accept="image/*"
          showUploadList={false}
          disabled={uploadReady === false || uploading}
          beforeUpload={handleUpload}
        >
          <Button
            size="mini"
            loading={uploading}
            disabled={uploadReady === false}
            type="outline"
          >
            上传
          </Button>
        </Upload>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space style={{ width: "100%" }}>
        <Input
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          style={{ flex: 1 }}
        />
        <Upload
          accept="image/*"
          showUploadList={false}
          disabled={uploadReady === false || uploading}
          beforeUpload={handleUpload}
        >
          <Button loading={uploading} disabled={uploadReady === false} type="primary">
            {uploadReady === false ? "暂无法上传" : "上传图片"}
          </Button>
        </Upload>
      </Space>
      {uploadReady === false ? (
        <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>
          图片上传服务未就绪，请联系技术人员处理
        </span>
      ) : (
        <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>
          支持 JPG、PNG、WebP，上传后自动压缩
        </span>
      )}
      {previewUrl ? (
        <Image
          src={previewUrl}
          width={thumbWidth}
          height={thumbSize}
          style={{ objectFit: "contain", borderRadius: 4 }}
          preview
        />
      ) : null}
    </Space>
  );
}
