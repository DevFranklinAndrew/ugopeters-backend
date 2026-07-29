import type { Request, Response } from "express";
import AppError from "../errors/app.error";
import * as uploadService from "../services/upload.service";

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  // `uploadSingleImage` middleware populates req.file (typed by @types/multer).
  if (!req.file) throw new AppError("No image file provided.", 400);

  const result = await uploadService.uploadImage(req.file.buffer);

  res.status(201).json({ status: "success", data: result });
};

export { uploadImage };
