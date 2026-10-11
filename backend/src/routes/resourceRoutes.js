// Purpose: resourceRoutes persists event resource metadata and private Storage files.
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../config/prisma.js";
import {
  authenticate,
  authorizeEventMembership,
  authorizeOrgLead,
} from "../middlewares/auth.js";

const router = express.Router();
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "event-resources";
const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const storage =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      ).storage
    : null;

// Purpose: reject unsupported resource files before they reach Storage.
function validateFile(file) {
  if (!file) return "A file is required.";
  if (!allowedTypes.has(file.mimetype))
    return "Only PDF, JPG, PNG, CSV, XLS, and XLSX files are allowed.";
  return null;
}

// Purpose: create a stable, event-scoped Storage path.
function filePath(eventId, file) {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `events/${eventId}/${randomUUID()}-${safeName}`;
}

// Purpose: convert stored resource paths into short-lived private download URLs.
async function withDownloadUrl(resource) {
  const normalized = {
    ...resource,
    fileSizeBytes:
      resource.fileSizeBytes == null ? null : Number(resource.fileSizeBytes),
  };
  if (!storage) return { ...normalized, downloadUrl: null };
  const { data, error } = await storage
    .from(bucket)
    .createSignedUrl(resource.fileUrl, 300);
  if (error) throw error;
  return { ...normalized, downloadUrl: data.signedUrl };
}

// Purpose: list event resources for authorized event members.
router.get(
  "/:eventId/resources",
  authenticate,
  authorizeEventMembership(),
  async (req, res) => {
    try {
      const resources = await prisma.eventResource.findMany({
        where: { eventId: req.params.eventId },
        orderBy: { createdAt: "desc" },
      });
      return res.json({
        resources: await Promise.all(resources.map(withDownloadUrl)),
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to fetch resources.", details: error.message });
    }
  },
);

// Purpose: upload a new private event resource for lead organizers.
router.post(
  "/:eventId/resources",
  authenticate,
  authorizeEventMembership(["organizer"]),
  authorizeOrgLead(),
  upload.single("file"),
  async (req, res) => {
    const fileError = validateFile(req.file);
    if (fileError) return res.status(400).json({ error: fileError });
    if (!storage)
      return res
        .status(500)
        .json({ error: "Supabase Storage is not configured on the backend." });
    const title = req.body.title?.trim() || req.file.originalname;
    const path = filePath(req.params.eventId, req.file);
    try {
      const { error: uploadError } = await storage
        .from(bucket)
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });
      if (uploadError) throw uploadError;
      const resource = await prisma.eventResource.create({
        data: {
          eventId: req.params.eventId,
          title,
          category: req.file.mimetype,
          fileUrl: path,
          fileType: req.file.mimetype,
          fileSizeBytes: req.file.size,
          uploadedUserId: req.user.id,
        },
      });
      return res
        .status(201)
        .json({ resource: await withDownloadUrl(resource) });
    } catch (error) {
      await storage.from(bucket).remove([path]);
      const details = error?.message || "Storage upload failed.";
      return res
        .status(500)
        .json({
          error: `Failed to upload resource to bucket "${bucket}".`,
          details,
        });
    }
  },
);

// Purpose: update resource metadata or replace its stored file for lead organizers.
router.patch(
  "/:eventId/resources/:resourceId",
  authenticate,
  authorizeEventMembership(["organizer"]),
  authorizeOrgLead(),
  upload.single("file"),
  async (req, res) => {
    try {
      const existing = await prisma.eventResource.findFirst({
        where: { id: req.params.resourceId, eventId: req.params.eventId },
      });
      if (!existing)
        return res.status(404).json({ error: "Resource not found." });
      let fileUrl = existing.fileUrl;
      let newPath = null;
      if (req.file) {
        const fileError = validateFile(req.file);
        if (fileError) return res.status(400).json({ error: fileError });
        if (!storage)
          return res
            .status(500)
            .json({
              error: "Supabase Storage is not configured on the backend.",
            });
        newPath = filePath(req.params.eventId, req.file);
        const { error } = await storage
          .from(bucket)
          .upload(newPath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });
        if (error) throw error;
        fileUrl = newPath;
      }
      const resource = await prisma.eventResource.update({
        where: { id: existing.id },
        data: {
          title: req.body.title?.trim() || existing.title,
          ...(req.file
            ? {
                fileUrl,
                category: req.file.mimetype,
                fileType: req.file.mimetype,
                fileSizeBytes: req.file.size,
              }
            : {}),
        },
      });
      if (newPath && storage)
        await storage.from(bucket).remove([existing.fileUrl]);
      return res.json({ resource: await withDownloadUrl(resource) });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to update resource.", details: error.message });
    }
  },
);

export default router;
