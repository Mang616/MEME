import { Router } from "express";
import multer from "multer";
import { isCosEnabled } from "../../config.js";
import { getCosStatus, getObjectUrl, uploadImageToCos } from "../../lib/cos.js";
import { isImageUploadFolder, processUploadImage } from "../../lib/image-process.js";
import { extractCosKey } from "../../lib/media-url.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const adminUploadRouter = Router();

adminUploadRouter.get("/status", (_req, res) => {
  res.json(getCosStatus());
});

adminUploadRouter.get("/sign", async (req, res) => {
  if (!isCosEnabled()) {
    res.status(503).json({ error: "UPLOAD_UNAVAILABLE", message: "图片上传服务暂不可用" });
    return;
  }

  const storage = typeof req.query.storage === "string" ? req.query.storage : "";
  const key = extractCosKey(storage);
  if (!key) {
    res.status(400).json({ error: "INVALID_QUERY", message: "无效的 storage 参数" });
    return;
  }

  try {
    const url = await getObjectUrl(key);
    res.json({ url, storage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "签名失败";
    res.status(400).json({ error: "SIGN_FAILED", message });
  }
});

adminUploadRouter.post("/", upload.single("file"), async (req, res) => {
  if (!isCosEnabled()) {
    res.status(503).json({
      error: "UPLOAD_UNAVAILABLE",
      message: "图片上传服务暂不可用，请联系管理员",
    });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "INVALID_BODY", message: "请选择图片文件" });
    return;
  }

  const folderRaw = typeof req.body?.folder === "string" ? req.body.folder : "common";
  const folder = isImageUploadFolder(folderRaw) ? folderRaw : "common";
  const entityId = typeof req.body?.entityId === "string" ? req.body.entityId.trim() : undefined;

  try {
    const processed = await processUploadImage({
      folder,
      buffer: file.buffer,
      mime: file.mimetype,
    });
    const result = await uploadImageToCos({
      folder,
      buffer: processed.buffer,
      mime: processed.mime,
      originalName: file.originalname,
      entityId,
    });
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    res.status(400).json({ error: "UPLOAD_FAILED", message });
  }
});
